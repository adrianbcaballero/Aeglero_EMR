# User management (IT admin)
from flask import Blueprint, request, g
from datetime import datetime, timezone

from auth_middleware import require_auth
from extensions import db
from models import User
from services.audit_logger import log_access
from werkzeug.security import generate_password_hash

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


def _client_ip():
    fwd = request.headers.get("X-Forwarded-For", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.remote_addr


def _serialize_user(u: User):
    is_temp_locked = bool(u.locked_until and u.locked_until > datetime.now(timezone.utc))
    return {
        "id": u.id,
        "username": u.username,
        "role": u.role,
        "full_name": u.full_name,
        "failed_attempts": u.failed_login_attempts,
        "is_locked": is_temp_locked or u.permanently_locked,
        "permanently_locked": u.permanently_locked,
        "locked_until": u.locked_until.isoformat() if u.locked_until else None,
        "last_login": None,
    }


@users_bp.get("")
@require_auth(roles=["admin"])
def list_users():
    """
    GET /api/users
    Admin only
    """
    users = User.query.order_by(User.id.asc()).all()

    return [_serialize_user(u) for u in users], 200


@users_bp.post("/<int:user_id>/unlock")
@require_auth(roles=["admin"])
def unlock_user(user_id: int):
    """
    POST /api/users/:id/unlock
    Admin only
    """
    ip = _client_ip()
    u = User.query.get(user_id)
    if not u:
        log_access(g.user.id, "USER_UNLOCK", f"user/{user_id}", "FAILED", ip)
        return {"error": "user not found"}, 404

    u.failed_login_attempts = 0
    u.locked_until = None
    u.permanently_locked = False
    db.session.commit()

    log_access(g.user.id, "USER_UNLOCK", f"user/{u.id}", "SUCCESS", ip)
    return {"ok": True, "user": _serialize_user(u)}, 200


@users_bp.post("/<int:user_id>/lock")
@require_auth(roles=["admin"])
def lock_user(user_id: int):
    """
    POST /api/users/:id/lock
    Permanently lock a user account. Admin only.
    """
    ip = _client_ip()
    u = User.query.get(user_id)
    if not u:
        log_access(g.user.id, "USER_LOCK", f"user/{user_id}", "FAILED", ip)
        return {"error": "user not found"}, 404

    if u.id == g.user.id:
        log_access(g.user.id, "USER_LOCK", f"user/{user_id}", "FAILED", ip)
        return {"error": "cannot lock your own account"}, 400

    u.permanently_locked = True
    db.session.commit()

    log_access(g.user.id, "USER_LOCK", f"user/{u.id}", "SUCCESS", ip)
    return {"ok": True, "user": _serialize_user(u)}, 200


@users_bp.put("/<int:user_id>/reset-password")
@require_auth(roles=["admin"])
def reset_password(user_id: int):
    """
    PUT /api/users/:id/reset-password
    Body: { "new_password": "..." }
    Admin only
    """
    ip = _client_ip()
    data = request.get_json(silent=True) or {}
    new_password = data.get("new_password")

    from services.password_validator import validate_password
    is_valid, error_msg = validate_password(new_password)
    if not is_valid:
        log_access(g.user.id, "USER_RESET_PASSWORD", f"user/{user_id}", "FAILED", ip)
        return {"error": error_msg}, 400

    u = User.query.get(user_id)
    if not u:
        log_access(g.user.id, "USER_RESET_PASSWORD", f"user/{user_id}", "FAILED", ip)
        return {"error": "user not found"}, 404

    u.password_hash = generate_password_hash(new_password)
    u.failed_login_attempts = 0
    u.locked_until = None
    u.permanently_locked = False
    db.session.commit()

    log_access(g.user.id, "USER_RESET_PASSWORD", f"user/{u.id}", "SUCCESS", ip)
    return {"ok": True}, 200
