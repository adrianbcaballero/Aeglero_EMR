from flask import Blueprint, request, g
from sqlalchemy import or_

from auth_middleware import require_auth
from extensions import db
from models import Patient, User

patients_bp = Blueprint("patients", __name__, url_prefix="/api/patients")


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

        # not implemented until appointments exist
        "lastVisit": None,
        "nextAppointment": None,
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
    p = None

    # If it looks numeric, try db PK
    if patient_id.isdigit():
        p = Patient.query.get(int(patient_id))

    # Otherwise (or fallback), treat as patient_code
    if not p:
        p = Patient.query.filter_by(patient_code=patient_id).first()

    if not p:
        return {"error": "patient not found"}, 404

    # RBAC check: technician can only access assigned patient
    if g.user.role == "technician" and p.assigned_provider_id != g.user.id:
        return {"error": "forbidden"}, 403

    # “Full record” placeholder (appointments/notes/plan come later)
    return {
        **_serialize_patient(p),
        "appointments": [],
        "notes": [],
        "treatmentPlan": None,
    }, 200
