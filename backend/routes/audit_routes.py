import time
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from backend.auth import require_auth

audit_bp = Blueprint("audit_bp", __name__)

SAMPLE_AUDIT_LOGS = [
    {
        "id": "audit-1",
        "timestamp": "2026-11-04T14:32:00.000Z",
        "actorId": "user-faculty",
        "actorName": "Prof. Rajesh Deshmukh",
        "role": "FACULTY",
        "action": "ATTENDANCE_OVERRIDE",
        "targetSessionId": "sess-prev-1",
        "studentName": "Samoh Baiin (20000004)",
        "previousStatus": "Absent",
        "newStatus": "Present",
        "reason": "Submitted valid medical certificate verified by HOD"
    },
    {
        "id": "audit-2",
        "timestamp": "2026-11-03T11:15:00.000Z",
        "actorId": "user-admin",
        "actorName": "Dr. Anita Roy",
        "role": "ADMIN",
        "action": "STATUTORY_THRESHOLD_CHANGE",
        "targetSessionId": "global-config",
        "studentName": "Institutional Setting",
        "previousStatus": "75.0%",
        "newStatus": "75.0% (Re-confirmed)",
        "reason": "Mandatory University Grants Commission semester audit check"
    }
]

@audit_bp.route("/api/v1/audit/logs", methods=["GET"])
@require_auth()
def list_logs():
    return jsonify({
        "success": True,
        "logs": SAMPLE_AUDIT_LOGS,
        "total": len(SAMPLE_AUDIT_LOGS)
    }), 200

@audit_bp.route("/api/v1/audit/logs", methods=["POST"])
@require_auth()
def record_log():
    data = request.get_json() or {}
    actor_id = g.current_user.get("sub", "user-faculty")
    actor_name = g.current_user.get("name", "Faculty Member")
    role = g.current_user.get("role", "FACULTY")
    action = data.get("action", "RECORD_MUTATION")
    target_id = data.get("targetSessionId", "system")
    student_name = data.get("studentName", "Student")
    prev_status = data.get("previousStatus", "N/A")
    new_status = data.get("newStatus", "N/A")
    reason = data.get("reason", "").strip()
    
    if not reason:
        return jsonify({"error": {"code": "MISSING_REASON", "message": "Written justification is mandatory for audit trail logging."}}), 400
        
    entry = {
        "id": f"audit-{int(time.time() * 1000)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actorId": actor_id,
        "actorName": actor_name,
        "role": role,
        "action": action,
        "targetSessionId": target_id,
        "studentName": student_name,
        "previousStatus": prev_status,
        "newStatus": new_status,
        "reason": reason
    }
    
    SAMPLE_AUDIT_LOGS.insert(0, entry)
    return jsonify({"success": True, "log": entry}), 201
