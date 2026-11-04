import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "attendora-enterprise-default-secret-key-change-in-prod")
    JWT_SECRET = os.getenv("JWT_SECRET", "attendora-jwt-secure-signing-key-minimum-256-bit")
    JWT_ACCESS_EXPIRES = timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", "15")))
    JWT_REFRESH_EXPIRES = timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "7")))
    
    # PostgreSQL Connection String with TLS
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://attendora_user:attendora_pass@localhost:5432/attendora_db")
    
    # Redis Bus & Task Queue
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Statutory Compliance Defaults
    DEFAULT_STATUTORY_THRESHOLD = float(os.getenv("DEFAULT_STATUTORY_THRESHOLD", "75.0"))
    DEFAULT_WARNING_THRESHOLD = float(os.getenv("DEFAULT_WARNING_THRESHOLD", "70.0"))
    
    # AI Studio & Cloud Run
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    APP_URL = os.getenv("APP_URL", "http://localhost:3000")

