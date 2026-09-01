from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid
from backend.app.db.session import get_db
from backend.app.schemas.workspace import CreateWorkspaceRequest, InviteMemberRequest
from backend.app.core.dependencies import get_current_user
from backend.app.db.models.user import User
from backend.app.services import workspace_service

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("", status_code=201)
def create_workspace(
    data: CreateWorkspaceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = workspace_service.create_workspace(
        db=db, user=current_user,
        name=data.name, description=data.description,
    )
    return {
        "id": str(workspace.id), "name": workspace.name,
        "slug": workspace.slug, "description": workspace.description,
        "is_personal": workspace.is_personal,
        "owner_id": str(workspace.owner_id),
    }


@router.get("")
def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspaces = workspace_service.get_user_workspaces(db=db, user=current_user)
    return {
        "workspaces": [
            {
                "id": str(w.id), "name": w.name, "slug": w.slug,
                "description": w.description, "is_personal": w.is_personal,
                "owner_id": str(w.owner_id),
            }
            for w in workspaces
        ]
    }


@router.get("/{workspace_id}")
def get_workspace(
    workspace_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = workspace_service.get_workspace_or_403(
        db=db, workspace_id=workspace_id, user=current_user
    )
    return {
        "id": str(workspace.id), "name": workspace.name,
        "slug": workspace.slug, "description": workspace.description,
        "is_personal": workspace.is_personal,
        "owner_id": str(workspace.owner_id),
    }


@router.post("/{workspace_id}/members/invite", status_code=201)
def invite_member(
    workspace_id: uuid.UUID,
    data: InviteMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invitation = workspace_service.invite_member(
        db=db, workspace_id=workspace_id,
        invited_by=current_user,
        email=data.email, role=data.role,
    )
    return {
        "id": str(invitation.id),
        "invited_email": invitation.invited_email,
        "role": invitation.role,
        "status": invitation.status,
        "expires_at": str(invitation.expires_at),
    }


@router.post("/invitations/{token}/accept")
def accept_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member = workspace_service.accept_invitation(
        db=db, token=token, user=current_user
    )
    return {
        "workspace_id": str(member.workspace_id),
        "role": member.role,
        "status": member.status,
    }


@router.get("/{workspace_id}/members")
def list_members(
    workspace_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace_service.get_workspace_or_403(
        db=db, workspace_id=workspace_id, user=current_user
    )
    from backend.app.db.models.workspace import WorkspaceMember
    members = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.status == "active",
    ).all()
    return {
        "members": [
            {
                "id": str(m.id), "user_id": str(m.user_id),
                "role": m.role, "status": m.status,
                "joined_at": str(m.joined_at) if m.joined_at else None,
            }
            for m in members
        ]
    }