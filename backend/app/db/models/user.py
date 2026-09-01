import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    workspaces_owned: Mapped[list] = relationship(
        "Workspace", back_populates="owner", cascade="all, delete-orphan"
    )
    workspace_memberships: Mapped[list] = relationship(
        "WorkspaceMember", back_populates="user", cascade="all, delete-orphan"
    )
    refresh_tokens: Mapped[list] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )