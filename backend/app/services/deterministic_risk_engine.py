import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple, Optional, Set
from app.models.schemas import (
    ValidationResult,
    RiskIndicator,
    RiskEvaluationResult,
    DeterministicRuleInfo
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. TRANSACTION VALIDATOR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TransactionValidator:
    """
    Validates transaction input payloads prior to rule engine execution.
    Enforces boundary checks, data types, and required security parameters.
    """
    ALLOWED_TYPES = {"debit", "credit"}
    ALLOWED_CHANNELS = {
        "UPI", "IMPS", "NEFT", "RTGS", "CARD", "NET_BANKING", 
        "ATM", "CRYPTO_GATEWAY", "P2P_TRANSFER", "WALLET"
    }

    @staticmethod
    def validate(tx_data: Dict[str, Any]) -> ValidationResult:
        errors: List[str] = []
        sanitized: Dict[str, Any] = {}

        # 1. Validate Amount
        amount_raw = tx_data.get("amount")
        if amount_raw is None:
            errors.append("Validation failed: Transaction 'amount' is required")
        else:
            try:
                amount = float(amount_raw)
                if math.isnan(amount) or math.isinf(amount):
                    errors.append("Validation failed: Amount must be a finite numerical value")
                elif amount <= 0:
                    errors.append(f"Validation failed: Amount must be strictly greater than 0 (received: {amount})")
                else:
                    sanitized["amount"] = round(amount, 2)
            except (ValueError, TypeError):
                errors.append(f"Validation failed: Invalid amount format '{amount_raw}'")

        # 2. Validate Recipient / Beneficiary
        recipient = str(tx_data.get("recipient") or tx_data.get("merchant") or "").strip()
        if not recipient:
            errors.append("Validation failed: 'recipient' (or 'merchant') identifier is required and cannot be empty")
        elif len(recipient) < 2:
            errors.append("Validation failed: Recipient name is too short (< 2 characters)")
        else:
            sanitized["recipient"] = recipient

        # 3. Validate Transaction Type
        tx_type = str(tx_data.get("type", "debit")).lower().strip()
        if tx_type not in TransactionValidator.ALLOWED_TYPES:
            errors.append(f"Validation failed: Invalid transaction type '{tx_type}'. Must be 'debit' or 'credit'")
        else:
            sanitized["type"] = tx_type

        # 4. Validate Channel
        channel = str(tx_data.get("channel", "UPI")).upper().strip()
        if channel not in TransactionValidator.ALLOWED_CHANNELS:
            # Allow fallback with warning
            sanitized["channel"] = "UPI"
        else:
            sanitized["channel"] = channel

        # 5. Validate / Normalize Timestamp
        raw_time = tx_data.get("timestamp") or tx_data.get("date")
        if raw_time:
            try:
                # Accept multiple standard formats
                if isinstance(raw_time, datetime):
                    sanitized["timestamp"] = raw_time
                else:
                    cleaned_str = str(raw_time).strip()
                    # Try ISO or standard datetime formats
                    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S"):
                        try:
                            sanitized["timestamp"] = datetime.strptime(cleaned_str, fmt)
                            break
                        except ValueError:
                            continue
                    if "timestamp" not in sanitized:
                        sanitized["timestamp"] = datetime.now()
            except Exception:
                sanitized["timestamp"] = datetime.now()
        else:
            sanitized["timestamp"] = datetime.now()

        sanitized["title"] = str(tx_data.get("title") or f"Transfer to {sanitized.get('recipient', 'Unknown')}").strip()
        sanitized["category"] = str(tx_data.get("category", "Transfers")).strip()
        sanitized["location"] = str(tx_data.get("location", "Online / Domestic")).strip()

        return ValidationResult(
            is_valid=(len(errors) == 0),
            errors=errors,
            sanitized_fields={
                k: v.isoformat() if isinstance(v, datetime) else v 
                for k, v in sanitized.items()
            }
        )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. DETERMINISTIC RULES REGISTRY & IMPLEMENTATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DeterministicRiskEngine:
    """
    Deterministic Fraud & Risk Engine.
    Executes a sequential rule evaluation pipeline:
    Transaction -> Validation -> Rules -> Risk Indicators -> Risk Score
    """

    HIGH_RISK_KEYWORDS = [
        "crypto", "gift card", "voucher", "wire offshore", "western union", 
        "test_acc", "carding", "quick cash", "unverified transfer", "darknet", 
        "apk", "digital arrest", "customs fee", "escrow fast", "police bond",
        "lottery claim", "binance", "tether", "telegram bot", "remote access"
    ]

    CARDING_PROBE_WORDS = [
        "test", "probe", "auth", "ping", "verification", "check", "temp", "val"
    ]

    def __init__(self):
        self.rules_registry = self._init_rules_registry()

    def _init_rules_registry(self) -> List[DeterministicRuleInfo]:
        """Provides metadata for all registered deterministic rules."""
        return [
            DeterministicRuleInfo(
                rule_id="RULE_UNUSUAL_AMOUNT",
                name="Unusually High Amount Spike",
                category="AMOUNT_ANOMALY",
                severity="HIGH",
                weight=40,
                formula="if amount > normal_amount * 5 -> flag('Unusually high amount')",
                description="Flags transactions where the amount is 5x or more above historical normal baseline."
            ),
            DeterministicRuleInfo(
                rule_id="RULE_NEW_RECIPIENT",
                name="New Recipient Verification",
                category="BENEFICIARY_RISK",
                severity="MEDIUM",
                weight=25,
                formula="if new_recipient -> flag('New recipient')",
                description="Flags transactions targeted at a beneficiary never previously encountered in user history."
            ),
            DeterministicRuleInfo(
                rule_id="RULE_RAPID_TRANSACTIONS",
                name="Rapid Transaction Burst Velocity",
                category="VELOCITY_ANOMALY",
                severity="HIGH",
                weight=35,
                formula="if many_transactions_in_short_period -> flag('Rapid transactions')",
                description="Flags automated bursts (3+ transfers within 10 minutes or 5+ in 1 hour)."
            ),
            DeterministicRuleInfo(
                rule_id="RULE_OFF_HOURS",
                name="Off-Hours Execution Window",
                category="TEMPORAL_RISK",
                severity="LOW",
                weight=15,
                formula="if 01:00 <= hour <= 05:00 -> flag('Off-hours transaction')",
                description="Flags transfers initiated during late-night off-peak hours (1:00 AM - 5:00 AM)."
            ),
            DeterministicRuleInfo(
                rule_id="RULE_MICRO_CARDING_PROBE",
                name="Micro-Charge Carding Probe",
                category="PATTERN_ATTACK",
                severity="HIGH",
                weight=45,
                formula="if 0.5 <= amount <= 3.0 and probe_keyword -> flag('Micro-charge probe')",
                description="Detects micro-charge probe patterns used by carders to validate compromised credentials."
            ),
            DeterministicRuleInfo(
                rule_id="RULE_HIGH_RISK_BENEFICIARY",
                name="High-Risk Beneficiary & Scam Keywords",
                category="THREAT_INTELLIGENCE",
                severity="CRITICAL",
                weight=45,
                formula="if recipient/memo in blacklist_keywords -> flag('High-risk beneficiary')",
                description="Detects mule accounts, crypto bridges, offshore wires, and social engineering pretext keywords."
            ),
            DeterministicRuleInfo(
                rule_id="RULE_ACCOUNT_DRAIN",
                name="Account Liquidation / Drain Attempt",
                category="BALANCE_DRAIN",
                severity="CRITICAL",
                weight=40,
                formula="if amount > monthly_income * 0.8 -> flag('Potential account drain')",
                description="Flags single outbound debits liquidating more than 80% of regular monthly surplus."
            ),
            DeterministicRuleInfo(
                rule_id="RULE_TRIAD_COMPOUND",
                name="Compound Triad Fraud Signature",
                category="COMPOUND_SYNERGY",
                severity="CRITICAL",
                weight=25,
                formula="if new_recipient AND amount > normal * 5 AND rapid_transactions -> flag('Triad signature')",
                description="Compound synergy rule triggering when all 3 prime scam indicators coincide simultaneously."
            ),
        ]

    def get_registered_rules(self) -> List[DeterministicRuleInfo]:
        return self.rules_registry

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. HISTORICAL BASELINE & CONTEXT EXTRACTION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def compute_user_context(
        self, 
        history: List[Dict[str, Any]], 
        profile_income: float = 6500.0
    ) -> Dict[str, Any]:
        """
        Calculates baseline normal amount, known recipients set, and velocity windows.
        """
        # Baseline normal amount calculated from valid past debit transactions
        past_debits = [
            float(t.get("amount", 0)) for t in history 
            if str(t.get("type", "debit")).lower() == "debit" and float(t.get("amount", 0)) > 0
        ]

        if past_debits:
            normal_amount = sum(past_debits) / len(past_debits)
        else:
            # Fallback to daily normal expenditure estimate (monthly income / 30)
            normal_amount = max(50.0, profile_income / 30.0)

        # Build set of historically known recipients
        known_recipients: Set[str] = set()
        for t in history:
            rec = str(t.get("merchant") or t.get("recipient") or "").strip().lower()
            if rec:
                known_recipients.add(rec)
            # Also add words from title
            title_name = str(t.get("title", "")).strip().lower()
            if title_name:
                known_recipients.add(title_name)

        return {
            "normal_amount": round(normal_amount, 2),
            "known_recipients": known_recipients,
            "monthly_income": profile_income,
            "total_past_debits": len(past_debits)
        }

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 4. DETERMINISTIC PIPELINE EVALUATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    def evaluate_transaction(
        self,
        tx_data: Dict[str, Any],
        history: List[Dict[str, Any]],
        profile_income: float = 6500.0,
        simulator_overrides: Optional[Dict[str, Any]] = None
    ) -> RiskEvaluationResult:
        """
        Full Pipeline:
        Transaction -> Validation -> Rules -> Risk Indicators -> Risk Score
        """
        tx_id = str(tx_data.get("id") or f"eval_{int(datetime.now().timestamp())}")

        # Step 1: Validation
        validation = TransactionValidator.validate(tx_data)
        if not validation.is_valid:
            # Short-circuit on critical validation errors
            return RiskEvaluationResult(
                transaction_id=tx_id,
                validation=validation,
                rules_evaluated_count=0,
                risk_indicators=[
                    RiskIndicator(
                        rule_id="RULE_VALIDATION_FAILURE",
                        flag="Invalid transaction payload",
                        description="; ".join(validation.errors),
                        severity="CRITICAL",
                        score_contribution=100,
                        category="INPUT_VALIDATION"
                    )
                ],
                risk_score=100,
                risk_level="CRITICAL",
                decision="BLOCK",
                is_anomaly=True,
                recommendations=["Fix validation errors before submitting transaction to banking gateway."],
                telemetry={"validation_errors": validation.errors}
            )

        sanitized = validation.sanitized_fields
        amount = float(sanitized["amount"])
        recipient = str(sanitized["recipient"]).strip()
        recipient_lower = recipient.lower()
        title = str(sanitized.get("title", "")).lower()
        channel = str(sanitized.get("channel", "UPI"))

        # Parse timestamp
        timestamp_str = sanitized.get("timestamp", "")
        try:
            tx_time = datetime.fromisoformat(timestamp_str) if timestamp_str else datetime.now()
        except Exception:
            tx_time = datetime.now()

        # Step 2: Extract Context
        context = self.compute_user_context(history, profile_income)
        normal_amount = context["normal_amount"]
        known_recipients = context["known_recipients"]

        # Simulator overrides if testing
        overrides = simulator_overrides or {}
        if "normal_amount" in overrides:
            normal_amount = float(overrides["normal_amount"])

        risk_indicators: List[RiskIndicator] = []
        rules_evaluated_count = len(self.rules_registry)

        flagged_rules = set()

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # RULE 1: Unusually High Amount Spike
        # if amount > normal_amount * 5: flag("Unusually high amount")
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        amount_multiplier = amount / normal_amount if normal_amount > 0 else 1.0

        if amount > (normal_amount * 5):
            flagged_rules.add("RULE_UNUSUAL_AMOUNT")
            is_extreme = amount > (normal_amount * 10)
            severity = "CRITICAL" if is_extreme else "HIGH"
            score_contrib = 50 if is_extreme else 40

            risk_indicators.append(RiskIndicator(
                rule_id="RULE_UNUSUAL_AMOUNT",
                flag="Unusually high amount",
                description=(
                    f"Transaction amount ({amount:,.2f}) exceeds 5x user normal baseline ({normal_amount:,.2f}) "
                    f"by a factor of {amount_multiplier:.1f}x."
                ),
                severity=severity,
                score_contribution=score_contrib,
                category="AMOUNT_ANOMALY",
                metadata={
                    "amount": amount,
                    "normal_amount": normal_amount,
                    "multiplier": round(amount_multiplier, 2)
                }
            ))
        elif amount > (normal_amount * 3):
            # Moderate threshold check
            risk_indicators.append(RiskIndicator(
                rule_id="RULE_UNUSUAL_AMOUNT_MODERATE",
                flag="Moderately elevated amount",
                description=(
                    f"Transaction amount ({amount:,.2f}) is {amount_multiplier:.1f}x higher than average baseline."
                ),
                severity="MEDIUM",
                score_contribution=20,
                category="AMOUNT_ANOMALY",
                metadata={"amount": amount, "normal_amount": normal_amount, "multiplier": round(amount_multiplier, 2)}
            ))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # RULE 2: New Recipient Check
        # if new_recipient: flag("New recipient")
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        force_new = overrides.get("force_new_recipient")
        is_new_recipient = (force_new is True) or (
            force_new is not False and (recipient_lower not in known_recipients)
        )

        if is_new_recipient:
            flagged_rules.add("RULE_NEW_RECIPIENT")
            # Elevate severity if amount is also high
            severity = "HIGH" if amount > (normal_amount * 2) else "MEDIUM"
            score_contrib = 30 if severity == "HIGH" else 25

            risk_indicators.append(RiskIndicator(
                rule_id="RULE_NEW_RECIPIENT",
                flag="New recipient",
                description=(
                    f"Beneficiary '{recipient}' is a first-time payee with zero prior ledger interactions."
                ),
                severity=severity,
                score_contribution=score_contrib,
                category="BENEFICIARY_RISK",
                metadata={
                    "recipient": recipient,
                    "is_first_interaction": True,
                    "total_known_recipients": len(known_recipients)
                }
            ))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # RULE 3: Rapid Transactions Burst Velocity
        # if many_transactions_in_short_period: flag("Rapid transactions")
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        burst_override = overrides.get("burst_count_override")
        if burst_override is not None:
            recent_burst_count = int(burst_override)
        else:
            # Count transactions executed within the last 10 minutes
            recent_burst_count = 0
            ten_minutes_ago = tx_time - timedelta(minutes=10)
            for past_tx in history[:15]:
                p_date_str = past_tx.get("date") or past_tx.get("timestamp")
                if p_date_str:
                    try:
                        p_time = None
                        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S"):
                            try:
                                p_time = datetime.strptime(str(p_date_str), fmt)
                                break
                            except ValueError:
                                continue
                        if p_time and (ten_minutes_ago <= p_time <= tx_time):
                            recent_burst_count += 1
                    except Exception:
                        continue

        if recent_burst_count >= 3:
            flagged_rules.add("RULE_RAPID_TRANSACTIONS")
            is_critical_burst = recent_burst_count >= 5
            severity = "CRITICAL" if is_critical_burst else "HIGH"
            score_contrib = 45 if is_critical_burst else 35

            risk_indicators.append(RiskIndicator(
                rule_id="RULE_RAPID_TRANSACTIONS",
                flag="Rapid transactions",
                description=(
                    f"Velocity spike detected: {recent_burst_count} outbound transfers initiated in under 10 minutes."
                ),
                severity=severity,
                score_contribution=score_contrib,
                category="VELOCITY_ANOMALY",
                metadata={
                    "burst_count": recent_burst_count,
                    "window_minutes": 10
                }
            ))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # RULE 4: Off-Hours Late Night Window (01:00 AM - 05:00 AM)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if 1 <= tx_time.hour < 5:
            flagged_rules.add("RULE_OFF_HOURS")
            risk_indicators.append(RiskIndicator(
                rule_id="RULE_OFF_HOURS",
                flag="Off-hours transaction",
                description=(
                    f"Transfer initiated at {tx_time.strftime('%I:%M %p')} during dormant hours (01:00 AM - 05:00 AM)."
                ),
                severity="LOW",
                score_contribution=15,
                category="TEMPORAL_RISK",
                metadata={"hour": tx_time.hour, "time_formatted": tx_time.strftime("%H:%M")}
            ))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # RULE 5: Micro-Charge Carding Probe
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        is_micro_range = (0.5 <= amount <= 3.0) or (10.0 <= amount <= 150.0 and amount < (normal_amount * 0.05))
        has_probe_kw = any(w in recipient_lower or w in title for w in self.CARDING_PROBE_WORDS)

        if is_micro_range and (has_probe_kw or ("probe" in title or "test" in recipient_lower)):
            flagged_rules.add("RULE_MICRO_CARDING_PROBE")
            risk_indicators.append(RiskIndicator(
                rule_id="RULE_MICRO_CARDING_PROBE",
                flag="Micro-charge validation probe",
                description=(
                    f"Micro-charge of {amount:,.2f} matches automated carding authorization probes."
                ),
                severity="HIGH",
                score_contribution=45,
                category="PATTERN_ATTACK",
                metadata={"amount": amount, "matched_pattern": "carding_probe"}
            ))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # RULE 6: High-Risk Beneficiary & Scam Keywords
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        matched_keywords = [
            kw for kw in self.HIGH_RISK_KEYWORDS 
            if kw in recipient_lower or kw in title
        ]
        if matched_keywords:
            flagged_rules.add("RULE_HIGH_RISK_BENEFICIARY")
            risk_indicators.append(RiskIndicator(
                rule_id="RULE_HIGH_RISK_BENEFICIARY",
                flag="High-risk beneficiary or keyword match",
                description=(
                    f"Beneficiary or memo references blacklisted fraud vector(s): '{', '.join(matched_keywords)}'."
                ),
                severity="CRITICAL",
                score_contribution=45,
                category="THREAT_INTELLIGENCE",
                metadata={"matched_keywords": matched_keywords}
            ))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # RULE 7: Account Drain / Surplus Wipeout
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if profile_income > 0 and amount >= (profile_income * 0.8):
            flagged_rules.add("RULE_ACCOUNT_DRAIN")
            risk_indicators.append(RiskIndicator(
                rule_id="RULE_ACCOUNT_DRAIN",
                flag="Potential account drain attempt",
                description=(
                    f"Outbound transfer ({amount:,.2f}) depletes {(amount / profile_income) * 100:.1f}% "
                    f"of total regular monthly cash reserve."
                ),
                severity="CRITICAL",
                score_contribution=40,
                category="BALANCE_DRAIN",
                metadata={
                    "amount": amount,
                    "monthly_income": profile_income,
                    "drain_ratio": round(amount / profile_income, 2)
                }
            ))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # RULE 8: Triad Scam Signature (Compound Synergy)
        # if new_recipient AND amount > normal * 5 AND rapid_transactions:
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        has_new_recip = "RULE_NEW_RECIPIENT" in flagged_rules
        has_unusual_amt = "RULE_UNUSUAL_AMOUNT" in flagged_rules
        has_rapid_tx = "RULE_RAPID_TRANSACTIONS" in flagged_rules

        if has_new_recip and has_unusual_amt and has_rapid_tx:
            risk_indicators.append(RiskIndicator(
                rule_id="RULE_TRIAD_COMPOUND",
                flag="Triad scam signature (New Recipient + 5x Spike + Rapid Bursts)",
                description=(
                    "CRITICAL SOCIAL ENGINEERING SIGNATURE: First-time recipient combined with a 5x spike "
                    "and rapid succession velocity. Strongly indicative of active Digital Arrest or duress coercion."
                ),
                severity="CRITICAL",
                score_contribution=25,
                category="COMPOUND_SYNERGY",
                metadata={"triad_signature_active": True}
            ))

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 4 & 5: CALCULATE RISK SCORE & DECISION
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        base_score = 5
        score_sum = base_score + sum(ind.score_contribution for ind in risk_indicators)
        final_score = min(99, max(5, score_sum))

        # Determine Risk Level & Automated Decision
        if final_score < 30:
            risk_level = "LOW"
            decision = "APPROVE"
            is_anomaly = False
        elif final_score < 60:
            risk_level = "MODERATE"
            decision = "FLAG_REVIEW"
            is_anomaly = False
        elif final_score < 85:
            risk_level = "HIGH"
            decision = "STEP_UP_AUTH"
            is_anomaly = True
        else:
            risk_level = "CRITICAL"
            decision = "BLOCK"
            is_anomaly = True

        # Generate Actionable Security Recommendations
        recommendations = self._generate_recommendations(risk_indicators, final_score)

        return RiskEvaluationResult(
            transaction_id=tx_id,
            validation=validation,
            rules_evaluated_count=rules_evaluated_count,
            risk_indicators=risk_indicators,
            risk_score=final_score,
            risk_level=risk_level,
            decision=decision,
            is_anomaly=is_anomaly,
            recommendations=recommendations,
            telemetry={
                "normal_amount": normal_amount,
                "amount": amount,
                "amount_multiplier": round(amount_multiplier, 2),
                "is_new_recipient": is_new_recipient,
                "burst_count": recent_burst_count,
                "channel": channel,
                "execution_hour": tx_time.hour
            }
        )

    def _generate_recommendations(self, indicators: List[RiskIndicator], score: int) -> List[str]:
        recs = []
        rule_ids = {ind.rule_id for ind in indicators}

        if "RULE_TRIAD_COMPOUND" in rule_ids or score >= 85:
            recs.append("CRITICAL: Immediately halt transaction. Contact your bank fraud division or dial 1930.")
            recs.append("NEVER share OTP, UPI PIN, or remote screen sharing access (AnyDesk/TeamViewer).")

        if "RULE_NEW_RECIPIENT" in rule_ids:
            recs.append("Verify recipient account details with the recipient over an independent, trusted voice call.")

        if "RULE_UNUSUAL_AMOUNT" in rule_ids:
            recs.append("Step-up authentication required: Verify transfer with registered biometric token or hardware 2FA.")

        if "RULE_RAPID_TRANSACTIONS" in rule_ids:
            recs.append("Enforce 30-minute velocity cooling-off pause before allowing successive transfers.")

        if "RULE_MICRO_CARDING_PROBE" in rule_ids:
            recs.append("Temporarily freeze card international/online e-commerce limits via your bank app.")

        if not recs:
            recs.append("Transaction verified under safe operational parameters. No threat indicators detected.")

        return recs


# Global singleton instance
deterministic_risk_engine = DeterministicRiskEngine()
