from fastapi import APIRouter
from backend.app.api.v1.routes.health import router as health_router
from backend.app.api.v1.routes.providers import router as providers_router
from backend.app.api.v1.routes.auth import router as auth_router
from backend.app.api.v1.routes.users import router as users_router
from backend.app.api.v1.routes.workspaces import router as workspaces_router
from backend.app.api.v1.routes.chat import router as chat_router
from backend.app.api.v1.routes.knowledge import router as knowledge_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(providers_router, tags=["providers"])
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(workspaces_router)
api_router.include_router(chat_router)
api_router.include_router(knowledge_router)