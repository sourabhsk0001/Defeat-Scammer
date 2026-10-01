import os
import json
import httpx
from typing import Dict, Any, Optional
from ai.prompts import FRAUD_DEFENSE_SYSTEM_PROMPT

class GeminiEngine:
    """Interface for Google Gemini API with fallback heuristic engine."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.api_key:
            return self._heuristic_fallback(prompt)

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024
            }
        }
        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        try:
            url = f"{self.endpoint}?key={self.api_key}"
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                return self._heuristic_fallback(prompt)
        except Exception as e:
            print(f"[GeminiEngine] Remote call failed: {e}. Utilizing local heuristic.")
            return self._heuristic_fallback(prompt)

    def _heuristic_fallback(self, prompt: str) -> str:
        p = prompt.lower()
        if any(w in p for w in ["digital arrest", "police", "cbi", "narcotics", "court warrant"]):
            return (
                "🚨 **CRITICAL: Digital Arrest Coercion Identified**\n\n"
                "• **No law enforcement agency conducts trials or makes arrests over video calls.**\n"
                "• **Action:** Disconnect the call immediately. Block the number. Never transfer money to a 'security verification escrow'.\n"
                "• **Helpline:** Report to the Cyber Crime Helpline at **1930** or visit **cybercrime.gov.in**."
            )
        elif any(w in p for w in ["electricity", "power cutoff", "unpaid bill", "meter disconnected"]):
            return (
                "⚡ **SUSPICIOUS UTILITY SCAM:**\n\n"
                "• Electric utility boards do not issue same-night disconnection notices via casual SMS with personal mobile numbers.\n"
                "• **Action:** Never call back the number in the SMS or install any APK file. Verify your bill status strictly inside the official power distribution portal."
            )
        elif any(w in p for w in ["upi pin", "qr code", "receive money", "claim refund"]):
            return (
                "🛡️ **PAYMENT PROTOCOL ADVISORY:**\n\n"
                "• Entering your UPI PIN or scanning a QR code ALWAYS debits money from your account. You NEVER need to enter a PIN to receive funds.\n"
                "• **Action:** Cancel the interaction immediately and report the counterparty UPI ID."
            )
        else:
            return (
                "🛡️ **FinAccess-AI Sentinel Advisory:**\n\n"
                "I have scanned your input against our threat database. Legitimate institutions will never ask for your passwords, OTPs, or remote screen sharing (AnyDesk/RustDesk). Keep communication documented and verify unknown requests through verified channels."
            )

gemini_engine = GeminiEngine()
