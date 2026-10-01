import uuid
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.db.models.conversation import Conversation, Message
from backend.app.db.models.workspace import WorkspaceMember
from backend.app.core.logging import get_logger
from backend.app.gateway import gateway

logger = get_logger(__name__)

DEFAULT_PROVIDER = "gemini"
DEFAULT_MODEL = "gemini-flash-latest"


def verify_workspace_access(db: Session, workspace_id: uuid.UUID, user_id: uuid.UUID):
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id,
        WorkspaceMember.status == "active",
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this workspace"
        )
    return member


def create_conversation(
    db: Session,
    user_id: uuid.UUID,
    workspace_id: uuid.UUID,
    title: str = "New Conversation",
    provider: str = DEFAULT_PROVIDER,
    model: str = DEFAULT_MODEL,
) -> Conversation:
    verify_workspace_access(db, workspace_id, user_id)
    conv = Conversation(
        workspace_id=workspace_id,
        user_id=user_id,
        title=title,
        model_id=f"{provider}:{model}",
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    logger.info("Conversation created", conversation_id=str(conv.id))
    return conv


def get_conversations(db: Session, user_id: uuid.UUID, workspace_id: uuid.UUID) -> list:
    verify_workspace_access(db, workspace_id, user_id)
    return db.query(Conversation).filter(
        Conversation.workspace_id == workspace_id,
        Conversation.user_id == user_id,
    ).order_by(Conversation.updated_at.desc()).all()


def get_conversation(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return conv


def rename_conversation(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID, title: str) -> Conversation:
    conv = get_conversation(db, conversation_id, user_id)
    conv.title = title
    db.commit()
    db.refresh(conv)
    return conv


def delete_conversation(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID) -> None:
    conv = get_conversation(db, conversation_id, user_id)
    db.delete(conv)
    db.commit()
    logger.info("Conversation deleted", conversation_id=str(conversation_id))


def send_message(
    db: Session,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
    content: str,
    provider: str = None,
    model: str = None,
) -> dict:
    conv = get_conversation(db, conversation_id, user_id)
    
    
    # Parse provider/model — handle auto routing
    if provider == "auto" or model == "auto":
        from backend.app.gateway.router import auto_route

        decision, classification = auto_route(
            content,
            []
        )

        provider = decision.provider
        model = decision.model

        logger.info(
            "Auto-routed",
            provider=provider,
            model=model,
            task=classification.task_type.value,
        )

    elif provider is None or model is None:
        if ":" in (conv.model_id or ""):
            stored_provider, stored_model = conv.model_id.split(":", 1)
            provider = provider or stored_provider
            model = model or stored_model
        else:
            provider = provider or DEFAULT_PROVIDER
            model = model or DEFAULT_MODEL

    # Store user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=content,
    )
    db.add(user_msg)
    db.commit()

    # Auto-title from first message
    if conv.title == "New Conversation":
        conv.title = content[:50] + ("..." if len(content) > 50 else "")
        db.commit()

    # Get full conversation history
    history = db.query(Message).filter(
        Message.conversation_id == conv.id
    ).order_by(Message.created_at).all()

    messages_for_api = [
        {"role": m.role, "content": m.content}
        for m in history
    ]

    # Call AI via Gateway
    request = gateway.build_request(
        messages=messages_for_api,
        provider=provider,
        model=model,
    )
    response = gateway.execute(request)

    # Handle response
    if response.success:
        assistant_content = response.content
    else:
        assistant_content = f"⚠️ {response.error}"

    # Store assistant message
    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=assistant_content,
        meta={
            "provider": provider,
            "model": model,
            "latency_ms": response.latency_ms,
            "input_tokens": response.input_tokens,
            "output_tokens": response.output_tokens,
        }
    )
    db.add(assistant_msg)
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(assistant_msg)

    logger.info("Message sent", conversation_id=str(conversation_id), provider=provider)

    return {
        "id": str(assistant_msg.id),
        "role": "assistant",
        "content": assistant_content,
        "created_at": str(assistant_msg.created_at),
        "provider": provider,
        "model": model,
        "latency_ms": response.latency_ms,
    }


def format_conversation(conv: Conversation) -> dict:
    provider, model = DEFAULT_PROVIDER, DEFAULT_MODEL
    if conv.model_id and ":" in conv.model_id:
        provider, model = conv.model_id.split(":", 1)
    return {
        "id": str(conv.id),
        "title": conv.title,
        "workspace_id": str(conv.workspace_id),
        "user_id": str(conv.user_id),
        "model_id": conv.model_id,
        "provider": provider,
        "model": model,
        "created_at": str(conv.created_at),
        "updated_at": str(conv.updated_at),
    }


def format_message(msg: Message) -> dict:
    return {
        "id": str(msg.id),
        "role": msg.role,
        "content": msg.content,
        "created_at": str(msg.created_at),
        "meta": msg.meta or {},
    }