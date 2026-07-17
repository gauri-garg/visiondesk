import logging
from dataclasses import dataclass

import fitz  # PyMuPDF

from sqlalchemy.orm import Session
from app.models.document_model import Document

logger = logging.getLogger(__name__)


@dataclass
class PageText:
    page_number: int  # 1-indexed
    text: str


class PDFExtractor:

    def extract_text(
        self,
        pdf_path: str,
        document_id: str = None,
        db: Session = None,
    ) -> list[PageText]:
        """
        Extract text from every page of the PDF at pdf_path.

        - Page numbers are 1-indexed.
        - Pages with no extractable text log a WARNING and are included
          as PageText with empty string (so page_number attribution is preserved).
        - On ANY exception: update Document.status = "failed" and error_message
          in db (if provided), then re-raise so the pipeline halts.

        Returns list[PageText] on success.
        """
        try:
            doc = fitz.open(pdf_path)
            pages: list[PageText] = []

            for idx in range(len(doc)):
                page = doc[idx]
                page_number = idx + 1
                text = page.get_text()

                if not text or not text.strip():
                    logger.warning(
                        "page %d of %s yielded no extractable text",
                        page_number,
                        pdf_path,
                    )
                    # Still include the page so page_number attribution is preserved
                    pages.append(PageText(page_number=page_number, text=""))
                else:
                    pages.append(PageText(page_number=page_number, text=text))

            doc.close()
            return pages

        except Exception as exc:
            logger.error(
                "PDFExtractor failed on %s: %s",
                pdf_path,
                str(exc),
            )
            if db is not None and document_id is not None:
                try:
                    doc_record = db.query(Document).filter(
                        Document.document_id == document_id
                    ).first()
                    if doc_record:
                        doc_record.status = "failed"
                        doc_record.error_message = str(exc)
                        db.commit()
                except Exception as db_exc:
                    logger.error(
                        "Failed to update document status after extraction error: %s",
                        str(db_exc),
                    )
            raise
