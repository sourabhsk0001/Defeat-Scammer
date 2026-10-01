from typing import List, Dict, Any
from app.services.rag.pipeline import rag_pipeline as backend_pipeline
from app.services.rag.documents import OFFICIAL_KNOWLEDGE_DOCUMENTS

class RAGPipeline:
    """
    Retrieval-Augmented Generation (RAG) pipeline for financial fraud signatures
    and official regulatory documents.
    """
    def __init__(self):
        self.pipeline = backend_pipeline
        self.official_documents = OFFICIAL_KNOWLEDGE_DOCUMENTS

    def query(self, text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Synchronously retrieves matching document chunks via vector store."""
        results = self.pipeline.vector_store.similarity_search(
            query_embedding=self.pipeline.embedding_engine.get_embedding(text),
            top_k=top_k
        )
        return [
            {
                "id": r["chunk_id"],
                "title": r["title"],
                "source": r["source"],
                "category": r["category"],
                "summary": r["text"][:200] + "...",
                "url": r["url"],
                "document_type": r["document_type"],
                "publication_date": r["publication_date"],
                "jurisdiction": r["jurisdiction"],
                "score": r["similarity_score"]
            }
            for r in results
        ]

    async def answer(self, text: str, top_k: int = 3) -> Dict[str, Any]:
        """Full RAG flow producing synthesized Answer + Sources."""
        return await self.pipeline.query(user_query=text, top_k=top_k)

rag_pipeline = RAGPipeline()
