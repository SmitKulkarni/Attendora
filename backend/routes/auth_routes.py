from flask import Blueprint, request, jsonify, g
from backend.auth import generate_tokens, decode_token, require_auth

auth_bp = Blueprint("auth_bp", __name__)

# Sample credential map for baseline verification
DEMO_USERS = {
    "anita.roy@attendora.edu": {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Dr. Anita Roy",
        "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "role": "ADMIN",
        "password": "password123",
        "department": "Computer Science & Engineering",
        "designation": "Academic Dean & Principal Administrator"
    },
    "rajesh.deshmukh@attendora.edu": {
        "id": "22222222-2222-2222-2222-222222222222",
        "name": "Prof. Rajesh Deshmukh",
        "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "role": "FACULTY",
        "password": "password123",
        "department": "Computer Science & Engineering",
        "designation": "Assistant Professor (Faculty)"
    },
    "sneha.kulkarni@student.attendora.edu": {
        "id": "33333333-3333-3333-3333-333333333333",
        "name": "Sneha Kulkarni",
        "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "role": "STUDENT",
        "password": "password123",
        "department": "Computer Science & Engineering",
        "rollNo": "20000001"
    }
}

@auth_bp.route("/api/v1/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    user = DEMO_USERS.get(email)
    if not user or user["password"] != password:
        return jsonify({"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"}}), 401
    
    access_token, refresh_token = generate_tokens(
        user_id=user["id"],
        tenant_id=user["tenant_id"],
        role=user["role"],
        email=email
    )
    
    resp = jsonify({
        "success": True,
        "access_token": access_token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": email,
            "role": user["role"],
            "tenant_id": user["tenant_id"],
            "department": user["department"],
            "designation": user.get("designation"),
            "rollNo": user.get("rollNo")
        }
    })
    resp.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="Lax")
    return resp, 200

@auth_bp.route("/api/v1/auth/refresh", methods=["POST"])
def refresh():
    refresh_token = request.cookies.get("refresh_token") or (request.get_json() or {}).get("refresh_token")
    if not refresh_token:
        return jsonify({"error": {"code": "MISSING_REFRESH_TOKEN", "message": "No refresh token supplied"}}), 401
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return jsonify({"error": {"code": "INVALID_REFRESH_TOKEN", "message": "Token expired or corrupted"}}), 401
    
    user_id = payload.get("sub")
    tenant_id = payload.get("tenant_id")
    role = payload.get("role")
    email = payload.get("email", "")
    
    new_access_token, new_refresh_token = generate_tokens(user_id, tenant_id, role, email)
    resp = jsonify({"success": True, "access_token": new_access_token})
    resp.set_cookie("refresh_token", new_refresh_token, httponly=True, secure=False, samesite="Lax")
    return resp, 200

@auth_bp.route("/api/v1/auth/logout", methods=["POST"])
def logout():
    resp = jsonify({"success": True, "message": "Logged out successfully"})
    resp.delete_cookie("refresh_token")
    return resp, 200

@auth_bp.route("/api/v1/auth/me", methods=["GET"])
@require_auth()
def me():
    return jsonify({"success": True, "user": g.current_user}), 200

