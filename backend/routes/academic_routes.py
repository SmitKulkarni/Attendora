import re
from flask import Blueprint, request, jsonify, g
from backend.auth import require_auth

academic_bp = Blueprint("academic_bp", __name__)

# In-memory mock database state for demo / standalone execution
SAMPLE_STUDENTS = [
    {
        "id": "stu-1",
        "rollNo": "20000001",
        "name": "Heuren Name",
        "email": "heuren.name@student.attendora.edu",
        "department": "Computer Sci.",
        "semester": 6,
        "section": "A",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
        "totalConducted": 40,
        "totalAttended": 35,
        "attendanceRate": 87.5,
        "status": "Present"
    },
    {
        "id": "stu-2",
        "rollNo": "20000002",
        "name": "Kenrii Anay",
        "email": "kenrii.anay@student.attendora.edu",
        "department": "Computer Sci.",
        "semester": 6,
        "section": "A",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
        "totalConducted": 40,
        "totalAttended": 34,
        "attendanceRate": 85.0,
        "status": "Present"
    },
    {
        "id": "stu-3",
        "rollNo": "20000003",
        "name": "Karey Matton",
        "email": "karey.matton@student.attendora.edu",
        "department": "Computer Sci.",
        "semester": 6,
        "section": "A",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
        "totalConducted": 40,
        "totalAttended": 33,
        "attendanceRate": 82.5,
        "status": "Present"
    },
    {
        "id": "stu-4",
        "rollNo": "20000004",
        "name": "Samoh Baiin",
        "email": "samoh.baiin@student.attendora.edu",
        "department": "Computer Sci.",
        "semester": 6,
        "section": "A",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120",
        "totalConducted": 40,
        "totalAttended": 27,
        "attendanceRate": 67.5,
        "status": "Low Rate",
        "notes": "Medical certificate pending verification"
    },
    {
        "id": "stu-5",
        "rollNo": "20000005",
        "name": "Pooja Sharma",
        "email": "pooja.sharma@student.attendora.edu",
        "department": "Computer Sci.",
        "semester": 6,
        "section": "A",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
        "totalConducted": 40,
        "totalAttended": 36,
        "attendanceRate": 90.0,
        "status": "Present"
    }
]

SAMPLE_COURSES = [
    {
        "id": "crs-1",
        "code": "CS601",
        "name": "Mathematics IV & Numerical Analysis",
        "shortName": "Maths",
        "facultyName": "Dr. V. Raman",
        "department": "Computer Sci.",
        "semester": 6,
        "totalConducted": 20,
        "totalAttended": 17,
        "percentage": 85.0,
        "status": "Safe",
        "room": "LH-201",
        "nextLectureSlot": "Today, 10:00 AM - 11:00 AM"
    },
    {
        "id": "crs-2",
        "code": "CS602",
        "name": "Applied Physics & Quantum Optics",
        "shortName": "Physics",
        "facultyName": "Prof. K. Verma",
        "department": "Computer Sci.",
        "semester": 6,
        "totalConducted": 20,
        "totalAttended": 16,
        "percentage": 80.0,
        "status": "Low",
        "room": "Lab-3",
        "nextLectureSlot": "Tomorrow, 09:00 AM - 10:00 AM"
    },
    {
        "id": "crs-3",
        "code": "CS603",
        "name": "Database Management Systems & Relational Theory",
        "shortName": "Computer Sci.",
        "facultyName": "Prof. Rajesh Deshmukh",
        "department": "Computer Sci.",
        "semester": 6,
        "totalConducted": 22,
        "totalAttended": 18,
        "percentage": 81.8,
        "status": "Safe",
        "room": "LH-104",
        "nextLectureSlot": "Today, 02:00 PM - 03:00 PM"
    },
    {
        "id": "crs-4",
        "code": "CS604",
        "name": "Data Structures & Algorithms in C++",
        "shortName": "Data Structures",
        "facultyName": "Prof. S. Iyer",
        "department": "Computer Sci.",
        "semester": 6,
        "totalConducted": 25,
        "totalAttended": 17,
        "percentage": 68.0,
        "status": "Critical",
        "room": "LH-205",
        "nextLectureSlot": "Friday, 11:15 AM - 12:15 PM"
    }
]

