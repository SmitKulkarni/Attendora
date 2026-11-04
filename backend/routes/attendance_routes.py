import time
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from backend.auth import require_auth

attendance_bp = Blueprint("attendance_bp", __name__)

SAMPLE_SESSIONS = [
    {
        "id": "sess-prev-1",
        "subjectCode": "CS603",
        "subjectName": "Database Management Systems & Relational Theory",
        "department": "Computer Sci.",
        "semester": 6,
        "section": "A",
        "facultyId": "user-faculty",
        "facultyName": "Prof. Rajesh Deshmukh",
        "date": "2026-11-04",
        "timeSlot": "02:00 PM - 03:00 PM",
        "totalEnrolled": 10,
        "presentCount": 9,
        "absentCount": 1,
        "isLocked": True,
        "records": [
            {"studentId": "stu-1", "rollNo": "20000001", "studentName": "Heuren Name", "status": "Present"},
            {"studentId": "stu-2", "rollNo": "20000002", "studentName": "Kenrii Anay", "status": "Present"},
            {"studentId": "stu-4", "rollNo": "20000004", "studentName": "Samoh Baiin", "status": "Absent"}
        ],
        "createdAt": "2026-11-04T14:55:00.000Z"
    }
]

@attendance_bp.route("/api/v1/attendance/sessions", methods=["GET"])
@require_auth()
def list_sessions():
    return jsonify({"success": True, "sessions": SAMPLE_SESSIONS, "total": len(SAMPLE_SESSIONS)}), 200

@attendance_bp.route("/api/v1/attendance/sessions", methods=["POST"])
@require_auth(allowed_roles=["COLLEGE_ADMIN", "ADMIN", "FACULTY"])
def create_session():
    data = request.get_json() or {}
    subject_code = data.get("subjectCode")
    subject_name = data.get("subjectName")
    department = data.get("department", "Computer Sci.")
    semester = data.get("semester", 6)
    section = data.get("section", "A")
    time_slot = data.get("timeSlot", "10:00 AM - 11:00 AM")
    date_str = data.get("date", datetime.now().strftime("%Y-%m-%d"))
    records = data.get("records", [])
    
    if not subject_code or not records:
        return jsonify({"error": {"code": "INVALID_SESSION_DATA", "message": "Missing subjectCode or student records"}}), 400
        
    present_count = sum(1 for r in records if r.get("status") == "Present")
    absent_count = len(records) - present_count
    now_iso = datetime.now(timezone.utc).isoformat()
    session_id = f"sess-{int(time.time() * 1000)}"
    
    # Enforce Session Lock on initial submit (ADR-007)
    new_session = {
        "id": session_id,
        "subjectCode": subject_code,
        "subjectName": subject_name,
        "department": department,
        "semester": semester,
        "section": section,
        "facultyId": g.current_user.get("sub", "user-faculty"),
        "facultyName": g.current_user.get("name", "Faculty Member"),
        "date": date_str,
        "timeSlot": time_slot,
        "totalEnrolled": len(records),
        "presentCount": present_count,
        "absentCount": absent_count,
        "isLocked": True,
        "records": records,
        "createdAt": now_iso
    }
    
    SAMPLE_SESSIONS.insert(0, new_session)
    return jsonify({"success": True, "session": new_session}), 201

@attendance_bp.route("/api/v1/attendance/sessions/<session_id>", methods=["PATCH"])
@require_auth(allowed_roles=["COLLEGE_ADMIN", "ADMIN", "FACULTY"])
def override_session(session_id):
    data = request.get_json() or {}
    reason = data.get("reason", "").strip()
    updated_records = data.get("records")
    
    if not reason:
        return jsonify({"error": {"code": "MISSING_JUSTIFICATION", "message": "Modifying a finalized attendance session requires a written justification reason under compliance rules."}}), 400
        
    target_session = next((s for s in SAMPLE_SESSIONS if s["id"] == session_id), None)
    if not target_session:
        return jsonify({"error": {"code": "NOT_FOUND", "message": "Session not found"}}), 404
        
    if updated_records:
        present_count = sum(1 for r in updated_records if r.get("status") == "Present")
        target_session["records"] = updated_records
        target_session["presentCount"] = present_count
        target_session["absentCount"] = len(updated_records) - present_count
        
    target_session["modifiedAt"] = datetime.now(timezone.utc).isoformat()
    target_session["modificationReason"] = reason
    
    return jsonify({"success": True, "session": target_session}), 200
