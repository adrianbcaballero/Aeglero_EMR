from flask import Blueprint, request, g
from sqlalchemy import or_

from auth_middleware import require_auth
from extensions import db
from models import Patient, User, TreatmentPlan

from datetime import date
import re
from services.audit_logger import log_access


patients_bp = Blueprint("patients", __name__, url_prefix="/api/patients")

VALID_RISK = {"low", "moderate", "high"}
VALID_STATUS = {"active", "inactive", "archived"}

def _client_ip():
    fwd = request.headers.get("X-Forwarded-For", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.remote_addr


def _parse_date_iso(value):
    if value in (None, ""):
        return None
    try:
        # expects YYYY-MM-DD
        return date.fromisoformat(value)
    except ValueError:
        return "INVALID"


def _next_patient_code():
    """
    Generates the next PT-### code based on max existing.
    PT-001, PT-002, ...
    """
    codes = db.session.query(Patient.patient_code).all()
    max_n = 0
    for (code,) in codes:
        if not code:
            continue
        m = re.match(r"^PT-(\d{3,})$", code)
        if m:
            n = int(m.group(1))
            max_n = max(max_n, n)
    return f"PT-{max_n + 1:03d}"


def _get_patient_by_id_or_code(patient_id: str):
    p = None
    if patient_id.isdigit():
        p = Patient.query.get(int(patient_id))
    if not p:
        p = Patient.query.filter_by(patient_code=patient_id).first()
    return p


def _serialize_patient(p: Patient):
    #assigned provider display
    provider_name = None
    if p.assigned_provider_id:
        u = User.query.get(p.assigned_provider_id)
        provider_name = u.full_name or u.username if u else None

    return {
        # frontend uses string IDs like PT-001
        "id": p.patient_code,
        "firstName": p.first_name,
        "lastName": p.last_name,
        "dateOfBirth": p.date_of_birth.isoformat() if p.date_of_birth else None,
        "phone": p.phone,
        "email": p.email,
        "status": p.status,
        "primaryDiagnosis": p.primary_diagnosis,
        "insurance": p.insurance,
        "riskLevel": p.risk_level,
        "assignedProvider": provider_name,
    }

def _serialize_treatment_plan(tp: TreatmentPlan):
    created = getattr(tp, "created_at", None)
    updated = getattr(tp, "updated_at", None)

    return {
        "id": tp.id,
        "patientId": tp.patient_id,
        "startDate": tp.start_date.isoformat() if tp.start_date else None,
        "reviewDate": tp.review_date.isoformat() if tp.review_date else None,
        "goals": tp.goals,
        "status": tp.status,
        "createdAt": created.isoformat() if created else None,
        "updatedAt": updated.isoformat() if updated else None,
    }


def _apply_rbac(query):
    """
    technician: only assigned patients
    psychiatrist/admin: all patients
    """
    role = g.user.role
    if role == "technician":
        return query.filter(Patient.assigned_provider_id == g.user.id)
    return query


@patients_bp.get("")
@require_auth(roles=["technician", "psychiatrist", "admin"])
def list_patients():
    """
    GET /api/patients?search=name&status=active&risk_level=high
    """
    search = (request.args.get("search") or "").strip()
    status = (request.args.get("status") or "").strip()
    risk_level = (request.args.get("risk_level") or "").strip()

    q = Patient.query
    q = _apply_rbac(q)

    if search:
        # search across first/last name and patient_code
        like = f"%{search}%"
        q = q.filter(
            or_(
                Patient.first_name.ilike(like),
                Patient.last_name.ilike(like),
                Patient.patient_code.ilike(like),
            )
        )

    if status:
        q = q.filter(Patient.status == status)

    if risk_level:
        q = q.filter(Patient.risk_level == risk_level)

    q = q.order_by(Patient.last_name.asc(), Patient.first_name.asc())

    patients = q.all()
    return [_serialize_patient(p) for p in patients], 200


@patients_bp.get("/<patient_id>")
@require_auth(roles=["technician", "psychiatrist", "admin"])
def get_patient(patient_id):
    """
    Supports:
    - /api/patients/PT-001
    - /api/patients/1 (numeric db id)
    """
    ip = _client_ip()

    p = None
    if patient_id.isdigit():
        p = Patient.query.get(int(patient_id))

    if not p:
        p = Patient.query.filter_by(patient_code=patient_id).first()

    if not p:
        log_access(g.user.id, "PATIENT_GET", f"patient/{patient_id}", "FAILED", ip)
        return {"error": "patient not found"}, 404

    if g.user.role == "technician":
        if not p.assigned_provider_id or p.assigned_provider_id != g.user.id:
            log_access(g.user.id, "PATIENT_GET", f"patient/{p.patient_code}", "FAILED", ip)
            return {"error": "forbidden"}, 403

    tp = (
        TreatmentPlan.query
        .filter_by(patient_id=p.id)
        .order_by(TreatmentPlan.id.desc())
        .first()
    )

    log_access(g.user.id, "PATIENT_GET", f"patient/{p.patient_code}", "SUCCESS", ip)

    return {
        **_serialize_patient(p),
        "treatmentPlan": _serialize_treatment_plan(tp) if tp else None,
    }, 200



@patients_bp.post("")
@require_auth(roles=["technician", "psychiatrist", "admin"])
def create_patient():
    """
    POST /api/patients
    Body expects camelCase keys like frontend:
    {
      patientCode?:"PT-001",
      firstName, lastName, dateOfBirth?,
      phone?, email?, status?, riskLevel?,
      primaryDiagnosis?, insurance?,
      assignedProviderId? (optional)
    }
    """
    data = request.get_json(silent=True) or {}
    ip = _client_ip()

    first_name = (data.get("firstName") or "").strip()
    last_name = (data.get("lastName") or "").strip()

    if not first_name or not last_name:
        log_access(g.user.id, "PATIENT_CREATE", "patient", "FAILED", ip)
        return {"error": "firstName and lastName are required"}, 400

    dob = _parse_date_iso(data.get("dateOfBirth"))
    if dob == "INVALID":
        log_access(g.user.id, "PATIENT_CREATE", "patient", "FAILED", ip)
        return {"error": "dateOfBirth must be YYYY-MM-DD"}, 400

    status = (data.get("status") or "active").strip()
    risk = (data.get("riskLevel") or "low").strip()

    if status not in VALID_STATUS:
        log_access(g.user.id, "PATIENT_CREATE", "patient", "FAILED", ip)
        return {"error": f"status must be one of {sorted(VALID_STATUS)}"}, 400

    if risk not in VALID_RISK:
        log_access(g.user.id, "PATIENT_CREATE", "patient", "FAILED", ip)
        return {"error": f"riskLevel must be one of {sorted(VALID_RISK)}"}, 400

    #assigned provider handling
    assigned_provider_id = data.get("assignedProviderId")

    if g.user.role == "technician":
        # technicians can only assign to themselves (or leave null -> force to self)
        assigned_provider_id = g.user.id

    # If psychiatrist/admin set it, ensure it's valid if provided
    if assigned_provider_id is not None:
        try:
            assigned_provider_id = int(assigned_provider_id)
        except ValueError:
            log_access(g.user.id, "PATIENT_CREATE", "patient", "FAILED", ip)
            return {"error": "assignedProviderId must be an integer"}, 400

        if not User.query.get(assigned_provider_id):
            log_access(g.user.id, "PATIENT_CREATE", "patient", "FAILED", ip)
            return {"error": "assignedProviderId does not exist"}, 400

    patient_code = (data.get("patientCode") or "").strip()
    if patient_code:
        # validate uniqueness if provided
        existing = Patient.query.filter_by(patient_code=patient_code).first()
        if existing:
            log_access(g.user.id, "PATIENT_CREATE", f"patient/{patient_code}", "FAILED", ip)
            return {"error": "patientCode already exists"}, 409
    else:
        patient_code = _next_patient_code()

    p = Patient(
        patient_code=patient_code,
        first_name=first_name,
        last_name=last_name,
        date_of_birth=dob,
        phone=(data.get("phone") or "").strip() or None,
        email=(data.get("email") or "").strip() or None,
        status=status,
        risk_level=risk,
        primary_diagnosis=(data.get("primaryDiagnosis") or "").strip() or None,
        insurance=(data.get("insurance") or "").strip() or None,
        assigned_provider_id=assigned_provider_id,
    )

    db.session.add(p)
    db.session.commit()

    log_access(g.user.id, "PATIENT_CREATE", f"patient/{p.patient_code}", "SUCCESS", ip)
    return _serialize_patient(p), 201


@patients_bp.put("/<patient_id>")
@require_auth(roles=["technician", "psychiatrist", "admin"])
def update_patient(patient_id):
    """
    PUT /api/patients/<PT-001 or db id>
    Body can include any updatable patient fields in camelCase.
    """
    data = request.get_json(silent=True) or {}
    ip = _client_ip()

    p = _get_patient_by_id_or_code(patient_id)
    if not p:
        log_access(g.user.id, "PATIENT_UPDATE", f"patient/{patient_id}", "FAILED", ip)
        return {"error": "patient not found"}, 404

    #technician can only update assigned
    if g.user.role == "technician" and p.assigned_provider_id != g.user.id:
        log_access(g.user.id, "PATIENT_UPDATE", f"patient/{p.patient_code}", "FAILED", ip)
        return {"error": "forbidden"}, 403

    #Update allowed fields
    if "firstName" in data:
        val = (data.get("firstName") or "").strip()
        if not val:
            return {"error": "firstName cannot be empty"}, 400
        p.first_name = val

    if "lastName" in data:
        val = (data.get("lastName") or "").strip()
        if not val:
            return {"error": "lastName cannot be empty"}, 400
        p.last_name = val

    if "dateOfBirth" in data:
        dob = _parse_date_iso(data.get("dateOfBirth"))
        if dob == "INVALID":
            return {"error": "dateOfBirth must be YYYY-MM-DD"}, 400
        p.date_of_birth = dob

    if "phone" in data:
        p.phone = (data.get("phone") or "").strip() or None

    if "email" in data:
        p.email = (data.get("email") or "").strip() or None

    if "primaryDiagnosis" in data:
        p.primary_diagnosis = (data.get("primaryDiagnosis") or "").strip() or None

    if "insurance" in data:
        p.insurance = (data.get("insurance") or "").strip() or None

    if "status" in data:
        status = (data.get("status") or "").strip()
        if status not in VALID_STATUS:
            return {"error": f"status must be one of {sorted(VALID_STATUS)}"}, 400
        p.status = status

    if "riskLevel" in data:
        risk = (data.get("riskLevel") or "").strip()
        if risk not in VALID_RISK:
            return {"error": f"riskLevel must be one of {sorted(VALID_RISK)}"}, 400
        p.risk_level = risk

    #Provider assignment rules
    if "assignedProviderId" in data:
        if g.user.role == "technician":
            #technicians cannot reassign
            return {"error": "technician cannot change assignedProviderId"}, 403

        apid = data.get("assignedProviderId")
        if apid is None or apid == "":
            p.assigned_provider_id = None
        else:
            try:
                apid = int(apid)
            except ValueError:
                return {"error": "assignedProviderId must be an integer"}, 400

            if not User.query.get(apid):
                return {"error": "assignedProviderId does not exist"}, 400

            p.assigned_provider_id = apid

    db.session.commit()

    log_access(g.user.id, "PATIENT_UPDATE", f"patient/{p.patient_code}", "SUCCESS", ip)
    return _serialize_patient(p), 200

