from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, ChangePasswordRequest
from backend.app.schemas.user import UserResponse
from backend.app.services import auth_service
from backend.app.core.dependencies import get_current_user
from backend.app.db.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user, access_token, refresh_token = auth_service.register_user(
        db=db, email=data.email, password=data.password,
        first_name=data.first_name, last_name=data.last_name,
        display_name=data.display_name,
    )
    return {
        "user": {
            "id": str(user.id), "email": user.email,
            "first_name": user.first_name, "last_name": user.last_name,
            "display_name": user.display_name, "avatar_url": user.avatar_url,
            "is_active": user.is_active, "is_verified": user.is_verified,
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user, access_token, refresh_token = auth_service.login_user(
        db=db, email=data.email, password=data.password,
    )
    return {
        "user": {
            "id": str(user.id), "email": user.email,
            "first_name": user.first_name, "last_name": user.last_name,
            "display_name": user.display_name, "avatar_url": user.avatar_url,
            "is_active": user.is_active, "is_verified": user.is_verified,
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/logout")
def logout(data: dict, db: Session = Depends(get_db)):
    refresh_token = data.get("refresh_token", "")
    auth_service.logout_user(db=db, refresh_token=refresh_token)
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
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


@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth_service.change_password(
        db=db, user=current_user,
        current_password=data.current_password,
        new_password=data.new_password,
    )
    return {"message": "Password changed successfully"}