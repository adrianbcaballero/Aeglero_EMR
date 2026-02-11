# mood_routes.py
from flask import Blueprint, request, jsonify
from models import db, MoodSubmission, Score
from datetime import datetime

mood_bp = Blueprint("mood", __name__)

@mood_bp.route("/submit-mood", methods=["POST"])
def submit_mood():
    data = request.get_json()

    student_id = data.get("student_id")
    date_str = data.get("date")
    slider = data.get("slider_value")
    image = data.get("image")
    color = data.get("color")

    if not all([student_id, date_str, slider, image, color]):
        return jsonify({"error": "Missing fields"}), 400

    date = datetime.strptime(date_str, "%Y-%m-%d").date()

    # no duplicates, is this necessary if check in initial login????????
    existing = MoodSubmission.query.filter_by(student_id=student_id, date=date).first()
    if existing:
        return jsonify({"error": "Mood already submitted for this date"}), 409

    #Create mood submission
    mood = MoodSubmission(
        student_id=student_id,
        date=date,
        slider_value=slider,  
        image=image,
        color=color
    )
    db.session.add(mood)

    #Create initial score after submitting the first mood form but subject to change. HOW TO GRADE IMAGES
    score = Score(
        student_id=student_id,
        date=date,
        daily_score=slider  
    )
    db.session.add(score)

    db.session.commit()

    return jsonify({"message": "Mood submitted", "score": slider}), 201