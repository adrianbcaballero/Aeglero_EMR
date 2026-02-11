"""
AEGLERO EMR - Performance Baseline Test
Run this to measure current query performance
"""

import time
from app import app, db
from models import Student, Advisor, MoodSubmission, FormSubmission, Score

print("="*80)
print("AEGLERO EMR - PERFORMANCE BASELINE")
print("="*80)

with app.app_context():
    
    print(f"\nQUERY PERFORMANCE TESTS:")
    print("-" * 80)
    
    # Test 1: Simple SELECT
    try:
        start = time.time()
        students = Student.query.limit(10).all()
        duration = (time.time() - start) * 1000
        print(f"✓ Test 1 - Simple SELECT (10 rows)")
        print(f"  Time: {duration:.2f} ms")
        print(f"  Records returned: {len(students)}")
    except Exception as e:
        print(f"✗ Test 1 failed: {e}")
    
    # Test 2: JOIN query
    try:
        start = time.time()
        results = db.session.query(Student, MoodSubmission)\
            .join(MoodSubmission, Student.id == MoodSubmission.student_id, isouter=True)\
            .limit(10).all()
        duration = (time.time() - start) * 1000
        print(f"\n✓ Test 2 - JOIN query (Students + Moods)")
        print(f"  Time: {duration:.2f} ms")
        print(f"  Records returned: {len(results)}")
    except Exception as e:
        print(f"\n✗ Test 2 failed: {e}")
    
    # Test 3: Aggregation
    try:
        start = time.time()
        results = db.session.query(
            Student.name,
            db.func.count(MoodSubmission.id).label('mood_count')
        ).outerjoin(MoodSubmission, Student.id == MoodSubmission.student_id)\
         .group_by(Student.id, Student.name)\
         .all()
        duration = (time.time() - start) * 1000
        print(f"\n✓ Test 3 - Aggregation (Count moods per student)")
        print(f"  Time: {duration:.2f} ms")
        print(f"  Students processed: {len(results)}")
    except Exception as e:
        print(f"\n✗ Test 3 failed: {e}")
    
    # Test 4: Complex multi-JOIN
    try:
        start = time.time()
        results = db.session.query(
            Student.name,
            db.func.count(db.distinct(MoodSubmission.id)).label('mood_count'),
            db.func.count(db.distinct(FormSubmission.id)).label('form_count'),
            db.func.avg(Score.daily_score).label('avg_score')
        ).outerjoin(MoodSubmission, Student.id == MoodSubmission.student_id)\
         .outerjoin(FormSubmission, Student.id == FormSubmission.student_id)\
         .outerjoin(Score, Student.id == Score.student_id)\
         .group_by(Student.id, Student.name)\
         .all()
        duration = (time.time() - start) * 1000
        print(f"\n✓ Test 4 - Complex Multi-JOIN (All tables)")
        print(f"  Time: {duration:.2f} ms")
        print(f"  Students processed: {len(results)}")
    except Exception as e:
        print(f"\n✗ Test 4 failed: {e}")
    
    # Test 5: Full table scan
    try:
        start = time.time()
        all_students = Student.query.all()
        duration = (time.time() - start) * 1000
        print(f"\nTest 5 - Full Table Scan (All Students)")
        print(f"  Time: {duration:.2f} ms")
        print(f"  Total records: {len(all_students)}")
    except Exception as e:
        print(f"\n✗ Test 5 failed: {e}")
    
    print(f"\n" + "="*80)
    print("PERFORMANCE TESTING COMPLETE")
    print("="*80)
    