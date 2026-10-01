from fastapi import APIRouter
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    RAGQueryRequest, RAGQueryResponse, RAGSourceCitation, OfficialDocumentMetadata
)
from app.services.rag.pipeline import rag_pipeline
from app.services.rag.documents import OFFICIAL_KNOWLEDGE_DOCUMENTS

router = APIRouter(prefix="/rag", tags=["Phase 12 — RAG Knowledge Base"])

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ARCHITECTURE:
# Official Documents ➔ Document Loader ➔ Chunking ➔ Embeddings ➔
# Supabase pgvector ➔ Retriever ➔ Gemini ➔ Answer + Sources
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/query", response_model=RAGQueryResponse)
async def query_rag_knowledge_base(req: RAGQueryRequest):
    """
    Executes end-to-end RAG query:
    1. Embeds query into 768-dim space.
    2. Runs cosine similarity search against Supabase pgvector store.
    3. Retrieves top-K authoritative statutory passages.
    4. Passes context to Google Gemini.
    5. Returns synthesized Answer + full authoritative Sources metadata.
    """
    res = await rag_pipeline.query(
        user_query=req.query,
        top_k=req.top_k or 3,
        category_filter=req.category_filter
    )
    return RAGQueryResponse(
        query=res["query"],
        answer=res["answer"],
        sources=[RAGSourceCitation(**s) for s in res["sources"]],
        total_sources_cited=res["total_sources_cited"],
        pipeline_trace=res["pipeline_trace"]
    )

@router.get("/documents", response_model=List[OfficialDocumentMetadata])
def list_official_documents(category: Optional[str] = None):
    """Lists all official statutory documents in the knowledge base."""
    docs = OFFICIAL_KNOWLEDGE_DOCUMENTS
    if category:
        docs = [d for d in docs if d["category"].lower() == category.lower()]
    return [OfficialDocumentMetadata(**d) for d in docs]

@router.get("/stats")
def get_rag_pipeline_stats():
    """Returns real-time pipeline telemetry and pgvector chunk statistics."""
    categories = {}
    for d in OFFICIAL_KNOWLEDGE_DOCUMENTS:
        cat = d["category"]
        categories[cat] = categories.get(cat, 0) + 1

    return {
        "status": "operational",
        "documents_loaded": len(OFFICIAL_KNOWLEDGE_DOCUMENTS),
        "pgvector_chunks_indexed": rag_pipeline.vector_store.count(),
        "embedding_dimensions": 768,
        "similarity_metric": "cosine (<=>)",
        "categories_covered": categories,
        "authoritative_sources": [
            "Reserve Bank of India (RBI)",
            "National Payments Corporation of India (NPCI)",
            "Indian Computer Emergency Response Team (CERT-In)",
            "Indian Cyber Crime Coordination Centre (I4C)",
            "Insurance Regulatory and Development Authority of India (IRDAI)",
            "Ministry of Finance (Govt of India)",
            "Ministry of Home Affairs (MHA)"
        ]
    }
