from typing import Dict, Any, List, Tuple
from ml.feature_pipeline import FeaturePipeline

class AnomalyDetector:
    """Unsupervised anomaly detection model using multi-factor thresholding."""

    def __init__(self, z_score_threshold: float = 2.5, spike_multiplier: float = 4.0):
        self.z_score_threshold = z_score_threshold
        self.spike_multiplier = spike_multiplier

    def predict(self, tx: Dict[str, Any], history: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
        features = FeaturePipeline.extract_features(tx, history)
        flags = []
        is_anomaly = False

        # Check 1: Extreme statistical deviation
        if features["z_score"] >= self.z_score_threshold and features["amount"] > 500:
            is_anomaly = True
            flags.append(f"Z-Score outlier: transaction is {features['z_score']}σ above user baseline")

        # Check 2: Spike multiplier
        if features["ratio_to_mean"] >= self.spike_multiplier and features["amount"] > 600:
            is_anomaly = True
            flags.append(f"Sudden spending spike: amount is {features['ratio_to_mean']}x above average debit")

        # Check 3: Off-peak execution combined with moderate outlier
        if features["is_off_peak"] == 1.0 and features["amount"] > 400:
            is_anomaly = True
            flags.append("High-velocity off-peak execution window (01:00 AM - 05:00 AM)")

        # Check 4: Card testing probe
        if features["is_micro_charge"] == 1.0 and ("test" in str(tx.get("merchant", "")).lower() or "probe" in str(tx.get("title", "")).lower()):
            is_anomaly = True
            flags.append("Suspected automated carding probe micro-charge")

        return is_anomaly, flags
