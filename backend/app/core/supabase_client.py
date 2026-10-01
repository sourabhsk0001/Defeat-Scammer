import os
import httpx
from typing import Dict, Any, List, Optional

class SupabaseClient:
    """Lightweight asynchronous Supabase REST client supporting PostgREST & pgvector RPC."""

    def __init__(self):
        self.url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
        self.service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.is_configured = bool(self.url and (self.key or self.service_role_key))

    def _get_headers(self, use_admin: bool = False) -> Dict[str, str]:
        auth_token = self.service_role_key if (use_admin and self.service_role_key) else self.key
        return {
            "apikey": auth_token,
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    async def select(self, table: str, params: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        if not self.is_configured:
            return []
        endpoint = f"{self.url}/rest/v1/{table}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(endpoint, headers=self._get_headers(), params=params)
            return resp.json() if resp.status_code == 200 else []

    async def insert(self, table: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.is_configured:
            return None
        endpoint = f"{self.url}/rest/v1/{table}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(endpoint, headers=self._get_headers(use_admin=True), json=data)
            return resp.json()[0] if resp.status_code in (200, 201) and resp.json() else None

    async def match_knowledge_documents(
        self, 
        query_embedding: List[float], 
        threshold: float = 0.7, 
        count: int = 3
    ) -> List[Dict[str, Any]]:
        """Invokes Supabase PostgreSQL pgvector stored procedure match_knowledge_documents."""
        if not self.is_configured:
            return []
        endpoint = f"{self.url}/rest/v1/rpc/match_knowledge_documents"
        payload = {
            "query_embedding": query_embedding,
            "match_threshold": threshold,
            "match_count": count
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(endpoint, headers=self._get_headers(), json=payload)
            return resp.json() if resp.status_code == 200 else []

supabase = SupabaseClient()
