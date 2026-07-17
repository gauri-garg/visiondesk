import logging
import os
import time

from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session

from app.models.document_model import Document
from app.services.chunker import ChunkData

load_dotenv()
logger = logging.getLogger(__name__)

BATCH_SIZE = 100
MAX_RETRIES = 5
INITIAL_WAIT = 1.0
MAX_WAIT = 60.0


class EmbeddingService:
    """
    Generates vector embeddings for document chunks using Gemini text-embedding-004.

    - Processes chunks in batches of ≤100
    - Exponential back-off on rate-limit (429) errors
    - Reads GEMINI_API_KEY from environment (consistent with GeminiService)
    """

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self._client = genai.Client(api_key=api_key)

    def embed_chunks(
        self,
        chunks: list[ChunkData],
        document_id: str = None,
        db: Session = None,
    ) -> list[tuple[ChunkData, list[float]]]:
        """
        Embed a list of ChunkData objects.

        Returns list of (ChunkData, embedding_vector) pairs.
        On failure: updates document status to "failed" and raises.
        """
        if not chunks:
            return []

        results: list[tuple[ChunkData, list[float]]] = []

        # Process in batches of BATCH_SIZE
        for batch_start in range(0, len(chunks), BATCH_SIZE):
            batch = chunks[batch_start : batch_start + BATCH_SIZE]
            batch_embeddings = self._embed_batch_with_retry(batch, document_id, db)
            results.extend(zip(batch, batch_embeddings))

        return results

    def embed_query(self, query: str) -> list[float]:
        """
        Embed a single query string. Returns the embedding vector.
        Raises on failure.
        """
        embeddings = self._embed_texts_api([query])
        return embeddings[0]

    def _embed_batch_with_retry(
        self,
        batch: list[ChunkData],
        document_id: str = None,
        db: Session = None,
    ) -> list[list[float]]:
        """Embed a batch with exponential back-off on 429 / quota errors."""
        texts = [chunk.text for chunk in batch]
        wait = INITIAL_WAIT

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                return self._embed_texts_api(texts)
            except Exception as exc:
                error_str = str(exc).lower()
                is_rate_limit = (
                    "429" in str(exc)
                    or "rate" in error_str
                    or "quota" in error_str
                    or "resource_exhausted" in error_str
                )

                if is_rate_limit and attempt < MAX_RETRIES:
                    logger.warning(
                        "Rate limit hit (attempt %d/%d). Waiting %.1fs before retry.",
                        attempt,
                        MAX_RETRIES,
                        wait,
                    )
                    time.sleep(wait)
                    wait = min(wait * 2, MAX_WAIT)
                    continue

                # Non-retryable error or final retry exhausted
                logger.error(
                    "Embedding failed (attempt %d/%d): %s",
                    attempt,
                    MAX_RETRIES,
                    str(exc),
                )
                if db is not None and document_id is not None:
                    self._set_failed(db, document_id, str(exc))
                raise

        # Should not be reached, but satisfies type checker
        raise RuntimeError("Embedding retry loop exhausted unexpectedly")

    def _embed_texts_api(self, texts: list[str]) -> list[list[float]]:
        """
        Call the Gemini embedding API once per text.

        The google-genai SDK's embed_content accepts a single content item
        (str, Content, Part, etc.) or a list.  We call it once per text to
        keep error attribution straightforward and avoid any per-SDK-version
        differences in batch behaviour.

        Returns list[list[float]] — one vector per input text.
        """
        embeddings: list[list[float]] = []

        for text in texts:
            result = self._client.models.embed_content(
                model="gemini-embedding-001",
                contents=text,
            )

            # EmbedContentResponse exposes .embeddings (list[ContentEmbedding])
            # each ContentEmbedding has a .values attribute (list[float]).
            if hasattr(result, "embeddings") and result.embeddings:
                vector = result.embeddings[0].values
            elif hasattr(result, "embedding") and result.embedding:
                # Fallback for older SDK shapes
                vector = result.embedding.values
            else:
                raise ValueError(
                    f"Gemini embed_content returned no embeddings for text: {text[:50]!r}"
                )

            embeddings.append(list(vector))

        return embeddings

    def _set_failed(self, db: Session, document_id: str, reason: str) -> None:
        """Best-effort update of document status to 'failed'."""
        try:
            doc = (
                db.query(Document)
                .filter(Document.document_id == document_id)
                .first()
            )
            if doc:
                doc.status = "failed"
                doc.error_message = reason
                db.commit()
        except Exception as exc:
            logger.error("Failed to update document status: %s", str(exc))
