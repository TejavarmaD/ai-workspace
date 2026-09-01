from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.schemas.user import UpdateProfileRequest
from backend.app.core.dependencies import get_current_user
from backend.app.db.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "display_name": current_user.display_name,
        "avatar_url": current_user.avatar_url,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "last_login_at": str(current_user.last_login_at) if current_user.last_login_at else None,
    }


@router.patch("/me")
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.first_name is not None:
        current_user.first_name = data.first_name.strip()
    if data.last_name is not None:
        current_user.last_name = data.last_name.strip()
    if data.display_name is not None:
        current_user.display_name = data.display_name.strip()
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    db.commit()
    db.refresh(current_user)
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "display_name": current_user.display_name,
        "avatar_url": current_user.avatar_url,
    }