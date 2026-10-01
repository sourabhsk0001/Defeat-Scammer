from fastapi import APIRouter
from app.models.schemas import AIChatRequest, AIChatResponse
from app.services.gemini_service import gemini_service
from app.services.rag_service import rag_service

router = APIRouter(prefix="/ai-assistant", tags=["AI Financial Guardian"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_assistant(req: AIChatRequest):
    # 1. Retrieve RAG context
    rag_matches = rag_service.search_knowledge(req.message, top_k=2)
    context_str = ""
    if rag_matches:
        context_str = "RELEVANT FRAUD KNOWLEDGE BASE DOCS:\n" + "\n".join(
            [f"- {d['title']}: {d['content']} (Action: {d['recommended_action']})" for d in rag_matches]
        )

    system_instruction = (
        "You are the Defeat Scammer AI Sentinel, an expert financial cyber-defense copilot. "
        "Your mission is to defend users against financial fraud, online scams, social engineering, "
        "and predatory investment schemes. Deliver clear, decisive, actionable safety advice with warmth and authority. "
        "Never advise the user to pay fees, click unknown links, or share OTPs.\n"
        f"{context_str}"
    )

    prompt = f"User asks: {req.message}"
    reply = await gemini_service.analyze_with_ai(prompt, system_instruction=system_instruction)

    safety_advisory = (
        "🛡️ Remember: Bank representatives & Police officers will NEVER demand your PIN, OTP, or remote screen access."
    )

    return AIChatResponse(
        reply=reply,
        rag_sources=rag_matches,
        safety_advisory=safety_advisory
    )
