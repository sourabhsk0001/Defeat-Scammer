from fastapi import APIRouter
from app.models.schemas import (
    AIChatRequest, AIChatResponse,
    FinancialExplanationRequest, FinancialExplanationResponse,
    ScamExplanationRequest, ScamExplanationResponse,
    BudgetRecommendationRequest, BudgetRecommendationResponse,
    FinancialEducationRequest, FinancialEducationResponse,
    PersonalizedGuidanceRequest, PersonalizedGuidanceResponse
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai-assistant", tags=["Phase 11 — AI Engine (Gemini)"])

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ARCHITECTURE:
# User ➔ FastAPI ➔ AI Service ➔ Gemini ➔ Response
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_assistant(req: AIChatRequest):
    """Unified AI copilot conversational chat with RAG grounding."""
    res = await ai_service.chat(
        message=req.message,
        history=[{"role": m.role, "content": m.content} for m in req.history]
    )
    return AIChatResponse(
        reply=res["reply"],
        rag_sources=res.get("rag_sources", []),
        safety_advisory=res.get("safety_advisory")
    )

@router.post("/explain-finances", response_model=FinancialExplanationResponse)
async def explain_finances(req: FinancialExplanationRequest):
    """Responsibility 1: Financial explanation & cash flow diagnostics."""
    savings = req.savings if req.savings is not None else (req.income - req.expenses)
    savings_rate = req.savings_rate if req.savings_rate is not None else (
        (savings / req.income * 100) if req.income > 0 else 0.0
    )

    res = await ai_service.explain_finances(
        income=req.income,
        expenses=req.expenses,
        savings=savings,
        savings_rate=savings_rate,
        categories=req.categories or {"Living": req.expenses * 0.6, "Discretionary": req.expenses * 0.4},
        anomalies_count=req.anomalies_count,
        user_query=req.query
    )
    return FinancialExplanationResponse(
        explanation=res["explanation"],
        health_tier=res["health_tier"],
        health_summary=res["health_summary"],
        metrics_evaluated=res["metrics_evaluated"]
    )

@router.post("/explain-scam", response_model=ScamExplanationResponse)
async def explain_scam(req: ScamExplanationRequest):
    """Responsibility 2: Scam explanation & threat vector deconstruction."""
    res = await ai_service.explain_scam(
        content=req.content,
        channel=req.channel or "SMS",
        scam_category=req.scam_category,
        threat_level=req.threat_level or "HIGH",
        indicators=req.indicators or []
    )
    return ScamExplanationResponse(
        scam_explanation=res["scam_explanation"],
        channel=res["channel"],
        category=res["category"],
        threat_level=res["threat_level"],
        golden_rule=res["golden_rule"],
        reporting_helpline=res["reporting_helpline"]
    )

@router.post("/budget-recommendations", response_model=BudgetRecommendationResponse)
async def recommend_budget(req: BudgetRecommendationRequest):
    """Responsibility 3: Budget recommendations & 50/30/20 optimization."""
    res = await ai_service.recommend_budget(
        income=req.income,
        expenses=req.expenses,
        current_budgets=req.current_budgets,
        financial_goals=req.financial_goals
    )
    return BudgetRecommendationResponse(
        recommendations=res["recommendations"],
        framework=res["framework"],
        monthly_income=res["monthly_income"],
        target_allocations=res["target_allocations"],
        category_targets=res["category_targets"],
        annual_wealth_growth_potential=res["annual_wealth_growth_potential"]
    )

@router.post("/financial-education", response_model=FinancialEducationResponse)
async def provide_financial_education(req: FinancialEducationRequest):
    """Responsibility 4: Financial education on core wealth & literacy concepts."""
    res = await ai_service.provide_education(
        topic=req.topic,
        user_level=req.difficulty_level or "beginner"
    )
    return FinancialEducationResponse(
        topic=res["topic"],
        lesson=res["lesson"],
        difficulty=res["difficulty"],
        estimated_read_time=res["estimated_read_time"]
    )

@router.post("/personalized-guidance", response_model=PersonalizedGuidanceResponse)
async def provide_personalized_guidance(req: PersonalizedGuidanceRequest):
    """Responsibility 5: Personalized multi-phase financial & security guidance."""
    res = await ai_service.provide_personalized_guidance(
        name=req.name or "Alex Morgan",
        age_range=req.age_range or "26-35",
        occupation=req.occupation or "Professional",
        monthly_income=req.monthly_income or 6500.0,
        monthly_expenses=req.monthly_expenses or 4250.0,
        financial_goal=req.financial_goal or "Financial Freedom & Scam Immunity",
        preferred_language=req.preferred_language or "English",
        risk_alerts_count=req.risk_alerts_count or 0
    )
    return PersonalizedGuidanceResponse(
        name=res["name"],
        goal=res["goal"],
        guidance_roadmap=res["guidance_roadmap"],
        monthly_surplus=res["monthly_surplus"],
        security_status=res["security_status"],
        action_phases=res["action_phases"]
    )
