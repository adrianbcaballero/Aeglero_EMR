#models
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Advisor(db.Model):
    __tablename__ = 'advisors'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)

    # Establishes 1:N relationship with students
    students = db.relationship("Student", backref="advisor", lazy=True)


class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)

    advisor_id = db.Column(db.Integer, db.ForeignKey('advisors.id'), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class MoodSubmission(db.Model):
    __tablename__ = 'mood_submissions'

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    student = db.relationship('Student', backref='mood_submissions', lazy=True)

    date = db.Column(db.Date, nullable=False)  # 👈 just the date
    slider_value = db.Column(db.Integer, nullable=False)  # 0–100
    image = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(20), nullable=False)  # validated on frontend/backend

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    __table_args__ = (
        db.UniqueConstraint('student_id', 'date', name='_mood_student_date_uc'),
    )

class FormSubmission(db.Model):
    __tablename__ = 'form_submissions'

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    student = db.relationship('Student', backref='form_submissions', lazy=True)

    date = db.Column(db.Date, nullable=False)
    text = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Score(db.Model):
    __tablename__ = 'scores'

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    student = db.relationship('Student', backref='scores', lazy=True)

    date = db.Column(db.Date, nullable=False)  # 1 entry per student per day

    daily_score = db.Column(db.Integer, nullable=False)  #this is just mood plus journal YOU CAN CHANGE THIS 

    created_at = db.Column(db.DateTime, server_default=db.func.now())

    __table_args__ = (db.UniqueConstraint('student_id', 'date', name='_student_date_uc'),)
