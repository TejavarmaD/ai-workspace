import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from backend.app.db.session import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.db.models.user import User
from backend.app.db.models.conversation import Conversation, Message
from backend.app.db.models.knowledge import KnowledgeBase, KnowledgeDocument
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
def get_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.id

    # Total conversations
    total_convs = db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).count()

    # Total messages
    total_msgs = db.query(Message).join(Conversation).filter(
        Conversation.user_id == user_id
    ).count()

    # User messages only
    user_msgs = db.query(Message).join(Conversation).filter(
        Conversation.user_id == user_id,
        Message.role == "user"
    ).count()

    # AI messages only
    ai_msgs = db.query(Message).join(Conversation).filter(
        Conversation.user_id == user_id,
        Message.role == "assistant"
    ).count()

    # Knowledge bases
    total_kbs = db.query(KnowledgeBase).filter(
        KnowledgeBase.user_id == user_id
    ).count()

    # Documents
    total_docs = db.query(KnowledgeDocument).join(KnowledgeBase).filter(
        KnowledgeBase.user_id == user_id
    ).count()

    # Conversations last 7 days
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_convs = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.created_at >= week_ago
    ).count()

    # Daily activity last 7 days
    daily_activity = []
    for i in range(6, -1, -1):
        day = datetime.now(timezone.utc) - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = db.query(Message).join(Conversation).filter(
            Conversation.user_id == user_id,
            Message.role == "user",
            Message.created_at >= day_start,
            Message.created_at < day_end,
        ).count()
        daily_activity.append({
            "date": day_start.strftime("%b %d"),
            "messages": count,
        })

    # Model usage
    convs = db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).all()

    model_usage = {}
    for conv in convs:
        model = conv.model_id or "unknown"
        if ":" in model:
            provider = model.split(":")[0]
        else:
            provider = model
        model_usage[provider] = model_usage.get(provider, 0) + 1

    model_chart = [
        {"name": k, "value": v}
        for k, v in sorted(model_usage.items(), key=lambda x: -x[1])
    ]

    return {
        "overview": {
            "total_conversations": total_convs,
            "total_messages": total_msgs,
            "user_messages": user_msgs,
            "ai_messages": ai_msgs,
            "recent_conversations": recent_convs,
            "knowledge_bases": total_kbs,
            "documents": total_docs,
        },
        "daily_activity": daily_activity,
        "model_usage": model_chart,
    }