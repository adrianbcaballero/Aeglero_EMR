from models import db, Student, MoodSubmission, FormSubmission, Score
from services.score_service import calculate_and_store_score
from datetime import date
from app import app

with app.app_context():
    student = Student.query.filter_by(name="Student 4").first()
    if not student:
        raise ValueError("Student 4 not found! Please check the DB.")

    mood = MoodSubmission(
        student_id=student.id,
        slider_value=40,
        color="blue",
        image="test.png",
        date=date.today()
    )
    db.session.add(mood)
    db.session.commit()

    form = FormSubmission(
        student_id=student.id,
        text="I feel very anxious today after what happened.",
        category="Fear",
        date=date.today()
    )
    db.session.add(form)
    db.session.commit()

    score = calculate_and_store_score(student.id, mood, image_name=mood.image, form_submission=form)
    print(f"Generated score for {student.name} (ID={student.id}): {score}")

