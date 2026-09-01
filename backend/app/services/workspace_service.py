import uuid
import secrets
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.db.models.workspace import (
    Workspace, WorkspaceMember, WorkspaceInvitation,
    WorkspaceRole, MemberStatus, InvitationStatus
)
from backend.app.db.models.user import User
from backend.app.core.logging import get_logger
import re

logger = get_logger(__name__)


def create_workspace(db: Session, user: User, name: str,
                     description: str = None) -> Workspace:
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower().strip())
    slug = f"{slug}-{str(uuid.uuid4())[:8]}"

    workspace = Workspace(
        name=name.strip(),
        slug=slug,
        description=description,
        is_personal=False,
        owner_id=user.id,
    )
    db.add(workspace)
    db.flush()

    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=user.id,
        role=WorkspaceRole.owner,
        status=MemberStatus.active,
        joined_at=datetime.now(timezone.utc),
    )
    db.add(member)
    db.commit()
    db.refresh(workspace)

    logger.info("Workspace created", workspace_id=str(workspace.id), user_id=str(user.id))
    return workspace


def get_user_workspaces(db: Session, user: User) -> list[Workspace]:
    memberships = db.query(WorkspaceMember).filter(
        WorkspaceMember.user_id == user.id,
        WorkspaceMember.status == MemberStatus.active,
    ).all()
    workspace_ids = [m.workspace_id for m in memberships]
    return db.query(Workspace).filter(Workspace.id.in_(workspace_ids)).all()


def get_workspace_or_403(db: Session, workspace_id: uuid.UUID,
                          user: User) -> Workspace:
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user.id,
        WorkspaceMember.status == MemberStatus.active,
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this workspace"
        )

    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Workspace not found")
    return workspace


def invite_member(db: Session, workspace_id: uuid.UUID,
                  invited_by: User, email: str, role: str) -> WorkspaceInvitation:
    email = email.lower().strip()

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        existing_member = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == existing_user.id,
            WorkspaceMember.status == MemberStatus.active,
        ).first()
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already a member"
            )

    token = secrets.token_urlsafe(32)
    invitation = WorkspaceInvitation(
        workspace_id=workspace_id,
        invited_email=email,
        invited_by=invited_by.id,
        role=role,
        token=token,
        status=InvitationStatus.pending,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    logger.info("Invitation sent", email=email, workspace_id=str(workspace_id))
    return invitation


def accept_invitation(db: Session, token: str, user: User) -> WorkspaceMember:
    invitation = db.query(WorkspaceInvitation).filter(
        WorkspaceInvitation.token == token,
        WorkspaceInvitation.status == InvitationStatus.pending,
    ).first()

    if not invitation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Invalid invitation token")

    if invitation.expires_at < datetime.now(timezone.utc):
        invitation.status = InvitationStatus.expired
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invitation has expired")

    if invitation.invited_email != user.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Invitation is for a different email address")

    existing = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == invitation.workspace_id,
        WorkspaceMember.user_id == user.id,
    ).first()

    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Already a member of this workspace")

    member = WorkspaceMember(
        workspace_id=invitation.workspace_id,
        user_id=user.id,
        role=invitation.role,
        status=MemberStatus.active,
        joined_at=datetime.now(timezone.utc),
    )
    db.add(member)

    invitation.status = InvitationStatus.accepted
    invitation.accepted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(member)

    logger.info("Invitation accepted", user_id=str(user.id),
                workspace_id=str(invitation.workspace_id))
    return member


def remove_member(db: Session, workspace_id: uuid.UUID,
                  member_id: uuid.UUID, requesting_user: User) -> None:
    requesting_member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == requesting_user.id,
        WorkspaceMember.status == MemberStatus.active,
    ).first()

    if not requesting_member or requesting_member.role not in [
        WorkspaceRole.owner, WorkspaceRole.admin
    ]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Insufficient permissions")

    target = db.query(WorkspaceMember).filter(
        WorkspaceMember.id == member_id,
        WorkspaceMember.workspace_id == workspace_id,
    ).first()

    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Member not found")

    if target.role == WorkspaceRole.owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Cannot remove workspace owner")

    target.status = MemberStatus.removed
    db.commit()
    logger.info("Member removed", member_id=str(member_id))