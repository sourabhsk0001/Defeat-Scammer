from typing import Dict, Any, List, Tuple, Optional
import numpy as np
from sklearn.ensemble import IsolationForest
from ml.feature_pipeline import FeaturePipeline
from ml.synthetic_data_generator import generate_synthetic_transactions

class AnomalyDetector:
    """
    Phase 8 ML Anomaly Detector using Scikit-Learn Isolation Forest.
    Evaluates multidimensional isolation trees across the 6 canonical features:
    - transaction_amount
    - transaction_frequency
    - time_of_day
    - recipient_frequency
    - amount_deviation
    - daily_transaction_count
    """

    def __init__(
        self, 
        n_estimators: int = 100, 
        contamination: float = 0.08, 
        random_state: int = 42
    ):
        self.n_estimators = n_estimators
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            random_state=self.random_state,
            max_samples="auto"
        )
        self.is_fitted = False
        self.training_samples_count = 0
        self._warmup_baseline()

    def _warmup_baseline(self):
        """
        Initializes and fits Isolation Forest on a calibrated synthetic banking baseline
        so the model is immediately capable of scoring streaming transactions accurately.
        """
        synthetic_ledger = generate_synthetic_transactions(n_samples=180, fraud_ratio=0.08)
        history_buffer = []
        vectors = []

        for tx in synthetic_ledger:
            feats = FeaturePipeline.extract_features(tx, history_buffer)
            vectors.append(FeaturePipeline.to_vector(feats)[0])
            history_buffer.append(tx)

        X = np.array(vectors, dtype=np.float64)
        self.fit(X)

    def fit(self, X: np.ndarray):
        """Fits or retrains the Isolation Forest model on feature matrix X (N, 6)."""
        self.model.fit(X)
        self.is_fitted = True
        self.training_samples_count = len(X)

    def retrain_from_ledger(self, ledger: List[Dict[str, Any]]):
        """Retrains Isolation Forest incorporating real user transaction history."""
        if not ledger:
            return
        vectors = []
        running_history = []
        for tx in ledger:
            feats = FeaturePipeline.extract_features(tx, running_history)
            vectors.append(FeaturePipeline.to_vector(feats)[0])
            running_history.append(tx)

        # Supplement with baseline if ledger is small (< 50)
        if len(vectors) < 50:
            synthetic_ledger = generate_synthetic_transactions(n_samples=100, fraud_ratio=0.06)
            for tx in synthetic_ledger:
                feats = FeaturePipeline.extract_features(tx, running_history)
                vectors.append(FeaturePipeline.to_vector(feats)[0])

        X = np.array(vectors, dtype=np.float64)
        self.fit(X)

    def predict(
        self, 
        tx: Dict[str, Any], 
        history: List[Dict[str, Any]]
    ) -> Tuple[bool, List[str], Dict[str, float], int]:
        """
        Runs Scikit-Learn Isolation Forest on input transaction.
        Returns:
            is_anomaly: bool
            flags: List[str] (feature explanations)
            features: Dict[str, float] (the 6 engineered features)
            anomaly_score: int (0 to 100 percentage score)
        """
        # 1. Feature Engineering (extract exactly the 6 required features)
        features = FeaturePipeline.extract_features(tx, history)
        X = FeaturePipeline.to_vector(features)

        # 2. Scikit-learn Isolation Forest Prediction & Decision Function
        # decision_function: lower values indicate more anomalous / outlier status.
        # Negative values are outliers in scikit-learn.
        raw_score = float(self.model.decision_function(X)[0])
        pred = int(self.model.predict(X)[0])  # -1 = anomaly, 1 = normal

        # 3. Normalize raw_score to intuitive 0-100 Anomaly Score
        # Linear & sigmoid scaling where raw_score 0.15 -> ~10%, 0.0 -> ~55%, -0.15 -> ~90%
        # formula: clip(50 - (raw_score / 0.25) * 50, 5, 99)
        scaled_score = 50.0 - (raw_score / 0.28) * 50.0
        anomaly_score = int(round(np.clip(scaled_score, 5.0, 99.0)))

        is_anomaly = (pred == -1) or (anomaly_score >= 60)

        # 4. Generate Explanations / Attributions for why it's anomalous
        flags = []
        if features["amount_deviation"] >= 3.0:
            flags.append(f"Amount deviation (+{features['amount_deviation']} std-dev above mean)")
        elif features["amount_deviation"] >= 2.0:
            flags.append(f"Elevated amount (+{features['amount_deviation']} std-dev above mean)")

        if features["transaction_frequency"] >= 3.0:
            flags.append(f"High transaction frequency ({int(features['transaction_frequency'])} transfers in rolling window)")

        if 1.0 <= features["time_of_day"] <= 5.0:
            flags.append(f"Dormant hour anomaly (executed at {int(features['time_of_day'])}:00 off-peak)")

        if features["recipient_frequency"] == 0.0:
            flags.append("New beneficiary with zero historical recipient frequency")

        if features["daily_transaction_count"] >= 5.0:
            flags.append(f"Daily transaction velocity surge ({int(features['daily_transaction_count'])} transfers today)")

        if is_anomaly and not flags:
            flags.append(f"Isolation Forest multi-factor outlier (Raw path score: {raw_score:.3f})")

        return is_anomaly, flags, features, anomaly_score

# Singleton ML Detector
ml_anomaly_detector = AnomalyDetector()
