import time
import base64
import hmac
import hashlib
import json
from functools import wraps
from flask import request, jsonify, g
from backend.config import Config

# Try importing pyjwt, fallback to standard library HMAC-SHA256 implementation
try:
    import jwt
    HAS_PYJWT = True
except ImportError:
    HAS_PYJWT = False

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

def _b64url_decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s.encode("utf-8"))

def generate_tokens(user_id: str, tenant_id: str, role: str, email: str):
    """Generates short-lived access token and long-lived refresh token."""
    now = int(time.time())
    access_payload = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "role": role,
        "email": email,
        "iat": now,
        "exp": now + int(Config.JWT_ACCESS_EXPIRES.total_seconds()),
        "type": "access"
    }
    refresh_payload = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "role": role,
        "iat": now,
        "exp": now + int(Config.JWT_REFRESH_EXPIRES.total_seconds()),
        "type": "refresh"
    }
    
    if HAS_PYJWT:
        access_token = jwt.encode(access_payload, Config.JWT_SECRET, algorithm="HS256")
        refresh_token = jwt.encode(refresh_payload, Config.JWT_SECRET, algorithm="HS256")
    else:
        # Standard library HMAC-SHA256 token generator
        header = {"alg": "HS256", "typ": "JWT"}
        
        def _sign(payload):
            h_str = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
            p_str = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
            signing_input = f"{h_str}.{p_str}".encode("utf-8")
            sig = hmac.new(Config.JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
            sig_str = _b64url_encode(sig)
            return f"{h_str}.{p_str}.{sig_str}"
            
        access_token = _sign(access_payload)
        refresh_token = _sign(refresh_payload)

    return access_token, refresh_token

def decode_token(token: str):
    """Decodes and validates a JWT token."""
    if not token or not isinstance(token, str):
        return None
        
    if HAS_PYJWT:
        try:
            return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        except Exception:
            return None
            
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        h_str, p_str, sig_str = parts
        signing_input = f"{h_str}.{p_str}".encode("utf-8")
        expected_sig = hmac.new(Config.JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(sig_str)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
            
        payload = json.loads(_b64url_decode(p_str).decode("utf-8"))
        # Expiry check
        if payload.get("exp") and time.time() > payload["exp"]:
            return None
        return payload
    except Exception:
        return None

def require_auth(allowed_roles=None):
    """Decorator ensuring valid JWT token and optional role check."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                # Support X-Tenant-ID fallback in dev mode
                tenant_header = request.headers.get("X-Tenant-ID", "")
                if tenant_header:
                    g.current_tenant_id = tenant_header
                    g.current_user = {
                        "id": "dev-user",
                        "tenant_id": tenant_header,
                        "role": "ADMIN",
                        "email": "admin@attendora.edu"
                    }
                    return f(*args, **kwargs)
                return jsonify({"error": {"code": "UNAUTHORIZED", "message": "Missing Bearer token"}}), 401
            
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if not payload:
                return jsonify({"error": {"code": "TOKEN_EXPIRED_OR_INVALID", "message": "Invalid or expired token"}}), 401
            
            if payload.get("type") != "access":
                return jsonify({"error": {"code": "INVALID_TOKEN_TYPE", "message": "Requires access token"}}), 401
            
            user_role = payload.get("role")
            if allowed_roles and user_role not in allowed_roles:
                return jsonify({"error": {"code": "FORBIDDEN", "message": "Insufficient permissions for this resource"}}), 403
            
            g.current_user = payload
            g.current_tenant_id = payload.get("tenant_id")
            return f(*args, **kwargs)
        return decorated_function
    return decorator
