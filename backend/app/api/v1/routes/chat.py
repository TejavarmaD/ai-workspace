import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.db.models.user import User
from backend.app.schemas.chat import CreateConversationRequest, RenameConversationRequest, SendMessageRequest
from backend.app.services import chat_service
from backend.app.gateway.gateway import get_provider_status
from backend.app.gateway.contracts import PROVIDER_REGISTRY

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/providers")
def list_providers():
    """Return all providers with their status and available models."""
    return {"providers": get_provider_status()}


@router.get("/providers/{provider_id}/models")
def list_provider_models(provider_id: str):
    """Return models for a specific provider."""
    if provider_id not in PROVIDER_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' not found")
    provider = PROVIDER_REGISTRY[provider_id]
    return {
        "provider": provider_id,
        "display_name": provider["display_name"],
        "models": provider["models"],
    }


@router.post("/conversations", status_code=201)
def create_conversation(
    data: CreateConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    provider = getattr(data, 'provider', 'gemini') or 'gemini'
    model = getattr(data, 'model', 'gemini-2.5-flash-lite') or 'gemini-2.5-flash-lite'
    conv = chat_service.create_conversation(
        db=db,
        user_id=current_user.id,
        workspace_id=uuid.UUID(data.workspace_id),
        title=data.title,
        provider=provider,
        model=model,
    )
    return chat_service.format_conversation(conv)


@router.get("/conversations")
def list_conversations(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convs = chat_service.get_conversations(
        db=db,
        user_id=current_user.id,
        workspace_id=uuid.UUID(workspace_id),
    )
    return {"conversations": [chat_service.format_conversation(c) for c in convs]}


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = chat_service.get_conversation(
        db=db, conversation_id=conversation_id, user_id=current_user.id
    )
    messages = [chat_service.format_message(m) for m in (conv.messages or [])]
    result = chat_service.format_conversation(conv)
    result["messages"] = messages
    return result


@router.patch("/conversations/{conversation_id}/rename")
def rename_conversation(
    conversation_id: uuid.UUID,
    data: RenameConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = chat_service.rename_conversation(
        db=db, conversation_id=conversation_id,
        user_id=current_user.id, title=data.title,
    )
    return chat_service.format_conversation(conv)


@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat_service.delete_conversation(
        db=db, conversation_id=conversation_id, user_id=current_user.id
    )


@router.post("/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: uuid.UUID,
    data: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    provider = getattr(data, 'provider', None)
    model = getattr(data, 'model', None)
    return chat_service.send_message(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id,
        content=data.content,
        provider=provider,
        model=model,
    )


@router.post("/auto-route")
def auto_route_preview(data: dict, current_user: User = Depends(get_current_user)):
    """Preview what model Auto mode would select for a given prompt."""
    from backend.app.gateway.router import auto_route
    prompt = data.get("prompt", "")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    decision, classification = auto_route(prompt)
    return {
        "task_type": classification.task_type.value,
        "confidence": round(classification.confidence, 2),
        "reasoning": classification.reasoning,
        "selected_provider": decision.provider,
        "selected_model": decision.model,
        "selection_reason": decision.reason,
        "estimated_tokens": classification.estimated_tokens,
        "requires_vision": classification.requires_vision,
        "requires_tools": classification.requires_tools,
    }