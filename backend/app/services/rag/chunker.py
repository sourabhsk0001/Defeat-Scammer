import re
from typing import List, Dict, Any

class SemanticChunker:
    """
    Splits authoritative documents into semantic passages while preserving
    complete parent provenance metadata across every generated chunk.
    """

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_documents(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        all_chunks = []

        for doc in documents:
            text = doc["content"]
            # Split into natural sentences
            sentences = re.split(r"(?<=[.!?])\s+", text)
            
            current_chunk_sentences = []
            current_len = 0
            chunks_for_doc = []

            for sentence in sentences:
                sent_len = len(sentence)
                if current_len + sent_len > self.chunk_size and current_chunk_sentences:
                    chunk_text = " ".join(current_chunk_sentences).strip()
                    chunks_for_doc.append(chunk_text)
                    
                    # Compute overlap from end of previous sentences
                    overlap_sentences = []
                    overlap_len = 0
                    for s in reversed(current_chunk_sentences):
                        if overlap_len + len(s) < self.chunk_overlap:
                            overlap_sentences.insert(0, s)
                            overlap_len += len(s)
                        else:
                            break
                    current_chunk_sentences = overlap_sentences
                    current_len = overlap_len

                current_chunk_sentences.append(sentence)
                current_len += sent_len

            if current_chunk_sentences:
                chunks_for_doc.append(" ".join(current_chunk_sentences).strip())

            # Format each chunk with full metadata provenance
            total_chunks = len(chunks_for_doc)
            for idx, chunk_text in enumerate(chunks_for_doc):
                chunk_id = f"{doc['id']}_chk_{idx + 1}"
                all_chunks.append({
                    "chunk_id": chunk_id,
                    "doc_id": doc["id"],
                    "chunk_index": idx + 1,
                    "total_chunks": total_chunks,
                    "text": chunk_text,
                    "category": doc["category"],
                    "title": doc["title"],
                    "source": doc["source"],
                    "publication_date": doc["publication_date"],
                    "update_date": doc.get("update_date", doc["publication_date"]),
                    "jurisdiction": doc["jurisdiction"],
                    "document_type": doc["document_type"],
                    "url": doc["url"],
                    "keywords": doc.get("keywords", [])
                })

        return all_chunks
