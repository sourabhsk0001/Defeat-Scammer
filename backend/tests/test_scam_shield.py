from app.services.scam_shield_engine import scam_shield_engine
from app.models.schemas import ScamShieldScanRequest

def test_sms_urgent_utility_scam():
    # Test SMS input with urgent cutoff threat + link
    sms_text = "Dear Consumer, Your electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Click http://ebill-update.xyz to pay immediately."
    req = ScamShieldScanRequest(
        content=sms_text,
        input_type="sms",
        sender_info="VM-POWERCUT"
    )
    res = scam_shield_engine.scan(req)
    
    assert res.is_scam is True
    assert res.risk_level in ["HIGH", "CRITICAL"]
    assert res.risk_score >= 60
    assert "Urgent language" in res.indicators
    assert "Suspicious URL" in res.indicators
    assert "Account-threat language" in res.indicators
    assert "Do not click the link." in res.recommended_actions
    assert "Verify through the official channel." in res.recommended_actions

def test_whatsapp_digital_arrest():
    # Test WhatsApp input with digital arrest threat
    wa_text = "CBI Cyber Branch: Warrant issued under Section 420. You are under Digital Arrest. Stay on WhatsApp call. Do not disclose to family."
    req = ScamShieldScanRequest(
        content=wa_text,
        input_type="whatsapp",
        sender_info="+92-300-1234567"
    )
    res = scam_shield_engine.scan(req)

    assert res.is_scam is True
    assert res.risk_level == "CRITICAL"
    assert "Account-threat language" in res.indicators
    assert "Digital Arrest" in res.scam_category
    assert len(res.psychological_triggers) > 0

def test_payment_upi_pin_reverse_scam():
    # Test Payment message tricking user into entering PIN to receive
    pay_text = "₹5,000 Cashback Approved! Scan QR code and enter your UPI PIN immediately to claim and receive refund to your bank account."
    req = ScamShieldScanRequest(
        content=pay_text,
        input_type="payment"
    )
    res = scam_shield_engine.scan(req)

    assert res.is_scam is True
    assert res.risk_score >= 65
    assert "Requests sensitive information" in res.indicators
    assert "Do not share OTP/PIN." in res.recommended_actions

def test_phishing_url_input():
    # Test direct Website URL input
    url = "http://sbi-banking-kyc-update.xyz/verify/login.php"
    req = ScamShieldScanRequest(
        content=url,
        input_type="url"
    )
    res = scam_shield_engine.scan(req)

    assert res.is_scam is True
    assert "Suspicious URL" in res.indicators
    assert "Do not click the link." in res.recommended_actions

def test_safe_transaction_receipt_email():
    # Test safe routine receipt
    safe_text = "Thank you for your order #402-99812. Your package from Amazon Retail has shipped and will arrive on Friday. Track via your official Amazon app."
    req = ScamShieldScanRequest(
        content=safe_text,
        input_type="email",
        sender_info="auto-confirm@amazon.in"
    )
    res = scam_shield_engine.scan(req)

    assert res.is_scam is False
    assert res.risk_level == "LOW"
    assert res.risk_score < 35
    assert res.verdict_banner == "✓ Verified Low Risk"
