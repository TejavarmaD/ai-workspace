from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid


class CreateWorkspaceRequest(BaseModel):
    name: str
    description: str | None = None


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    is_personal: bool
    owner_id: str

    class Config:
        from_attributes = True


class MemberResponse(BaseModel):
    id: str
    user_id: str
    workspace_id: str
    role: str
    status: str
    joined_at: datetime | None

    class Config:
        from_attributes = True


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = "member"


class UpdateMemberRoleRequest(BaseModel):
    role: str


class InvitationResponse(BaseModel):
    id: str
    workspace_id: str
    invited_email: str
    role: str
    status: str
    expires_at: datetime

    class Config:
        from_attributes = True