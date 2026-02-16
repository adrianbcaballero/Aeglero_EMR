# Used for audit logs
from datetime import datetime, timezone, date, timedelta
from flask import Blueprint, request, g

from auth_middleware import require_auth
from models import AuditLog, UserSession, User
from services.audit_logger import log_access
from extensions import db

audit_bp = Blueprint("audit", __name__, url_prefix="/api/audit")


def _client_ip():
    fwd = request.headers.get("X-Forwarded-For", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.remote_addr


def _parse_date(value):
    """
    Accepts YYYY-MM-DD; returns datetime range start in UTC.
    """
    if not value:
        return None
    try:
        d = date.fromisoformat(value)
        return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
    except ValueError:
        return "INVALID"


def _serialize_log(row: AuditLog):
    # user display
    username = None
    if row.user_id:
        u = User.query.get(row.user_id)
        username = u.username if u else None

    return {
        "id": row.id,
        "timestamp": row.timestamp.isoformat() if row.timestamp else None,
        "userId": row.user_id,
        "username": username,
        "action": row.action,
        "resource": row.resource,
        "ipAddress": row.ip_address,
        "status": row.status,
    }


@audit_bp.get("/logs")
@require_auth(roles=["admin"])
def get_audit_logs():
    """
    GET /api/audit/logs
    Query params:
      user_id=2
      action=NOTE_CREATE
      status=SUCCESS|FAILED
      date_from=YYYY-MM-DD
      date_to=YYYY-MM-DD
      limit=200
    """
    ip = _client_ip()

    user_id = request.args.get("user_id")
    action = (request.args.get("action") or "").strip()
    status = (request.args.get("status") or "").strip()
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    limit = request.args.get("limit", "200")

    try:
        limit = min(int(limit), 500)
    except ValueError:
        limit = 200

    q = AuditLog.query

    if user_id:
        try:
            q = q.filter(AuditLog.user_id == int(user_id))
        except ValueError:
            log_access(g.user.id, "AUDIT_LOGS", "audit/logs", "FAILED", ip)
            return {"error": "user_id must be an integer"}, 400

    if action:
        q = q.filter(AuditLog.action == action)

    if status:
        q = q.filter(AuditLog.status == status)

    dt_from = _parse_date(date_from)
    dt_to = _parse_date(date_to)

    if dt_from == "INVALID" or dt_to == "INVALID":
        log_access(g.user.id, "AUDIT_LOGS", "audit/logs", "FAILED", ip)
        return {"error": "date_from/date_to must be YYYY-MM-DD"}, 400

    if dt_from:
        q = q.filter(AuditLog.timestamp >= dt_from)

    if dt_to:
        #include the whole date_to day by making it exclusive next day
        q = q.filter(AuditLog.timestamp < (dt_to + timedelta(days=1)))

    rows = q.order_by(AuditLog.id.desc()).limit(limit).all()

    log_access(g.user.id, "AUDIT_LOGS", "audit/logs", "SUCCESS", ip)
    return [_serialize_log(r) for r in rows], 200


@audit_bp.get("/stats")
@require_auth(roles=["admin"])
def get_audit_stats():
    """
    GET /api/audit/stats
    Returns:
      total_logins_today
      failed_attempts_today
      unauthorized_attempts_today
      active_sessions
    """
    ip = _client_ip()

    now = datetime.now(timezone.utc)
    start_today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    start_tomorrow = start_today + timedelta(days=1)

    #successful logins today
    total_logins_today = (
        db.session.query(AuditLog)
        .filter(AuditLog.action == "LOGIN", AuditLog.status == "SUCCESS",
                AuditLog.timestamp >= start_today, AuditLog.timestamp < start_tomorrow)
        .count()
    )

    #Count failed logins today
    failed_attempts_today = (
        db.session.query(AuditLog)
        .filter(AuditLog.action == "LOGIN", AuditLog.status == "FAILED",
                AuditLog.timestamp >= start_today, AuditLog.timestamp < start_tomorrow)
        .count()
    )

    #Unauthorized attempts (403) today, need to update middleware to log those with resource containing "forbidden"
    unauthorized_attempts_today = (
        db.session.query(AuditLog)
        .filter(
            AuditLog.action == "ACCESS_403",
            AuditLog.status == "FAILED",
            AuditLog.timestamp >= start_today,
            AuditLog.timestamp < start_tomorrow
        )
        .count()
    )

    not_authenticated_today = (
        db.session.query(AuditLog)
        .filter(
            AuditLog.action == "ACCESS_401",
            AuditLog.status == "FAILED",
            AuditLog.timestamp >= start_today,
            AuditLog.timestamp < start_tomorrow
        )
        .count()
    )

    #Active sessions presently in the system (not expired)
    active_sessions = UserSession.query.count()

    log_access(g.user.id, "AUDIT_STATS", "audit/stats", "SUCCESS", ip)
    return {
        "total_logins_today": total_logins_today,
        "failed_attempts_today": failed_attempts_today,
        "unauthorized_attempts_today": unauthorized_attempts_today,
        "active_sessions": active_sessions,
        "not_authenticated_today": not_authenticated_today,
    }, 200
