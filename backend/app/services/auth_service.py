import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.db.models.user import User
from backend.app.db.models.refresh_token import RefreshToken
from backend.app.db.models.workspace import Workspace, WorkspaceMember
from backend.app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, validate_password_strength
)
from backend.app.core.logging import get_logger
import re

logger = get_logger(__name__)


def register_user(db: Session, email: str, password: str,
                  first_name: str, last_name: str,
                  display_name: str = None) -> tuple[User, str, str]:
    email = email.lower().strip()

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )

    is_valid, msg = validate_password_strength(password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    user = User(
        email=email,
        password_hash=hash_password(password),
        first_name=first_name.strip(),
        last_name=last_name.strip(),
        display_name=display_name or f"{first_name.strip()} {last_name.strip()}",
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.flush()

    slug = re.sub(r'[^a-z0-9]+', '-', first_name.lower().strip())
    slug = f"{slug}-{str(user.id)[:8]}"

    workspace = Workspace(
        name=f"{first_name}'s Workspace",
        slug=slug,
        is_personal=True,
        owner_id=user.id,
    )
    db.add(workspace)
    db.flush()

    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=user.id,
        role="owner",
        status="active",
        joined_at=datetime.now(timezone.utc),
    )
    db.add(member)
    db.commit()
    db.refresh(user)

    logger.info("User registered", user_id=str(user.id), email=email)

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token_str = create_refresh_token({"sub": str(user.id)})

    _store_refresh_token(db, user.id, refresh_token_str)

    return user, access_token, refresh_token_str


def login_user(db: Session, email: str, password: str) -> tuple[User, str, str]:
    email = email.lower().strip()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password_hash):
        logger.warning("Failed login attempt", email=email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    logger.info("User logged in", user_id=str(user.id))

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token_str = create_refresh_token({"sub": str(user.id)})
    _store_refresh_token(db, user.id, refresh_token_str)

    return user, access_token, refresh_token_str


def logout_user(db: Session, refresh_token: str) -> None:
    token_record = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token
    ).first()
    if token_record:
        token_record.is_revoked = True
        token_record.revoked_at = datetime.now(timezone.utc)
        db.commit()
    logger.info("User logged out")


def change_password(db: Session, user: User,
                    current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    is_valid, msg = validate_password_strength(new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    user.password_hash = hash_password(new_password)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id,
        RefreshToken.is_revoked == False
    ).update({"is_revoked": True, "revoked_at": datetime.now(timezone.utc)})
    db.commit()
    logger.info("Password changed", user_id=str(user.id))


def _store_refresh_token(db: Session, user_id: uuid.UUID, token: str) -> None:
    rt = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        is_revoked=False,
    )
    db.add(rt)
    db.commit()