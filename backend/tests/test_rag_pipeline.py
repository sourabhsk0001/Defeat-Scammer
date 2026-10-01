import unittest
from app.services.rag.document_loader import DocumentLoader
from app.services.rag.chunker import SemanticChunker
from app.services.rag.embeddings import VectorEmbeddingEngine
from app.services.rag.vector_store import SupabasePgVectorStore
from app.services.rag.retriever import RAGRetriever
from app.services.rag.pipeline import RAGPipeline
from app.services.rag.documents import OFFICIAL_KNOWLEDGE_DOCUMENTS

class TestPhase12RAGPipeline(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.loader = DocumentLoader()
        self.chunker = SemanticChunker(chunk_size=500, chunk_overlap=100)
        self.embedding_engine = VectorEmbeddingEngine()
        self.vector_store = SupabasePgVectorStore()
        self.retriever = RAGRetriever(self.vector_store, self.embedding_engine)

    def test_document_loader_all_8_domains_and_metadata(self):
        docs = self.loader.load()
        self.assertEqual(len(docs), 8)

        expected_categories = {
            "Financial literacy",
            "UPI safety",
            "Cyber safety",
            "Banking basics",
            "Loan terminology",
            "Insurance basics",
            "Government schemes",
            "Official fraud-reporting guidance"
        }
        loaded_categories = {d["category"] for d in docs}
        self.assertEqual(loaded_categories, expected_categories)

        # Verify all 6 mandatory metadata fields on every document
        for doc in docs:
            self.assertTrue(doc["source"], f"Missing source in {doc['id']}")
            self.assertTrue(doc["title"], f"Missing title in {doc['id']}")
            self.assertTrue(doc["publication_date"], f"Missing publication_date in {doc['id']}")
            self.assertTrue(doc["jurisdiction"], f"Missing jurisdiction in {doc['id']}")
            self.assertTrue(doc["document_type"], f"Missing document_type in {doc['id']}")
            self.assertTrue(doc["url"].startswith("http"), f"Invalid url in {doc['id']}")

    def test_semantic_chunker_metadata_preservation(self):
        docs = self.loader.load()
        chunks = self.chunker.chunk_documents(docs)
        self.assertGreater(len(chunks), len(docs))

        # Check provenance preservation on chunks
        for chk in chunks:
            self.assertIn("chunk_id", chk)
            self.assertIn("source", chk)
            self.assertIn("title", chk)
            self.assertIn("publication_date", chk)
            self.assertIn("jurisdiction", chk)
            self.assertIn("document_type", chk)
            self.assertIn("url", chk)
            self.assertGreater(len(chk["text"]), 20)

    def test_vector_embeddings_properties(self):
        vec1 = self.embedding_engine.get_embedding("UPI PIN is only required to send money, not to receive funds")
        vec2 = self.embedding_engine.get_embedding("You never need to enter your UPI PIN to claim a refund or receive cash")
        vec3 = self.embedding_engine.get_embedding("Organic horticulture farming and greenhouse soil cultivation")

        self.assertEqual(len(vec1), 768)
        self.assertEqual(len(vec2), 768)

        # Check unit normalization
        norm = sum(x * x for x in vec1)
        self.assertAlmostEqual(norm, 1.0, places=2)

        # Semantic proximity test: UPI queries should be much closer than organic farming
        sim_upi = VectorEmbeddingEngine.cosine_similarity(vec1, vec2)
        sim_irrelevant = VectorEmbeddingEngine.cosine_similarity(vec1, vec3)
        self.assertGreater(sim_upi, sim_irrelevant)

    def test_supabase_pgvector_similarity_search(self):
        docs = self.loader.load()
        chunks = self.chunker.chunk_documents(docs)
        self.vector_store.insert_chunks(chunks)
        self.assertGreater(self.vector_store.count(), 0)

        # Query UPI safety
        q_emb = self.embedding_engine.get_embedding("Do I need to enter UPI PIN to receive money on OLX?")
        results = self.vector_store.similarity_search(q_emb, top_k=3)
        self.assertGreater(len(results), 0)
        top = results[0]
        self.assertIn(top["category"], ["UPI safety", "Financial literacy", "Official fraud-reporting guidance"])
        self.assertIn("source", top)
        self.assertIn("url", top)

    async def test_full_rag_pipeline_end_to_end(self):
        pipeline = RAGPipeline()
        query = "What should I do during the golden hour if money was stolen through online cyber fraud?"
        res = await pipeline.query(query, top_k=2)

        self.assertIn("answer", res)
        self.assertIn("sources", res)
        self.assertGreater(len(res["sources"]), 0)

        found_sources = [s["source"] for s in res["sources"]]
        self.assertTrue(
            any("I4C" in src or "MHA" in src or "CERT" in src for src in found_sources),
            f"Expected authoritative cyber agency, got {found_sources}"
        )
        self.assertTrue(any("https://" in s["url"] for s in res["sources"]))
        self.assertTrue(any(s["jurisdiction"] == "India" or "Global" in s["jurisdiction"] for s in res["sources"]))

if __name__ == "__main__":
    unittest.main()
