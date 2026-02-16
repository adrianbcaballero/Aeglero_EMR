# scoring risk level
from datetime import datetime, timezone, timedelta

from extensions import db
from models import Patient, ClinicalNote


#keywords that should push risk up fast
FLAGGED_KEYWORDS = {
    "suicidal", "suicide", "self-harm", "self harm", "cutting",
    "overdose", "homicidal", "kill myself", "kill him", "kill her",
    "plan to die", "want to die", "panic attack", "psychosis", "hallucination"
}

#diagnoses that tend to be higher baseline risk (keep this simple + editable)
HIGH_SEVERITY_DIAG = {
    "bipolar", "schizophrenia", "psychosis", "major depressive disorder",
    "mdd", "ptsd", "borderline", "substance use", "opioid use"
}

MODERATE_SEVERITY_DIAG = {
    "gad", "generalized anxiety", "anxiety", "panic", "adhd", "depression"
}


def _contains_flagged(text: str) -> bool:
    if not text:
        return False
    t = text.lower()
    return any(k in t for k in FLAGGED_KEYWORDS)


def _diagnosis_bucket(diagnosis: str) -> str:
    """
    Returns: 'high' | 'moderate' | 'low'
    """
    if not diagnosis:
        return "low"
    d = diagnosis.lower()

    if any(k in d for k in HIGH_SEVERITY_DIAG):
        return "high"
    if any(k in d for k in MODERATE_SEVERITY_DIAG):
        return "moderate"
    return "low"


def calculate_risk_level(patient_id: int) -> str:
    """
    Explainable risk scoring (rule-based):
    1) If any recent note contains flagged keywords -> high
    2) Otherwise use diagnosis bucket + recent note frequency
    """
    patient = Patient.query.get(patient_id)
    if not patient:
        return "low"

    now = datetime.now(timezone.utc)
    since_30d = now - timedelta(days=30)

    #Recent notes
    notes = (
        ClinicalNote.query
        .filter(ClinicalNote.patient_id == patient_id, ClinicalNote.created_at >= since_30d)
        .all()
    )

    #Rule 1: flagged keywords
    for n in notes:
        if _contains_flagged(n.summary) or _contains_flagged(n.diagnosis):
            return "high"

    #Rule 2: diagnosis baseline
    diag_bucket = _diagnosis_bucket(patient.primary_diagnosis)

    #Rule 3: frequency bump (based on how many notes in last 30 days)
    count = len(notes)

    #frequency thresholds (CAN CHANGE IDK)
    if count >= 6:
        freq_bucket = "high"
    elif count >= 3:
        freq_bucket = "moderate"
    else:
        freq_bucket = "low"

    #combine buckets (take the higher of the two)
    order = {"low": 0, "moderate": 1, "high": 2}
    combined = max(diag_bucket, freq_bucket, key=lambda x: order[x])

    return combined
