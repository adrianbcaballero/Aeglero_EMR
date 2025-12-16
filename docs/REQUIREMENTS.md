# User Requirements Document

## Aeglero EMR - Mental Health Electronic Medical Records Platform

**Version:** First 
**Author:** Adrian Caballero  
**Last Updated:** December 2025

---

## 1. Executive Summary

This document defines the user requirements for the Aeglero EMR platform, a web-based mental health electronic medical records system designed to support clinical workflows for mental health advisors and their patients.

---

## 2. Project Scope

### 2.1 In Scope
- Patient mood tracking and journaling
- Advisor dashboard for patient monitoring
- Role-based authentication (Advisor/Patient)
- Data visualization and trend analysis
- Secure data storage with audit capabilities

### 2.2 Out of Scope
- Prescription management
- Insurance billing integration
- Video conferencing
- Third-party EHR integration

---

## 3. User Roles

### 3.1 Advisor (Clinician)
Mental health professionals who monitor and support multiple patients.

**Needs:**
- View all assigned patients at a glance
- Identify high-priority patients quickly
- Track patient mood trends over time
- Access complete patient history
- Search and filter patient records

### 3.2 Patient (Student)
Individuals receiving mental health support who track their daily wellness.

**Needs:**
- Log daily mood easily
- Record journal entries with categorization
- Secure access to personal data
- Simple, intuitive interface

---

## 4. Functional Requirements

### 4.1 Authentication System

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | System shall support separate login for advisors and patients | High |
| FR-AUTH-02 | System shall prevent duplicate mood submissions on the same day | High |
| FR-AUTH-03 | System shall assign new patients to an advisor automatically | Medium |
| FR-AUTH-04 | System shall validate credentials before granting access | High |

### 4.2 Patient Mood Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MOOD-01 | Patients shall submit one mood entry per day | High |
| FR-MOOD-02 | Mood entry shall include slider value (0-100) | High |
| FR-MOOD-03 | Mood entry shall include color selection | Medium |
| FR-MOOD-04 | Mood entry shall include emoji/image selection | Medium |
| FR-MOOD-05 | System shall timestamp all mood submissions | High |

### 4.3 Journal Entries

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-FORM-01 | Patients shall submit text-based journal entries | High |
| FR-FORM-02 | Entries shall be categorized (Personal, Academic, Career, Social) | Medium |
| FR-FORM-03 | Entries shall be dated and timestamped | High |
| FR-FORM-04 | Entries shall be viewable by assigned advisor | High |

### 4.4 Advisor Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-01 | Advisors shall view list of all assigned patients | High |
| FR-DASH-02 | Dashboard shall display patient priority scores | High |
| FR-DASH-03 | Dashboard shall show most recent submission date | Medium |
| FR-DASH-04 | Advisors shall search patients by name | Medium |
| FR-DASH-05 | Advisors shall filter patients by date | Medium |
| FR-DASH-06 | Advisors shall filter patients by score value | Medium |

### 4.5 Data Visualization

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-VIS-01 | System shall display mood trends as line graphs | High |
| FR-VIS-02 | Graphs shall support multiple patient comparison | Medium |
| FR-VIS-03 | Graphs shall support time range filtering | Medium |
| FR-VIS-04 | Graphs shall display different score metrics | Medium |

### 4.6 Patient Detail View

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DET-01 | Advisors shall view complete mood submission history | High |
| FR-DET-02 | Advisors shall view all journal entries for a patient | High |
| FR-DET-03 | Advisors shall view calculated score history | High |
| FR-DET-04 | Detail view shall be scrollable for long histories | Medium |

---

## 5. Non-Functional Requirements

### 5.1 Security

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-SEC-01 | System shall implement role-based access control | High |
| NFR-SEC-02 | Patient data shall only be visible to assigned advisor | High |
| NFR-SEC-03 | All data modifications shall be timestamped | High |
| NFR-SEC-04 | System shall support HTTPS encryption | High |
| NFR-SEC-05 | System shall follow HIPAA compliance guidelines | High |

### 5.2 Performance

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-PERF-01 | Dashboard shall load within 3 seconds | Medium |
| NFR-PERF-02 | Search results shall return within 1 second | Medium |
| NFR-PERF-03 | System shall support concurrent users | Medium |

### 5.3 Usability

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-USE-01 | Interface shall be intuitive without training | High |
| NFR-USE-02 | System shall be accessible on desktop browsers | High |
| NFR-USE-03 | System shall provide clear error messages | Medium |

### 5.4 Reliability

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-REL-01 | System shall be available 99% of the time | Medium |
| NFR-REL-02 | Data shall be backed up regularly | High |
| NFR-REL-03 | System shall handle errors gracefully | Medium |

---

## 6. Data Requirements

### 6.1 Data Entities

| Entity | Description | Key Fields |
|--------|-------------|------------|
| Advisor | Mental health professional | id, name, password |
| Student | Patient/client | id, name, password, advisor_id, created_at |
| MoodSubmission | Daily mood entry | id, student_id, date, slider_value, image, color, created_at |
| FormSubmission | Journal entry | id, student_id, date, text, category, created_at |
| Score | Calculated daily score | id, student_id, date, daily_score, created_at |

### 6.2 Data Relationships

- One Advisor has many Students (1:N)
- One Student has many MoodSubmissions (1:N)
- One Student has many FormSubmissions (1:N)
- One Student has many Scores (1:N)
- One Student can have only one MoodSubmission per day (unique constraint)

### 6.3 Data Retention

- All patient data shall be retained indefinitely
- Audit timestamps shall be immutable
- Deleted records shall be soft-deleted (future enhancement)

---

## 7. Acceptance Criteria

### 7.1 Authentication
- [ ] Advisors can log in and see their dashboard
- [ ] Patients can log in and submit mood entries
- [ ] Patients cannot log in twice on the same day after submitting
- [ ] Invalid credentials display error message

### 7.2 Mood Tracking
- [ ] Patients can submit mood with slider, color, and image
- [ ] Submissions are saved with correct date and timestamp
- [ ] Duplicate submissions on same day are prevented

### 7.3 Advisor Dashboard
- [ ] Advisors see only their assigned patients
- [ ] Patient list shows scores and dates
- [ ] Search by name returns matching patients
- [ ] Graphs display mood trends correctly

### 7.4 Patient Detail View
- [ ] All mood submissions are displayed
- [ ] All journal entries are displayed
- [ ] Score history is displayed
- [ ] Data is sorted by date (most recent first)

---

## 8. Sign-Off


---

*Document Version History*


