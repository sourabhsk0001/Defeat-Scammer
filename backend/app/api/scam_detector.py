from fastapi import APIRouter
from app.models.schemas import (
    MessageAnalysisRequest, MessageAnalysisResult,
    URLAnalysisRequest, URLAnalysisResult,
    ScreenshotAnalysisRequest, ScreenshotAnalysisResult,
    VoiceAnalysisRequest, VoiceAnalysisResult
)
from app.services.rag_service import rag_service
from app.services.url_analyzer import url_analyzer
from app.services.screenshot_analyzer import screenshot_analyzer

router = APIRouter(prefix="/scam-shield", tags=["Scam Detector Engine"])

@router.post("/analyze-message", response_model=MessageAnalysisResult)
def analyze_message(req: MessageAnalysisRequest):
    content = req.content
    content_lower = content.lower()
    
    # 1. Query RAG to retrieve matching fraud vectors
    rag_matches = rag_service.search_knowledge(content, top_k=2)

    risk_score = 10
    detected_patterns = []
    psychological_triggers = []
    scam_category = "General Communication"
    urgency_rating = "Normal"

    # Pattern checks
    if any(k in content_lower for k in ["digital arrest", "police", "customs", "cbi", "passport confiscated", "narcotics", "supreme court"]):
        risk_score += 85
        scam_category = "Digital Arrest / Fake Law Enforcement"
        detected_patterns.append("Impersonation of legal authority and fake arrest warrants")
        psychological_triggers.append("Extreme fear & isolation coercion")
        urgency_rating = "Severe"

    elif any(k in content_lower for k in ["electricity", "power cut", "disconnected tonight", "9:30 pm", "unpaid bill"]):
        risk_score += 80
        scam_category = "Urgent Utility Disconnection Scam"
        detected_patterns.append("Artificial deadline with same-day power cutoff threat")
        psychological_triggers.append("Panic and fear of utility disruption")
        urgency_rating = "Severe"

    elif any(k in content_lower for k in ["part time", "rating task", "youtube like", "earn $100", "daily salary", "hotel review"]):
        risk_score += 75
        scam_category = "Prepaid Job / Task Syndicate Scam"
        detected_patterns.append("Unsolicited remote work offer with unrealistic hourly wage")
        psychological_triggers.append("Greed & low-effort financial gain")
        urgency_rating = "Moderate"

    elif any(k in content_lower for k in ["enter pin to receive", "qr code", "receive money", "claim refund"]):
        risk_score += 90
        scam_category = "UPI PIN Reverse Transfer Scam"
        detected_patterns.append("Misleading claim that authorization PIN is needed to receive payment")
        psychological_triggers.append("Cognitive confusion regarding payment mechanics")
        urgency_rating = "Severe"

    elif any(k in content_lower for k in ["won lottery", "prize", "congratulations", "selected winner", "customs clearance"]):
        risk_score += 70
        scam_category = "Lottery & Advance-Fee Fraud"
        detected_patterns.append("Unsolicited prize notification demanding advance fee")
        psychological_triggers.append("Artificial euphoria / FOMO")
        urgency_rating = "Moderate"

    elif any(k in content_lower for k in ["apk", "download app", "install rustdesk", "anydesk", "teamviewer"]):
        risk_score += 85
        scam_category = "Remote Screen Takeover / Trojan APK"
        detected_patterns.append("Request to install third-party application or screen sharing client")
        psychological_triggers.append("False sense of technical support")
        urgency_rating = "Severe"

    # General urgency checks
    if any(k in content_lower for k in ["immediately", "urgent", "within 2 hours", "account will be blocked", "final notice"]):
        risk_score += 15
        if urgency_rating == "Normal":
            urgency_rating = "Moderate"
        detected_patterns.append("Artificial countdown timer / coercive urgency phrasing")

    risk_score = min(99, max(5, risk_score))
    is_scam = risk_score >= 55

    threat_level = "LOW"
    if risk_score >= 80:
        threat_level = "CRITICAL"
    elif risk_score >= 55:
        threat_level = "HIGH"
    elif risk_score >= 30:
        threat_level = "MEDIUM"

    evidence = [
        f"Channel: {req.channel} (Frequent vector for social engineering)",
        f"Identified Scam Category: {scam_category}",
        f"Language Urgency Analysis: {urgency_rating}"
    ]
    if rag_matches:
        evidence.append(f"Historical Match: Strong correlation with '{rag_matches[0]['title']}'")

    recommended_actions = [
        "DO NOT click any link, dial the telephone number provided, or send money.",
        "Block the sender and report as spam inside your messaging app.",
        "Verify independently through official customer care numbers from the company's verified website."
    ] if is_scam else [
        "Message appears low risk, but never disclose personal passwords or OTPs."
    ]

    return MessageAnalysisResult(
        is_scam=is_scam,
        threat_level=threat_level,
        risk_score=risk_score,
        scam_category=scam_category,
        detected_patterns=detected_patterns if detected_patterns else ["Standard communication tone"],
        urgency_rating=urgency_rating,
        psychological_triggers=psychological_triggers if psychological_triggers else ["No overt manipulation detected"],
        evidence=evidence,
        recommended_actions=recommended_actions,
        reporting_advice="If money was lost or demands were made, file an official cyber report immediately via dial 1930 or cybercrime.gov.in."
    )

