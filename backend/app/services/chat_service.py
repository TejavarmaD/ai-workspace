import uuid
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.db.models.conversation import Conversation, Message
from backend.app.db.models.workspace import WorkspaceMember
from backend.app.core.logging import get_logger

logger = get_logger(__name__)


def verify_workspace_access(db: Session, workspace_id: uuid.UUID, user_id: uuid.UUID):
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id,
        WorkspaceMember.status == "active",
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")
    return member


def create_conversation(db: Session, user_id: uuid.UUID, workspace_id: uuid.UUID, title: str = "New Conversation") -> Conversation:
    verify_workspace_access(db, workspace_id, user_id)
    conv = Conversation(
        workspace_id=workspace_id,
        user_id=user_id,
        title=title,
        model_id="gemini-flash-latest",
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


def call_gemini(messages_for_api: list, content: str) -> str:
    try:
        from google import genai
        api_key = os.environ.get("GOOGLE_API_KEY", "")
        if not api_key:
            return "Google API key not configured."

        client = genai.Client(api_key=api_key)

        # Build contents from history
        contents = []
        for msg in messages_for_api:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=contents,
        )
        return response.text

    except Exception as e:
        logger.error("Gemini API error", error=str(e))
        error_str = str(e)
        if "API_KEY_INVALID" in error_str:
            return "Invalid Google API key."
        elif "quota" in error_str.lower():
            return "API quota exceeded. Please try again later."
        else:
            return f"AI error: {error_str[:150]}"


def send_message(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID, content: str) -> dict:
    conv = get_conversation(db, conversation_id, user_id)

    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=content,
    )
    db.add(user_msg)
    db.commit()

    if conv.title == "New Conversation":
        conv.title = content[:50] + ("..." if len(content) > 50 else "")
        db.commit()

    history = db.query(Message).filter(
        Message.conversation_id == conv.id
    ).order_by(Message.created_at).all()

    messages_for_api = [
        {"role": m.role, "content": m.content}
        for m in history
    ]

    assistant_content = call_gemini(messages_for_api, content)

    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=assistant_content,
    )
    db.add(assistant_msg)
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(assistant_msg)

    logger.info("Message sent", conversation_id=str(conversation_id))

    return {
        "id": str(assistant_msg.id),
        "role": "assistant",
        "content": assistant_content,
        "created_at": str(assistant_msg.created_at),
    }


def format_conversation(conv: Conversation) -> dict:
    return {
        "id": str(conv.id),
        "title": conv.title,
        "workspace_id": str(conv.workspace_id),
        "user_id": str(conv.user_id),
        "model_id": conv.model_id,
        "created_at": str(conv.created_at),
        "updated_at": str(conv.updated_at),
    }


def format_message(msg: Message) -> dict:
    return {
        "id": str(msg.id),
        "role": msg.role,
        "content": msg.content,
        "created_at": str(msg.created_at),
    }