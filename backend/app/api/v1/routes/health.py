from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db, check_db_connection
from backend.app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check — confirms API is running."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.app_env,
        "version": "1.0.0",
    }


@router.get("/health/db")
async def database_health_check():
    """Database health check — confirms PostgreSQL is reachable."""
    is_connected = check_db_connection()
    return {
        "status": "ok" if is_connected else "error",
        "database": "connected" if is_connected else "unreachable",
    }