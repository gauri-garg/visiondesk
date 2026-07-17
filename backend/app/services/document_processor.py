import logging
from sqlalchemy.orm import Session

from app.models.document_model import Document
from app.services.pdf_extractor import PDFExtractor, PageText
from app.services.text_cleaner import TextCleaner
from app.services.chunker import Chunker, ChunkData
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """
    Orchestrates the full document processing pipeline:
    extract → clean → chunk → embed → store

    Runs as a FastAPI BackgroundTask. Uses a dedicated db Session
    (not the request session which is closed before this runs).
    """

    def __init__(self):
        self._extractor = PDFExtractor()
        self._cleaner = TextCleaner()
        self._chunker = Chunker()
        self._embedder = EmbeddingService()
        self._vector_store = VectorStore()

    async def process(
        self,
        document_id: str,
        file_path: str,
        filename: str,
        category: str,
        db: Session,
    ) -> None:
        """
        Run the full pipeline for a document asynchronously.
        Pipeline: extract → clean → chunk → embed → store

        Status progression:
        - Start: status is "pending"
        - After extract: "extracted" (with page_count and char_count)
        - After chunk: "chunked"
        - Before embed: "embedding"
        - After store: "completed" (set by VectorStore.upsert)

        On any step failure:
        - Set status="failed" and error_message
        - Return immediately (do not run subsequent steps)
        - Never overwrite an existing "failed" status with "completed"
        """
        # Update status to processing
        self._update_status(db, document_id, "processing")

        # ── Step 1: Extract ──────────────────────────────────────────────
        try:
            pages = self._extractor.extract_text(
                pdf_path=file_path,
                document_id=document_id,
                db=db,
            )
            total_chars = sum(len(p.text) for p in pages)
            page_count = len(pages)
            self._update_status(
                db, document_id, "extracted",
                page_count=page_count, char_count=total_chars
            )
        except Exception as exc:
            # PDFExtractor already set status="failed" in DB
            logger.error("Pipeline step 1 (extract) failed for %s: %s", document_id, str(exc))
            return

        # ── Step 2: Clean ────────────────────────────────────────────────
        try:
            cleaned_pages: list[PageText] = []
            for page in pages:
                cleaned_text = self._cleaner.clean(page.text)
                cleaned_pages.append(
                    PageText(page_number=page.page_number, text=cleaned_text)
                )
        except Exception as exc:
            logger.error("Pipeline step 2 (clean) failed for %s: %s", document_id, str(exc))
            self._set_failed(db, document_id, f"Text cleaning failed: {exc}")
            return

        # ── Step 3: Chunk ────────────────────────────────────────────────
        try:
            chunks: list[ChunkData] = self._chunker.chunk(
                pages=cleaned_pages,
                document_id=document_id,
                source_filename=filename,
                category=category,
                db=db,
            )
            if not chunks:
                # Chunker already set status="failed" for empty/invalid cases
                logger.error("Pipeline step 3 (chunk) returned empty for %s", document_id)
                return
            self._update_status(db, document_id, "chunked")
        except Exception as exc:
            logger.error("Pipeline step 3 (chunk) failed for %s: %s", document_id, str(exc))
            self._set_failed(db, document_id, f"Chunking failed: {exc}")
            return

        # ── Step 4: Embed ────────────────────────────────────────────────
        try:
            self._update_status(db, document_id, "embedding")
            chunk_embedding_pairs = self._embedder.embed_chunks(
                chunks=chunks,
                document_id=document_id,
                db=db,
            )
        except Exception as exc:
            # EmbeddingService already set status="failed" in DB
            logger.error("Pipeline step 4 (embed) failed for %s: %s", document_id, str(exc))
            return

        # ── Step 5: Store ────────────────────────────────────────────────
        try:
            self._vector_store.upsert(
                chunk_embedding_pairs=chunk_embedding_pairs,
                document_id=document_id,
                db=db,
            )
            # VectorStore.upsert sets status="completed" on success
        except Exception as exc:
            # VectorStore.upsert already set status="failed" in DB
            logger.error("Pipeline step 5 (store) failed for %s: %s", document_id, str(exc))
            return

        logger.info(
            "Pipeline completed successfully for document %s (%d chunks)",
            document_id, len(chunk_embedding_pairs)
        )

    def _update_status(
        self,
        db: Session,
        document_id: str,
        status: str,
        page_count: int = None,
        char_count: int = None,
    ) -> None:
        """Update document status (and optional fields) in the registry."""
        try:
            doc = db.query(Document).filter(
                Document.document_id == document_id
            ).first()
            if doc and doc.status != "failed":
                doc.status = status
                if page_count is not None:
                    doc.page_count = page_count
                if char_count is not None:
                    doc.char_count = char_count
                db.commit()
        except Exception as exc:
            logger.error(
                "Failed to update document %s status to %s: %s",
                document_id, status, str(exc)
            )

    def _set_failed(self, db: Session, document_id: str, reason: str) -> None:
        """Set document status to 'failed' with error message."""
        try:
            doc = db.query(Document).filter(
                Document.document_id == document_id
            ).first()
            if doc:
                doc.status = "failed"
                doc.error_message = reason
                db.commit()
        except Exception as exc:
            logger.error(
                "Failed to mark document %s as failed: %s",
                document_id, str(exc)
            )
