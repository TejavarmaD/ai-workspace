from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.security import decode_token
from backend.app.db.models.user import User
from backend.app.db.models.workspace import Workspace, WorkspaceMember, WorkspaceRole
import uuid

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    return user


def get_workspace_member(
    workspace_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkspaceMember:
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.status == "active",
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this workspace",
        )
    return member


def require_workspace_admin(
    member: WorkspaceMember = Depends(get_workspace_member),
) -> WorkspaceMember:
    if member.role not in [WorkspaceRole.owner, WorkspaceRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or owner role required",
        )
    return member


def require_workspace_owner(
    member: WorkspaceMember = Depends(get_workspace_member),
) -> WorkspaceMember:
    if member.role != WorkspaceRole.owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner role required",
        )
    return member