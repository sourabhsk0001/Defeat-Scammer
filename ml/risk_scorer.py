from typing import Dict, Any, List, Tuple
from ml.anomaly_detector import AnomalyDetector
from ml.feature_pipeline import FeaturePipeline

class RiskScorer:
    """Calculates composite 0-100 fraud risk score combining ML features with high-risk heuristics."""

    HIGH_RISK_BENEFICIARIES = [
        "crypto", "gift card", "voucher depot", "wire offshore", "western union", 
        "test_acc", "carding", "quick cash", "darknet", "apk"
    ]

    def __init__(self):
        self.detector = AnomalyDetector()

    def score(self, tx: Dict[str, Any], history: List[Dict[str, Any]]) -> Tuple[int, bool, List[str]]:
        features = FeaturePipeline.extract_features(tx, history)
        is_anomaly, anomaly_flags = self.detector.predict(tx, history)
        
        base_score = 5
        flags = list(anomaly_flags)
        merchant = str(tx.get("merchant", "")).lower()
        title = str(tx.get("title", "")).lower()

        # Keyword risk boost
        for kw in self.HIGH_RISK_BENEFICIARIES:
            if kw in merchant or kw in title:
                base_score += 40
                flags.append(f"High-risk beneficiary tag: '{kw}'")
                break

        # ML anomaly boost
        if is_anomaly:
            base_score += 45

        # Off-peak boost
        if features["is_off_peak"] == 1.0:
            base_score += 15

        final_score = min(99, max(5, base_score))
        return final_score, (final_score >= 60 or is_anomaly), flags

risk_scorer = RiskScorer()
