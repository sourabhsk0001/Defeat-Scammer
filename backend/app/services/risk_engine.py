import math
from typing import List, Dict, Any, Tuple
from app.models.schemas import Transaction, MoneyTrailData, MoneyTrailNode, MoneyTrailLink

class RiskEngine:
    HIGH_RISK_KEYWORDS = [
        "crypto", "gift card", "voucher", "wire offshore", "western union", 
        "test_acc", "carding", "quick cash", "unverified transfer", "darknet", "apk"
    ]

    def analyze_transaction(self, tx: Dict[str, Any], history: List[Dict[str, Any]]) -> Tuple[int, bool, List[str]]:
        """
        Anomaly Detection & Risk Scoring Algorithm:
        - Evaluates amount deviations (statistical z-score heuristic)
        - Off-peak time check (midnight to 5 AM)
        - High-risk merchant patterns
        - Micro-transaction probe patterns (< $2 test charges)
        """
        risk_score = 5
        risk_flags = []
        is_anomaly = False

        amount = float(tx.get("amount", 0))
        merchant = str(tx.get("merchant", "")).lower()
        title = str(tx.get("title", "")).lower()
        date_str = str(tx.get("date", ""))

        # 1. Check merchant / title keywords
        for kw in self.HIGH_RISK_KEYWORDS:
            if kw in merchant or kw in title:
                risk_score += 35
                risk_flags.append(f"High-risk beneficiary or keyword match: '{kw}'")

        # 2. Check micro-charge probe (carding attack)
        if 0.5 <= amount <= 3.0 and ("test" in merchant or "verification" in title.lower()):
            risk_score += 45
            risk_flags.append("Suspected micro-charge card validation probe (Carding behavior)")

        # 3. Statistical deviation from baseline history
        past_amounts = [float(t.get("amount", 0)) for t in history if t.get("type") == "debit" and float(t.get("amount", 0)) > 0]
        if past_amounts:
            mean = sum(past_amounts) / len(past_amounts)
            variance = sum((x - mean) ** 2 for x in past_amounts) / max(1, len(past_amounts))
            std_dev = math.sqrt(variance)

            if std_dev > 0:
                z_score = (amount - mean) / std_dev
                if z_score > 2.5 and amount > 500:
                    risk_score += 30
                    risk_flags.append(f"Statistical Anomaly: Amount (${amount:.2f}) is {z_score:.1f} standard deviations above historical mean (${mean:.2f})")
            elif amount > (mean * 4) and amount > 500:
                risk_score += 30
                risk_flags.append(f"Sudden spike: Amount is 4x greater than regular transaction baseline")

        # 4. Off-peak execution check (between 01:00 and 05:00)
        if any(f"0{hour}:" in date_str or f" 0{hour}:" in date_str for hour in range(1, 6)):
            risk_score += 15
            risk_flags.append("High-velocity off-peak execution timestamp (1:00 AM - 5:00 AM)")

        # Cap score
        risk_score = min(99, max(1, risk_score))
        if risk_score >= 60:
            is_anomaly = True

        return risk_score, is_anomaly, risk_flags

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
