from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.schemas import (
    RiskEvaluationRequest, 
    RiskEvaluationResult, 
    ValidationResult,
    DeterministicRuleInfo
)
from app.core.database import db
from app.services.deterministic_risk_engine import deterministic_risk_engine, TransactionValidator

router = APIRouter(prefix="/risk", tags=["Phase 7: Deterministic Risk Engine"])

@router.get("/rules", response_model=List[DeterministicRuleInfo])
def get_deterministic_rules():
    """
    Returns the complete registry of deterministic fraud detection rules,
    including mathematical formulas, severity levels, categories, and score weights.
    """
    return deterministic_risk_engine.get_registered_rules()

@router.post("/validate", response_model=ValidationResult)
def validate_transaction(req: RiskEvaluationRequest):
    """
    Step 2: Transaction Validation.
    Validates boundary criteria, formats, non-empty beneficiaries, and amounts without running full scoring.
    """
    tx_data = req.model_dump()
    return TransactionValidator.validate(tx_data)

@router.post("/evaluate", response_model=RiskEvaluationResult)
def evaluate_transaction(req: RiskEvaluationRequest):
    """
    Executes the Complete Phase 7 Deterministic Pipeline:
    Transaction -> Validation -> Rules -> Risk Indicators -> Risk Score
    """
    tx_data = {
        "id": f"eval_{int(datetime.now().timestamp() * 1000)}",
        "amount": req.amount,
        "recipient": req.recipient,
        "merchant": req.recipient,
        "title": req.title or f"Transfer to {req.recipient}",
        "type": req.type,
        "category": req.category,
        "channel": req.channel,
        "location": req.location,
        "timestamp": req.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # Pass overrides if supplied (for simulation/testing)
    overrides = {}
    if req.force_new_recipient is not None:
        overrides["force_new_recipient"] = req.force_new_recipient
    if req.burst_count_override is not None:
        overrides["burst_count_override"] = req.burst_count_override

    profile_income = float(db.profile.get("monthly_income", 6500.0))
    result = deterministic_risk_engine.evaluate_transaction(
        tx_data=tx_data,
        history=db.transactions,
        profile_income=profile_income,
        simulator_overrides=overrides if overrides else None
    )

    return result

@router.post("/simulate", response_model=RiskEvaluationResult)
def simulate_fraud_scenario(req: RiskEvaluationRequest):
    """
    Interactive Simulation Sandbox:
    Explicitly test combinations of deterministic rules:
    - amount > normal_amount * 5 ('Unusually high amount')
    - new_recipient ('New recipient')
    - rapid_transactions ('Rapid transactions')
    - compound triad signatures
    """
    return evaluate_transaction(req)
