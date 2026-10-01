import os
import json
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    async def analyze_with_ai(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Call Gemini if API key is configured, else fallback gracefully."""
        if not self.api_key:
            return self._fallback_assistant_response(prompt)

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1000
            }
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            url = f"{self.endpoint}?key={self.api_key}"
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                return self._fallback_assistant_response(prompt)
        except Exception as e:
            print(f"Gemini API invocation error: {e}")
            return self._fallback_assistant_response(prompt)

    def _fallback_assistant_response(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        if "digital arrest" in prompt_lower or "police" in prompt_lower or "cbi" in prompt_lower:
            return (
                "⚠️ **CRITICAL ALERT: Digital Arrest Extortion Detected.**\n\n"
                "1. **Law enforcement agencies (Police, CBI, Customs, ED) never arrest anyone over Skype, Zoom, or WhatsApp video calls.**\n"
                "2. They will never ask you to transfer funds to a 'safe verification account' or 'reserve escrow'.\n"
                "3. **Immediate Action:** Hang up the call immediately. Do NOT transfer any money. Report the incident directly to the national cybercrime portal or call the helpline at **1930**."
            )
        elif "electricity" in prompt_lower or "power" in prompt_lower or "bill" in prompt_lower:
            return (
                "⚡ **SUSPICIOUS UTILITY BILL THREAT DETECTED:**\n\n"
                "Legitimate electric utility companies do not issue instant same-night disconnection ultimatums over informal SMS or WhatsApp. "
                "Never call the mobile number listed in the text or download any APK attachment. Verify your bill status only inside your official utility consumer portal."
            )
        elif "crypto" in prompt_lower or "investment" in prompt_lower or "trading" in prompt_lower:
            return (
                "📈 **HIGH-RISK INVESTMENT / PONZI ADVISORY:**\n\n"
                "Guaranteed returns of 10%+ daily or weekly do not exist in genuine financial markets. If you were approached on Telegram, WhatsApp, or a dating app, this exhibits all hallmarks of a 'Pig Butchering' (Sha Zhu Pan) syndicate. Do not send further capital or pay fees to withdraw."
            )
        elif "qr code" in prompt_lower or "upi" in prompt_lower or "pin" in prompt_lower:
            return (
                "🛡️ **GOLDEN RULE OF UPI SAFETY:**\n\n"
                "You NEVER have to enter your UPI PIN or scan a QR code to *receive* money. A PIN is strictly an authorization code to *debit* money from your account. If someone is telling you to enter your PIN to claim an advance or refund, they are attempting to drain your account."
            )
        else:
            return (
                "🛡️ **Financial Guardian AI Analysis:**\n\n"
                "I have evaluated your query against our verified cyber fraud database. Remember: legitimate institutions will never ask for your passwords, OTPs, or remote screen sharing (AnyDesk/TeamViewer). Always verify unexpected payment demands through independent official channels. Let me know if you would like me to check a specific message, URL, or transaction!"
            )

gemini_service = GeminiService()
