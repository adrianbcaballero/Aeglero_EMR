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
    ip = _client_ip()

    user_id = request.args.get("user_id")
    action = (request.args.get("action") or "").strip()
    status = (request.args.get("status") or "").strip()
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    limit = request.args.get("limit", "200")
    before_id = request.args.get("before_id")
    resource_contains = (request.args.get("resource_contains") or "").strip()

    try:
        limit = min(int(limit), 500)
    except ValueError:
        limit = 200

    q = db.session.query(AuditLog, User.username).outerjoin(User, User.id == AuditLog.user_id)

    if user_id:
        try:
            q = q.filter(AuditLog.user_id == int(user_id))
        except ValueError:
            log_access(g.user.id, "AUDIT_LOGS", "audit/logs", "FAILED", ip)
            return {"error": "user_id must be an integer"}, 400
        
    if before_id:
        try:
            q = q.filter(AuditLog.id < int(before_id))
        except ValueError:
            log_access(g.user.id, "AUDIT_LOGS", "audit/logs", "FAILED", ip)
            return {"error": "before_id must be an integer"}, 400

    if action:
        q = q.filter(AuditLog.action == action)

    if status:
        q = q.filter(AuditLog.status == status)

    if resource_contains:
        q = q.filter(AuditLog.resource.ilike(f"%{resource_contains}%"))

    dt_from = _parse_date(date_from)
    dt_to = _parse_date(date_to)

    if dt_from == "INVALID" or dt_to == "INVALID":
        log_access(g.user.id, "AUDIT_LOGS", "audit/logs", "FAILED", ip)
        return {"error": "date_from/date_to must be YYYY-MM-DD"}, 400

    if dt_from:
        q = q.filter(AuditLog.timestamp >= dt_from)

    if dt_to:
        q = q.filter(AuditLog.timestamp < (dt_to + timedelta(days=1)))

    total = q.count()

    rows = (
        q.order_by(AuditLog.id.desc())
         .limit(limit)
         .all()
    )

    items = []
    for log, username in rows:
        items.append({
            "id": log.id,
            "timestamp": log.timestamp.isoformat(),
            "userId": log.user_id,
            "username": username,
            "action": log.action,
            "resource": log.resource,
            "ipAddress": log.ip_address,
            "status": log.status,
        })
    next_before_id = items[-1]["id"] if items else None
    
    log_access(g.user.id, "AUDIT_LOGS", "audit/logs", "SUCCESS", ip)
    return {"total": total, "nextBeforeId": next_before_id, "items": items}, 200



@audit_bp.get("/stats")
@require_auth(roles=["admin"])
def get_audit_stats():
    """
    GET /api/audit/stats
    Returns:
      total_logins_today
      failed_logins_today
      not_authenticated_today (401)
      unauthorized_attempts_today (403)
      server_errors_today (500)
      active_sessions
    """
    ip = _client_ip()

    now = datetime.now(timezone.utc)
    start_today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    start_tomorrow = start_today + timedelta(days=1)

    def _count(action, status=None):
        q = db.session.query(AuditLog).filter(
            AuditLog.action == action,
            AuditLog.timestamp >= start_today,
            AuditLog.timestamp < start_tomorrow,
        )
        if status:
            q = q.filter(AuditLog.status == status)
        return q.count()

    total_logins_today = _count("LOGIN", "SUCCESS")
    failed_logins_today = _count("LOGIN", "FAILED")

    not_authenticated_today = _count("ACCESS_401", "FAILED")
    unauthorized_attempts_today = _count("ACCESS_403", "FAILED")
    server_errors_today = _count("ACCESS_500", "FAILED")

    active_sessions = UserSession.query.count()

    log_access(g.user.id, "AUDIT_STATS", "audit/stats", "SUCCESS", ip)
    return {
        "total_logins_today": total_logins_today,
        "failed_logins_today": failed_logins_today,
        "not_authenticated_today": not_authenticated_today,
        "unauthorized_attempts_today": unauthorized_attempts_today,
        "server_errors_today": server_errors_today,
        "active_sessions": active_sessions,
    }, 200
