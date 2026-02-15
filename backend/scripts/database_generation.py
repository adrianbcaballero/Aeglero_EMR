# creating data into database for testing purposes

import os
import sys
from datetime import date, datetime, timedelta

# Ensure imports work when running from /app/scripts
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from werkzeug.security import generate_password_hash
from app import create_app
from extensions import db
from models import User, Patient, AuditLog

app = create_app()

def seed():
    with app.app_context():
        #no duplicates
        if User.query.first() or Patient.query.first():
            print("Seed skipped: users/patients already exist.")
            return

        #password for testing
        default_pw = "password"

        users = [
            User(
                username="psychiatrist1",
                password_hash=generate_password_hash(default_pw),
                role="psychiatrist",
                full_name="Dr. Fierro",
            ),
            User(
                username="technician1",
                password_hash=generate_password_hash(default_pw),
                role="technician",
                full_name="Jordan Kim",
            ),
            User(
                username="admin1",
                password_hash=generate_password_hash(default_pw),
                role="admin",
                full_name="Morgan Lee",
            ),
        ]
        db.session.add_all(users)
        db.session.commit()

        technician = User.query.filter_by(username="technician1").first()

        #10 patients for testing data
        patients = []
        for i in range(1, 11):
            code = f"PT-{i:03d}"
            p = Patient(
                patient_code=code,
                first_name=f"Test{i}",
                last_name="Patient",
                date_of_birth=date(1990, 1, min(i, 28)),
                phone=f"555-010{i:02d}",
                email=f"pt{i:03d}@example.com",
                status="active",
                risk_level="low" if i <= 6 else ("moderate" if i <= 8 else "high"),
                primary_diagnosis="General Anxiety" if i <= 5 else "Depression",
                insurance="Blue Shield" if i % 2 == 0 else "Kaiser",
                assigned_provider_id=technician.id if technician else None,
            )
            patients.append(p)

        db.session.add_all(patients)
        db.session.commit()

        #fake audit logs
        logs = [
            AuditLog(
                user_id=technician.id if technician else None,
                action="SEED",
                resource="database",
                ip_address="127.0.0.1",
                status="SUCCESS",
                timestamp=datetime.utcnow() - timedelta(days=1),
            ),
            AuditLog(
                user_id=technician.id if technician else None,
                action="SEED",
                resource="patients",
                ip_address="127.0.0.1",
                status="SUCCESS",
            ),
        ]
        db.session.add_all(logs)
        db.session.commit()

        print("Seed complete: 3 users + 10 patients + audit logs created.")
        print("Login users: psychiatrist1 / technician1 / admin1")
        print("Password for all: Password123!")

if __name__ == "__main__":
    seed()
