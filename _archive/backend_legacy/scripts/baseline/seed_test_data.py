"""
AEGLERO EMR - Seed Test Data for Baseline Testing

Creates realistic test data to measure performance metrics.
Run this ONCE before baseline testing.
"""

from app import app, db
from models import Student, Advisor, MoodSubmission, FormSubmission, Score
from datetime import datetime, timedelta
import random

print("="*80)
print("AEGLERO EMR - SEEDING TEST DATA")
print("="*80)

with app.app_context():
    # Check if data already exists
    existing_students = Student.query.count()
    if existing_students > 0:
        print(f"\n⚠️  Database already has {existing_students} students")
        response = input("Do you want to clear and reseed? (yes/no): ")
        if response.lower() != 'yes':
            print("Aborting. No changes made.")
            exit()
        
        # Clear existing data
        print("\nClearing existing data...")
        Score.query.delete()
        FormSubmission.query.delete()
        MoodSubmission.query.delete()
        Student.query.delete()
        Advisor.query.delete()
        db.session.commit()
        print("✓ Existing data cleared")
    
    print("\n📝 Creating test data...")
    
    # Create Advisors
    advisors = []
    advisor_names = [
        "Dr. Sarah Johnson",
        "Dr. Michael Chen",
        "Dr. Emily Rodriguez",
        "Dr. James Williams",
        "Dr. Lisa Anderson"
    ]
    
    for name in advisor_names:
        advisor = Advisor(
            name=name,
            password="password123"  # In production, this would be hashed
        )
        advisors.append(advisor)
        db.session.add(advisor)
    
    db.session.commit()
    print(f"✓ Created {len(advisors)} advisors")
    
    # Create Students (50 students for realistic testing)
    students = []
    first_names = ["John", "Emma", "Michael", "Sophia", "William", "Olivia", 
                   "James", "Ava", "Robert", "Isabella", "David", "Mia",
                   "Richard", "Charlotte", "Joseph", "Amelia", "Thomas", "Harper",
                   "Charles", "Evelyn", "Daniel", "Abigail", "Matthew", "Emily",
                   "Anthony", "Elizabeth"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
                  "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez",
                  "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore",
                  "Jackson", "Martin", "Lee", "Perez", "Thompson", "White"]
    
    for i in range(50):
        first = random.choice(first_names)
        last = random.choice(last_names)
        advisor = random.choice(advisors)
        
        student = Student(
            name=f"{first} {last}",
            password="password123",
            advisor_id=advisor.id
        )
        students.append(student)
        db.session.add(student)
    
    db.session.commit()
    print(f"✓ Created {len(students)} students")
    
    # Create Mood Submissions (past 30 days)
    mood_count = 0
    colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DFE6E9"]
    
    for student in students:
        # Each student has 10-30 mood submissions
        num_moods = random.randint(10, 30)
        
        for day in range(num_moods):
            date = datetime.now() - timedelta(days=random.randint(0, 30))
            mood = MoodSubmission(
                student_id=student.id,
                date=date,
                slider_value=random.randint(20, 100),
                image=f"emoji_{random.randint(1,5)}.png",
                color=random.choice(colors)
            )
            db.session.add(mood)
            mood_count += 1
    
    db.session.commit()
    print(f"✓ Created {mood_count} mood submissions")
    
    # Create Form Submissions (journal entries)
    form_count = 0
    categories = ["Academic", "Personal", "Health", "Social", "Career"]
    sample_texts = [
        "Had a great day in class today. Feeling motivated!",
        "Struggled with the exam but learned a lot from the experience.",
        "Met with my advisor about future career plans.",
        "Feeling stressed about upcoming deadlines.",
        "Made progress on my research project.",
        "Connected with classmates for a study group.",
        "Attended a workshop on time management.",
        "Feeling more confident about my abilities.",
        "Need to work on balancing school and personal life.",
        "Grateful for the support from my advisor."
    ]
    
    for student in students:
        # Each student has 5-15 journal entries
        num_forms = random.randint(5, 15)
        
        for _ in range(num_forms):
            date = datetime.now() - timedelta(days=random.randint(0, 30))
            form = FormSubmission(
                student_id=student.id,
                date=date,
                text=random.choice(sample_texts),
                category=random.choice(categories)
            )
            db.session.add(form)
            form_count += 1
    
    db.session.commit()
    print(f"✓ Created {form_count} form submissions")
    
    # Create Scores
    score_count = 0
    
    for student in students:
        # Each student has 15-25 daily scores
        num_scores = random.randint(15, 25)
        
        for day in range(num_scores):
            date = datetime.now() - timedelta(days=day)
            score = Score(
                student_id=student.id,
                date=date,
                daily_score=random.randint(50, 100)
            )
            db.session.add(score)
            score_count += 1
    
    db.session.commit()
    print(f"✓ Created {score_count} daily scores")
    
    # Summary
    print("\n" + "="*80)
    print("DATA SEEDING COMPLETE")
    print("="*80)
    print(f"\nSummary:")
    print(f"  Advisors: {len(advisors)}")
    print(f"  Students: {len(students)}")
    print(f"  Mood Submissions: {mood_count}")
    print(f"  Form Submissions: {form_count}")
    print(f"  Daily Scores: {score_count}")
    print(f"  TOTAL RECORDS: {len(advisors) + len(students) + mood_count + form_count + score_count}")
    
    print(f"\n✅ Database is now ready for baseline performance testing!")
    print(f"\nNext steps:")
    print(f"  1. Run: docker exec cpp-backend python scripts/baseline/check_database.py")
    print(f"  2. Run: docker exec cpp-backend python scripts/baseline/test_performance.py")
    print(f"  3. Record the performance metrics\n")