import re
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional, Tuple
from app.models.schemas import ScamShieldScanRequest, ScamShieldScanResult
from app.services.url_analyzer import url_analyzer
from app.services.rag_service import rag_service

class ScamShieldEngine:
    """
    Phase 9 — Scam Shield Engine.
    Executes the 6-step unified detection flow across SMS, WhatsApp, Email, URL, and Payment messages:
    User Input ➔ Text Extraction ➔ URL Extraction ➔ Pattern Detection ➔ AI Analysis ➔ Risk Engine ➔ Explanation
    """

    # 1. Urgent language patterns
    URGENT_KEYWORDS = [
        "urgent", "immediately", "within 24 hours", "within 10 minutes", "within 2 hours",
        "tonight", "9:30 pm", "last warning", "final notice", "expire", "expires today",
        "action required", "act fast", "without delay", "promptly", "asap", "deadline",
        "suspended tonight", "cut off tonight", "emergency"
    ]

    # 2. Sensitive information request patterns
    SENSITIVE_INFO_KEYWORDS = [
        "otp", "one time password", "pin", "upi pin", "enter pin", "enter your pin",
        "password", "cvv", "card details", "card number", "expiry date", "aadhaar", 
        "pan card", "pan update", "bank details", "credentials", "seed phrase", 
        "private key", "login credentials", "verify identity", "share otp", "send pin"
    ]

    # 3. Account threat & coercion patterns
    ACCOUNT_THREAT_KEYWORDS = [
        "account blocked", "account suspended", "deactivated", "sim blocked", "sim deactivated",
        "digital arrest", "police", "cyber crime", "cbi", "customs", "warrant", "arrest warrant",
        "court notice", "narcotics", "contraband", "passport confiscated", "legal action",
        "electricity disconnected", "power cutoff", "unpaid bill", "service terminated",
        "bank account freeze", "kyc expired", "kyc suspended", "stay on this call"
    ]

    # 4. Financial & Reward baiting patterns
    REWARD_BAITING_KEYWORDS = [
        "won lottery", "prize winner", "congratulations", "selected winner", "claim reward",
        "earn $", "earn ₹", "daily salary", "part time job", "youtube like", "hotel review",
        "rating task", "claim refund", "receive money", "qr code", "enter pin to receive"
    ]

    # Obfuscation replacement dictionary
    OBFUSCATION_MAP = {
        r"0\s*t\s*p": "otp",
        r"p\s*i\s*n": "pin",
        r"u\s*p\s*i": "upi",
        r"c\s*v\s*v": "cvv",
        r"p\s*a\s*s\s*s\s*w\s*o\s*r\s*d": "password",
        r"c\s*l\s*i\s*c\s*k": "click",
        r"b\s*l\s*o\s*c\s*k": "block",
        r"u\s*r\s*g\s*e\s*n\s*t": "urgent"
    }

    # URL extraction regex
    URL_REGEX = re.compile(
        r"(https?://[^\s<>\"'()]+|www\.[^\s<>\"'()]+|[a-zA-Z0-9-]+\.(?:xyz|top|buzz|cam|click|work|link|zip|icu|rest|monster|tk|ml|gq|cf)[^\s<>\"'()]*)",
        re.IGNORECASE
    )

    def scan(self, req: ScamShieldScanRequest) -> ScamShieldScanResult:
        """
        Full 6-Step Pipeline Execution:
        User Input ➔ Text Extraction ➔ URL Extraction ➔ Pattern Detection ➔ AI Analysis ➔ Risk Engine ➔ Explanation
        """
        raw_content = req.content or ""
        input_type = (req.input_type or "sms").lower().strip()
        sender_info = str(req.sender_info or "").strip()

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 1 & 2: TEXT EXTRACTION & NORMALIZATION
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        clean_text = self._extract_and_clean_text(raw_content)
        normalized_for_scan = self._normalize_obfuscations(clean_text.lower())

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 3: URL EXTRACTION & DEEP LINK INSPECTION
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        extracted_urls, has_suspicious_url = self._extract_and_inspect_urls(clean_text, input_type)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 4: PATTERN DETECTION
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        detected_indicators: List[str] = []
        pattern_scores = 0

        # Indicator A: Urgent language
        has_urgent_lang = any(kw in normalized_for_scan for kw in self.URGENT_KEYWORDS)
        if has_urgent_lang:
            detected_indicators.append("Urgent language")
            pattern_scores += 25

        # Indicator B: Requests sensitive information
        has_sensitive_req = any(kw in normalized_for_scan for kw in self.SENSITIVE_INFO_KEYWORDS)
        if has_sensitive_req:
            detected_indicators.append("Requests sensitive information")
            pattern_scores += 35

        # Indicator C: Suspicious URL
        if has_suspicious_url or (input_type == "url" and len(extracted_urls) > 0 and extracted_urls[0].get("risk_score", 0) >= 40):
            detected_indicators.append("Suspicious URL")
            pattern_scores += 35
        elif len(extracted_urls) > 0 and any("bit.ly" in u.get("url", "") or "tinyurl" in u.get("url", "") for u in extracted_urls):
            detected_indicators.append("Suspicious URL")
            pattern_scores += 25

        # Indicator D: Account-threat language
        has_account_threat = any(kw in normalized_for_scan for kw in self.ACCOUNT_THREAT_KEYWORDS)
        if has_account_threat:
            detected_indicators.append("Account-threat language")
            pattern_scores += 35

        # Supplementary Indicator: Reward / Financial baiting
        has_reward_bait = any(kw in normalized_for_scan for kw in self.REWARD_BAITING_KEYWORDS)
        if has_reward_bait:
            if "enter pin to receive" in normalized_for_scan or "qr code" in normalized_for_scan:
                if "Requests sensitive information" not in detected_indicators:
                    detected_indicators.append("Requests sensitive information")
                pattern_scores += 30

        # Channel specific heuristics
        if sender_info:
            sender_lower = sender_info.lower()
            if any(p in sender_lower for p in ["+92", "+880", "+234", "+254"]) and input_type in ["whatsapp", "sms"]:
                pattern_scores += 20
                if "International spoofed sender" not in detected_indicators:
                    detected_indicators.append("International sender pretending to be domestic authority")

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 5: AI ANALYSIS & PSYCHOLOGICAL PROFILING
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        scam_category, psych_triggers, ai_score_boost = self._run_ai_analysis(
            normalized_for_scan, clean_text, input_type, detected_indicators
        )

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 6: RISK ENGINE (MULTI-VECTOR SCORING)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        base_score = 5
        composite_score = base_score + pattern_scores + ai_score_boost

        # Cap and classify
        risk_score = min(99, max(5, composite_score))

        if risk_score >= 85:
            risk_level = "CRITICAL"
            verdict_banner = "🚨 Critical Scam Threat"
            is_scam = True
        elif risk_score >= 60:
            risk_level = "HIGH"
            verdict_banner = "⚠️ Potential Scam"
            is_scam = True
        elif risk_score >= 35:
            risk_level = "MODERATE"
            verdict_banner = "⚠️ Suspicious Activity Detected"
            is_scam = True
        else:
            risk_level = "LOW"
            verdict_banner = "✓ Verified Low Risk"
            is_scam = False

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 7: EXPLANATION & RECOMMENDED ACTIONS
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        recommended_actions = self._generate_recommended_actions(
            detected_indicators, risk_level, has_suspicious_url, has_sensitive_req
        )

        pipeline_trace = {
            "step_1_user_input": {
                "input_type": input_type,
                "character_count": len(raw_content),
                "sender_info": sender_info or "Unknown"
            },
            "step_2_text_extraction": {
                "clean_length": len(clean_text),
                "normalized_words_count": len(normalized_for_scan.split())
            },
            "step_3_url_extraction": {
                "urls_found_count": len(extracted_urls),
                "has_suspicious_url": has_suspicious_url
            },
            "step_4_pattern_detection": {
                "indicators_fired_count": len(detected_indicators),
                "raw_pattern_points": pattern_scores
            },
            "step_5_ai_analysis": {
                "scam_category": scam_category,
                "psychological_triggers_count": len(psych_triggers),
                "ai_boost": ai_score_boost
            },
            "step_6_risk_engine": {
                "final_score": risk_score,
                "risk_level": risk_level
            }
        }

        return ScamShieldScanResult(
            verdict_banner=verdict_banner,
            risk_level=risk_level,
            risk_score=risk_score,
            indicators=detected_indicators if detected_indicators else ["No anomaly indicators detected"],
            recommended_actions=recommended_actions,
            scam_category=scam_category,
            input_type=input_type.upper(),
            extracted_text_clean=clean_text[:400] + ("..." if len(clean_text) > 400 else ""),
            extracted_urls=extracted_urls,
            psychological_triggers=psych_triggers,
            pipeline_trace=pipeline_trace,
            reporting_advice="Report cyber fraud immediately to National Helpline 1930 or file complaint at cybercrime.gov.in.",
            is_scam=is_scam
        )

    def _extract_and_clean_text(self, text: str) -> str:
        """Strips zero-width characters, unescapes formatting, and cleans input."""
        # Remove zero-width spaces, joiners
        cleaned = re.sub(r"[\u200B-\u200D\uFEFF]", "", text)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def _normalize_obfuscations(self, text: str) -> str:
        """Normalizes intentional scammer evasions (e.g. '0 T P', 'P-I-N')."""
        normalized = text
        for pattern, replacement in self.OBFUSCATION_MAP.items():
            normalized = re.sub(pattern, replacement, normalized)
        return normalized

    def _extract_and_inspect_urls(self, text: str, input_type: str) -> Tuple[List[Dict[str, Any]], bool]:
        """Extracts and analyzes all URLs using the URLAnalyzer."""
        urls_found: List[str] = []

        if input_type == "url":
            urls_found.append(text.strip())
        else:
            matches = self.URL_REGEX.findall(text)
            urls_found.extend(matches)

        inspected_results = []
        has_suspicious = False

        for u in urls_found[:4]:  # Inspect top 4 URLs
            res = url_analyzer.analyze(u)
            is_bad = res.is_phishing or res.risk_score >= 40
            if is_bad:
                has_suspicious = True
            inspected_results.append({
                "url": res.url,
                "is_phishing": res.is_phishing,
                "risk_score": res.risk_score,
                "threat_level": res.threat_level,
                "impersonated_brand": res.impersonated_brand,
                "detected_tricks": res.detected_tricks,
                "domain_reputation": res.domain_reputation,
                "ssl_status": res.ssl_status,
                "verdict_summary": res.verdict_summary,
                "recommended_actions": res.recommended_actions,
                "url_components": res.url_components,
                "domain_analysis": res.domain_analysis,
                "threat_intelligence": res.threat_intelligence
            })

        return inspected_results, has_suspicious

    def _run_ai_analysis(
        self, 
        normalized_text: str, 
        original_text: str,
        input_type: str,
        detected_indicators: List[str]
    ) -> Tuple[str, List[str], int]:
        """Classifies scam vector and extracts psychological manipulation triggers."""
        psych_triggers: List[str] = []
        ai_boost = 0
        scam_category = "General Communication"

        # 1. Digital Arrest / Law Enforcement
        if any(k in normalized_text for k in ["digital arrest", "police", "customs", "cbi", "narcotics", "supreme court", "passport"]):
            scam_category = "Digital Arrest / Law Enforcement Coercion"
            psych_triggers.extend([
                "Extreme fear & intimidation of imminent arrest",
                "Authority spoofing to prevent independent verification",
                "Isolation coercion ('do not tell family or disconnect call')"
            ])
            ai_boost += 35

        # 2. Electricity / Utility cutoff
        elif any(k in normalized_text for k in ["electricity", "power cut", "disconnected tonight", "9:30 pm", "unpaid bill"]):
            scam_category = "Urgent Utility Disconnection Scam"
            psych_triggers.extend([
                "Panic from same-day essential service shutdown",
                "Artificial deadline to force immediate impulsive call"
            ])
            ai_boost += 30

        # 3. UPI Reverse Transfer / QR
        elif any(k in normalized_text for k in ["enter pin to receive", "qr code", "receive money", "claim refund", "upi pin"]):
            scam_category = "UPI PIN Reverse Transfer Scam"
            psych_triggers.extend([
                "Cognitive confusion regarding payment mechanics",
                "False belief that entering PIN credits money into bank account"
            ])
            ai_boost += 35

        # 4. Task / Job syndicate
        elif any(k in normalized_text for k in ["part time", "rating task", "youtube like", "earn $", "earn ₹", "daily salary", "hotel review"]):
            scam_category = "Prepaid Job & Task Syndicate Scam"
            psych_triggers.extend([
                "Financial greed & illusion of high reward for minimal effort",
                "Sunk-cost trap through small initial payouts followed by frozen funds"
            ])
            ai_boost += 25

        # 5. Phishing login / KYC
        elif any(k in normalized_text for k in ["kyc", "pan", "account suspended", "update now", "verify details", "login"]):
            scam_category = "Credential Harvesting & KYC Smishing"
            psych_triggers.extend([
                "Fear of account closure / financial access disruption",
                "Urgency pushing victim toward spoofed banking portal"
            ])
            ai_boost += 30

        # 6. Lottery / Prize
        elif any(k in normalized_text for k in ["won lottery", "prize", "congratulations", "selected winner", "customs fee"]):
            scam_category = "Advance-Fee Lottery / Prize Scam"
            psych_triggers.extend([
                "Euphoria of unexpected wealth",
                "Urgency to pay 'processing / customs fees' before prize is lost"
            ])
            ai_boost += 20

        # Default trigger profiling based on indicators
        if "Urgent language" in detected_indicators and "Artificial Urgency" not in str(psych_triggers):
            psych_triggers.append("Time pressure designed to bypass critical reasoning")
        if "Account-threat language" in detected_indicators and "Fear of penalty" not in str(psych_triggers):
            psych_triggers.append("Fear of financial or legal disruption")

        return scam_category, psych_triggers, ai_boost

    def _generate_recommended_actions(
        self, 
        indicators: List[str], 
        risk_level: str,
        has_suspicious_url: bool,
        has_sensitive_req: bool
    ) -> List[str]:
        """
        Outputs the exact requested format:
        Do not click the link.
        Do not share OTP/PIN.
        Verify through the official channel.
        """
        actions = []

        if has_suspicious_url or "Suspicious URL" in indicators or risk_level in ["HIGH", "CRITICAL"]:
            actions.append("Do not click the link.")
        
        if has_sensitive_req or "Requests sensitive information" in indicators or risk_level in ["HIGH", "CRITICAL"]:
            actions.append("Do not share OTP/PIN.")

        # Always include official channel verification
        actions.append("Verify through the official channel.")

        # Additional high-priority directives for critical scams
        if risk_level == "CRITICAL":
            actions.append("Block the sender and report to National Cybercrime Helpline: 1930.")

        return actions

# Global singleton instance
scam_shield_engine = ScamShieldEngine()
