from flask import Blueprint, request, jsonify
from models import db, Student, Score, MoodSubmission, FormSubmission
from sqlalchemy import func, desc
from datetime import date

advisor_bp = Blueprint("advisor", __name__)

@advisor_bp.route("/advisor/<int:advisor_id>/students", methods=["GET"])
def get_high_priority_students(advisor_id):
    page = int(request.args.get("page", 1))
    per_page = 5

    # Subquery to get each student's most recent score
    recent_score_subquery = (
        db.session.query(
            Score.student_id,
            func.max(Score.date).label("latest_date")
        )
        .group_by(Score.student_id)
        .subquery()
    )

    # Join students to their most recent scores
    results = (
        db.session.query(Student, Score)
        .join(Score, Student.id == Score.student_id)
        .join(recent_score_subquery,
              (Score.student_id == recent_score_subquery.c.student_id) &
              (Score.date == recent_score_subquery.c.latest_date))
        .filter(Student.advisor_id == advisor_id)
        .order_by(Score.daily_score.desc())   #highest first HIGH PRIORITY
        .limit(per_page)
        .offset((page - 1) * per_page)
        .all()
    )

    # Format data
    students_data = []
    for student, score in results:
        students_data.append({
            "id": student.id,
            "name": student.name,
            "score": score.daily_score,
            "date": score.date.isoformat()
        })

    return jsonify(students_data), 200


@advisor_bp.route("/advisor/<int:advisor_id>/search-students", methods=["GET"])
def search_students(advisor_id):
    query = request.args.get("q", "")
    matches = Student.query.filter(
        Student.advisor_id == advisor_id,
        Student.name.ilike(f"%{query}%")
    ).all()

    return jsonify([{"id": s.id, "name": s.name} for s in matches])

@advisor_bp.route("/student/<int:student_id>/submissions", methods=["GET"])
def get_student_submissions(student_id):
    moods = MoodSubmission.query.filter_by(student_id=student_id).order_by(MoodSubmission.date.desc()).all()
    forms = FormSubmission.query.filter_by(student_id=student_id).order_by(FormSubmission.date.desc()).all()
    scores = Score.query.filter_by(student_id=student_id).order_by(Score.date.desc()).all()

    student = Student.query.get_or_404(student_id)

    return jsonify({
        "name": student.name,
        "moods": [
            {
                "date": m.date.isoformat(),
                "slider_value": m.slider_value,
                "color": m.color,
                "image": m.image
            } for m in moods
        ],
        "forms": [
            {
                "date": f.date.isoformat(),
                "text": f.text,
                "category": f.category
            } for f in forms
        ],
        "scores": [
            {
                "date": s.date.isoformat(),
                "daily_score": s.daily_score
            } for s in scores
        ]
    }), 200


@advisor_bp.route("/advisor/date/<date_str>", methods=["GET"])
def get_data_by_date(date_str):
    selected_date = date.fromisoformat(date_str)

    moods = MoodSubmission.query.filter_by(date=selected_date).all()
    forms = FormSubmission.query.filter_by(date=selected_date).all()
    scores = Score.query.filter_by(date=selected_date).all()

    return jsonify({
        "moods": [{
            "student_id": m.student_id,
            "slider_value": m.slider_value,
            "image": m.image,
            "color": m.color,
            "date": m.date.isoformat()
        } for m in moods],
        "forms": [{
            "student_id": f.student_id,
            "category": f.category,
            "text": f.text,
            "date": f.date.isoformat()
        } for f in forms],
        "scores": [{
            "student_id": s.student_id,
            "daily_score": s.daily_score,
            "date": s.date.isoformat()
        } for s in scores]
    }), 200


@advisor_bp.route("/advisor/<int:advisor_id>/search-by-score", methods=["GET"])
def search_by_score(advisor_id):
    score_value = request.args.get("score")
    if score_value is None:
        return jsonify({"error": "Missing score"}), 400

    results = (
        db.session.query(Score, Student)
        .join(Student, Score.student_id == Student.id)
        .filter(Score.daily_score == int(score_value), Student.advisor_id == advisor_id)
        .order_by(Score.date.desc())
        .all()
    )

    return jsonify([
        {
            "id": student.id,
            "name": student.name,
            "score": score.daily_score,
            "date": score.date.isoformat()
        }
        for score, student in results
    ])

