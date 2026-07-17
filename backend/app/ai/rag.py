import logging
from dataclasses import dataclass
from fastapi.concurrency import run_in_threadpool

from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore

logger = logging.getLogger(__name__)

MIN_SIMILARITY = 0.4


@dataclass
class RAGContext:
    source_filename: str
    page_number: int
    chunk_text: str
    similarity_score: float


class RAGIntegration:
    """
    Bridges the document knowledge base with the chat endpoint.

    retrieve_context() embeds the question, searches VectorStore,
    filters by MIN_SIMILARITY (0.4), and returns [] if VectorStore
    is unavailable (logs a warning — never raises to the caller).

    build_rag_prompt() assembles a Gemini prompt that includes
    retrieved excerpts as context before answering the question.
    """

    def __init__(self):
        self._embedder = EmbeddingService()
        self._vector_store = VectorStore()

    def retrieve_context(
        self,
        question: str,
        top_k: int = 5,
        min_similarity: float = MIN_SIMILARITY,
    ) -> list[RAGContext]:
        """
        Synchronous context retrieval (called from sync chat handler or
        wrapped in run_in_threadpool from async handlers).

        Returns [] if:
        - VectorStore is unavailable (logs WARNING)
        - No chunks meet the min_similarity threshold
        """
        try:
            query_embedding = self._embedder.embed_query(question)
        except Exception as exc:
            logger.warning(
                "RAGIntegration: embedding failed, falling back to no-context: %s",
                str(exc),
            )
            return []

        try:
            results = self._vector_store.search(query_embedding, top_k)
        except Exception as exc:
            logger.warning(
                "RAGIntegration: VectorStore unavailable, falling back to no-context: %s",
                str(exc),
            )
            return []

        # Filter by minimum similarity threshold
        return [
            RAGContext(
                source_filename=r.source_filename,
                page_number=r.page_number,
                chunk_text=r.chunk_text,
                similarity_score=r.similarity_score,
            )
            for r in results
            if r.similarity_score >= min_similarity
        ]

    def build_rag_prompt(
        self,
        question: str,
        context_chunks: list[RAGContext],
        detection_context: str = "",
    ) -> str:
        """
        Build a RAG-augmented Gemini prompt.

        Structure:
        1. System header
        2. Numbered document excerpts (with filename + page)
        3. Current inspection data (if provided)
        4. The user's question
        """
        lines = [
            "You are a workplace safety assistant for VisionDesk AI.",
            "",
            "The following excerpts are from uploaded safety documents:",
            "",
        ]

        for i, chunk in enumerate(context_chunks, start=1):
            lines.append(
                f"--- Excerpt {i} ({chunk.source_filename}, page {chunk.page_number}) ---"
            )
            lines.append(chunk.chunk_text.strip())
            lines.append("")

        if detection_context:
            lines.append("Current inspection data:")
            lines.append(detection_context)
            lines.append("")

        lines.append(
            "Answer the following question based on the excerpts and inspection data above."
        )
        lines.append(f"Question: {question}")

        return "\n".join(lines)


# Module-level singleton
rag_integration = RAGIntegration()
