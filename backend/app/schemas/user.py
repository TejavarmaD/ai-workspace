from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    display_name: str | None
    avatar_url: str | None
    is_active: bool
    is_verified: bool
    last_login_at: datetime | None

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None