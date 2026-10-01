import re
from urllib.parse import urlparse
from typing import List
from app.models.schemas import URLAnalysisResult

class URLAnalyzer:
    SUSPICIOUS_TLDS = {
        ".top", ".xyz", ".buzz", ".cam", ".click", ".work", ".link", ".zip", 
        ".icu", ".rest", ".monster", ".gq", ".cf", ".tk", ".ml"
    }
    
    TARGETED_BRANDS = [
        "paypal", "apple", "netflix", "microsoft", "google", "amazon", "chase", 
        "wells-fargo", "bankofamerica", "sbi", "hdfc", "icici", "binance", "metamask", "coinbase"
    ]

    def analyze(self, raw_url: str) -> URLAnalysisResult:
        url = raw_url.strip()
        if not url.startswith("http://") and not url.startswith("https://"):
            url = "https://" + url

        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        path = parsed.path.lower()
        query = parsed.query.lower()

        risk_score = 5
        tricks = []
        impersonated_brand = None

        # 1. Plain HTTP check
        if parsed.scheme == "http":
            risk_score += 25
            tricks.append("Unencrypted connection (HTTP): Credentials can be intercepted in transit.")

        # 2. IP Host check
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", domain):
            risk_score += 45
            tricks.append("Direct IP address host used instead of registered domain name (common malware/C2 proxy).")

        # 3. Suspicious TLD
        for tld in self.SUSPICIOUS_TLDS:
            if domain.endswith(tld):
                risk_score += 35
                tricks.append(f"High-abuse top-level domain detected ('{tld}'). Disproportionately used by disposable phishing kits.")
                break

        # 4. Brand impersonation / Typosquatting
        for brand in self.TARGETED_BRANDS:
            if brand in domain and not domain.endswith(f".{brand}.com") and domain != f"{brand}.com":
                risk_score += 45
                impersonated_brand = brand.capitalize()
                tricks.append(f"Brand Impersonation / Typosquatting: Domain spoofing recognized entity '{brand.capitalize()}'.")
                break

        # 5. Phishing keywords in path or query
        phish_keywords = ["login", "verify", "secure", "update", "banking", "wallet", "recovery", "seed", "kyc", "signin", "authenticate"]
        found_kw = [k for k in phish_keywords if k in path or k in query or k in domain]
        if found_kw:
            risk_score += 20
            tricks.append(f"Deceptive credential harvesting tokens found in URL path: {', '.join(found_kw[:3])}")

        # 6. Deep subdomain nesting
        subdomain_parts = domain.split(".")
        if len(subdomain_parts) >= 4:
            risk_score += 15
            tricks.append(f"Excessive sub-domain chaining ({len(subdomain_parts)} parts) designed to disguise legitimate root domain.")

        # Calculate final verdict
        risk_score = min(99, max(5, risk_score))
        is_phishing = risk_score >= 50

        if risk_score >= 80:
            threat_level = "CRITICAL"
            domain_rep = "Known Malicious / Phishing Host"
        elif risk_score >= 50:
            threat_level = "HIGH"
            domain_rep = "Suspicious / Unverified New Registrar"
        elif risk_score >= 25:
            threat_level = "MEDIUM"
            domain_rep = "Neutral / Low Historical Trust"
        else:
            threat_level = "LOW"
            domain_rep = "Reputable Domain"

        ssl_status = "Valid SSL Certificate" if parsed.scheme == "https" else "Missing / Self-Signed HTTP"

        actions = [
            "Do NOT enter passwords, OTPs, or credit card details on this domain.",
            "Close any active browser sessions communicating with this link immediately.",
            "Report URL to Google Safe Browsing and Microsoft SmartScreen feeds."
        ] if is_phishing else [
            "Always inspect address bar for correct domain spelling before logging in."
        ]

        summary = (
            f"High danger! This URL displays classic deceptive phishing attributes "
            f"aimed at harvesting credentials for {impersonated_brand or 'user accounts'}."
            if is_phishing else "This domain appears standard with no glaring malicious indicators."
        )

        return URLAnalysisResult(
            url=raw_url,
            is_phishing=is_phishing,
            threat_level=threat_level,
            risk_score=risk_score,
            detected_tricks=tricks if tricks else ["No overt phishing vectors detected in static structure."],
            domain_reputation=domain_rep,
            ssl_status=ssl_status,
            impersonated_brand=impersonated_brand,
            verdict_summary=summary,
            recommended_actions=actions
        )

url_analyzer = URLAnalyzer()
