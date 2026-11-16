import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "busora-kerala-smart-transit-secret-key-2026")
    
    # Database configuration
    # Default to SQLite for seamless zero-config local runs, or MySQL if configured
    DB_TYPE = os.getenv("DB_TYPE", "sqlite")
    if DB_TYPE == "mysql":
        MYSQL_USER = os.getenv("MYSQL_USER", "busora_user")
        MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "busora_password")
        MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
        MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
        MYSQL_DB = os.getenv("MYSQL_DB", "busora_db")
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
        )
    else:
        DB_PATH = BASE_DIR / "database" / "busora.db"
        SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Uploads
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", str(BASE_DIR / "uploads"))
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    
    # JWT Config
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-token-key-busora-9988")
    JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    
    # Simulation & GPS parameters
    DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
    GPS_STALE_THRESHOLD_SECONDS = int(os.getenv("GPS_STALE_THRESHOLD_SECONDS", "300")) # 5 mins
    GPS_OFFLINE_THRESHOLD_SECONDS = int(os.getenv("GPS_OFFLINE_THRESHOLD_SECONDS", "900")) # 15 mins
