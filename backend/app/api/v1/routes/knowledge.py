import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.db.models.user import User
from backend.app.services import rag_service

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.post("/bases", status_code=201)
def create_knowledge_base(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    kb = rag_service.create_knowledge_base(
        db=db,
        user_id=current_user.id,
        workspace_id=uuid.UUID(data["workspace_id"]),
        name=data["name"],
        description=data.get("description"),
    )
    return rag_service.format_kb(kb)


@router.get("/bases")
def list_knowledge_bases(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    kbs = rag_service.get_knowledge_bases(
        db=db,
        user_id=current_user.id,
        workspace_id=uuid.UUID(workspace_id),
    )
    return {"knowledge_bases": [rag_service.format_kb(kb) for kb in kbs]}


@router.delete("/bases/{kb_id}", status_code=204)
def delete_knowledge_base(
    kb_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rag_service.delete_knowledge_base(
        db=db, kb_id=kb_id, user_id=current_user.id
    )


@router.post("/bases/{kb_id}/documents", status_code=201)
async def upload_document(
    kb_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allowed = ['pdf', 'txt', 'md', 'docx', 'doc']
    ext = file.filename.split('.')[-1].lower()
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {', '.join(allowed)}"
        )

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    doc = rag_service.add_document_to_kb(
        db=db,
        kb_id=kb_id,
        user_id=current_user.id,
        filename=file.filename,
        file_content=content,
        file_type=ext,
    )
    return rag_service.format_document(doc)


@router.get("/bases/{kb_id}/documents")
def list_documents(
    kb_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from backend.app.db.models.knowledge import KnowledgeDocument, KnowledgeBase
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == kb_id).first()
    if not kb or kb.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    docs = db.query(KnowledgeDocument).filter(
        KnowledgeDocument.knowledge_base_id == kb_id
    ).all()
    return {"documents": [rag_service.format_document(d) for d in docs]}


@router.post("/bases/{kb_id}/search")
def search_kb(
    kb_id: uuid.UUID,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = data.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    context = rag_service.build_rag_context(
        db=db, kb_id=kb_id, user_id=current_user.id, query=query
    )
    return {"context": context, "found": bool(context)}