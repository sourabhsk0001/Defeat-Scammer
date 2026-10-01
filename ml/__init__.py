"""
FinAccess-AI / Defeat Scammer - Machine Learning Module
Contains anomaly detection, feature engineering, risk scoring, and synthetic data pipelines.
"""
from ml.feature_pipeline import FeaturePipeline
from ml.anomaly_detector import AnomalyDetector
from ml.risk_scorer import RiskScorer

__all__ = ["FeaturePipeline", "AnomalyDetector", "RiskScorer"]
