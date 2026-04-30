import os
import logging

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./device_management.db")

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@company.com")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads", "devices")

logger = logging.getLogger("config")
_smtp_configured = bool(SMTP_HOST and SMTP_USER)


def is_smtp_configured():
    return _smtp_configured


if not _smtp_configured:
    logger.warning("SMTP not configured. Emails will be logged only.")
    logger.warning("Set env: SMTP_HOST SMTP_USER SMTP_PASSWORD SMTP_FROM")
else:
    logger.info(f"SMTP configured: {SMTP_HOST} as {SMTP_USER}")