@advisor_bp.route("/advisor/<int:advisor_id>/graph-data", methods=["POST"])
def generate_graph_data(advisor_id):
    from datetime import datetime, timedelta, date
    data = request.get_json()
    selected_options = data.get("selections", [])

    if not selected_options:
        return jsonify({"error": "No selections provided"}), 400

    response_data = []

    for selection in selected_options:
        student_id = selection.get("studentId")
        if isinstance(student_id, str) and student_id.isdigit():
            student_id = int(student_id)
        date_range = selection.get("dateRange")
        data_type = selection.get("dataType")

        # Setup base query
        if student_id == "all":
            if data_type == "score":
                base = db.session.query(
                    Score.date,
                    func.avg(Score.daily_score).label("value")
                ).join(Student).filter(Student.advisor_id == advisor_id)
            elif data_type == "mood":
                base = db.session.query(
                    MoodSubmission.date,
                    func.avg(MoodSubmission.slider_value).label("value")
                ).join(Student).filter(Student.advisor_id == advisor_id)

                if date_range == "month":
                    base = base.filter(MoodSubmission.date >= (datetime.utcnow().date() - timedelta(days=30)))
                elif date_range == "week":
                    base = base.filter(MoodSubmission.date >= (datetime.utcnow().date() - timedelta(days=7)))

                results = base.group_by(MoodSubmission.date).order_by(MoodSubmission.date).all()
                response_data.append({
                    "id": f"All Students - {data_type}",
                    "data": [{"x": r.date.isoformat(), "y": r.value} for r in results]
                })
                continue
            elif data_type == "form":
                base = db.session.query(
                    FormSubmission.date,
                    func.count(FormSubmission.text).label("value")
                ).join(Student).filter(Student.advisor_id == advisor_id)

                if date_range == "month":
                    base = base.filter(FormSubmission.date >= (datetime.utcnow().date() - timedelta(days=30)))
                elif date_range == "week":
                    base = base.filter(FormSubmission.date >= (datetime.utcnow().date() - timedelta(days=7)))

                results = base.group_by(FormSubmission.date).order_by(FormSubmission.date).all()
                response_data.append({
                    "id": f"All Students - {data_type}",
                    "data": [{"x": r.date.isoformat(), "y": r.value} for r in results]
                })
                continue
            else:
                continue

            if date_range == "month":
                base = base.filter(Score.date >= (datetime.utcnow().date() - timedelta(days=30)))
            elif date_range == "week":
                base = base.filter(Score.date >= (datetime.utcnow().date() - timedelta(days=7)))

            results = base.group_by(Score.date).order_by(Score.date).all()
            response_data.append({
                "id": f"All Students - {data_type}",
                "data": [{"x": r.date.isoformat(), "y": r.value} for r in results]
            })

        else:
            if data_type == "score":
                query = Score.query.filter_by(student_id=student_id)
                if date_range == "month":
                    query = query.filter(Score.date >= (datetime.utcnow().date() - timedelta(days=30)))
                elif date_range == "week":
                    query = query.filter(Score.date >= (datetime.utcnow().date() - timedelta(days=7)))
                scores = query.order_by(Score.date.asc()).all()
                data_points = [{"x": s.date.isoformat(), "y": s.daily_score} for s in scores]
                label = f"Student {student_id} - {data_type}"
            elif data_type == "mood":
                query = MoodSubmission.query.filter_by(student_id=student_id)
                if date_range == "month":
                    query = query.filter(MoodSubmission.date >= (datetime.utcnow().date() - timedelta(days=30)))
                elif date_range == "week":
                    query = query.filter(MoodSubmission.date >= (datetime.utcnow().date() - timedelta(days=7)))
                moods = query.order_by(MoodSubmission.date.asc()).all()
                data_points = [{"x": m.date.isoformat(), "y": m.slider_value} for m in moods]
                label = f"Student {student_id} - {data_type}"
            elif data_type == "form":
                query = FormSubmission.query.filter_by(student_id=student_id)
                if date_range == "month":
                    query = query.filter(FormSubmission.date >= (datetime.utcnow().date() - timedelta(days=30)))
                elif date_range == "week":
                    query = query.filter(FormSubmission.date >= (datetime.utcnow().date() - timedelta(days=7)))
                forms = query.order_by(FormSubmission.date.asc()).all()
                from collections import defaultdict
                day_counts = defaultdict(int)
                for f in forms:
                    day_counts[f.date.isoformat()] += 1
                data_points = [{"x": k, "y": v} for k, v in sorted(day_counts.items())]
                label = f"Student {student_id} - {data_type}"
            else:
                continue

            if data_points:
                response_data.append({"id": label, "data": data_points})

    return jsonify(response_data), 200
