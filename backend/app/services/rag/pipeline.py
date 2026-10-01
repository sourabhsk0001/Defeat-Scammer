from typing import List, Dict, Any, Optional
from app.services.rag.document_loader import DocumentLoader
from app.services.rag.chunker import SemanticChunker
from app.services.rag.embeddings import VectorEmbeddingEngine
from app.services.rag.vector_store import SupabasePgVectorStore
from app.services.rag.retriever import RAGRetriever

class RAGPipeline:
    """
    Phase 12 — Retrieval-Augmented Generation (RAG) Architecture:
    Official Documents ➔ Document Loader ➔ Chunking ➔ Embeddings ➔ Supabase pgvector ➔ Retriever ➔ Gemini ➔ Answer + Sources
    """

    def __init__(self):
        self.loader = DocumentLoader()
        self.chunker = SemanticChunker(chunk_size=550, chunk_overlap=120)
        self.embedding_engine = VectorEmbeddingEngine()
        self.vector_store = SupabasePgVectorStore()
        self.retriever = RAGRetriever(self.vector_store, self.embedding_engine)
        self._gemini_client = None

        # Initialize and populate vector store on startup
        self._initialize_pipeline()

    @property
    def gemini_client(self):
        if self._gemini_client is None:
            from app.services.ai_service import GeminiClient
            self._gemini_client = GeminiClient()
        return self._gemini_client


    def _initialize_pipeline(self):
        """Loads official documents, chunks them, and indexes them into Supabase pgvector."""
        docs = self.loader.load()
        chunks = self.chunker.chunk_documents(docs)
        self.vector_store.insert_chunks(chunks)
        print(f"[RAGPipeline] Initialized knowledge base with {len(docs)} official documents across {len(chunks)} pgvector chunks.")

    async def query(
        self,
        user_query: str,
        top_k: int = 3,
        category_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes the full RAG pipeline:
        1. Retrieve top-K relevant chunks via Supabase pgvector.
        2. Construct authoritative citation context.
        3. Pass context and query to Gemini.
        4. Return structured Answer + Sources.
        """
        # 1. Vector Retrieval
        retrieved_chunks = await self.retriever.retrieve_async(
            query=user_query,
            top_k=top_k,
            category_filter=category_filter
        )

        # 2. Build Sources metadata
        sources = []
        context_parts = []
        for i, chunk in enumerate(retrieved_chunks):
            sources.append({
                "source": chunk["source"],
                "title": chunk["title"],
                "publication_date": chunk["publication_date"],
                "update_date": chunk.get("update_date", chunk["publication_date"]),
                "jurisdiction": chunk["jurisdiction"],
                "document_type": chunk["document_type"],
                "url": chunk["url"],
                "category": chunk["category"],
                "relevance_score": chunk["similarity_score"],
                "excerpt": chunk["text"]
            })
            context_parts.append(
                f"[Source {i+1}]: {chunk['title']} by {chunk['source']} ({chunk['document_type']}, {chunk['jurisdiction']})\n"
                f"URL: {chunk['url']}\n"
                f"Content: {chunk['text']}"
            )

        context_str = "\n\n".join(context_parts) if context_parts else "No specific documents matched above threshold."

        # 3. Instruct Gemini
        system_instruction = (
            "You are the official FinAccess-AI Knowledge Base Sentinel. "
            "You provide authoritative, highly accurate information grounded strictly in official regulatory "
            "and government documents: RBI, NPCI, CERT-In, I4C, IRDAI, and Ministry of Finance directives. "
            "When answering, explicitly reference the official sources and guidelines provided in the context. "
            "If asked about fraud or scams, clearly articulate the official defense protocols and reporting helplines (e.g. 1930 / cybercrime.gov.in).\n\n"
            f"OFFICIAL RETRIEVED STATUTORY CONTEXT:\n{context_str}"
        )

        prompt = f"User Question: {user_query}\n\nPlease synthesize a clear, authoritative answer based on the official documents provided."
        ai_response = await self.gemini_client.generate(prompt, system_instruction=system_instruction)

        # Fallback synthesis if remote Gemini is unavailable
        if not ai_response:
            ai_response = self._fallback_answer_synthesis(user_query, sources)

        # 4. Structured Answer + Sources Output
        return {
            "query": user_query,
            "answer": ai_response,
            "sources": sources,
            "total_sources_cited": len(sources),
            "pipeline_trace": {
                "document_loader": "Active (8 Official Domains)",
                "chunker": f"Semantic Chunking (550 chars)",
                "embedding_model": "text-embedding-004 (768-dim normalized)",
                "vector_store": "Supabase pgvector (cosine distance <=>)",
                "retriever_top_k": top_k,
                "synthesizer": "Google Gemini (gemini-1.5-flash)"
            }
        }

    def _fallback_answer_synthesis(self, user_query: str, sources: List[Dict[str, Any]]) -> str:
        """Synthesizes an authoritative answer from the retrieved source excerpts."""
        if not sources:
            return (
                "Based on the official statutory documents, no direct matches were found. "
                "However, as a general rule established by RBI, NPCI, and CERT-In: "
                "1. Never share confidential credentials (passwords, PINs, OTPs, CVV) with anyone. "
                "2. A UPI PIN is strictly for debiting funds, never to receive money. "
                "3. In the event of unauthorized financial loss, immediately dial **1930** or visit **cybercrime.gov.in**."
            )

        primary = sources[0]
        secondary_points = [f"• **{s['source']} ({s['title']}):** {s['excerpt'][:180]}..." for s in sources]

        return (
            f"### 🏛️ Official Regulatory Guidance\n\n"
            f"According to **{primary['source']}** under the *{primary['title']}* ({primary['document_type']}, {primary['publication_date']}):\n\n"
            f"{primary['excerpt']}\n\n"
            f"#### 🔍 Key Official Insights:\n"
            + "\n".join(secondary_points) +
            f"\n\n#### 🛡️ Authoritative Directive:\n"
            f"For verified rules, review the official document at [{primary['title']}]({primary['url']}). "
            f"If reporting an active financial fraud incident, take immediate action under the Ministry of Home Affairs SOP by dialing **1930** or accessing **cybercrime.gov.in**."
        )

# Global singleton pipeline
rag_pipeline = RAGPipeline()
