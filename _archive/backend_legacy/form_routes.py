# form_routes.py
from flask import Blueprint, request, jsonify
from models import db, FormSubmission, Score
from datetime import datetime
from sqlalchemy.exc import IntegrityError

form_bp = Blueprint("form", __name__)

@form_bp.route("/submit-form", methods=["POST"])
def submit_form():
    data = request.get_json()

    student_id = data.get("student_id")
    date = datetime.strptime(data.get("date"), "%Y-%m-%d").date()
    text = data.get("text", "").strip()
    category = data.get("category")

    form = FormSubmission(
        student_id=student_id,
        date=date,
        text=text,
        category=category
    )
    db.session.add(form)

    #UPDATING THE TOTAL SCORE CLASS. HOW DO WE WANT THIS LOGIC. THIS IS A PLACEHOLDER
    try:
        score = Score(student_id=student_id, date=date, daily_score=2)
        db.session.add(score)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        existing_score = Score.query.filter_by(student_id=student_id, date=date).first()
        if existing_score:
            existing_score.daily_score += 2
            db.session.commit()

    return jsonify({"message": "Form submitted and score updated"}), 201
