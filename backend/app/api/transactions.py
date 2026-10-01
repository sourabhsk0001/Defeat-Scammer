from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
from app.models.schemas import Transaction, TransactionCreate
from app.core.database import db
from app.services.risk_engine import risk_engine

router = APIRouter(prefix="/transactions", tags=["Transactions & Anomaly Detection"])

@router.get("", response_model=List[Transaction])
def get_transactions():
    return db.transactions

@router.post("", response_model=Transaction)
def create_transaction(tx_in: TransactionCreate):
    tx_dict = {
        "id": f"tx_{str(uuid.uuid4())[:8]}",
        "title": tx_in.title,
        "amount": tx_in.amount,
        "type": tx_in.type,
        "category": tx_in.category,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "merchant": tx_in.merchant,
        "location": tx_in.location or "Online"
    }

    # Run Real-time Risk Engine & Anomaly Detection
    score, is_anomaly, flags = risk_engine.analyze_transaction(tx_dict, db.transactions)
    tx_dict["risk_score"] = score
    tx_dict["is_anomaly"] = is_anomaly
    tx_dict["risk_flags"] = flags

    # Prepend to list
    db.transactions.insert(0, tx_dict)
    
    # Recalculate security score if anomaly
    if is_anomaly:
        db.profile["security_score"] = max(45, db.profile.get("security_score", 90) - 8)
    db.save()

    return tx_dict

@router.post("/re-scan-all")
def re_scan_all():
    """Batch re-runs anomaly detection across entire ledger."""
    anomalies_found = 0
    for tx in db.transactions:
        score, is_anomaly, flags = risk_engine.analyze_transaction(tx, db.transactions)
        tx["risk_score"] = score
        tx["is_anomaly"] = is_anomaly
        tx["risk_flags"] = flags
        if is_anomaly:
            anomalies_found += 1
    db.save()
    return {"status": "success", "scanned_total": len(db.transactions), "anomalies_detected": anomalies_found}
