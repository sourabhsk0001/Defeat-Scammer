"""
Re-export of AIService from backend.app.services.ai_service
for root ai/ module namespace compatibility.
"""
from app.services.ai_service import AIService, GeminiClient, ai_service

__all__ = ["AIService", "GeminiClient", "ai_service"]
