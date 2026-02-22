# Audit Logging utility
from datetime import datetime, timezone
from extensions import db
from models import AuditLog

def log_access(user_id, action, resource, status, ip_address=None, description=None):
    entry = AuditLog(
        timestamp=datetime.now(timezone.utc),
        user_id=user_id,
        action=action,
        resource=resource,
        status=status,
        ip_address=ip_address,
        description=description,
    )
    db.session.add(entry)
    db.session.commit()