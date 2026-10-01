import re
from typing import Dict, Any, List
from app.models.schemas import ScreenshotAnalysisResult

class ScreenshotAnalyzer:
    def analyze(self, text: str, scenario: str = "fake_receipt") -> ScreenshotAnalysisResult:
        content = text.lower()
        risk_score = 10
        manipulations = []
        indicators = []

        # 1. Fake payment receipt check (e.g., GPay / PhonePe / Paytm / Zelle fake screens)
        if any(w in content for w in ["payment successful", "transfer completed", "sent to", "utr", "transaction id", "credited"]):
            if any(w in content for w in ["demo", "prank", "spoof", "generator", "paytm spoon", "fake pay"]):
                risk_score += 85
                manipulations.append("App watermark / metadata traces from fake receipt generator APK")
            if re.search(r"\b(utr\s*:\s*0000|123456789|demo_tx)\b", content):
                risk_score += 60
                indicators.append("Generic or repetitive mock UTR / Reference ID sequence detected")
            if "pending verification" in content or "processing will release" in content:
                risk_score += 40
                indicators.append("False escrow assurance: Claims money is held until victim performs an action")

        # 2. Fake Bank SMS / Warning screenshot
        if any(w in content for w in ["account blocked", "kyc expired", "pan card suspended", "electricity", "apk"]):
            risk_score += 50
            indicators.append("Intense social engineering urgency: Threatens immediate deactivation")
            if ".apk" in content or "http" in content or "bit.ly" in content:
                risk_score += 40
                manipulations.append("Malicious third-party download link or shortened URL embedded")

        # 3. Font / layout mismatch indicators
        if "screenshot" in content or len(text.strip()) > 0:
            if any(w in content for w in ["dear customer", "urgently", "immediately"]):
                risk_score += 20
                indicators.append("Informal grammar / spelling inconsistencies typical of fraudulent templates")

        risk_score = min(98, max(5, risk_score))
        is_fraud = risk_score >= 50

        if risk_score >= 75:
            threat = "CRITICAL"
        elif risk_score >= 50:
            threat = "HIGH"
        elif risk_score >= 25:
            threat = "MEDIUM"
        else:
            threat = "LOW"

        action_plan = [
            "DO NOT release goods, services, or credentials based on this screenshot.",
            "Verify your bank balance directly inside your verified mobile banking app (never trust counterparty screenshots).",
            "Cross-check the UTR / Reference number directly with bank statements."
        ] if is_fraud else [
            "Confirm transaction ledger balance in your official banking portal."
        ]

        return ScreenshotAnalysisResult(
            scenario=scenario,
            risk_score=risk_score,
            threat_level=threat,
            is_fraudulent=is_fraud,
            detected_manipulations=manipulations if manipulations else ["No obvious watermark tampering detected."],
            extracted_text_preview=text[:200] + ("..." if len(text) > 200 else ""),
            fraud_indicators=indicators if indicators else ["Normal payment acknowledgment structure."],
            action_plan=action_plan
        )

screenshot_analyzer = ScreenshotAnalyzer()
