from typing import Dict, Any, List, Tuple, Optional
from app.services.deterministic_risk_engine import deterministic_risk_engine
from app.models.schemas import Transaction, MoneyTrailData, MoneyTrailNode, MoneyTrailLink, RiskEvaluationResult

class RiskEngine:
    HIGH_RISK_KEYWORDS = [
        "crypto", "gift card", "voucher", "wire offshore", "western union", 
        "test_acc", "carding", "quick cash", "unverified transfer", "darknet", "apk"
    ]

    def analyze_transaction(self, tx: Dict[str, Any], history: List[Dict[str, Any]]) -> Tuple[int, bool, List[str]]:
        """
        Runs deterministic rule evaluation pipeline and returns (score, is_anomaly, flags).
        """
        res = deterministic_risk_engine.evaluate_transaction(tx, history)
        flags = [ind.flag for ind in res.risk_indicators]
        return res.risk_score, res.is_anomaly, flags

    def evaluate_pipeline(
        self, 
        tx: Dict[str, Any], 
        history: List[Dict[str, Any]], 
        profile_income: float = 6500.0,
        simulator_overrides: Optional[Dict[str, Any]] = None
    ) -> RiskEvaluationResult:
        """
        Executes full deterministic risk evaluation pipeline returning structured telemetry.
        """
        return deterministic_risk_engine.evaluate_transaction(
            tx, history, profile_income=profile_income, simulator_overrides=simulator_overrides
        )

    def generate_money_trail(self, victim_name: str = "Alex Morgan") -> MoneyTrailData:
        """Generates an interconnected money trail fraud graph showing mule networks and recovery points."""
        nodes = [
            MoneyTrailNode(id="n1", label=f"Victim ({victim_name})", type="victim", balance=0.0, risk_level="Protected"),
            MoneyTrailNode(id="n2", label="Mule Account #1 (Regional Bank)", type="mule_account", balance=1450.0, risk_level="CRITICAL"),
            MoneyTrailNode(id="n3", label="Mule Account #2 (Fintech Wallet)", type="mule_account", balance=1500.0, risk_level="CRITICAL"),
            MoneyTrailNode(id="n4", label="Layering Splitter (P2P Hub)", type="scammer_hub", balance=800.0, risk_level="CRITICAL"),
            MoneyTrailNode(id="n5", label="Crypto Bridge (Tether TRC-20)", type="crypto_bridge", balance=1200.0, risk_level="HIGH"),
            MoneyTrailNode(id="n6", label="ATM Cash-Out Mule (Dubai)", type="cash_out", balance=950.0, risk_level="HIGH")
        ]

        links = [
            MoneyTrailLink(source="n1", target="n2", amount=1450.0, timestamp="02:41:10", flagged=True),
            MoneyTrailLink(source="n1", target="n3", amount=1500.0, timestamp="02:41:35", flagged=True),
            MoneyTrailLink(source="n2", target="n4", amount=1400.0, timestamp="02:48:12", flagged=True),
            MoneyTrailLink(source="n3", target="n4", amount=1480.0, timestamp="02:50:00", flagged=True),
            MoneyTrailLink(source="n4", target="n5", amount=1600.0, timestamp="03:04:19", flagged=True),
            MoneyTrailLink(source="n4", target="n6", amount=950.0, timestamp="03:12:44", flagged=True)
        ]

        return MoneyTrailData(
            nodes=nodes,
            links=links,
            total_stolen_tracked=2950.00,
            recovery_probability="78% (Mule #1 and #2 Freeze Request Dispatched to Bank CIRT)",
            frozen_nodes_count=2
        )

risk_engine = RiskEngine()
