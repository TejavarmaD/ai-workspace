import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.db.models.user import User
from backend.app.schemas.chat import CreateConversationRequest, RenameConversationRequest, SendMessageRequest
from backend.app.services import chat_service
from backend.app.gateway.gateway import get_provider_status
from backend.app.gateway.contracts import PROVIDER_REGISTRY
from fastapi.responses import StreamingResponse

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
    model = getattr(data, 'model', 'gemini-3.1-flash-lite') or 'gemini-3.1-flash-lite'
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


@router.post("/conversations/{conversation_id}/stream")
def stream_message(
    conversation_id: uuid.UUID,
    data: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Stream AI response token by token."""
    from backend.app.gateway.router import auto_route

    conv = chat_service.get_conversation(
        db=db, conversation_id=conversation_id, user_id=current_user.id
    )

    provider = getattr(data, 'provider', None) or 'gemini'
    model = getattr(data, 'model', None) or 'gemini-flash-latest'

    if provider == 'auto' or model == 'auto':
        from backend.app.gateway.router import auto_route
        decision, _ = auto_route(data.content)
        provider = decision.provider
        model = decision.model

    # Store user message first
    from backend.app.db.models.conversation import Message
    from datetime import datetime, timezone
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=data.content,
    )
    db.add(user_msg)

    if conv.title == "New Conversation":
        conv.title = data.content[:50] + ("..." if len(data.content) > 50 else "")

    db.commit()

    def generate():
        full_response = ""
        try:
            if provider == 'gemini':
                import os
                from google import genai
                client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

                history = db.query(Message).filter(
                    Message.conversation_id == conv.id
                ).order_by(Message.created_at).all()

                contents = [
                    {"role": "user" if m.role == "user" else "model",
                     "parts": [{"text": m.content}]}
                    for m in history
                ]

                stream = client.models.generate_content_stream(
                    model=model,
                    contents=contents,
                )

                for chunk in stream:
                    if chunk.text:
                        full_response += chunk.text
                        yield f"data: {json.dumps({'token': chunk.text})}\n\n"

            else:
                # Fallback — non-streaming
                from backend.app.gateway.gateway import build_request, execute
                req = build_request(
                    messages=[{"role": "user", "content": data.content}],
                    provider=provider, model=model
                )
                resp = execute(req)
                full_response = resp.content
                for word in full_response.split(' '):
                    yield f"data: {json.dumps({'token': word + ' '})}\n\n"

        except Exception as e:
            full_response = f"Error: {str(e)[:100]}"
            yield f"data: {json.dumps({'token': full_response})}\n\n"
        finally:
            # Store assistant message
            assistant_msg = Message(
                conversation_id=conv.id,
                role="assistant",
                content=full_response,
                meta={"provider": provider, "model": model, "streamed": True},
            )
            db.add(assistant_msg)
            conv.updated_at = datetime.now(timezone.utc)
            db.commit()
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )