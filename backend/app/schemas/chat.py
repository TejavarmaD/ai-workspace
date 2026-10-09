from pydantic import BaseModel
from typing import Optional


class CreateConversationRequest(BaseModel):
    title: str = "New Conversation"
    workspace_id: str
    provider: str = "gemini"
    model: str = "gemini-3.1-flash-lite"


class RenameConversationRequest(BaseModel):
    title: str


class SendMessageRequest(BaseModel):
    content: str
    conversation_id: str
    provider: Optional[str] = None
    model: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: str
    title: str
    workspace_id: str
    user_id: str
    model_id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ConversationWithMessages(BaseModel):
    id: str
    title: str
    workspace_id: str
    user_id: str
    model_id: str
    created_at: str
    updated_at: str
    messages: list[MessageResponse]

    class Config:
        from_attributes = True