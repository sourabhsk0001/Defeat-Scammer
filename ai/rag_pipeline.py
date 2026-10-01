import re
from typing import List, Dict, Any

class RAGPipeline:
    """Retrieval-Augmented Generation pipeline for financial fraud signatures."""
    
    def __init__(self):
        self.corpus = [
            {
                "id": "kb_01",
                "title": "Digital Arrest & Impersonation Playbook",
                "category": "Extortion / Police Impersonation",
                "summary": "Scammers claim courier interception with drugs/passports. They force victims onto Skype video calls with fake police backdrops and demand asset transfers to escrow accounts.",
                "keywords": ["digital arrest", "police", "customs", "cbi", "drugs", "passport", "warrant", "skype", "courier", "fedex"],
                "helpline": "Dial 1930 / file complaint on cybercrime.gov.in"
            },
            {
                "id": "kb_02",
                "title": "Utility Bill Disconnection SMS",
                "category": "Urgency / Utility",
                "summary": "Urgent SMS claiming power disconnection at 9:30 PM due to unpaid bill. Directs victim to call personal mobile number or download a malicious APK.",
                "keywords": ["electricity", "power cut", "disconnection", "unpaid bill", "officer", "meter"],
                "helpline": "Use official utility portal only"
            },
            {
                "id": "kb_03",
                "title": "UPI / QR Code Reversal Scam",
                "summary": "Pretext on marketplace: seller is told to scan a QR code and enter UPI PIN to receive payment. Entering PIN always debits funds.",
                "category": "Payment Gateway Fraud",
                "keywords": ["qr code", "upi pin", "receive money", "olx", "refund", "scan to receive"],
                "helpline": "Report counterparty UPI ID to bank & NPCI"
            },
            {
                "id": "kb_04",
                "title": "Remote Desktop Screen Sharing (AnyDesk / RustDesk)",
                "summary": "Scammer claims to fix banking issue or process flight refund by instructing user to install remote management tool and read out session ID.",
                "category": "Device Compromise",
                "keywords": ["anydesk", "teamviewer", "rustdesk", "quicksupport", "screen share", "9 digit code"],
                "helpline": "Disconnect WiFi immediately, uninstall app, reset bank credentials"
            },
            {
                "id": "kb_05",
                "title": "Pig Butchering & Fake Crypto Trading Schemes",
                "summary": "Long-term social engineering beginning via dating apps or wrong numbers, culminating in high-yield fake cryptocurrency deposits with impossible withdrawal terms.",
                "category": "Investment Syndicate",
                "keywords": ["crypto", "pig butchering", "guaranteed profit", "trading platform", "sha zhu pan"],
                "helpline": "Retain blockchain TX hashes and file with FBI IC3 / CERT"
            }
        ]

    def query(self, text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_terms = set(re.findall(r"\w+", text.lower()))
        results = []

        for item in self.corpus:
            score = 0
            body = (item["title"] + " " + item["summary"] + " " + " ".join(item["keywords"])).lower()
            for kw in item["keywords"]:
                if kw in text.lower():
                    score += 6
            for term in query_terms:
                if len(term) > 3 and term in body:
                    score += 2

            if score > 0:
                results.append({
                    "id": item["id"],
                    "title": item["title"],
                    "category": item["category"],
                    "summary": item["summary"],
                    "helpline": item["helpline"],
                    "score": min(100, score * 10)
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

rag_pipeline = RAGPipeline()
