from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.db.models.provider import Provider, Model

router = APIRouter()


@router.get("/providers")
async def list_providers(db: Session = Depends(get_db)):
    """Return all registered AI providers."""
    providers = db.execute(select(Provider)).scalars().all()
    return {
        "count": len(providers),
        "providers": [
            {
                "id": str(p.id),
                "name": p.name,
                "display_name": p.display_name,
                "is_active": p.is_active,
                "requires_api_key": p.requires_api_key,
            }
            for p in providers
        ],
    }


@router.get("/models")
async def list_models(db: Session = Depends(get_db)):
    """Return all registered AI models."""
    models = db.execute(select(Model)).scalars().all()
    return {
        "count": len(models),
        "models": [
            {
                "id": str(m.id),
                "provider_id": str(m.provider_id),
                "provider_model_id": m.provider_model_id,
                "display_name": m.display_name,
                "status": m.status,
                "supports_streaming": m.supports_streaming,
                "supports_tools": m.supports_tools,
                "supports_vision": m.supports_vision,
            }
            for m in models
        ],
    }