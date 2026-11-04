from flask import Blueprint, request, jsonify, Response
from backend.auth import require_auth
from backend.routes.academic_routes import SAMPLE_STUDENTS

reports_bp = Blueprint("reports_bp", __name__)

@reports_bp.route("/api/v1/reports/defaulters", methods=["GET"])
@require_auth()
def get_defaulters():
    threshold = float(request.args.get("threshold", "75.0"))
    department = request.args.get("department")
    
    defaulters = []
    for s in SAMPLE_STUDENTS:
        if department and department != "All" and s.get("department") != department:
            continue
        rate = float(s.get("attendanceRate", 100.0))
        if rate < threshold:
            conducted = s.get("totalConducted", 40)
            attended = s.get("totalAttended", 0)
            # Statutory shortfall calculation
            required_attended = round((threshold / 100.0) * conducted)
            shortfall = max(0, required_attended - attended)
            
            defaulters.append({
                **s,
                "shortfall": shortfall,
                "statutoryThreshold": threshold,
                "tier": "CRITICAL" if rate < 70.0 else "WARNING"
            })
            
    return jsonify({
        "success": True,
        "threshold": threshold,
        "totalEvaluated": len(SAMPLE_STUDENTS),
        "defaultersCount": len(defaulters),
        "defaulters": defaulters
    }), 200

@reports_bp.route("/api/v1/reports/export-csv", methods=["POST"])
@require_auth()
def export_csv():
    data = request.get_json() or {}
    threshold = float(data.get("threshold", "75.0"))
    
    csv_lines = [
        "RollNo,FullName,Email,Department,Semester,Conducted,Attended,AttendanceRate,Shortfall,Status"
    ]
    for s in SAMPLE_STUDENTS:
        rate = float(s.get("attendanceRate", 100.0))
        if rate < threshold:
            conducted = s.get("totalConducted", 40)
            attended = s.get("totalAttended", 0)
            required = round((threshold / 100.0) * conducted)
            shortfall = max(0, required - attended)
            status = "CRITICAL" if rate < 70.0 else "WARNING"
            csv_lines.append(
                f'{s["rollNo"]},"{s["name"]}",{s["email"]},{s["department"]},{s["semester"]},{conducted},{attended},{rate}%,{shortfall},{status}'
            )
            
    csv_content = "\n".join(csv_lines)
    return Response(
        csv_content,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=attendora_defaulters_report.csv"}
    )

