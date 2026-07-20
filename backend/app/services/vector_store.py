import logging
import os
from dataclasses import dataclass

import chromadb
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.services.chunker import ChunkData
from app.models.document_model import Document

load_dotenv()
logger = logging.getLogger(__name__)

COLLECTION_NAME = "safety_documents"


@dataclass
class SearchResult:
    chunk_text: str
    document_id: str
    source_filename: str
    page_number: int
    category: str
    similarity_score: float


class VectorStore:
    """
    ChromaDB-backed vector store for document chunks.
    ALL methods are synchronous. In async contexts, use run_in_threadpool.
    """

    def __init__(self):
        chroma_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        self._client = chromadb.PersistentClient(path=chroma_path)
        self._collection = self._client.get_or_create_collection(
            name=COLLECTION_NAME,
            # Use cosine similarity (higher = more similar)
            metadata={"hnsw:space": "cosine"},
        )

    def upsert(
        self,
        chunk_embedding_pairs: list[tuple[ChunkData, list[float]]],
        document_id: str,
        db: Session,
    ) -> None:
        """
        Upsert chunks into ChromaDB.
        Before inserting, deletes all existing records for document_id (idempotence).
        On success: updates document status to "completed" and chunk_count in SQLite.
        On failure: logs error, attempts to set status="failed", re-raises.
        """
        try:
            # Delete stale chunks first (idempotence)
            self._delete_by_document_id(document_id)

            if not chunk_embedding_pairs:
                return

            ids = []
            embeddings = []
            documents = []
            metadatas = []

            for chunk, embedding in chunk_embedding_pairs:
                record_id = f"{chunk.document_id}_{chunk.chunk_index}"
                ids.append(record_id)
                embeddings.append(embedding)
                documents.append(chunk.text)
                metadatas.append({
                    "document_id": chunk.document_id,
                    "source_filename": chunk.source_filename,
                    "page_number": chunk.page_number,
                    "chunk_index": chunk.chunk_index,
                    "category": chunk.category,
                })

            self._collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas,
            )

            # Update document status to "completed"
            doc = db.query(Document).filter(
                Document.document_id == document_id
            ).first()
            if doc:
                doc.status = "completed"
                doc.chunk_count = len(chunk_embedding_pairs)
                db.commit()

        except Exception as exc:
            logger.error(
                "VectorStore upsert failed for document %s: %s",
                document_id, str(exc),
            )
            # Best-effort: set document status to "failed"
            try:
                doc = db.query(Document).filter(
                    Document.document_id == document_id
                ).first()
                if doc and doc.status != "failed":
                    doc.status = "failed"
                    doc.error_message = str(exc)
                    db.commit()
            except Exception as db_exc:
                logger.error(
                    "Failed to set document status to failed: %s", str(db_exc)
                )
            raise

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[SearchResult]:
        """
        Search for the most similar chunks.
        Returns list[SearchResult] sorted by similarity_score descending.
        """
        try:
            count = self._collection.count()
            if count == 0:
                return []

            actual_k = min(top_k, count)
            results = self._collection.query(
                query_embeddings=[query_embedding],
                n_results=actual_k,
                include=["documents", "metadatas", "distances"],
            )

            search_results = []
            documents_list = results.get("documents", [[]])[0]
            metadatas_list = results.get("metadatas", [[]])[0]
            distances_list = results.get("distances", [[]])[0]

            for doc_text, meta, distance in zip(
                documents_list, metadatas_list, distances_list
            ):
                # ChromaDB cosine distance: 0 = identical, 2 = opposite.
                # Convert to similarity score in [0, 1]: similarity = 1 - distance
                # (ChromaDB normalises cosine distance to [0, 1] range)
                similarity_score = max(0.0, 1.0 - distance)

                search_results.append(SearchResult(
                    chunk_text=doc_text or "",
                    document_id=meta.get("document_id", ""),
                    source_filename=meta.get("source_filename", ""),
                    page_number=int(meta.get("page_number", 0)),
                    category=meta.get("category", ""),
                    similarity_score=round(similarity_score, 4),
                ))

            # Sort by similarity descending
            search_results.sort(key=lambda r: r.similarity_score, reverse=True)
            return search_results

        except Exception as exc:
            logger.error("VectorStore search failed: %s", str(exc))
            return []

    def delete_document(self, document_id: str) -> None:
        """
        Delete all chunks for a document from ChromaDB.
        Does not interact with SQLite — caller handles DB deletion.
        """
        try:
            self._delete_by_document_id(document_id)
        except Exception as exc:
            logger.error(
                "VectorStore delete_document failed for %s: %s",
                document_id, str(exc),
            )
            raise

    def _delete_by_document_id(self, document_id: str) -> None:
        """Delete all ChromaDB records for the given document_id."""
        try:
            count = self._collection.count()
            if count == 0:
                return
            self._collection.delete(
                where={"document_id": {"$eq": document_id}}
            )
        except Exception as exc:
            # If the collection is empty or document not found, that's fine
            logger.debug(
                "Delete by document_id %s: %s (may be safe to ignore)",
                document_id, str(exc),
            )

