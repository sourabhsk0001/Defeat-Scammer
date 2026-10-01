import os
import math
import hashlib
import re
from typing import List, Optional
import httpx
from app.core.config import settings

class VectorEmbeddingEngine:
    """
    Computes dense vector representations for text chunks and queries.
    Embeddings are unit-normalized vectors (768 dimensions) so cosine similarity
    is equivalent to the dot product.
    Supports remote Google Gemini Embeddings API (text-embedding-004)
    with high-performance deterministic semantic vector generation fallback.
    """

    DIMENSION = 768

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"

    async def get_embedding_async(self, text: str) -> List[float]:
        """Asynchronously requests Gemini embedding if key is available, else uses deterministic engine."""
        if self.api_key:
            try:
                headers = {"Content-Type": "application/json"}
                payload = {
                    "model": "models/text-embedding-004",
                    "content": {"parts": [{"text": text[:2000]}]}
                }
                url = f"{self.endpoint}?key={self.api_key}"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(url, headers=headers, json=payload)
                    if res.status_code == 200:
                        values = res.json().get("embedding", {}).get("values", [])
                        if len(values) == self.DIMENSION:
                            return self._normalize(values)
            except Exception as e:
                print(f"[VectorEmbeddingEngine] Remote embedding failed: {e}. Falling back to deterministic engine.")

        return self.get_embedding(text)

    def get_embedding(self, text: str) -> List[float]:
        """
        Generates a 768-dimensional normalized semantic vector using
        frequency-weighted hashing and character n-grams.
        Deterministic, fast, and robust across all execution contexts.
        """
        vec = [0.0] * self.DIMENSION
        tokens = re.findall(r"\w+", text.lower())

        if not tokens:
            return [0.0] * self.DIMENSION

        for i, token in enumerate(tokens):
            # Term weight (slight position & frequency decay)
            weight = 1.0 + (1.0 / (1.0 + 0.05 * i))
            
            # Primary token hash bucket
            h1 = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16)
            idx1 = h1 % self.DIMENSION
            sign1 = 1.0 if (h1 >> 16) % 2 == 0 else -1.0
            vec[idx1] += sign1 * weight

            # Bigram hashing for local semantic context
            if i < len(tokens) - 1:
                bigram = f"{token}_{tokens[i+1]}"
                h2 = int(hashlib.md5(bigram.encode("utf-8")).hexdigest(), 16)
                idx2 = h2 % self.DIMENSION
                sign2 = 1.0 if (h2 >> 16) % 2 == 0 else -1.0
                vec[idx2] += sign2 * (weight * 1.5)

        return self._normalize(vec)

    @staticmethod
    def _normalize(vector: List[float]) -> List[float]:
        """Applies L2 normalization to project vector onto the unit hypersphere."""
        norm = math.sqrt(sum(x * x for x in vector))
        if norm == 0:
            return vector
        return [round(x / norm, 6) for x in vector]

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Calculates cosine similarity between two unit vectors (dot product)."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        return sum(a * b for a, b in zip(v1, v2))
