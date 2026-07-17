import logging
import os
from dataclasses import dataclass

from sqlalchemy.orm import Session
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.services.pdf_extractor import PageText
from app.models.document_model import Document

logger = logging.getLogger(__name__)


@dataclass
class ChunkData:
    document_id: str
    source_filename: str
    page_number: int       # page of the first character in this chunk (1-indexed)
    chunk_index: int       # 0-based, globally unique within the document
    category: str
    text: str


class Chunker:
    """
    Splits cleaned page text into overlapping chunks using LangChain's
    RecursiveCharacterTextSplitter.

    Configuration is read from env vars at instantiation:
    - CHUNK_SIZE: int, default 800
    - CHUNK_OVERLAP: int, default 150

    chunk() is deterministic: identical inputs always produce identical output.
    """

    def __init__(self):
        # Read config from env vars; fall back to defaults if absent or invalid
        try:
            chunk_size = int(os.getenv("CHUNK_SIZE", "800"))
            if chunk_size <= 0:
                raise ValueError("CHUNK_SIZE must be > 0")
        except (ValueError, TypeError):
            logger.warning("Invalid CHUNK_SIZE env var; using default 800")
            chunk_size = 800

        try:
            chunk_overlap = int(os.getenv("CHUNK_OVERLAP", "150"))
            if chunk_overlap < 0:
                raise ValueError("CHUNK_OVERLAP must be >= 0")
        except (ValueError, TypeError):
            logger.warning("Invalid CHUNK_OVERLAP env var; using default 150")
            chunk_overlap = 150

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk(
        self,
        pages: list[PageText],
        document_id: str,
        source_filename: str,
        category: str,
        db: Session,
    ) -> list[ChunkData]:
        """
        Split page text into overlapping chunks.

        Guards:
        - If total text is empty/whitespace: set doc status="failed", return []
        - If chunk_overlap >= chunk_size: set doc status="failed", return []

        Returns a flat list[ChunkData] with globally unique chunk_index values.
        """
        # Guard: overlap >= chunk_size
        if self.chunk_overlap >= self.chunk_size:
            logger.error(
                "CHUNK_OVERLAP (%d) >= CHUNK_SIZE (%d); cannot chunk document %s",
                self.chunk_overlap,
                self.chunk_size,
                document_id,
            )
            self._set_failed(db, document_id, "CHUNK_OVERLAP must be < CHUNK_SIZE")
            return []

        # Guard: empty text
        total_text = "".join(p.text for p in pages)
        if not total_text.strip():
            logger.error(
                "No text to chunk for document %s after cleaning",
                document_id,
            )
            self._set_failed(db, document_id, "Document has no extractable text after cleaning")
            return []

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
        )

        result: list[ChunkData] = []
        chunk_index = 0

        for page in pages:
            if not page.text.strip():
                # Skip blank pages (their page_number attribution is not needed
                # if there's no text to chunk)
                continue

            splits = splitter.split_text(page.text)

            for split_text in splits:
                if not split_text.strip():
                    continue
                result.append(
                    ChunkData(
                        document_id=document_id,
                        source_filename=source_filename,
                        page_number=page.page_number,
                        chunk_index=chunk_index,
                        category=category,
                        text=split_text,
                    )
                )
                chunk_index += 1

        return result

    def _set_failed(self, db: Session, document_id: str, reason: str) -> None:
        """Best-effort update of document status to 'failed'."""
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
                "Failed to update document status to 'failed' for %s: %s",
                document_id,
                str(exc),
            )
