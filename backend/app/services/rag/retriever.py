from typing import List, Dict, Any, Optional
from app.services.rag.embeddings import VectorEmbeddingEngine
from app.services.rag.vector_store import SupabasePgVectorStore

class RAGRetriever:
    """
    Semantic Retriever querying the Supabase pgvector store.
    Converts user natural language queries into normalized vector embeddings,
    executes cosine distance nearest-neighbor search, and returns top-K ranked passages.
    """

    def __init__(self, vector_store: SupabasePgVectorStore, embedding_engine: Optional[VectorEmbeddingEngine] = None):
        self.vector_store = vector_store
        self.embedding_engine = embedding_engine or VectorEmbeddingEngine()

    async def retrieve_async(
        self,
        query: str,
        top_k: int = 4,
        category_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Asynchronously converts query into embedding and queries vector store."""
        query_embedding = await self.embedding_engine.get_embedding_async(query)
        return self.vector_store.similarity_search(
            query_embedding=query_embedding,
            top_k=top_k,
            category_filter=category_filter
        )

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        category_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Synchronously converts query into embedding and queries vector store."""
        query_embedding = self.embedding_engine.get_embedding(query)
        return self.vector_store.similarity_search(
            query_embedding=query_embedding,
            top_k=top_k,
            category_filter=category_filter
        )
