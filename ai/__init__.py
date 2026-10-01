"""
FinAccess-AI / Defeat Scammer - AI Module
Contains Gemini integration, RAG vector pipeline, agent orchestration, and prompt templates.
"""
from ai.gemini_engine import GeminiEngine
from ai.rag_pipeline import RAGPipeline
from ai.agent import FraudDefenseAgent

__all__ = ["GeminiEngine", "RAGPipeline", "FraudDefenseAgent"]
