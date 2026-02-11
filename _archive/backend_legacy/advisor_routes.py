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
        .join(
            recent_score_subquery,
            (Score.student_id == recent_score_subquery.c.student_id)
            & (Score.date == recent_score_subquery.c.latest_date)
        )
        .filter(Student.advisor_id == advisor_id)
        .order_by(Score.daily_score.desc())
        .limit(per_page)
        .offset((page - 1) * per_page)
        .all()
    )

    students_data = []
    for student, score in results:
        students_data.append({
            "id": student.id,
            "name": student.name,
            "score": score.daily_score,
            "date": score.date.isoformat()
        })

    return jsonify(students_data), 200

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
    query = request.args.get("q", "")
    matches = Student.query.filter(
        Student.advisor_id == advisor_id,
        Student.name.ilike(f"%{query}%")
    ).all()

    return jsonify([{ "id": s.id, "name": s.name } for s in matches]), 200
    return jsonify([{"id": s.id, "name": s.name} for s in matches])

@advisor_bp.route("/student/<int:student_id>/submissions", methods=["GET"])
def get_student_submissions(student_id):
    moods = MoodSubmission.query.filter_by(student_id=student_id).order_by(MoodSubmission.date.desc()).all()
    forms = FormSubmission.query.filter_by(student_id=student_id).order_by(FormSubmission.date.desc()).all()
    scores = Score.query.filter_by(student_id=student_id).order_by(Score.date.desc()).all()
    moods = (
        MoodSubmission.query
        .filter_by(student_id=student_id)
        .order_by(MoodSubmission.date.desc())
        .all()
    )
    forms = (
        FormSubmission.query
        .filter_by(student_id=student_id)
        .order_by(FormSubmission.date.desc())
        .all()
    )
    scores = (
        Score.query
        .filter_by(student_id=student_id)
        .order_by(Score.date.desc())
        .all()
    )

    student = Student.query.get_or_404(student_id)

    return jsonify({
        "name": student.name,
        "moods": [
            {
                "date": m.date.isoformat(),
                "slider_value": m.slider_value,
                "color": m.color,
                "image": m.image,
            }
            for m in moods
        ],
        "forms": [
            {
                "date": f.date.isoformat(),
                "text": f.text,
                "category": f.category,
            }
            for f in forms
        ],
        "scores": [
            {
                "date": s.date.isoformat(),
                "daily_score": s.daily_score,
            }
            for s in scores
        ],
    }), 200
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
    selected_date = date.fromisoformat(date_str)

    moods = MoodSubmission.query.filter_by(date=selected_date).all()
    forms = FormSubmission.query.filter_by(date=selected_date).all()
    scores = Score.query.filter_by(date=selected_date).all()

    return jsonify({
        "moods": [
            {
                "student_id": m.student_id,
                "slider_value": m.slider_value,
                "image": m.image,
                "color": m.color,
                "date": m.date.isoformat(),
            }
            for m in moods
        ],
        "forms": [
            {
                "student_id": f.student_id,
                "category": f.category,
                "text": f.text,
                "date": f.date.isoformat(),
            }
            for f in forms
        ],
        "scores": [
            {
                "student_id": s.student_id,
                "daily_score": s.daily_score,
                "date": s.date.isoformat(),
            }
            for s in scores
        ],
    }), 200
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
    score_value = request.args.get("score")
    if score_value is None:
        return jsonify({"error": "score query param required"}), 400

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
            "date": score.date.isoformat(),
        }
        for score, student in results
    ]), 200
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
        from datetime import datetime, timedelta
        payload = request.get_json(silent=True) or {}
        selections = payload.get("selections", [])

        if not selections:
            return jsonify({"error": "selections array required"}), 400

        series = []

        for selection in selections:
            student_id = selection.get("studentId")
            date_range = selection.get("dateRange", "week")
            data_type = selection.get("dataType", "score")

            start_date = None
            if date_range == "week":
                start_date = datetime.utcnow().date() - timedelta(days=7)
            elif date_range == "month":
                start_date = datetime.utcnow().date() - timedelta(days=30)

            if student_id == "all":
                if data_type == "score":
                    q = (
                        db.session.query(Score.date, func.avg(Score.daily_score).label("value"))
                        .join(Student, Score.student_id == Student.id)
                        .filter(Student.advisor_id == advisor_id)
                    )
                    if start_date:
                        q = q.filter(Score.date >= start_date)
                    rows = q.group_by(Score.date).order_by(Score.date).all()
                    series.append({
                        "id": "All Students - score",
                        "data": [{"x": r.date.isoformat(), "y": float(r.value)} for r in rows],
                    })
                elif data_type == "mood":
                    q = (
                        db.session.query(MoodSubmission.date, func.avg(MoodSubmission.slider_value).label("value"))
                        .join(Student, MoodSubmission.student_id == Student.id)
                        .filter(Student.advisor_id == advisor_id)
                    )
                    if start_date:
                        q = q.filter(MoodSubmission.date >= start_date)
                    rows = q.group_by(MoodSubmission.date).order_by(MoodSubmission.date).all()
                    series.append({
                        "id": "All Students - mood",
                        "data": [{"x": r.date.isoformat(), "y": float(r.value)} for r in rows],
                    })
                elif data_type == "form":
                    q = (
                        db.session.query(FormSubmission.date, func.count(FormSubmission.id).label("value"))
                        .join(Student, FormSubmission.student_id == Student.id)
                        .filter(Student.advisor_id == advisor_id)
                    )
                    if start_date:
                        q = q.filter(FormSubmission.date >= start_date)
                    rows = q.group_by(FormSubmission.date).order_by(FormSubmission.date).all()
                    series.append({
                        "id": "All Students - form",
                        "data": [{"x": r.date.isoformat(), "y": int(r.value)} for r in rows],
                    })
            else:
                # Normalize possible string IDs from client
                if isinstance(student_id, str) and student_id.isdigit():
                    student_id = int(student_id)

                if data_type == "score":
                    q = Score.query.filter_by(student_id=student_id)
                    if start_date:
                        q = q.filter(Score.date >= start_date)
                    rows = q.order_by(Score.date.asc()).all()
                    series.append({
                        "id": f"Student {student_id} - score",
                        "data": [{"x": s.date.isoformat(), "y": s.daily_score} for s in rows],
                    })
                elif data_type == "mood":
                    q = MoodSubmission.query.filter_by(student_id=student_id)
                    if start_date:
                        q = q.filter(MoodSubmission.date >= start_date)
                    rows = q.order_by(MoodSubmission.date.asc()).all()
                    series.append({
                        "id": f"Student {student_id} - mood",
                        "data": [{"x": m.date.isoformat(), "y": m.slider_value} for m in rows],
                    })
                elif data_type == "form":
                    q = FormSubmission.query.filter_by(student_id=student_id)
                    if start_date:
                        q = q.filter(FormSubmission.date >= start_date)
                    rows = q.order_by(FormSubmission.date.asc()).all()
                    series.append({
                        "id": f"Student {student_id} - form",
                        "data": [{"x": f.date.isoformat(), "y": 1} for f in rows],
                    })

        return jsonify(series), 200
