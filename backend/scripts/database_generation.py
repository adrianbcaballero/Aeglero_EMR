# creating data into database for testing purposes

import os
import sys
from datetime import date, datetime, timedelta, timezone


# Ensure imports work when running from /app/scripts
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from werkzeug.security import generate_password_hash
from app import create_app
from extensions import db
from models import User, Patient, AuditLog, ClinicalNote, TreatmentPlan, FormTemplate, PatientForm
import random

app = create_app()

def seed():
    with app.app_context():
        #no duplicates
        if User.query.first() or Patient.query.first():
            print("Seed skipped: users/patients already exist.")
            return

        #password for testing
        default_pw = "password123!"

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
                timestamp=datetime.now(timezone.utc) - timedelta(days=1),
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

        now = datetime.now(timezone.utc)

        note_types = ["intake", "progress", "discharge"]
        note_statuses = ["draft", "signed"]

        for p in patients:
            # 1–3 notes per patient
            for _ in range(random.randint(1, 3)):
                created = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))

                n = ClinicalNote(
                    patient_id=p.id,
                    provider_id=technician.id if technician else None,
                    note_type=random.choice(note_types),
                    status=random.choice(note_statuses),
                    summary=f"Patient update for {p.patient_code}.",
                    diagnosis=p.primary_diagnosis or "unspecified",
                    created_at=created,
                )
                db.session.add(n)

            #70% of patients get a treatment plan
            if random.random() < 0.7:
                start = now.date() - timedelta(days=random.randint(0, 60))
                review = start + timedelta(days=30)

                tp = TreatmentPlan(
                    patient_id=p.id,
                    start_date=start,
                    review_date=review,
                    goals=[
                        {"goal": "Reduce symptoms", "target": "4 weeks"},
                        {"goal": "Improve daily routine", "target": "2 weeks"},
                    ],
                    status="active",
                    updated_at=now,
                )
                db.session.add(tp)

        db.session.commit()


        # ── Form Templates ──
        templates = [
            FormTemplate(
                name="New Patient Intake Form",
                category="intake",
                description="Standard intake form for new patients including demographics, medical history, insurance information, and emergency contacts.",
                fields=[
                    {"label": "Full Name", "type": "text"},
                    {"label": "Date of Birth", "type": "date"},
                    {"label": "Primary Insurance", "type": "text"},
                    {"label": "Emergency Contact", "type": "text"},
                    {"label": "Reason for Visit", "type": "textarea"},
                    {"label": "Medical History", "type": "textarea"},
                    {"label": "Current Medications", "type": "textarea"},
                    {"label": "Consent Acknowledgment", "type": "checkbox", "options": ["Yes", "No"]},
                ],
                allowed_roles=["admin", "psychiatrist", "technician"],
                created_by=users[2].id,
            ),
            FormTemplate(
                name="PHQ-9 Depression Screening",
                category="assessment",
                description="Patient Health Questionnaire-9 for screening, diagnosing, monitoring, and measuring severity of depression.",
                fields=[
                    {"label": "Little interest or pleasure", "type": "scale", "min": 0, "max": 3},
                    {"label": "Feeling down or depressed", "type": "scale", "min": 0, "max": 3},
                    {"label": "Trouble falling/staying asleep", "type": "scale", "min": 0, "max": 3},
                    {"label": "Feeling tired or little energy", "type": "scale", "min": 0, "max": 3},
                    {"label": "Poor appetite or overeating", "type": "scale", "min": 0, "max": 3},
                    {"label": "Feeling bad about yourself", "type": "scale", "min": 0, "max": 3},
                    {"label": "Trouble concentrating", "type": "scale", "min": 0, "max": 3},
                    {"label": "Moving or speaking slowly", "type": "scale", "min": 0, "max": 3},
                    {"label": "Thoughts of self-harm", "type": "scale", "min": 0, "max": 3},
                ],
                allowed_roles=["admin", "psychiatrist"],
                created_by=users[0].id,
            ),
            FormTemplate(
                name="GAD-7 Anxiety Assessment",
                category="assessment",
                description="Generalized Anxiety Disorder 7-item scale for screening and measuring severity of generalized anxiety disorder.",
                fields=[
                    {"label": "Feeling nervous or on edge", "type": "scale", "min": 0, "max": 3},
                    {"label": "Not being able to stop worrying", "type": "scale", "min": 0, "max": 3},
                    {"label": "Worrying too much", "type": "scale", "min": 0, "max": 3},
                    {"label": "Trouble relaxing", "type": "scale", "min": 0, "max": 3},
                    {"label": "Being so restless", "type": "scale", "min": 0, "max": 3},
                    {"label": "Becoming easily annoyed", "type": "scale", "min": 0, "max": 3},
                    {"label": "Feeling afraid", "type": "scale", "min": 0, "max": 3},
                ],
                allowed_roles=["admin", "psychiatrist"],
                created_by=users[0].id,
            ),
            FormTemplate(
                name="Informed Consent for Treatment",
                category="consent",
                description="Standard informed consent document covering treatment procedures, risks, benefits, confidentiality, and patient rights.",
                fields=[
                    {"label": "Patient Name", "type": "text"},
                    {"label": "Treatment Type", "type": "select", "options": ["Individual Therapy", "Group Therapy", "Medication Management", "Crisis Intervention"]},
                    {"label": "Risks Acknowledgment", "type": "checkbox", "options": ["Yes", "No"]},
                    {"label": "Benefits Acknowledgment", "type": "checkbox", "options": ["Yes", "No"]},
                    {"label": "Confidentiality Agreement", "type": "checkbox", "options": ["Yes", "No"]},
                    {"label": "Patient Signature", "type": "signature"},
                    {"label": "Date", "type": "date"},
                ],
                allowed_roles=["admin", "psychiatrist", "technician"],
                created_by=users[2].id,
            ),
            FormTemplate(
                name="Insurance Authorization Form",
                category="insurance",
                description="Form for requesting prior authorization from insurance carriers for continued treatment sessions.",
                fields=[
                    {"label": "Patient Name", "type": "text"},
                    {"label": "Insurance ID", "type": "text"},
                    {"label": "Diagnosis Code", "type": "text"},
                    {"label": "Requested Sessions", "type": "number"},
                    {"label": "Clinical Justification", "type": "textarea"},
                    {"label": "Provider Signature", "type": "signature"},
                ],
                allowed_roles=["admin", "psychiatrist"],
                created_by=users[2].id,
            ),
            FormTemplate(
                name="Safety Plan Worksheet",
                category="clinical",
                description="Collaborative safety planning tool for patients at risk, including warning signs, coping strategies, and emergency contacts.",
                fields=[
                    {"label": "Warning Signs", "type": "textarea"},
                    {"label": "Internal Coping Strategies", "type": "textarea"},
                    {"label": "People Who Provide Distraction", "type": "textarea"},
                    {"label": "People to Ask for Help", "type": "textarea"},
                    {"label": "Professionals to Contact", "type": "textarea"},
                    {"label": "Making Environment Safe", "type": "textarea"},
                    {"label": "Patient Signature", "type": "signature"},
                ],
                allowed_roles=["admin", "psychiatrist"],
                created_by=users[0].id,
            ),
            FormTemplate(
                name="Symptom Checklist",
                category="assessment",
                description="General symptom screening with check-all-that-apply format for initial assessment.",
                fields=[
                    {"label": "Current Symptoms", "type": "checkbox_group", "options": ["Anxiety", "Depression", "Insomnia", "Fatigue", "Loss of Appetite", "Irritability", "Difficulty Concentrating", "Panic Attacks"]},
                    {"label": "Symptom Duration", "type": "select", "options": ["Less than 2 weeks", "2-4 weeks", "1-3 months", "3-6 months", "More than 6 months"]},
                    {"label": "Severity", "type": "select", "options": ["Mild", "Moderate", "Severe"]},
                    {"label": "Previous Treatment", "type": "checkbox", "options": ["Yes", "No"]},
                    {"label": "Additional Notes", "type": "textarea"},
                ],
                allowed_roles=["admin", "psychiatrist", "technician"],
                created_by=users[2].id,
            ),
        ]

        db.session.add_all(templates)
        db.session.commit()

        # ── Sample Patient Forms ──
        intake_template = FormTemplate.query.filter_by(name="New Patient Intake Form").first()
        symptom_template = FormTemplate.query.filter_by(name="Symptom Checklist").first()

        if intake_template:
            for p in patients[:5]:
                f = PatientForm(
                    patient_id=p.id,
                    template_id=intake_template.id,
                    form_data={
                        "Full Name": f"{p.first_name} {p.last_name}",
                        "Date of Birth": p.date_of_birth.isoformat() if p.date_of_birth else "",
                        "Primary Insurance": p.insurance or "",
                        "Emergency Contact": "John Doe - 555-0000",
                        "Reason for Visit": p.primary_diagnosis or "Initial assessment",
                        "Medical History": "No significant history",
                        "Current Medications": "None",
                        "Consent Acknowledgment": "Yes",
                    },
                    status="completed",
                    filled_by=technician.id,
                )
                db.session.add(f)

        if symptom_template:
            for p in patients[3:7]:
                f = PatientForm(
                    patient_id=p.id,
                    template_id=symptom_template.id,
                    form_data={
                        "Current Symptoms": ["Anxiety", "Insomnia", "Fatigue"],
                        "Symptom Duration": "2-4 weeks",
                        "Severity": "Moderate",
                        "Previous Treatment": "No",
                        "Additional Notes": f"Patient reports ongoing symptoms for {p.patient_code}.",
                    },
                    status="draft",
                    filled_by=technician.id,
                )
                db.session.add(f)

        db.session.commit()


        print("Seed complete: 3 users + 10 patients + audit logs created.")
        print("Login users: psychiatrist1 / technician1 / admin1")
        print("Password for all: password123!")
        print("Patient Notes and Treatment Plans created with random data for testing created.")
        print("Form templates and sample patient forms created for testing.")

if __name__ == "__main__":
    seed()
