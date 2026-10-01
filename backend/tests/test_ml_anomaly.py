from datetime import datetime, timedelta
import numpy as np
from ml.feature_pipeline import FeaturePipeline
from ml.anomaly_detector import ml_anomaly_detector

def test_feature_engineering_six_features():
    tx = {
        "amount": 2500.0,
        "recipient": "Electronics Store",
        "type": "debit",
        "date": "2026-10-01 15:30:00"
    }
    history = [
        {"amount": 500.0, "recipient": "Grocery", "type": "debit", "date": "2026-10-01 14:00:00"},
        {"amount": 600.0, "recipient": "Electronics Store", "type": "debit", "date": "2026-09-30 11:00:00"}
    ]

    features = FeaturePipeline.extract_features(tx, history)

    # 1. Check all 6 required features are present
    expected_keys = [
        "transaction_amount",
        "transaction_frequency",
        "time_of_day",
        "recipient_frequency",
        "amount_deviation",
        "daily_transaction_count"
    ]
    for key in expected_keys:
        assert key in features, f"Missing feature: {key}"
        assert isinstance(features[key], (int, float))

    # 2. Check values
    assert features["transaction_amount"] == 2500.0
    assert features["time_of_day"] == 15.5
    assert features["recipient_frequency"] == 0.5  # 1 out of 2 past tx
    assert features["transaction_frequency"] == 2.0 # 1 past tx within 2h + current
    assert features["daily_transaction_count"] == 2.0 # 1 past tx today + current
    assert features["amount_deviation"] > 0

    # 3. Check vectorization
    vec = FeaturePipeline.to_vector(features)
    assert vec.shape == (1, 6)

def test_isolation_forest_prediction():
    history = [
        {"amount": 100.0, "recipient": "Cafe", "type": "debit", "date": "2026-10-01 12:00:00"},
        {"amount": 120.0, "recipient": "Cafe", "type": "debit", "date": "2026-10-01 12:30:00"},
        {"amount": 110.0, "recipient": "Supermarket", "type": "debit", "date": "2026-10-01 13:00:00"}
    ]

    # Routine transaction
    normal_tx = {"amount": 115.0, "recipient": "Cafe", "type": "debit", "date": "2026-10-01 13:30:00"}
    is_ano, flags, feats, score = ml_anomaly_detector.predict(normal_tx, history)
    assert 0 <= score <= 100
    assert isinstance(feats, dict)
    assert len(feats) == 6

    # Extreme Outlier (Massive amount spike + 3 AM execution + new recipient)
    outlier_tx = {"amount": 50000.0, "recipient": "Untrusted Offshore LLC", "type": "debit", "date": "2026-10-01 03:15:00"}
    is_ano_out, flags_out, feats_out, score_out = ml_anomaly_detector.predict(outlier_tx, history)
    assert is_ano_out is True
    assert score_out >= 65
    assert len(flags_out) > 0
