"""
AEGLERO EMR - Database Baseline Check
Run this to count tables and records
"""

from app import app, db
from models import Student, Advisor, MoodSubmission, FormSubmission, Score
from sqlalchemy import inspect

print("="*80)
print("AEGLERO EMR - DATABASE BASELINE")
print("="*80)

with app.app_context():
    # Count tables
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"\n DATABASE STRUCTURE:")
    print(f"Total Tables: {len(tables)}")
    print(f"Table Names: {', '.join(tables)}")
    
    # Count records in each table
    print(f"\n RECORD COUNTS:")
    try:
        student_count = Student.query.count()
        advisor_count = Advisor.query.count()
        mood_count = MoodSubmission.query.count()
        form_count = FormSubmission.query.count()
        score_count = Score.query.count()
        
        print(f"  Students: {student_count}")
        print(f"  Advisors: {advisor_count}")
        print(f"  Mood Submissions: {mood_count}")
        print(f"  Form Submissions: {form_count}")
        print(f"  Scores: {score_count}")
        
        total_records = student_count + advisor_count + mood_count + form_count + score_count
        print(f"\n  Total Records: {total_records}")
        
    except Exception as e:
        print(f"  Error counting records: {e}")
    
    # Feature inventory
    print(f"\nCURRENT FEATURES:")
    features = [
        "User authentication (login/logout)",
        "Create student accounts",
        "Create advisor accounts", 
        "Submit mood entries",
        "Submit form/journal entries",
        "View student list",
        "View student submissions",
        "Advisor-student relationships",
        "Daily score calculation",
        "Date-based tracking",
        "Basic data viewing via API"
    ]
    
    for i, feature in enumerate(features, 1):
        print(f"  {i}. {feature}")
    
    print(f"\n  Total Features: {len(features)}")
    
    # Missing features
    print(f"\nMISSING FEATURES (TO BE IMPLEMENTED):")
    missing = [
        "Analytics Dashboard",
        "Audit Trail System",
        "Automated Report Generation",
        "PDF Export",
        "CSV Export", 
        "Excel Export",
        "Real-time KPI Tracking",
        "Business Intelligence Dashboard",
        "Scheduled Reports",
        "Compliance Audit Logs"
    ]
    
    for i, feature in enumerate(missing, 1):
        print(f"  {i}. {feature}")
    
    print(f"\n  Total Missing: {len(missing)}")
    
    print(f"\n" + "="*80)
    print("BASELINE CHECK COMPLETE")
    print("="*80)