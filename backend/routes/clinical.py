#Forms, treatment plans
from datetime import date
from flask import Blueprint, request, g

from auth_middleware import require_auth
from extensions import db
from models import Patient, User, ClinicalNote, TreatmentPlan
from services.audit_logger import log_access

clinical_bp = Blueprint("clinical", __name__, url_prefix="/api/patients")


def _client_ip():
    fwd = request.headers.get("X-Forwarded-For", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.remote_addr


def _parse_date_iso(value):
    if value in (None, ""):
        return None
    try:
        return date.fromisoformat(value)  # YYYY-MM-DD
    except ValueError:
        return "INVALID"


def _get_patient_by_id_or_code(patient_id: str):
    p = None
    if patient_id.isdigit():
        p = Patient.query.get(int(patient_id))
    if not p:
        p = Patient.query.filter_by(patient_code=patient_id).first()
    return p


def _require_patient_access(p: Patient):
    """
    RBAC rule:
    - technician: only if assigned_provider_id == current user
    - psychiatrist/admin: any patient
    """
    if g.user.role == "technician" and p.assigned_provider_id != g.user.id:
        return False
    return True


def _provider_display(provider_id: int):
    u = User.query.get(provider_id)
    if not u:
        return None
    return u.full_name or u.username


def _serialize_note(n: ClinicalNote):
    return {
        "id": n.id,
        "patientId": n.patient_id,
        "providerId": n.provider_id,
        "providerName": _provider_display(n.provider_id),
        "date": n.created_at.isoformat() if n.created_at else None,
        "type": n.note_type,
        "status": n.status,
        "summary": n.summary,
        "diagnosis": n.diagnosis,
    }


def _serialize_plan(tp: TreatmentPlan):
    return {
        "id": tp.id,
        "patientId": tp.patient_id,
        "startDate": tp.start_date.isoformat() if tp.start_date else None,
        "reviewDate": tp.review_date.isoformat() if tp.review_date else None,
        "goals": tp.goals or [],
        "status": tp.status,
        "updatedAt": tp.updated_at.isoformat() if tp.updated_at else None,
    }



@clinical_bp.get("/<patient_id>/notes")
@require_auth(roles=["technician", "psychiatrist", "admin"])
def list_notes(patient_id):
    ip = _client_ip()

    p = _get_patient_by_id_or_code(patient_id)
    if not p:
        log_access(g.user.id, "NOTE_LIST", f"patient/{patient_id}/notes", "FAILED", ip)
        return {"error": "patient not found"}, 404

    if not _require_patient_access(p):
        log_access(g.user.id, "NOTE_LIST", f"patient/{p.patient_code}/notes", "FAILED", ip)
        return {"error": "forbidden"}, 403

    notes = (
        ClinicalNote.query
        .filter_by(patient_id=p.id)
        .order_by(ClinicalNote.created_at.desc())
        .all()
    )

    log_access(g.user.id, "NOTE_LIST", f"patient/{p.patient_code}/notes", "SUCCESS", ip)
    return [_serialize_note(n) for n in notes], 200


@clinical_bp.post("/<patient_id>/notes")
@require_auth(roles=["technician", "psychiatrist", "admin"])
def create_note(patient_id):
    ip = _client_ip()
    data = request.get_json(silent=True) or {}

    p = _get_patient_by_id_or_code(patient_id)
    if not p:
        log_access(g.user.id, "NOTE_CREATE", f"patient/{patient_id}/notes", "FAILED", ip)
        return {"error": "patient not found"}, 404

    if not _require_patient_access(p):
        log_access(g.user.id, "NOTE_CREATE", f"patient/{p.patient_code}/notes", "FAILED", ip)
        return {"error": "forbidden"}, 403

    note_type = (data.get("type") or "progress").strip()
    status = (data.get("status") or "draft").strip()

    #validation
    if status not in {"draft", "signed"}:
        log_access(g.user.id, "NOTE_CREATE", f"patient/{p.patient_code}/notes", "FAILED", ip)
        return {"error": "status must be draft or signed"}, 400

    n = ClinicalNote(
        patient_id=p.id,
        provider_id=g.user.id,  #current user
        note_type=note_type,
        status=status,
        summary=(data.get("summary") or "").strip() or None,
        diagnosis=(data.get("diagnosis") or "").strip() or None,
    )

    db.session.add(n)
    db.session.commit()

    log_access(g.user.id, "NOTE_CREATE", f"patient/{p.patient_code}/notes", "SUCCESS", ip)
    return _serialize_note(n), 201


# TREATMENT PLAN (single current plan per patient)

@clinical_bp.get("/<patient_id>/treatment-plan")
@require_auth(roles=["technician", "psychiatrist", "admin"])
def get_treatment_plan(patient_id):
    ip = _client_ip()

    p = _get_patient_by_id_or_code(patient_id)
    if not p:
        log_access(g.user.id, "TREATMENTPLAN_GET", f"patient/{patient_id}/treatment-plan", "FAILED", ip)
        return {"error": "patient not found"}, 404

    if not _require_patient_access(p):
        log_access(g.user.id, "TREATMENTPLAN_GET", f"patient/{p.patient_code}/treatment-plan", "FAILED", ip)
        return {"error": "forbidden"}, 403

    tp = TreatmentPlan.query.filter_by(patient_id=p.id).first()

    log_access(g.user.id, "TREATMENTPLAN_GET", f"patient/{p.patient_code}/treatment-plan", "SUCCESS", ip)
    return (_serialize_plan(tp) if tp else None), 200


@clinical_bp.post("/<patient_id>/treatment-plan")
@require_auth(roles=["technician", "psychiatrist", "admin"])
def upsert_treatment_plan(patient_id):
    """
    POST acts as create/update:
    - if plan exists: update it
    - else: create it
    """
    ip = _client_ip()
    data = request.get_json(silent=True) or {}

    p = _get_patient_by_id_or_code(patient_id)
    if not p:
        log_access(g.user.id, "TREATMENTPLAN_UPSERT", f"patient/{patient_id}/treatment-plan", "FAILED", ip)
        return {"error": "patient not found"}, 404

    if not _require_patient_access(p):
        log_access(g.user.id, "TREATMENTPLAN_UPSERT", f"patient/{p.patient_code}/treatment-plan", "FAILED", ip)
        return {"error": "forbidden"}, 403

    start_date = _parse_date_iso(data.get("startDate"))
    review_date = _parse_date_iso(data.get("reviewDate"))
    if start_date == "INVALID" or review_date == "INVALID":
        log_access(g.user.id, "TREATMENTPLAN_UPSERT", f"patient/{p.patient_code}/treatment-plan", "FAILED", ip)
        return {"error": "startDate/reviewDate must be YYYY-MM-DD"}, 400

    status = (data.get("status") or "active").strip()
    if status not in {"active", "archived"}:
        log_access(g.user.id, "TREATMENTPLAN_UPSERT", f"patient/{p.patient_code}/treatment-plan", "FAILED", ip)
        return {"error": "status must be active or archived"}, 400

    goals = data.get("goals", [])
    if goals is None:
        goals = []
    if not isinstance(goals, (list, dict)):
        log_access(g.user.id, "TREATMENTPLAN_UPSERT", f"patient/{p.patient_code}/treatment-plan", "FAILED", ip)
        return {"error": "goals must be a list or object"}, 400

    tp = TreatmentPlan.query.filter_by(patient_id=p.id).first()
    created = False
    if not tp:
        tp = TreatmentPlan(patient_id=p.id)
        db.session.add(tp)
        created = True

    tp.start_date = start_date
    tp.review_date = review_date
    tp.goals = goals
    tp.status = status

    db.session.commit()

    log_access(g.user.id, "TREATMENTPLAN_UPSERT", f"patient/{p.patient_code}/treatment-plan", "SUCCESS", ip)
    return {"created": created, "treatmentPlan": _serialize_plan(tp)}, 200
