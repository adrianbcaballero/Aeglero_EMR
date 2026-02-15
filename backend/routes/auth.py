from datetime import datetime, timedelta, timezone
import secrets

from flask import Blueprint, request
from werkzeug.security import check_password_hash

from extensions import db
import config
from models import User, UserSession
from services.audit_logger import log_access

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _client_ip():
    #maybe for a proxy later
    fwd = request.headers.get("X-Forwarded-For", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.remote_addr


def _get_session_id():
    """
    Reads session id from:
    Authorization: Bearer <session_id>
    """
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()
    return None


def _validate_session(session_id: str):
    """
    Returns (user, session) if valid, else (None, None)
    """
    if not session_id:
        return None, None

    sess = UserSession.query.filter_by(session_id=session_id).first()
    if not sess:
        return None, None

    if sess.expires_at < datetime.now(timezone.utc):
        #delete expired session
        db.session.delete(sess)
        db.session.commit()
        return None, None

    user = User.query.get(sess.user_id)
    if not user:
        return None, None

    return user, sess


@auth_bp.post("/login")
def login():
    """
    Body: {username, password}
    Returns: {user_id, username, role, session_id}
    """
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    ip = _client_ip()

    if not username or not password:
        log_access(None, "LOGIN", "auth", "FAILED", ip)
        return {"error": "username and password required"}, 400

    user = User.query.filter_by(username=username).first()

    #IF username doesnt exist 
    if not user:
        log_access(None, "LOGIN", "auth", "FAILED", ip)
        return {"error": "invalid credentials"}, 401

    # Check lockout
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        log_access(user.id, "LOGIN", "auth", "FAILED", ip)
        return {"error": "account locked. try again later"}, 403

    # Verify password
    if not check_password_hash(user.password_hash, password):
        user.failed_login_attempts += 1

        # Lock if too many failed attempts
        if user.failed_login_attempts >= config.MAX_FAILED_LOGINS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=config.ACCOUNT_LOCKOUT_MINUTES)

        db.session.commit()
        log_access(user.id, "LOGIN", "auth", "FAILED", ip)
        return {"error": "invalid credentials"}, 401

    # Success: reset lock counters
    user.failed_login_attempts = 0
    user.locked_until = None
    db.session.commit()

    # Create session
    session_id = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=config.SESSION_TIMEOUT_MINUTES)

    sess = UserSession(session_id=session_id, user_id=user.id, expires_at=expires_at)
    db.session.add(sess)
    db.session.commit()

    log_access(user.id, "LOGIN", "auth", "SUCCESS", ip)

    return {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,         # psychiatrist | technician | admin
        "session_id": session_id,
    }, 200


@auth_bp.get("/me")
def me():
    """
    Header: Authorization: Bearer <session_id>
    Returns: {user_id, username, role}
    """
    session_id = _get_session_id()
    ip = _client_ip()

    user, sess = _validate_session(session_id)
    if not user:
        log_access(None, "ME", "auth", "FAILED", ip)
        return {"error": "not authenticated"}, 401

    log_access(user.id, "ME", "auth", "SUCCESS", ip)
    return {"user_id": user.id, "username": user.username, "role": user.role}, 200


@auth_bp.post("/logout")
def logout():
    """
    Header: Authorization: Bearer <session_id>
    Deletes session
    """
    session_id = _get_session_id()
    ip = _client_ip()

    user, sess = _validate_session(session_id)
    if not sess:
        # No valid session (already logged out or expired)
        log_access(None, "LOGOUT", "auth", "FAILED", ip)
        return {"ok": True}, 200

    db.session.delete(sess)
    db.session.commit()

    log_access(user.id, "LOGOUT", "auth", "SUCCESS", ip)
    return {"ok": True}, 200
