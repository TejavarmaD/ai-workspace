from fastapi import APIRouter
from backend.app.api.v1.routes.health import router as health_router
from backend.app.api.v1.routes.providers import router as providers_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["health"])
api_router.include_router(providers_router, tags=["providers"])