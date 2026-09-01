import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class WorkspaceRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    member = "member"


class MemberStatus(str, enum.Enum):
    active = "active"
    invited = "invited"
    removed = "removed"


class InvitationStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    expired = "expired"
    cancelled = "cancelled"


class Workspace(Base):
    __tablename__ = "workspaces"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_personal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    owner: Mapped["User"] = relationship("User", back_populates="workspaces_owned")
    members: Mapped[list] = relationship(
        "WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan"
    )
    invitations: Mapped[list] = relationship(
        "WorkspaceInvitation", back_populates="workspace", cascade="all, delete-orphan"
    )


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="member")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="members")
    user: Mapped["User"] = relationship("User", back_populates="workspace_memberships")


class WorkspaceInvitation(Base):
    __tablename__ = "workspace_invitations"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    invited_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    invited_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="member")
    token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    accepted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="invitations")