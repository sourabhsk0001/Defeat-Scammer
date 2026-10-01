import math
from typing import Dict, Any, List

class FeaturePipeline:
    """Extracts behavioral and statistical feature vectors from transaction streams."""

    @staticmethod
    def extract_features(tx: Dict[str, Any], history: List[Dict[str, Any]]) -> Dict[str, float]:
        amount = float(tx.get("amount", 0))
        date_str = str(tx.get("date", ""))
        
        # 1. Historical baseline calculations
        past_debits = [float(t.get("amount", 0)) for t in history if t.get("type") == "debit" and float(t.get("amount", 0)) > 0]
        mean = sum(past_debits) / len(past_debits) if past_debits else amount
        variance = sum((x - mean) ** 2 for x in past_debits) / max(1, len(past_debits)) if past_debits else 1.0
        std_dev = math.sqrt(variance)

        # 2. Z-Score (amount deviation)
        z_score = (amount - mean) / std_dev if std_dev > 0 else 0.0

        # 3. Off-peak hour flag (01:00 to 05:00)
        is_off_peak = 1.0 if any(f"0{h}:" in date_str or f" 0{h}:" in date_str for h in range(1, 6)) else 0.0

        # 4. Micro-charge flag (card validation probe < $3.00)
        is_micro_charge = 1.0 if (0.5 <= amount <= 3.0) else 0.0

        # 5. Ratio to historical mean
        ratio_to_mean = amount / mean if mean > 0 else 1.0

        return {
            "amount": amount,
            "z_score": round(z_score, 2),
            "ratio_to_mean": round(ratio_to_mean, 2),
            "is_off_peak": is_off_peak,
            "is_micro_charge": is_micro_charge
        }
