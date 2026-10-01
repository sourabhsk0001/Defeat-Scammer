from fastapi import APIRouter
from app.models.schemas import BudgetSummary, BudgetCategory
from app.core.database import db

router = APIRouter(prefix="/budgets", tags=["Budget Analysis"])

@router.get("", response_model=BudgetSummary)
def get_budget_summary():
    categories = []
    total_budget = sum(b["budgeted"] for b in db.budgets)
    total_spent = sum(b["spent"] for b in db.budgets)
    remaining = total_budget - total_spent

    for b in db.budgets:
        pct = round((b["spent"] / b["budgeted"] * 100), 1) if b["budgeted"] > 0 else 0.0
        status = "Safe"
        if pct > 100:
            status = "Exceeded"
        elif pct > 85:
            status = "Warning"

        categories.append(BudgetCategory(
            category=b["category"],
            budgeted=b["budgeted"],
            spent=b["spent"],
            percentage=pct,
            status=status
        ))

    monthly_income = db.profile.get("monthly_income", 6500.0)
    savings = monthly_income - total_spent
    savings_rate = round((savings / monthly_income * 100), 1) if monthly_income > 0 else 0.0

    if savings_rate > 20:
        health_advice = "Excellent savings discipline. Maintain your emergency fund buffer."
    elif savings_rate > 5:
        health_advice = "Moderate savings buffer. High spending detected in Transfers category due to suspected fraud transaction."
    else:
        health_advice = "High cash burn rate. Immediate review required on anomalous off-shore transfers."

    return BudgetSummary(
        total_budget=total_budget,
        total_spent=total_spent,
        remaining=remaining,
        categories=categories,
        savings_rate=savings_rate,
        health_advice=health_advice
    )