@router.post("/analyze-url", response_model=URLAnalysisResult)
def analyze_url(req: URLAnalysisRequest):
    return url_analyzer.analyze(req.url)

@router.post("/analyze-screenshot", response_model=ScreenshotAnalysisResult)
def analyze_screenshot(req: ScreenshotAnalysisRequest):
    sample_text = req.extracted_text or "Payment of $1,450.00 to Alex Morgan SUCCESSFUL. UTR: 0000987654. Verify at bit.ly/claim-funds"
    return screenshot_analyzer.analyze(sample_text, req.simulated_scenario or "fake_receipt")

@router.post("/analyze-voice", response_model=VoiceAnalysisResult)
def analyze_voice(req: VoiceAnalysisRequest):
    text = req.audio_transcript.lower()
    risk_score = 15
    tactics = []
    target = "Unknown Entity"
    deepfake_suspected = False

    if any(k in text for k in ["arrest", "police", "cbi", "drugs", "customs", "parliament", "warrant"]):
        risk_score += 80
        target = "Federal Law Enforcement / Police"
        tactics.append("Intimidation with fabricated penal code allegations")
        tactics.append("Isolation demand: 'Do not tell family or disconnect the call'")

    elif any(k in text for k in ["grandson", "accident", "bail money", "hospital", "lawyer"]):
        risk_score += 75
        target = "Family Relative (Grandparent Emergency Scam)"
        tactics.append("Emotional distress manipulation using synthesized voice distress")
        deepfake_suspected = True

    elif any(k in text for k in ["bank manager", "security team", "otp", "debit card", "freeze your account"]):
        risk_score += 70
        target = "Bank Fraud Security Division"
        tactics.append("Manufactured panic over unauthorized withdrawals")

    risk_score = min(99, max(10, risk_score))
    threat_level = "CRITICAL" if risk_score >= 80 else ("HIGH" if risk_score >= 50 else "MEDIUM")

    return VoiceAnalysisResult(
        threat_level=threat_level,
        risk_score=risk_score,
        impersonation_target=target,
        voice_social_engineering_tactics=tactics if tactics else ["Standard telemarketing tone"],
        urgency_stress_level="Severe Audio Stress Inducers Detected" if risk_score > 60 else "Normal",
        immediate_instruction="HANG UP THE CALL NOW. Law enforcement or banks never conduct formal legal or financial procedures over casual calls.",
        is_deepfake_or_ai_voice_suspected=deepfake_suspected,
        defense_script="State: 'I am recording this call and dispatching your caller ID to local cyber police dispatch.' Then terminate the call immediately."
    )
