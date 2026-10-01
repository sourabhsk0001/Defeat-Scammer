from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import numpy as np

from app.models.schemas import (
    MLAnomalyDetectionRequest,
    MLAnomalyDetectionResult,
    MLFeatures,
    MLModelInfo
)
from app.core.database import db
from ml.anomaly_detector import ml_anomaly_detector
from ml.feature_pipeline import FeaturePipeline

router = APIRouter(prefix="/ml", tags=["Phase 8: Scikit-Learn Isolation Forest ML Anomaly Detection"])

@router.get("/model-info", response_model=MLModelInfo)
def get_ml_model_info():
    """Returns the operational metadata and hyperparameters for the Scikit-Learn Isolation Forest model."""
    return MLModelInfo(
        model_name="Scikit-Learn IsolationForest",
        n_estimators=ml_anomaly_detector.n_estimators,
        contamination=ml_anomaly_detector.contamination,
        training_samples_count=ml_anomaly_detector.training_samples_count,
        features_used=FeaturePipeline.FEATURE_NAMES,
        algorithm="Unsupervised Random Subspace Decision Trees (Path Length Outlier Measure)"
    )

@router.post("/detect", response_model=MLAnomalyDetectionResult)
def detect_transaction_anomaly(req: MLAnomalyDetectionRequest):
    """
    Executes the Complete Phase 8 ML Anomaly Detection Pipeline:
    Transaction Data ➔ Feature Engineering (6 Features) ➔ Scikit-learn ➔ Isolation Forest ➔ Anomaly Score
    """
    tx_data = {
        "id": f"tx_ml_{str(uuid.uuid4())[:8]}",
        "amount": req.amount,
        "recipient": req.recipient,
        "merchant": req.recipient,
        "type": req.type,
        "channel": req.channel,
        "timestamp": req.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # Extract 6 features
    features = FeaturePipeline.extract_features(tx_data, db.transactions)

    # Apply manual feature overrides if testing in simulator
    if req.feature_overrides:
        for k, v in req.feature_overrides.items():
            if k in features:
                features[k] = float(v)

    # Vectorize and predict with Isolation Forest
    X = FeaturePipeline.to_vector(features)
    raw_score = float(ml_anomaly_detector.model.decision_function(X)[0])
    pred = int(ml_anomaly_detector.model.predict(X)[0])

    # Convert to 0-100 anomaly score
    scaled_score = 50.0 - (raw_score / 0.28) * 50.0
    anomaly_score = int(round(np.clip(scaled_score, 5.0, 99.0)))
    is_anomaly = (pred == -1) or (anomaly_score >= 60)

    # Generate explanations
    flags = []
    if features["amount_deviation"] >= 3.0:
        flags.append(f"Amount deviation (+{features['amount_deviation']} std-dev above mean)")
    elif features["amount_deviation"] >= 2.0:
        flags.append(f"Elevated amount (+{features['amount_deviation']} std-dev above mean)")

    if features["transaction_frequency"] >= 3.0:
        flags.append(f"High transaction frequency ({int(features['transaction_frequency'])} transfers in rolling window)")

    if 1.0 <= features["time_of_day"] <= 5.0:
        flags.append(f"Dormant off-peak hour anomaly (time of day: {features['time_of_day']:.1f}h)")

    if features["recipient_frequency"] == 0.0:
        flags.append("New beneficiary with zero historical interaction frequency (0.00)")

    if features["daily_transaction_count"] >= 5.0:
        flags.append(f"Daily transaction velocity surge ({int(features['daily_transaction_count'])} transfers today)")

    if is_anomaly and not flags:
        flags.append(f"Isolation Forest multi-factor outlier (Raw score: {raw_score:.3f})")

    confidence = round(abs(raw_score) / 0.35 * 100.0, 1)
    confidence = min(99.0, max(50.0, confidence))

    return MLAnomalyDetectionResult(
        transaction_id=tx_data["id"],
        features=MLFeatures(**features),
        raw_decision_score=round(raw_score, 4),
        anomaly_score=anomaly_score,
        is_anomaly=is_anomaly,
        anomaly_flags=flags,
        confidence_percent=confidence,
        model_info={
            "model": "IsolationForest",
            "trees_evaluated": ml_anomaly_detector.n_estimators,
            "prediction": "OUTLIER" if pred == -1 else "INLIER"
        }
    )

@router.post("/batch-detect")
def batch_detect_ledger():
    """Runs Scikit-Learn Isolation Forest across all historical transactions."""
    results = []
    anomalies_detected = 0

    for tx in db.transactions:
        is_anomaly, flags, feats, score = ml_anomaly_detector.predict(tx, db.transactions)
        tx["ml_anomaly_score"] = score
        tx["ml_is_anomaly"] = is_anomaly
        tx["ml_features"] = feats
        if is_anomaly:
            anomalies_detected += 1
        results.append({
            "id": tx["id"],
            "title": tx.get("title", ""),
            "amount": tx.get("amount", 0),
            "anomaly_score": score,
            "is_anomaly": is_anomaly,
            "flags": flags,
            "features": feats
        })

    db.save()
    return {
        "status": "success",
        "scanned_total": len(db.transactions),
        "anomalies_detected": anomalies_detected,
        "results": results
    }

@router.post("/retrain")
def retrain_model():
    """Retrains the Isolation Forest with updated transactions from the ledger."""
    ml_anomaly_detector.retrain_from_ledger(db.transactions)
    return {
        "status": "retrained",
        "training_samples_count": ml_anomaly_detector.training_samples_count,
        "n_estimators": ml_anomaly_detector.n_estimators,
        "contamination": ml_anomaly_detector.contamination
    }
