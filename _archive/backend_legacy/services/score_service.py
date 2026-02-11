# backend/services/score_service.py
from openai import OpenAI
import re
from datetime import date
from models import db, Score


# OpenAI client for sentiment analysis
client = OpenAI()  # read API key


# Analyze text sentiment using GPT-4 and return score from -1 to 1
def get_sentiment_score(text):
    prompt = f"Please evaluate the emotional or mental state expressed in the following text on a scale from -1 to 1:\n{text}"

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    message = response.choices[0].message.content
    match = re.search(r'-?\d+\.\d+', message)
    return float(match.group()) if match else 0.0


# Generate text summary based on user input values
def summarize_mood(slider_value, color, image_name, score, sentiment_text=None):
    mood_info = f"""
    Slider value: {slider_value}
    Color selected: {color}
    Image selected: {image_name}
    Final score: {score}
    """
    if sentiment_text:
        mood_info += f"\nJournal text: {sentiment_text}"

    prompt = f"""Based on the following mood inputs, write a short summary (1-2 sentences) in English that describes the user's current emotional state. Be supportive and empathetic.

{mood_info}
"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content.strip()


# Use AI to evaluate symbolic input like colors or image labels
def get_symbolic_sentiment_score(input_type, value):
    prompt = f"""As a psychologist, rate the emotional impact of this {input_type} on a scale from -1 (very negative) to 1 (very positive). Return only a number.

{value}
"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    match = re.search(r'-?\d+\.\d+', response.choices[0].message.content)
    return float(match.group()) if match else 0.0


# Calculate and store the final mental health score in the database
def calculate_and_store_score(student_id, mood_submission, image_name, form_submission=None, ):

    # AI transfer color and image to score
    color_score = get_symbolic_sentiment_score("color", mood_submission.color)
    image_score = get_symbolic_sentiment_score("image", image_name)

    # Convert -1~1 → 0~20, then combine with slider
    base_score = (
        mood_submission.slider_value
        + int((color_score + 1) * 10)
        + int((image_score + 1) * 10)
    )

    # User add text form, and it adds text score
    if form_submission:
        sentiment = get_sentiment_score(form_submission.text)
        text_score = int((sentiment + 1) * 50)
        final_score = int(text_score * 0.7 + base_score * 0.3)
    else:
        final_score = base_score

    # Clamp score between 0 and 100
    final_score = max(0, min(100, final_score))

    # Save or update the score (1 entry per student per day)
    today = mood_submission.date
    existing = Score.query.filter_by(student_id=student_id, date=today).first()

    if existing:
        existing.daily_score = final_score
    else:
        new_score = Score(
            student_id=student_id,
            date=today,
            daily_score=final_score
        )
        db.session.add(new_score)

    db.session.commit()
    return {
        "score": final_score,
        "summary": summarize_mood(
            mood_submission.slider_value,
            mood_submission.color,
            image_name,
            final_score,
            form_submission.text if form_submission else None
        )
    }


