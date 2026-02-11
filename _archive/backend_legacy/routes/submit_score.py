from flask import Blueprint, request, jsonify
from models import db, MoodSubmission, FormSubmission
from services.score_service import calculate_and_store_score
from datetime import date

# Define Flask Blueprint for the score submission route
submit_score_bp = Blueprint("submit_score", __name__)

@submit_score_bp.route("/submit_score", methods=["POST"])
def submit_score():
    data = request.get_json()

    student_id = data.get("student_id")
    slider_value = data.get("slider_value")
    color = data.get("color")
    image = data.get("image", "default.png")
    date_str = data.get("date") or str(date.today())
    text = data.get("text")
    category = data.get("category")


    if not student_id or slider_value is None or not color or not date_str:
        
        return jsonify({"error": "Missing required fields"}), 400

    # Create a MoodSubmission entry
    mood = MoodSubmission(
        student_id=student_id,
        slider_value=slider_value,
        color=color,
        image=image,
        date=date.fromisoformat(date_str)
    )
    db.session.add(mood)
    db.session.commit()

    # Create FormSubmission only if journal text is provided
    form = None
    if text and category:
        form = FormSubmission(
            student_id=student_id,
            text=text,
            category=category,
            date=mood.date
        )
        db.session.add(form)
        db.session.commit()


    # Generate text summary based on user inpout
    result = calculate_and_store_score(student_id, mood, image, form)

    # Debug
    print("SUMMARY GENERATED:", result["summary"])

    return jsonify({
        "message": "Score submitted",
        "score": result["score"],
        "summary": result["summary"]
    }), 200