@academic_bp.route("/api/v1/students", methods=["GET"])
@require_auth()
def get_students():
    query = request.args.get("q", "").strip().lower()
    department = request.args.get("department")
    status = request.args.get("status")
    
    results = SAMPLE_STUDENTS
    if query:
        results = [s for s in results if query in s["name"].lower() or query in s["rollNo"].lower()]
    if department and department != "All":
        results = [s for s in results if s["department"] == department]
    if status and status != "All":
        results = [s for s in results if s["status"] == status]
        
    return jsonify({"success": True, "students": results, "total": len(results)}), 200

@academic_bp.route("/api/v1/courses", methods=["GET"])
@require_auth()
def get_courses():
    return jsonify({"success": True, "courses": SAMPLE_COURSES, "total": len(SAMPLE_COURSES)}), 200

@academic_bp.route("/api/v1/students/bulk", methods=["POST"])
@require_auth(allowed_roles=["COLLEGE_ADMIN", "ADMIN"])
def bulk_import():
    data = request.get_json() or {}
    rows = data.get("rows", [])
    
    if not rows:
        return jsonify({"error": {"code": "EMPTY_PAYLOAD", "message": "No student rows supplied"}}), 400
    
    errors = []
    valid_students = []
    seen_rolls = set(s["rollNo"] for s in SAMPLE_STUDENTS)
    email_regex = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    
    for idx, row in enumerate(rows, start=1):
        roll_no = str(row.get("rollNo", "")).strip()
        full_name = str(row.get("fullName", "")).strip()
        email = str(row.get("email", "")).strip()
        dept = str(row.get("department", "")).strip()
        
        if not roll_no:
            errors.append({"row": idx, "reason": "Missing Roll Number"})
            continue
        if roll_no in seen_rolls:
            errors.append({"row": idx, "reason": f"Duplicate Roll Number: {roll_no}"})
            continue
        if not full_name:
            errors.append({"row": idx, "reason": "Missing Full Name"})
            continue
        if not email or not email_regex.match(email):
            errors.append({"row": idx, "reason": f"Invalid email address: {email}"})
            continue
        if not dept:
            errors.append({"row": idx, "reason": "Missing Department"})
            continue
            
        seen_rolls.add(roll_no)
        new_student = {
            "id": f"stu-imp-{idx}-{roll_no}",
            "rollNo": roll_no,
            "name": full_name,
            "email": email,
            "department": dept,
            "semester": int(row.get("semester", 6)),
            "section": str(row.get("section", "A")),
            "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
            "totalConducted": 40,
            "totalAttended": 40,
            "attendanceRate": 100.0,
            "status": "Present"
        }
        valid_students.append(new_student)
    
    if errors:
        return jsonify({
            "success": False,
            "importedCount": 0,
            "errors": errors
        }), 422
    
    SAMPLE_STUDENTS.extend(valid_students)
    return jsonify({
        "success": True,
        "importedCount": len(valid_students),
        "students": valid_students
    }), 201

@academic_bp.route("/api/v1/students/<student_id>/rate", methods=["PATCH"])
@require_auth(allowed_roles=["COLLEGE_ADMIN", "ADMIN", "FACULTY"])
def update_rate(student_id):
    data = request.get_json() or {}
    new_rate = data.get("attendanceRate")
    reason = data.get("reason", "").strip()
    
    if new_rate is None or not (0 <= float(new_rate) <= 100):
        return jsonify({"error": {"code": "INVALID_RATE", "message": "Attendance rate must be between 0 and 100"}}), 400
    
    if not reason:
        return jsonify({"error": {"code": "MISSING_REASON", "message": "Written justification is required for percentage modifications"}}), 400
        
    for student in SAMPLE_STUDENTS:
        if student["id"] == student_id:
            student["attendanceRate"] = round(float(new_rate), 1)
            student["status"] = "Present" if student["attendanceRate"] >= 75.0 else "Low Rate"
            student["notes"] = reason
            return jsonify({"success": True, "student": student}), 200
            
    return jsonify({"error": {"code": "NOT_FOUND", "message": "Student not found"}}), 404

