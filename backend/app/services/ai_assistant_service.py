import re
import os
import json
from typing import Dict, Any, List, Optional
from app.models.schemas import (
    AIAssistantUnifiedResponse,
    AIAssistantSafetyAssessment,
    AIAssistantFinancialResult,
    RAGSourceCitation,
    ChatMessage
)
from app.services.financial_calculator import financial_calculator
from app.services.scam_shield_engine import scam_shield_engine
from app.services.url_analyzer import url_analyzer
from app.services.rag.pipeline import rag_pipeline
from app.services.ai_service import GeminiClient

class AIAssistantService:
    """
    Phase 13 — AI Assistant Service.
    Connects everything into a unified intelligent sentry:
                 AI ASSISTANT
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    Financial       RAG          Safety
    Calculator    Knowledge      Engine
        │             │             │
        └─────────────┼─────────────┘
                      ↓
                    Gemini
                      ↓
                Answer + Sources

    Flow:
    Analyze message ➔ Extract URL ➔ Check indicators ➔ Retrieve relevant safety guidance ➔ Gemini explanation ➔ Action steps
    """

    def __init__(self):
        self.gemini_client = GeminiClient()
        self.fin_calc = financial_calculator
        self.safety_engine = scam_shield_engine
        self.url_engine = url_analyzer
        self.rag = rag_pipeline

    async def assist(
        self,
        query: str,
        channel: Optional[str] = "sms",
        history: Optional[List[Dict[str, str]]] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> AIAssistantUnifiedResponse:
        """
        Orchestrates the entire Phase 13 flow.
        """
        query_text = query.strip()
        pipeline_trace = {
            "step_1_message_analysis": "Completed",
            "step_2_url_extraction": "Skipped",
            "step_3_indicator_check": "Completed",
            "step_4_rag_retrieval": "Completed",
            "step_5_financial_calc": "Skipped",
            "step_6_gemini_synthesis": "Completed"
        }

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 1 & 2: ANALYZE MESSAGE & EXTRACT URLS (Safety Engine)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        extracted_urls, has_suspicious_url = self.safety_engine._extract_and_inspect_urls(
            query_text, (channel or "sms").lower()
        )
        if extracted_urls:
            pipeline_trace["step_2_url_extraction"] = f"Extracted {len(extracted_urls)} URL(s)"

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 3: CHECK INDICATORS & RUN SAFETY ENGINE
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # We invoke ScamShield's indicator logic and pattern detection
        from app.models.schemas import ScamShieldScanRequest
        scan_request = ScamShieldScanRequest(
            content=query_text,
            input_type=channel or "sms"
        )
        scan_result = self.safety_engine.scan(scan_request)

        safety_assessment = AIAssistantSafetyAssessment(
            is_suspicious=scan_result.risk_level in ["MODERATE", "MEDIUM", "HIGH", "CRITICAL"],
            risk_level=scan_result.risk_level,
            risk_score=scan_result.risk_score,
            detected_indicators=scan_result.indicators,
            extracted_urls=[u.get("url", "") for u in scan_result.extracted_urls],
            scam_category=scan_result.scam_category
        )
        pipeline_trace["step_3_indicator_check"] = f"{len(scan_result.indicators)} indicators detected; Risk: {scan_result.risk_level}"

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 4: FINANCIAL CALCULATOR (Pillar 1)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        fin_calc_data = self.fin_calc.detect_and_calculate(query_text, user_context)
        financial_result = None
        if fin_calc_data:
            financial_result = AIAssistantFinancialResult(
                calculation_type=fin_calc_data["type"],
                details=fin_calc_data["details"]
            )
            pipeline_trace["step_5_financial_calc"] = f"Calculated {fin_calc_data['type']}"

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 5: RETRIEVE RELEVANT SAFETY & REGULATORY GUIDANCE (Pillar 2: RAG)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Formulate optimal semantic search query based on query & detected threat category
        search_query = query_text
        if scan_result.scam_category and scan_result.scam_category != "Safe / Low Risk":
            search_query = f"{query_text} {scan_result.scam_category} {' '.join(scan_result.indicators)}"

        rag_result = await self.rag.query(user_query=search_query, top_k=3)
        sources: List[RAGSourceCitation] = [
            RAGSourceCitation(
                source=s["source"],
                title=s["title"],
                publication_date=s["publication_date"],
                update_date=s.get("update_date", s["publication_date"]),
                jurisdiction=s["jurisdiction"],
                document_type=s["document_type"],
                url=s["url"],
                category=s["category"],
                relevance_score=s["relevance_score"],
                excerpt=s["excerpt"]
            )
            for s in rag_result.get("sources", [])
        ]
        pipeline_trace["step_4_rag_retrieval"] = f"Retrieved {len(sources)} authoritative source(s)"

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # STEP 6: GEMINI EXPLANATION & ACTION STEPS SYNTHESIS (Pillar 3 & Core)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        gemini_explanation, action_steps = await self._synthesize_with_gemini(
            query=query_text,
            safety=safety_assessment,
            sources=sources,
            financial=financial_result
        )

        return AIAssistantUnifiedResponse(
            query=query_text,
            answer=gemini_explanation,
            safety_assessment=safety_assessment,
            financial_calculations=financial_result,
            sources=sources,
            action_steps=action_steps,
            pipeline_trace=pipeline_trace
        )

    async def _synthesize_with_gemini(
        self,
        query: str,
        safety: AIAssistantSafetyAssessment,
        sources: List[RAGSourceCitation],
        financial: Optional[AIAssistantFinancialResult]
    ) -> tuple[str, List[str]]:
        """
        Synthesizes the explanation and action steps using Gemini,
        grounded in RAG sources, Safety indicators, and Financial figures.
        """
        system_instruction = (
            "You are the Defeat Scammer AI Assistant, an elite copilot integrating: "
            "1) Financial Calculator, 2) Official Knowledge Base (RAG), and 3) Safety Engine. "
            "When analyzing a user message or query: "
            "- Clearly diagnose if the situation is dangerous or a scam. "
            "- Detail the tactics used (urgency, spoofing, sensitive info requests). "
            "- Reference official regulations and authoritative sources cited. "
            "- If financial calculations exist, provide exact numerical guidance. "
            "- Provide clear, concise, actionable advice."
        )

        rag_summary = "\n".join([
            f"- [{s.source}] {s.title} ({s.document_type}, {s.jurisdiction}): {s.excerpt} (Official Link: {s.url})"
            for s in sources
        ]) or "General banking safety guidelines."

        safety_summary = (
            f"Risk Level: {safety.risk_level} (Score: {safety.risk_score}/100)\n"
            f"Scam Category: {safety.scam_category}\n"
            f"Detected Indicators: {', '.join(safety.detected_indicators) if safety.detected_indicators else 'None'}\n"
            f"Extracted URLs: {', '.join(safety.extracted_urls) if safety.extracted_urls else 'None'}"
        )

        fin_summary = json.dumps(financial.details) if financial else "No financial computation requested."

        prompt = (
            f"User Query / Message:\n\"{query}\"\n\n"
            f"Safety Engine Evaluation:\n{safety_summary}\n\n"
            f"Authoritative Knowledge Citations (RAG):\n{rag_summary}\n\n"
            f"Financial Calculator Findings:\n{fin_summary}\n\n"
            f"Please synthesize:\n"
            f"1. Executive Assessment & Diagnosis\n"
            f"2. Deep Explanation of Threat / Financial Situation\n"
            f"3. Official Regulatory Facts (citing the provided authoritative sources)\n"
            f"4. Action Steps (List 3 to 5 clear, prioritized, imperative action items)"
        )

        ai_response = await self.gemini_client.generate(prompt, system_instruction=system_instruction)

        # Fallback / parsing logic if remote API key is unavailable or offline
        if not ai_response:
            ai_response, action_steps = self._fallback_synthesis(query, safety, sources, financial)
        else:
            # Extract action steps from Gemini output if present
            action_steps = self._extract_action_steps(ai_response, safety)

        return ai_response, action_steps

    def _fallback_synthesis(
        self,
        query: str,
        safety: AIAssistantSafetyAssessment,
        sources: List[RAGSourceCitation],
        financial: Optional[AIAssistantFinancialResult]
    ) -> tuple[str, List[str]]:
        """High-fidelity local fallback synthesis."""
        q_lower = query.lower()

        # Case 1: KYC scam inquiry (The Canonical Phase 13 Example)
        if "kyc" in q_lower or "expire" in q_lower or safety.scam_category == "KYC Update Phishing":
            explanation = (
                "### ⚠️ Potential Scam: High Risk KYC Phishing\n\n"
                "**Assessment:** This message is a fraudulent phishing attempt designed to harvest your banking credentials and compromise your account.\n\n"
                "#### 🔍 Threat Breakdown & Indicators Detected:\n"
                + "".join([f"• **{ind}**: Attackers manufacture artificial panic.\n" for ind in safety.detected_indicators]) +
                "\n"
                "#### 🏛️ Official Regulatory Guidance:\n"
                "According to the **Reserve Bank of India (RBI Master Direction)** and **NPCI Safety Directives**, legitimate banks and payment service providers:\n"
                "1. **NEVER** threaten immediate account deactivation or KYC expiration via unverified SMS or WhatsApp.\n"
                "2. **NEVER** ask you to click third-party links or download APK files to update KYC.\n"
                "3. Periodic KYC updates are only conducted through the bank's official secured net-banking portal or in-person at a branch."
            )
            action_steps = [
                "Do not click any link in the message.",
                "Do not share OTP, PIN, password, or Aadhaar/PAN details.",
                "Do not call any phone number provided in the SMS.",
                "Verify your KYC status directly by logging into your official bank mobile app or visiting your branch.",
                "Report the fraudulent SMS to the National Cyber Crime Helpline at 1930 or at https://cybercrime.gov.in."
            ]
            return explanation, action_steps

        # Case 2: Digital Arrest / Law Enforcement Impersonation
        if any(k in q_lower for k in ["arrest", "police", "cbi", "customs", "court", "parcel"]):
            explanation = (
                "### 🚨 CRITICAL ALERT: Digital Arrest Extortion Scam\n\n"
                "**Assessment:** You are being targeted by an extortion syndicate impersonating police, CBI, or customs officials.\n\n"
                "#### 🏛️ Official Law Enforcement Directive:\n"
                "The **Ministry of Home Affairs (I4C)** and state police agencies confirm that **'Digital Arrest' does not exist in law**. "
                "Police and judicial authorities never conduct arrests, trials, or asset interrogations over Skype, WhatsApp, or video calls, and NEVER ask for funds transfer to 'clearing' accounts."
            )
            action_steps = [
                "Disconnect the call immediately; do not remain on video.",
                "Never transfer money to any claimed 'safe verification account'.",
                "Block the caller's number across all channels.",
                "Dial the National Cyber Helpline 1930 immediately to report the extortion attempt."
            ]
            return explanation, action_steps

        # Case 3: Financial Calculations Inquiry
        if financial:
            d = financial.details
            if financial.calculation_type == "emi_calculation":
                explanation = (
                    f"### 🧮 Financial Calculation: Loan EMI Breakdown\n\n"
                    f"• **Principal Loan Amount:** ₹{d['principal']:,.2f}\n"
                    f"• **Annual Interest Rate:** {d['annual_rate_pct']}%\n"
                    f"• **Tenure:** {d['tenure_months']} months ({d['tenure_months']//12} years)\n"
                    f"• **Monthly EMI:** **₹{d['monthly_emi']:,.2f}**\n"
                    f"• **Total Interest Payable:** ₹{d['total_interest']:,.2f} ({d['interest_to_principal_ratio']}% of principal)\n"
                    f"• **Total Amount Payable:** ₹{d['total_payment']:,.2f}\n\n"
                    f"#### 🏛️ Regulatory Advice (RBI Digital Lending):\n"
                    f"Ensure you only borrow from RBI-regulated entities (REs). Check the Key Fact Statement (KFS) and verify the Annual Percentage Rate (APR) before signing."
                )
                action_steps = [
                    f"Budget ₹{d['monthly_emi']:,.2f} each month as a non-negotiable fixed obligation.",
                    "Verify the lender on RBI's list of registered NBFCs and banks.",
                    "Ensure your Debt-to-Income (DTI) ratio stays below 36%."
                ]
                return explanation, action_steps
            elif financial.calculation_type == "budget_allocation":
                explanation = (
                    f"### 📊 Financial Calculation: 50/30/20 Budget Allocation\n\n"
                    f"Based on your monthly income of **₹{d['monthly_income']:,.2f}**:\n"
                    f"• **Needs (50%):** ₹{d['needs_50']:,.2f} (Housing, food, utilities, loan EMIs)\n"
                    f"• **Wants (30%):** ₹{d['wants_30']:,.2f} (Entertainment, dining, travel)\n"
                    f"• **Savings & Investments (20%):** ₹{d['savings_20']:,.2f}\n"
                    f"• **Annual Wealth Growth Potential:** ₹{d['annual_savings_potential']:,.2f}"
                )
                action_steps = [
                    f"Automate ₹{d['savings_20']:,.2f} to transfer to savings/investments on salary day.",
                    "Cap discretionary spending to 30% of net income.",
                    "Maintain at least 3-6 months of basic living expenses in an emergency fund."
                ]
                return explanation, action_steps

        # Case 4: General Inquiries
        primary_source = sources[0] if sources else None
        source_note = f" Referencing **{primary_source.source} — {primary_source.title}**." if primary_source else ""
        explanation = (
            f"### 🛡️ Sentinel Intelligence Assessment\n\n"
            f"Based on our evaluation through the Safety Engine and Knowledge Base:{source_note}\n\n"
            f"• **Security Status:** {safety.risk_level} ({safety.risk_score}/100)\n"
            f"• **Context Analysis:** Always verify unexpected requests independently. Legitimate banks and authorities will never pressure you into hasty actions or request confidential PINs/passwords."
        )
        action_steps = [
            "Never share confidential credentials (OTP, PIN, passwords).",
            "Verify communications through official customer support numbers.",
            "Report any suspicious cyber activities to helpline 1930."
        ]
        return explanation, action_steps

    def _extract_action_steps(self, text: str, safety: AIAssistantSafetyAssessment) -> List[str]:
        """Extracts bulleted action steps from text or returns standard steps."""
        steps = []
        lines = text.split("\n")
        in_action_section = False
        for line in lines:
            line_str = line.strip()
            if any(h in line_str.lower() for h in ["action step", "recommended action", "actionable step", "what to do"]):
                in_action_section = True
                continue
            if in_action_section and (line_str.startswith("•") or line_str.startswith("-") or re.match(r"^\d+\.", line_str)):
                clean_step = re.sub(r"^[•\-\d\.]+\s*", "", line_str).strip()
                if len(clean_step) > 5:
                    steps.append(clean_step)
            elif in_action_section and line_str.startswith("#"):
                in_action_section = False

        if not steps:
            if safety.risk_level in ["HIGH", "CRITICAL"]:
                steps = [
                    "Do not click the link.",
                    "Do not share OTP/PIN.",
                    "Verify through the official channel.",
                    "Report immediately to 1930 / cybercrime.gov.in."
                ]
            else:
                steps = [
                    "Verify through official channels.",
                    "Keep credentials and PINs confidential.",
                    "Monitor account activity regularly."
                ]
        return steps[:5]


ai_assistant_service = AIAssistantService()
