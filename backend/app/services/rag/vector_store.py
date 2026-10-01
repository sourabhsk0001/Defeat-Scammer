from typing import List, Dict, Any, Optional
from app.services.rag.embeddings import VectorEmbeddingEngine

class SupabasePgVectorStore:
    """
    Simulates and connects to the Supabase pgvector store ('knowledge_documents' table).
    Schema in PostgreSQL:
      CREATE TABLE knowledge_documents (
        id UUID PRIMARY KEY,
        title TEXT,
        category TEXT,
        content TEXT,
        embedding vector(768),
        metadata JSONB
      );
    Performs cosine similarity search mimicking the pgvector `<=>` operator.
    """

    def __init__(self):
        self.chunks_table: List[Dict[str, Any]] = []
        self.embedding_engine = VectorEmbeddingEngine()

    def insert_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Embeds and indexes chunks into the vector store."""
        inserted_count = 0
        for chunk in chunks:
            # Generate vector embedding for chunk text if not present
            if "embedding" not in chunk or not chunk["embedding"]:
                chunk["embedding"] = self.embedding_engine.get_embedding(chunk["text"])

            self.chunks_table.append(chunk)
            inserted_count += 1

        return inserted_count

    def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 4,
        min_similarity: float = 0.20,
        category_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes pgvector cosine similarity search:
        Cosine Similarity = (A . B) / (||A|| * ||B||)
        Equivalent to SQL:
          SELECT *, 1 - (embedding <=> query_embedding) AS similarity
          FROM knowledge_documents
          ORDER BY embedding <=> query_embedding ASC
          LIMIT top_k;
        """
        scored_results = []

        for chunk in self.chunks_table:
            if category_filter and chunk.get("category") != category_filter:
                continue

            chunk_emb = chunk.get("embedding", [])
            similarity = VectorEmbeddingEngine.cosine_similarity(query_embedding, chunk_emb)

            # Keyword lexical reinforcement boost
            # Checks if any core keywords match in the text
            text_lower = chunk["text"].lower()
            keyword_boost = 0.0
            for kw in chunk.get("keywords", []):
                if kw in text_lower:
                    keyword_boost += 0.05
            composite_score = round(min(1.0, similarity + min(0.2, keyword_boost)), 4)

            if composite_score >= min_similarity:
                scored_results.append({
                    "chunk_id": chunk["chunk_id"],
                    "doc_id": chunk["doc_id"],
                    "category": chunk["category"],
                    "title": chunk["title"],
                    "source": chunk["source"],
                    "publication_date": chunk["publication_date"],
                    "update_date": chunk["update_date"],
                    "jurisdiction": chunk["jurisdiction"],
                    "document_type": chunk["document_type"],
                    "url": chunk["url"],
                    "text": chunk["text"],
                    "similarity_score": round(composite_score * 100, 1)
                })

        # Sort descending by similarity score
        scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_results[:top_k]

    def count(self) -> int:
        return len(self.chunks_table)

    def clear(self):
        self.chunks_table.clear()
