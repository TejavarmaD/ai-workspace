import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token: Mapped[str] = mapped_column(
        String(500), unique=True, nullable=False, index=True
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    revoked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    device_info: Mapped[str] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")

    @property
    def is_valid(self) -> bool:
        from datetime import timezone
        return (
            not self.is_revoked
            and self.expires_at > datetime.now(timezone.utc)
        )