import math
from datetime import datetime, timedelta
from typing import Dict, Any, List
import numpy as np

class FeaturePipeline:
    """
    Phase 8 Feature Engineering Pipeline.
    Extracts the 6 canonical machine learning features required for Isolation Forest:
    1. transaction_amount
    2. transaction_frequency
    3. time_of_day
    4. recipient_frequency
    5. amount_deviation
    6. daily_transaction_count
    """

    FEATURE_NAMES = [
        "transaction_amount",
        "transaction_frequency",
        "time_of_day",
        "recipient_frequency",
        "amount_deviation",
        "daily_transaction_count"
    ]

    @staticmethod
    def parse_timestamp(raw_date: Any) -> datetime:
        if isinstance(raw_date, datetime):
            return raw_date
        if not raw_date:
            return datetime.now()
        cleaned = str(raw_date).strip()
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
            try:
                return datetime.strptime(cleaned, fmt)
            except ValueError:
                continue
        return datetime.now()

    @classmethod
    def extract_features(cls, tx: Dict[str, Any], history: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Extracts the 6 dimensional feature dictionary for Isolation Forest.
        """
        # 1. Feature: transaction_amount
        raw_amt = tx.get("amount", 0.0)
        try:
            transaction_amount = float(raw_amt)
        except (ValueError, TypeError):
            transaction_amount = 0.0

        tx_time = cls.parse_timestamp(tx.get("timestamp") or tx.get("date"))
        recipient = str(tx.get("recipient") or tx.get("merchant") or "").strip().lower()

        # 2. Feature: time_of_day (continuous decimal hours: 0.00 to 23.99)
        time_of_day = round(tx_time.hour + (tx_time.minute / 60.0), 2)

        # 3. Historical baseline calculations for amount_deviation
        past_debits = [
            float(t.get("amount", 0.0)) for t in history 
            if str(t.get("type", "debit")).lower() == "debit" and float(t.get("amount", 0.0)) > 0
        ]

        if past_debits:
            mean_amt = sum(past_debits) / len(past_debits)
            variance = sum((x - mean_amt) ** 2 for x in past_debits) / max(1, len(past_debits))
            std_dev = math.sqrt(variance)
            if std_dev > 0:
                amount_deviation = round((transaction_amount - mean_amt) / std_dev, 2)
            else:
                amount_deviation = round((transaction_amount - mean_amt) / max(1.0, mean_amt), 2)
        else:
            amount_deviation = 0.0

        # 4. Feature: recipient_frequency (proportion of past tx to this recipient)
        if history and recipient:
            recipient_matches = sum(
                1 for t in history
                if str(t.get("recipient") or t.get("merchant") or "").strip().lower() == recipient
            )
            recipient_frequency = round(recipient_matches / max(1, len(history)), 4)
        else:
            recipient_frequency = 0.0

        # 5. Feature: transaction_frequency (transactions in rolling 2-hour window)
        two_hours_prior = tx_time - timedelta(hours=2)
        recent_tx_count = 0
        for t in history:
            t_time = cls.parse_timestamp(t.get("timestamp") or t.get("date"))
            if two_hours_prior <= t_time <= tx_time:
                recent_tx_count += 1
        # Add current transaction into window
        transaction_frequency = float(recent_tx_count + 1)

        # 6. Feature: daily_transaction_count (transactions on same calendar day)
        tx_day = tx_time.date()
        daily_count = 0
        for t in history:
            t_time = cls.parse_timestamp(t.get("timestamp") or t.get("date"))
            if t_time.date() == tx_day:
                daily_count += 1
        daily_transaction_count = float(daily_count + 1)

        return {
            "transaction_amount": round(transaction_amount, 2),
            "transaction_frequency": round(transaction_frequency, 2),
            "time_of_day": round(time_of_day, 2),
            "recipient_frequency": round(recipient_frequency, 4),
            "amount_deviation": round(amount_deviation, 2),
            "daily_transaction_count": round(daily_transaction_count, 1)
        }

    @classmethod
    def to_vector(cls, features: Dict[str, float]) -> np.ndarray:
        """Converts feature dictionary to ordered numpy vector (1, 6)."""
        row = [features[name] for name in cls.FEATURE_NAMES]
        return np.array([row], dtype=np.float64)

    @classmethod
    def to_matrix(cls, feature_list: List[Dict[str, float]]) -> np.ndarray:
        """Converts list of feature dicts to numpy matrix (N, 6)."""
        rows = [[f[name] for name in cls.FEATURE_NAMES] for f in feature_list]
        return np.array(rows, dtype=np.float64)
