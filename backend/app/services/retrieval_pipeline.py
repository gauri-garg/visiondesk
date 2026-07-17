import logging
from dataclasses import dataclass, field
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore, SearchResult

logger = logging.getLogger(__name__)


@dataclass
class SearchResponse:
    results: list = field(default_factory=list)
    message: str | None = None


class RetrievalPipeline:
    """
    Orchestrates semantic search:
    1. Embed the query using EmbeddingService
    2. Query VectorStore for top_k nearest neighbors
    3. Return SearchResponse
    """

    def __init__(self):
        self._embedder = EmbeddingService()
        self._vector_store = VectorStore()

    async def search(
        self,
        query: str,
        top_k: int = 5,
        db: Session = None,
    ) -> SearchResponse:
        """
        Embed query and search the vector store.

        - Returns SearchResponse(results=[], message=...) if KB is empty
        - Returns SearchResponse(results=[...]) on success
        - Wraps synchronous VectorStore calls in run_in_threadpool
        """
        try:
            # Embed the query (synchronous call wrapped in threadpool)
            query_embedding = await run_in_threadpool(
                self._embedder.embed_query, query
            )
        except Exception as exc:
            logger.error("RetrievalPipeline: embedding query failed: %s", str(exc))
            return SearchResponse(results=[], message="Search unavailable: embedding service error.")

        try:
            # Search vector store (synchronous, wrapped in threadpool)
            results: list[SearchResult] = await run_in_threadpool(
                self._vector_store.search, query_embedding, top_k
            )
        except Exception as exc:
            logger.error("RetrievalPipeline: vector search failed: %s", str(exc))
            return SearchResponse(results=[], message="Search unavailable: vector store error.")

        if not results:
            # Determine if KB is empty or just no matches
            try:
                count = await run_in_threadpool(
                    lambda: self._vector_store._collection.count()
                )
                if count == 0:
                    return SearchResponse(
                        results=[],
                        message="No documents have been indexed yet."
                    )
            except Exception:
                pass
            return SearchResponse(results=results)

        return SearchResponse(results=results)
