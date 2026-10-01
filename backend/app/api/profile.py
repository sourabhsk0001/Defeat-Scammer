from fastapi import APIRouter
from typing import Dict, Any, List
from app.models.schemas import UserProfile, ProfileUpdate
from app.core.database import db

router = APIRouter(prefix="/profile", tags=["Financial Profile"])

@router.get("", response_model=UserProfile)
def get_profile():
    return db.profile

@router.put("", response_model=UserProfile)
def update_profile(update: ProfileUpdate):
    if update.name is not None:
        db.profile["name"] = update.name
    if update.phone is not None:
        db.profile["phone"] = update.phone
    if update.monthly_income is not None:
        db.profile["monthly_income"] = update.monthly_income
    if update.monthly_expenses is not None:
        db.profile["monthly_expenses"] = update.monthly_expenses
    if update.risk_appetite is not None:
        db.profile["risk_appetite"] = update.risk_appetite
    if update.financial_goal is not None:
        db.profile["financial_goal"] = update.financial_goal
    if update.preferred_language is not None:
        db.profile["preferred_language"] = update.preferred_language
    db.save()
    return db.profile

@router.get("/dashboard-summary")
def get_dashboard_summary():
    """Phase 4: Consolidated Financial Health, Income, Expenses, Savings, Budget & Alerts."""
    income = float(db.profile.get("monthly_income", 30000.00))
    expenses = float(db.profile.get("monthly_expenses", 21500.00))
    savings = max(0.0, income - expenses)
    savings_rate = round((savings / income * 100), 1) if income > 0 else 0.0

    # Risk alerts count from flagged anomalies
    risk_alerts = [t for t in db.transactions if t.get("is_anomaly")]
    risk_alerts_count = len(risk_alerts) if risk_alerts else 2

    # Scams checked simulated counter
    scams_checked_count = 14

    # Financial goal progress
    goal_progress_pct = 80

    return {
        "financial_health": {
            "income": income,
            "expenses": expenses,
            "savings": savings,
            "savings_rate": savings_rate,
            "risk_alerts_count": risk_alerts_count,
            "scams_checked_count": scams_checked_count,
            "goal_progress_pct": goal_progress_pct,
            "health_score": db.profile.get("financial_health_score", 85),
            "security_score": db.profile.get("security_score", 90),
            "financial_goal": db.profile.get("financial_goal", "Emergency Fraud Reserve"),
            "protection_tier": db.profile.get("protection_tier", "Ultra Sentinel")
        },
        "income_breakdown": [
            {"source": "Primary Salary Direct Deposit", "amount": round(income * 0.85, 2), "frequency": "Monthly", "verified": True},
            {"source": "Consulting / Performance Bonus", "amount": round(income * 0.15, 2), "frequency": "Variable", "verified": True}
        ],
        "expenses_breakdown": [
            {"category": "Housing & Utilities", "amount": round(expenses * 0.45, 2), "percentage": 45.0},
            {"category": "Groceries & Dining", "amount": round(expenses * 0.25, 2), "percentage": 25.0},
            {"category": "Transfers & Discretionary", "amount": round(expenses * 0.20, 2), "percentage": 20.0},
            {"category": "Software & Services", "amount": round(expenses * 0.10, 2), "percentage": 10.0}
        ],
        "active_risk_alerts": [
            {
                "id": "alt_01",
                "title": "Off-Peak Wire to High-Risk Exchange",
                "severity": "CRITICAL",
                "amount": 2950.00,
                "timestamp": "02:41 AM",
                "flag": "Z-score 4.8σ outlier + Proxy gateway"
            },
            {
                "id": "alt_02",
                "title": "Card Testing Micro-Charge Verification",
                "severity": "HIGH",
                "amount": 1.15,
                "timestamp": "04:12 AM",
                "flag": "Automated batch carding probe pattern"
            }
        ]
    }
