import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.schemas import (
    Transaction, TransactionCreate,
    ExpenseItem, ExpenseCreate,
    IncomeItem, IncomeCreate,
    BudgetCreate, BudgetSummary,
    GoalItem, GoalCreate
)
from app.core.database import db
from app.services.risk_engine import risk_engine
from app.services.analytics_engine import analytics_engine

router = APIRouter(tags=["Phase 5 — Financial Management & Analytics"])

# -------------------------------------------------------------
# 1. TRANSACTIONS
# -------------------------------------------------------------
@router.get("/transactions", response_model=List[Transaction])
def get_transactions():
    return db.transactions

@router.post("/transactions", response_model=Transaction)
def create_transaction(tx_in: TransactionCreate):
    tx_dict = {
        "id": f"tx_{uuid.uuid4().hex[:8]}",
        "title": tx_in.title,
        "amount": tx_in.amount,
        "type": tx_in.type,
        "category": tx_in.category,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "merchant": tx_in.merchant,
        "location": tx_in.location or "Online"
    }

    # Evaluate ML Risk & Anomaly Detection
    score, is_anomaly, flags = risk_engine.analyze_transaction(tx_dict, db.transactions)
    tx_dict["risk_score"] = score
    tx_dict["is_anomaly"] = is_anomaly
    tx_dict["risk_flags"] = flags

    db.transactions.insert(0, tx_dict)
    
    # Also log to expense or income
    if tx_in.type == "debit":
        for b in db.budgets:
            if b["category"] == tx_in.category:
                b["spent"] = round(b["spent"] + tx_in.amount, 2)
                break
    db.save()
    return tx_dict

# -------------------------------------------------------------
# 2. EXPENSES
# -------------------------------------------------------------
@router.get("/expenses")
def get_expenses():
    expenses = [
        {
            "id": t["id"],
            "category": t["category"],
            "amount": t["amount"],
            "merchant": t.get("merchant", "Unknown"),
            "date": t["date"],
            "payment_method": "card",
            "is_anomaly": t.get("is_anomaly", False)
        }
        for t in db.transactions if t.get("type") == "debit"
    ]
    return expenses

@router.post("/expenses")
def create_expense(exp_in: ExpenseCreate):
    tx_dict = {
        "id": f"exp_{uuid.uuid4().hex[:8]}",
        "title": f"Expense: {exp_in.category}",
        "amount": exp_in.amount,
        "type": "debit",
        "category": exp_in.category,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "merchant": exp_in.notes or exp_in.category,
        "location": "Point of Sale"
    }
    score, is_anomaly, flags = risk_engine.analyze_transaction(tx_dict, db.transactions)
    tx_dict["risk_score"] = score
    tx_dict["is_anomaly"] = is_anomaly
    tx_dict["risk_flags"] = flags

    db.transactions.insert(0, tx_dict)
    db.save()
    return {"status": "success", "expense": tx_dict}

# -------------------------------------------------------------
# 3. INCOME
# -------------------------------------------------------------
@router.get("/income")
def get_income():
    income_records = [
        {
            "id": t["id"],
            "source": t["title"],
            "amount": t["amount"],
            "date": t["date"],
            "frequency": "Monthly",
            "verified": True
        }
        for t in db.transactions if t.get("type") == "credit"
    ]
    if not income_records:
        income_records = [
            {"id": "inc_01", "source": "Payroll Direct Deposit", "amount": float(db.profile.get("monthly_income", 30000.0)), "date": "2026-09-28", "frequency": "Monthly", "verified": True}
        ]
    return income_records

@router.post("/income")
def create_income(inc_in: IncomeCreate):
    tx_dict = {
        "id": f"inc_{uuid.uuid4().hex[:8]}",
        "title": inc_in.source,
        "amount": inc_in.amount,
        "type": "credit",
        "category": "Income",
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "merchant": inc_in.source,
        "risk_score": 1,
        "is_anomaly": False,
        "risk_flags": [],
        "location": "Direct Deposit ACH"
    }
    db.transactions.insert(0, tx_dict)
    db.profile["monthly_income"] = round(db.profile.get("monthly_income", 0) + inc_in.amount, 2)
    db.save()
    return {"status": "success", "income": tx_dict}

# -------------------------------------------------------------
# 4. BUDGET
# -------------------------------------------------------------
@router.get("/budget")
def get_budgets():
    return db.budgets

@router.post("/budget")
def create_or_update_budget(b_in: BudgetCreate):
    found = False
    for b in db.budgets:
        if b["category"].lower() == b_in.category.lower():
            b["budgeted"] = b_in.budgeted
            found = True
            break
    if not found:
        db.budgets.append({
            "category": b_in.category,
            "budgeted": b_in.budgeted,
            "spent": 0.0,
            "percentage": 0.0,
            "status": "Safe"
        })
    db.save()
    return {"status": "success", "message": f"Budget for '{b_in.category}' set to ${b_in.budgeted:.2f}"}

# -------------------------------------------------------------
# 5. GOALS
# -------------------------------------------------------------
@router.get("/goals")
def get_goals():
    return [
        {
            "id": "goal_01",
            "title": db.profile.get("financial_goal", "Emergency Fraud Reserve"),
            "target_amount": 50000.0,
            "current_amount": 40000.0,
            "progress_percentage": 80.0,
            "target_date": "2026-12-31",
            "status": "Active"
        },
        {
            "id": "goal_02",
            "title": "Elder Care Shield Fund",
            "target_amount": 20000.0,
            "current_amount": 12500.0,
            "progress_percentage": 62.5,
            "target_date": "2027-03-31",
            "status": "Active"
        }
    ]

@router.post("/goals")
def create_goal(goal_in: GoalCreate):
    return {
        "status": "success",
        "goal": {
            "id": f"goal_{uuid.uuid4().hex[:6]}",
            "title": goal_in.title,
            "target_amount": goal_in.target_amount,
            "current_amount": goal_in.current_amount,
            "progress_percentage": round((goal_in.current_amount / goal_in.target_amount * 100), 1) if goal_in.target_amount > 0 else 0.0,
            "target_date": goal_in.target_date or "2026-12-31",
            "status": "Active"
        }
    }

# -------------------------------------------------------------
# 6. ANALYTICS (Pandas & NumPy Computation)
# -------------------------------------------------------------
@router.get("/analytics")
def get_financial_analytics():
    """
    Leverages Pandas & NumPy to calculate:
    - Monthly spending
    - Category spending
    - Savings rate
    - Cash flow
    - Budget variance
    """
    res = analytics_engine.compute_analytics(
        transactions=db.transactions,
        income_records=[],
        expenses=[],
        budgets=db.budgets,
        monthly_income_baseline=float(db.profile.get("monthly_income", 30000.0))
    )
    return res
