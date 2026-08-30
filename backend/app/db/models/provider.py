import uuid
from sqlalchemy import String, Boolean, Text, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.db.base import Base


class Provider(Base):
    __tablename__ = "providers"

    name: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    requires_api_key: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    base_url: Mapped[str] = mapped_column(String(500), nullable=True)
    extra_metadata: Mapped[dict] = mapped_column(JSON, nullable=True, default=dict)


class Model(Base):
    __tablename__ = "models"

    provider_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("providers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider_model_id: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    model_family: Mapped[str] = mapped_column(String(100), nullable=True)
    modality: Mapped[str] = mapped_column(String(50), default="text", nullable=False)
    context_window: Mapped[int] = mapped_column(Integer, nullable=True)
    max_output_tokens: Mapped[int] = mapped_column(Integer, nullable=True)
    supports_streaming: Mapped[bool] = mapped_column(Boolean, default=False)
    supports_tools: Mapped[bool] = mapped_column(Boolean, default=False)
    supports_vision: Mapped[bool] = mapped_column(Boolean, default=False)
    supports_reasoning: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    extra_metadata: Mapped[dict] = mapped_column(JSON, nullable=True, default=dict)