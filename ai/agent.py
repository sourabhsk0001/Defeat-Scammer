from typing import Dict, Any, List
from ai.gemini_engine import gemini_engine
from ai.rag_pipeline import rag_pipeline
from ai.prompts import FRAUD_DEFENSE_SYSTEM_PROMPT

class FraudDefenseAgent:
    """Autonomous Fraud Intelligence Agent coordinating RAG context and Gemini reasoning."""

    def __init__(self):
        self.engine = gemini_engine
        self.rag = rag_pipeline

    async def analyze(self, user_query: str) -> Dict[str, Any]:
        # 1. Retrieve matching RAG knowledge items
        knowledge_matches = self.rag.query(user_query, top_k=2)
        
        # 2. Build contextual prompt
        rag_context = ""
        if knowledge_matches:
            rag_context = "\n".join(
                [f"Reference Doc [{m['title']}]: {m['summary']} (Guidance: {m['helpline']})" for m in knowledge_matches]
            )

        system_instruction = f"{FRAUD_DEFENSE_SYSTEM_PROMPT}\n\nVERIFIED RAG FRAUD SIGNATURES:\n{rag_context}"
        
        # 3. Generate response via Gemini
        reply = await self.engine.generate_response(user_query, system_prompt=system_instruction)

        return {
            "reply": reply,
            "citations": knowledge_matches,
            "agent_status": "Active Shield"
        }

fraud_agent = FraudDefenseAgent()
