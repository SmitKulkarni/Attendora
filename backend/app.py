import os
import sys

# Ensure project root is in sys.path whether executed directly or as a package
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from flask import Flask, jsonify, request, g
from backend.config import Config
from backend.routes.auth_routes import auth_bp
from backend.routes.academic_routes import academic_bp
from backend.routes.attendance_routes import attendance_bp
from backend.routes.reports_routes import reports_bp
from backend.routes.audit_routes import audit_bp

# Try importing flask_cors, fallback to custom CORS headers
try:
    from flask_cors import CORS
    HAS_CORS = True
except ImportError:
    HAS_CORS = False

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    if HAS_CORS:
        CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"])
    else:
        @app.after_request
        def add_cors_headers(response):
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Tenant-ID"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response

    # Register Domain Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(academic_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(audit_bp)
    
    @app.before_request
    def set_tenant_context():
        # Inject tenant into request context simulating PostgreSQL session variable
        tenant_header = request.headers.get("X-Tenant-ID")
        if tenant_header:
            g.current_tenant_id = tenant_header
            
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "Attendora Modular Monolith API",
            "version": "1.5.0",
            "complianceEngine": "UGC-75-Statutory"
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": {"code": "NOT_FOUND", "message": "Endpoint not found"}}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected server error occurred."}}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
