from functools import wraps
from datetime import datetime, timezone

from flask import request, g

from extensions import db
from models import UserSession, User
from services.audit_logger import log_access


def _client_ip():
    fwd = request.headers.get("X-Forwarded-For", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.remote_addr


def _get_session_id():
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()
    return None


def _validate_session(session_id: str):
    """
    Returns (user, session) if valid; else (None, None).
    Also deletes expired sessions.
    """
    if not session_id:
        return None, None

    sess = UserSession.query.filter_by(session_id=session_id).first()
    if not sess:
        return None, None

    if sess.expires_at < datetime.now(timezone.utc):
        db.session.delete(sess)
        db.session.commit()
        return None, None

    user = User.query.get(sess.user_id)
    if not user:
        return None, None

    return user, sess


def require_auth(roles=None):
    """
    Decorator to protect routes.
    - roles=None: any logged-in user allowed
    - roles=["admin"]: only those roles allowed
    Uses Authorization: Bearer <session_id>
    Attaches g.user
    Logs access attempt to AuditLog
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            ip = _client_ip()
            session_id = _get_session_id()

            user, sess = _validate_session(session_id)
            if not user:
                log_access(None, "ACCESS", request.path, "FAILED", ip)
                return {"error": "not authenticated"}, 401

            if roles and user.role not in roles:
                log_access(user.id, "ACCESS", request.path, "FAILED", ip)
                return {"error": "forbidden"}, 403

            #Atach user
            g.user = user

            log_access(user.id, "ACCESS", request.path, "SUCCESS", ip)
            return fn(*args, **kwargs)
        return wrapper
    return decorator
