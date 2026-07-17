import logging
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.database.db import SessionLocal, get_db
from app.models.document_model import Document
from app.services.document_processor import DocumentProcessor
from app.services.retrieval_pipeline import RetrievalPipeline
from app.services.vector_store import VectorStore

logger = logging.getLogger(__name__)

# ── Module-level singletons ────────────────────────────────────────────────────
processor = DocumentProcessor()
retrieval_pipeline = RetrievalPipeline()
vector_store = VectorStore()

# ── Router ─────────────────────────────────────────────────────────────────────
router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)

# ── Constants ──────────────────────────────────────────────────────────────────
ALLOWED_CATEGORIES = {
    "safety_manual",
    "incident_report",
    "inspection_report",
    "compliance_document",
}

MAX_FILE_SIZE_BYTES = 52_428_800  # 50 MB

# ── Pydantic Schemas ───────────────────────────────────────────────────────────

class DocumentUploadResponse(BaseModel):
    document_id: str
    status: str  # always "processing"


class DocumentRecord(BaseModel):
    document_id: str
    filename: str
    category: str
    status: str
    upload_timestamp: datetime
    uploader_identity: Optional[str] = None
    file_size_bytes: int
    page_count: Optional[int] = None
    char_count: Optional[int] = None
    chunk_count: Optional[int] = None
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    items: list[DocumentRecord]
    total: int
    page: int
    page_size: int


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)


class SearchResultResponse(BaseModel):
    chunk_text: str
    document_id: str
    source_filename: str
    page_number: int
    category: str
    similarity_score: float


class SearchResponse(BaseModel):
    results: list[SearchResultResponse]
    message: Optional[str] = None


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=DocumentUploadResponse, status_code=202)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
):
    """Upload a PDF document for processing and indexing."""

    # Validate file extension
    filename = file.filename or ""
    _, ext = os.path.splitext(filename)
    if ext.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    # Validate category
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid category. Allowed values: {sorted(ALLOWED_CATEGORIES)}",
        )

    # Read file content and validate size
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds the 50 MB limit.",
        )

    # Generate document ID and save file
    document_id = str(uuid.uuid4())
    upload_dir = os.path.join("app", "uploads", "documents")
    os.makedirs(upload_dir, exist_ok=True)
    safe_filename = f"{document_id}_{filename}"
    file_path = os.path.join(upload_dir, safe_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    # Persist initial DB record
    doc = Document(
        document_id=document_id,
        filename=filename,
        category=category,
        status="pending",
        upload_timestamp=datetime.utcnow(),
        file_size_bytes=file_size,
        file_path=file_path,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Create a dedicated session for the background task (request session
    # closes when the response is sent)
    bg_db = SessionLocal()
    background_tasks.add_task(
        processor.process,
        document_id,
        file_path,
        filename,
        category,
        bg_db,
    )

    return DocumentUploadResponse(document_id=document_id, status="processing")


@router.get("", response_model=DocumentListResponse)
def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all documents with pagination."""
    total = db.query(Document).count()
    offset = (page - 1) * page_size
    docs = (
        db.query(Document)
        .order_by(Document.upload_timestamp.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )
    return DocumentListResponse(
        items=[DocumentRecord.model_validate(d) for d in docs],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{document_id}", response_model=DocumentRecord)
def get_document(document_id: str, db: Session = Depends(get_db)):
    """Retrieve a single document record by ID."""
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return DocumentRecord.model_validate(doc)


@router.delete("/{document_id}")
async def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Delete a document and its vector store entries."""
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    try:
        await run_in_threadpool(vector_store.delete_document, document_id)
        db.delete(doc)
        db.commit()
    except Exception as exc:
        logger.error("Failed to delete document %s: %s", document_id, str(exc))
        raise HTTPException(
            status_code=500,
            detail="Failed to delete document.",
        )

    return {"message": "Document deleted successfully."}


@router.post("/search", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest,
    db: Session = Depends(get_db),
):
    """Perform semantic search across indexed document chunks."""
    pipeline_response = await retrieval_pipeline.search(
        query=request.query,
        top_k=request.top_k,
        db=db,
    )

    results = [
        SearchResultResponse(
            chunk_text=r.chunk_text,
            document_id=r.document_id,
            source_filename=r.source_filename,
            page_number=r.page_number,
            category=r.category,
            similarity_score=r.similarity_score,
        )
        for r in pipeline_response.results
    ]

    return SearchResponse(results=results, message=pipeline_response.message)
