from datetime import datetime, timedelta
from app.services.deterministic_risk_engine import (
    deterministic_risk_engine, 
    TransactionValidator
)
from app.models.schemas import RiskEvaluationRequest

def test_transaction_validator_valid():
    tx = {
        "amount": 1500.0,
        "recipient": "Amazon Retail",
        "type": "debit",
        "channel": "UPI"
    }
    val = TransactionValidator.validate(tx)
    assert val.is_valid is True
    assert len(val.errors) == 0
    assert val.sanitized_fields["amount"] == 1500.0
    assert val.sanitized_fields["recipient"] == "Amazon Retail"

def test_transaction_validator_invalid_amount():
    # Negative amount
    val_neg = TransactionValidator.validate({"amount": -500, "recipient": "Store"})
    assert val_neg.is_valid is False
    assert any("strictly greater than 0" in e for e in val_neg.errors)

    # Zero amount
    val_zero = TransactionValidator.validate({"amount": 0, "recipient": "Store"})
    assert val_zero.is_valid is False

    # Missing amount
    val_none = TransactionValidator.validate({"recipient": "Store"})
    assert val_none.is_valid is False

def test_transaction_validator_missing_recipient():
    val = TransactionValidator.validate({"amount": 100, "recipient": ""})
    assert val.is_valid is False
    assert any("recipient" in e.lower() for e in val.errors)

def test_rule_unusually_high_amount():
    """if amount > normal_amount * 5: flag('Unusually high amount')"""
    history = [
        {"amount": 1000.0, "type": "debit", "merchant": "Grocery", "recipient": "Grocery"},
        {"amount": 1200.0, "type": "debit", "merchant": "Utility", "recipient": "Utility"},
        {"amount": 800.0, "type": "debit", "merchant": "Fuel", "recipient": "Fuel"}
    ]
    # normal_amount is 1000.0. 5x threshold is 5000.0.
    
    # Below 5x: Amount = 3000 (3x)
    res_mod = deterministic_risk_engine.evaluate_transaction(
        tx_data={"amount": 3000.0, "recipient": "Grocery", "type": "debit"},
        history=history,
        simulator_overrides={"force_new_recipient": False, "burst_count_override": 0}
    )
    flags_mod = [ind.flag for ind in res_mod.risk_indicators]
    assert "Unusually high amount" not in flags_mod

    # Above 5x: Amount = 6000 (6x)
    res_spike = deterministic_risk_engine.evaluate_transaction(
        tx_data={"amount": 6000.0, "recipient": "Grocery", "type": "debit"},
        history=history,
        simulator_overrides={"force_new_recipient": False, "burst_count_override": 0}
    )
    flags_spike = [ind.flag for ind in res_spike.risk_indicators]
    assert "Unusually high amount" in flags_spike
    assert res_spike.telemetry["amount_multiplier"] == 6.0

def test_rule_new_recipient():
    """if new_recipient: flag('New recipient')"""
    history = [
        {"amount": 1000.0, "type": "debit", "merchant": "Known Merchant A", "recipient": "Known Merchant A"},
        {"amount": 1500.0, "type": "debit", "merchant": "Known Merchant B", "recipient": "Known Merchant B"}
    ]

    # Known payee: Should NOT flag
    res_known = deterministic_risk_engine.evaluate_transaction(
        tx_data={"amount": 500.0, "recipient": "Known Merchant A", "type": "debit"},
        history=history,
        simulator_overrides={"burst_count_override": 0}
    )
    flags_known = [ind.flag for ind in res_known.risk_indicators]
    assert "New recipient" not in flags_known

    # Brand new payee: Should flag 'New recipient'
    res_new = deterministic_risk_engine.evaluate_transaction(
        tx_data={"amount": 500.0, "recipient": "First Time Payee XYZ", "type": "debit"},
        history=history,
        simulator_overrides={"burst_count_override": 0}
    )
    flags_new = [ind.flag for ind in res_new.risk_indicators]
    assert "New recipient" in flags_new

def test_rule_rapid_transactions():
    """if many_transactions_in_short_period: flag('Rapid transactions')"""
    history = [
        {"amount": 1000.0, "type": "debit", "merchant": "Known Shop", "recipient": "Known Shop"}
    ]

    # 1 transaction in window -> no velocity flag
    res_normal = deterministic_risk_engine.evaluate_transaction(
        tx_data={"amount": 500.0, "recipient": "Known Shop", "type": "debit"},
        history=history,
        simulator_overrides={"force_new_recipient": False, "burst_count_override": 1}
    )
    flags_normal = [ind.flag for ind in res_normal.risk_indicators]
    assert "Rapid transactions" not in flags_normal

    # 4 transactions in window -> triggers 'Rapid transactions'
    res_rapid = deterministic_risk_engine.evaluate_transaction(
        tx_data={"amount": 500.0, "recipient": "Known Shop", "type": "debit"},
        history=history,
        simulator_overrides={"force_new_recipient": False, "burst_count_override": 4}
    )
    flags_rapid = [ind.flag for ind in res_rapid.risk_indicators]
    assert "Rapid transactions" in flags_rapid

def test_compound_triad_and_decision():
    """All 3 rules trigger: 5x spike + new recipient + rapid transactions -> BLOCK"""
    history = [
        {"amount": 1000.0, "type": "debit", "merchant": "Routine Shop", "recipient": "Routine Shop"}
    ]

    res = deterministic_risk_engine.evaluate_transaction(
        tx_data={"amount": 8000.0, "recipient": "Unknown Off-Shore Wallet", "type": "debit"},
        history=history,
        simulator_overrides={
            "force_new_recipient": True,
            "burst_count_override": 5
        }
    )

    flags = [ind.flag for ind in res.risk_indicators]
    assert "Unusually high amount" in flags
    assert "New recipient" in flags
    assert "Rapid transactions" in flags
    assert any("Triad scam signature" in f for f in flags)
    assert res.risk_score >= 85
    assert res.risk_level == "CRITICAL"
    assert res.decision == "BLOCK"
    assert res.is_anomaly is True

def test_safe_transaction_approval():
    """Clean transaction -> LOW risk score, APPROVE decision"""
    history = [
        {"amount": 1000.0, "type": "debit", "merchant": "Supermarket", "recipient": "Supermarket"}
    ]

    res = deterministic_risk_engine.evaluate_transaction(
        tx_data={"amount": 450.0, "recipient": "Supermarket", "type": "debit"},
        history=history,
        simulator_overrides={
            "force_new_recipient": False,
            "burst_count_override": 0
        }
    )

    assert len(res.risk_indicators) == 0
    assert res.risk_score < 30
    assert res.risk_level == "LOW"
    assert res.decision == "APPROVE"
    assert res.is_anomaly is False
