# auth.py
from flask import Blueprint, request, jsonify, current_app
from datetime import date
from models import db, Student, Advisor, MoodSubmission
from sqlalchemy.exc import IntegrityError
from random import choice
from sqlalchemy import text
import logging
from werkzeug.security import generate_password_hash, check_password_hash

logging.basicConfig(level=logging.DEBUG)

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    name = data.get("name")
    password = data.get("password")
    role = data.get("role")
    logging.debug(f"Login attempt - Role: {role}, Name: {name}")

    if role == "student":
        user = Student.query.filter_by(name=name).first()
        if user and check_password_hash(user.password, password):
            #Check if mood already submitted today
            today = date.today()
            already_submitted = MoodSubmission.query.filter_by(
                student_id=user.id,
                date=today
            ).first()
            if already_submitted:
                return jsonify({
                    "error": "Mood already submitted for today. You can’t log in again today."
                }), 403
        else:
            user = None

    elif role == "advisor":
        user = Advisor.query.filter_by(name=name).first()
        if user and not check_password_hash(user.password, password):
            user = None
    else:
        return jsonify({"error": "Invalid role"}), 400

    if not user:
        logging.debug(f"Authentication failed for Name: {name} with Role: {role}")
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "id": user.id,
        "name": user.name,
        "role": role
    }), 200

def reset_sequence():
    """Resets the sequence for the 'id' column in the 'students' table."""
    try:
        # Get the sequence name for the 'id' column in the 'students' table
        result = db.session.execute(
            text("SELECT pg_get_serial_sequence('students', 'id')")
        )
        sequence_name = result.scalar()

        # Get the current maximum 'id' in the 'students' table
        result = db.session.execute(
            text("SELECT MAX(id) FROM students")
        )
        max_id = result.scalar()

        # Reset the sequence to the next value
        db.session.execute(
            text(f"SELECT setval(:seq_name, :max_id + 1)"),
            {"seq_name": sequence_name, "max_id": max_id},
        )
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Error resetting sequence: {e}")
        db.session.rollback()

#Create a student
@auth_bp.route("/auth/create-student", methods=["POST"])
def create_student():
    data = request.get_json()

    name = data.get("name")
    password = data.get("password")

    if not name or not password:
        return jsonify({"error": "Name and password are required"}), 400

    try:
        # Reset the sequence to avoid primary key conflicts
        reset_sequence()

        # Get all advisors from the DB
        advisors = Advisor.query.all()
        if not advisors:
            return jsonify({"error": "No advisors available"}), 400

        # Pick one advisor at random
        advisor = choice(advisors)

        new_student = Student(name=name, password=password, advisor_id=advisor.id)
        db.session.add(new_student)
        db.session.commit()

        return jsonify({
            "message": "Student created",
            "id": new_student.id,
            "assigned_advisor_id": advisor.id,
            "assigned_advisor_name": advisor.name
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        current_app.logger.error(f"IntegrityError creating student: {e}")
        return jsonify({"error": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating student: {e}")
        return jsonify({"error": "Server error"}), 500

# Create Advisor Account
@auth_bp.route("/auth/create-advisor", methods=["POST"])
def create_advisor():
    data = request.get_json()
    name = data.get("name")
    password = data.get("password")

    if not name or not password:
        return jsonify({"error": "Name and password are required"}), 400

    new_advisor = Advisor(name=name, password=password)
    db.session.add(new_advisor)
    db.session.commit()

    return jsonify({"message": "Advisor created", "id": new_advisor.id}), 201