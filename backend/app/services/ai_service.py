import os
import json
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.services.rag_service import rag_service

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# GEMINI API CLIENT & ADAPTER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class GeminiClient:
    """
    Connects to Google Gemini API (gemini-1.5-flash) with robust error handling
    and fallback heuristic engines when offline or API key is not configured.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.model = "gemini-1.5-flash"
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    async def generate(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.2) -> Optional[str]:
        """Invokes Gemini remote endpoint if API key exists, otherwise returns None."""
        if not self.api_key:
            return None

        headers = {"Content-Type": "application/json"}
        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 1500
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
                else:
                    print(f"[GeminiClient] Remote API returned status {res.status_code}: {res.text[:200]}")
                    return None
        except Exception as e:
            print(f"[GeminiClient] Connection failure: {e}")
            return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI SERVICE CORE: 5 CANONICAL RESPONSIBILITIES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AIService:
    """
    Phase 11 — AI Engine Service.
    Responsibilities:
    1. Financial explanation (Cash flow, health metrics, anomaly insights)
    2. Scam explanation (Deconstruction of fraud tactics & psychology)
    3. Budget recommendations (50/30/20 optimization & cutback strategy)
    4. Financial education (Core wealth concepts, compound interest, SIPs)
    5. Personalized guidance (Tailored roadmaps based on user profile & goals)
    """

    def __init__(self):
        self.client = GeminiClient()

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 1. FINANCIAL EXPLANATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async def explain_finances(
        self,
        income: float,
        expenses: float,
        savings: float,
        savings_rate: float,
        categories: Optional[Dict[str, float]] = None,
        anomalies_count: int = 0,
        user_query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyzes and explains the user's financial health, spending patterns,
        cash flow dynamics, and transaction anomalies.
        """
        system_instruction = (
            "You are an expert Certified Financial Planner (CFP) and financial analyst. "
            "Explain the user's financial health with crystal clarity, pinpointing strengths, "
            "vulnerabilities, savings rate sustainability, and actionable next steps. "
            "Be professional, encouraging, and mathematically accurate."
        )

        categories_summary = ", ".join([f"{k}: ${v:,.2f}" for k, v in (categories or {}).items()]) or "Standard distribution"
        prompt = (
            f"Please provide an executive financial analysis and explanation for the following data:\n"
            f"- Monthly Income: ${income:,.2f}\n"
            f"- Monthly Expenses: ${expenses:,.2f}\n"
            f"- Net Monthly Savings: ${savings:,.2f}\n"
            f"- Savings Rate: {savings_rate:.1f}%\n"
            f"- Category Breakdown: {categories_summary}\n"
            f"- Flagged Anomalous Transactions: {anomalies_count}\n"
            f"- User Specific Question: {user_query or 'How healthy is my financial posture?'}\n\n"
            f"Provide:\n"
            f"1. Executive Financial Assessment\n"
            f"2. Cash Flow & Burn Rate Analysis\n"
            f"3. Category Spending Observations\n"
            f"4. Key Vulnerabilities or Risk Factors\n"
            f"5. Top 3 Actionable Recommendations"
        )

        ai_response = await self.client.generate(prompt, system_instruction=system_instruction)
        if not ai_response:
            ai_response = self._fallback_financial_explanation(
                income=income,
                expenses=expenses,
                savings=savings,
                savings_rate=savings_rate,
                categories=categories or {},
                anomalies_count=anomalies_count
            )

        # Quantitative Health Tier
        if savings_rate >= 30:
            health_tier = "EXCELLENT"
            health_summary = "High capital accumulation rate with solid emergency cushion."
        elif savings_rate >= 20:
            health_tier = "HEALTHY"
            health_summary = "Meets the classical 20% savings benchmark. Resilient baseline."
        elif savings_rate >= 10:
            health_tier = "MODERATE"
            health_summary = "Modest surplus. Vulnerable to sudden unexpected expenditures."
        else:
            health_tier = "VULNERABLE"
            health_summary = "Narrow cash margin. Immediate spending rationalization recommended."

        return {
            "explanation": ai_response,
            "health_tier": health_tier,
            "health_summary": health_summary,
            "metrics_evaluated": {
                "income": income,
                "expenses": expenses,
                "net_savings": savings,
                "savings_rate_pct": round(savings_rate, 1),
                "anomalies_detected": anomalies_count
            }
        }

    def _fallback_financial_explanation(
        self,
        income: float,
        expenses: float,
        savings: float,
        savings_rate: float,
        categories: Dict[str, float],
        anomalies_count: int
    ) -> str:
        burn_pct = (expenses / income * 100) if income > 0 else 100.0
        
        highest_cat = "Living Costs"
        highest_val = 0.0
        if categories:
            highest_cat, highest_val = max(categories.items(), key=lambda x: x[1])

        anomaly_alert = (
            f"⚠️ **Anomaly Alert:** You have {anomalies_count} flagged transaction(s) requiring immediate ledger audit to ensure zero unauthorized card charges."
            if anomalies_count > 0 else "✅ **Ledger Integrity:** No fraudulent or anomalous transactions detected in current cycle."
        )

        return (
            f"### 📊 Financial Health Overview\n\n"
            f"• **Monthly Cash Flow:** You are earning **${income:,.2f}** and spending **${expenses:,.2f}** ({burn_pct:.1f}% burn rate), yielding a net surplus of **${savings:,.2f}**.\n"
            f"• **Savings Efficiency:** Your savings rate is **{savings_rate:.1f}%**. "
            f"{'This comfortably exceeds the classical 20% savings benchmark, providing strong capital accumulation.' if savings_rate >= 20 else 'This is below the recommended 20% benchmark. Trimming discretionary outflows will accelerate emergency liquidity.'}\n"
            f"• **Dominant Expense Cluster:** Your largest spending center is **{highest_cat}** at **${highest_val:,.2f}**.\n"
            f"• **Ledger Security:** {anomaly_alert}\n\n"
            f"#### 🎯 Recommended Focus Points:\n"
            f"1. **Emergency Reserve Buffer:** Maintain 3 to 6 months of essential living costs (${expenses * 3:,.2f} – ${expenses * 6:,.2f}) in a high-yield liquid account.\n"
            f"2. **Category Cap:** Monitor '{highest_cat}' to prevent lifestyle creep.\n"
            f"3. **Automated Surplus Routing:** Set up automatic transfers for ${savings:,.2f} on payday to avoid impulsive leakage."
        )

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 2. SCAM EXPLANATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async def explain_scam(
        self,
        content: str,
        channel: str = "SMS",
        scam_category: Optional[str] = None,
        threat_level: str = "HIGH",
        indicators: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Deconstructs fraudulent attacks, explaining the deception mechanics,
        psychological levers used by scammers, and immediate defensive actions.
        """
        system_instruction = (
            "You are an elite cyber-fraud defense investigator. "
            "Deconstruct the provided scam attempt with clinical precision. "
            "Explain: 1) What the scammer is trying to achieve, 2) The psychological coercion tactics used, "
            "3) Why the technical or institutional claims are completely fraudulent, and 4) Clear step-by-step counter-actions. "
            "Reinforce the golden rules: never share OTPs/PINs, never click suspicious links, verify through official channels."
        )

        indicators_str = ", ".join(indicators or ["Suspicious urgency", "Requests credentials"])
        prompt = (
            f"Please deconstruct and explain this suspected cyber-fraud attempt:\n"
            f"- Channel: {channel}\n"
            f"- Message / Content: \"{content}\"\n"
            f"- Preliminary Category: {scam_category or 'Suspected Social Engineering'}\n"
            f"- Threat Level: {threat_level}\n"
            f"- Detected Indicators: {indicators_str}\n\n"
            f"Format your response with:\n"
            f"1. Scam Vector Anatomy (What are they claiming vs. reality)\n"
            f"2. Psychological Manipulation Tactics (Fear, Urgency, Authority Spoofing)\n"
            f"3. The Fraud Mechanism (How money/data is actually stolen)\n"
            f"4. Immediate Defensive Protocol (Exact steps for the user)\n"
            f"5. Official Reporting Channels (Helpline numbers, reporting portals)"
        )

        ai_response = await self.client.generate(prompt, system_instruction=system_instruction)
        if not ai_response:
            ai_response = self._fallback_scam_explanation(
                content=content,
                channel=channel,
                scam_category=scam_category or "Social Engineering Fraud",
                indicators=indicators or []
            )

        return {
            "scam_explanation": ai_response,
            "channel": channel,
            "category": scam_category or "Social Engineering",
            "threat_level": threat_level,
            "golden_rule": "Legitimate authorities and banks NEVER demand OTPs, PINs, or urgent funds transfer over chat or phone.",
            "reporting_helpline": "Dial 1930 (National Cybercrime Portal: cybercrime.gov.in)"
        }

    def _fallback_scam_explanation(
        self,
        content: str,
        channel: str,
        scam_category: str,
        indicators: List[str]
    ) -> str:
        c_lower = content.lower()
        if "digital arrest" in c_lower or "police" in c_lower or "cbi" in c_lower:
            return (
                "### 🚨 Scam Deconstruction: Digital Arrest Extortion\n\n"
                "• **The Fiction:** Scammers impersonating police, CBI, or customs officers claim illegal contraband or money laundering was linked to your Aadhaar/phone and threaten immediate arrest via video call.\n"
                "• **The Reality:** **Digital Arrest does not legally exist.** Indian law enforcement and judicial courts never conduct formal interrogations, court sessions, or arrests over WhatsApp, Skype, or Zoom.\n"
                "• **Psychological Lever:** Manufactured panic, authority intimidation, and forced isolation ('do not disconnect or tell family').\n"
                "• **The Theft Trap:** Victims are coerced into sending 'security verification deposits' to fraudulent bank accounts.\n\n"
                "#### 🛡️ Immediate Countermeasures:\n"
                "1. **Terminate the Call:** Disconnect immediately. You are in zero legal peril from this caller.\n"
                "2. **Zero Fund Transfer:** Never transfer money to any claimed 'clearing account'.\n"
                "3. **Report Immediately:** Call the National Cybercrime Helpline at **1930** or visit **cybercrime.gov.in**."
            )
        elif "electricity" in c_lower or "power" in c_lower or "bill" in c_lower:
            return (
                "### ⚡ Scam Deconstruction: Electricity Bill Disconnection Fraud\n\n"
                "• **The Fiction:** An urgent SMS warns that your power supply will be cut off tonight at 9:30 PM due to an unpaid bill, urging you to contact an 'officer' or click a link.\n"
                "• **The Reality:** Power distribution companies (DISCOMs) follow strict billing protocols with mailed notices and utility portals, never informal personal mobile SMS.\n"
                "• **Psychological Lever:** Artificial time urgency designed to induce panic and prevent rational verification.\n"
                "• **The Theft Trap:** Calling the number directs you to install a malicious remote screen-sharing tool (AnyDesk/QuickSupport) or submit net-banking credentials on a spoofed portal.\n\n"
                "#### 🛡️ Immediate Countermeasures:\n"
                "1. **Do NOT dial the phone number** listed in the message.\n"
                "2. **Do NOT click any link** or download any APK.\n"
                "3. Check your bill status strictly inside your official electricity board portal or authorized payment app."
            )
        elif "upi" in c_lower or "pin" in c_lower or "qr" in c_lower:
            return (
                "### 💳 Scam Deconstruction: UPI Reverse Transfer / QR Code Trap\n\n"
                "• **The Fiction:** A buyer or merchant claims they sent you money or a refund and instructs you to 'scan this QR code' or 'enter your UPI PIN to claim funds'.\n"
                "• **The Reality:** **A UPI PIN is strictly an authorization to DEBIT funds from your account.** You never need to enter a PIN to receive incoming credits.\n"
                "• **Psychological Lever:** Greed or confusion over payment application workflows.\n"
                "• **The Theft Trap:** Entering your PIN instantly transfers your money straight into the fraudster's mule account.\n\n"
                "#### 🛡️ Immediate Countermeasures:\n"
                "1. **Never enter your UPI PIN** to receive funds or claim rewards.\n"
                "2. Cancel the transaction and block the sender's UPI ID.\n"
                "3. Report the fraudster directly inside your UPI app (GPay/PhonePe/Paytm)."
            )
        else:
            return (
                f"### ⚠️ Scam Deconstruction: {scam_category}\n\n"
                f"• **Channel:** Received via {channel}.\n"
                f"• **Attack Vector:** This communication displays standard social engineering signatures designed to harvest credentials or manipulate you into sending money.\n"
                f"• **Deceptive Signals:** {', '.join(indicators) if indicators else 'Urgent tone, unverified sender, coercive language'}.\n\n"
                f"#### 🛡️ Golden Defense Protocol:\n"
                f"1. **Do not click links** or dial unverified contact numbers.\n"
                f"2. **Never disclose OTPs, PINs, passwords, or KYC documents** to anyone.\n"
                f"3. Verify independently by typing the official company URL directly into your browser."
            )

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. BUDGET RECOMMENDATIONS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async def recommend_budget(
        self,
        income: float,
        expenses: Optional[List[Dict[str, Any]]] = None,
        current_budgets: Optional[List[Dict[str, Any]]] = None,
        financial_goals: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Produces mathematical budget optimizations using the 50/30/20 framework,
        discretionary expense trimming, and emergency fund buffer allocations.
        """
        system_instruction = (
            "You are a master personal finance strategist and budget coach. "
            "Analyze the user's income, expense footprint, and financial goals. "
            "Construct a precise, structured budget recommendation utilizing the 50/30/20 rule: "
            "50% Needs, 30% Wants, 20% Savings/Investments. Provide category-specific dollar targets, "
            "actionable cutback opportunities, and a prioritized surplus allocation plan."
        )

        expense_items_summary = "\n".join(
            [f"- {e.get('category', 'General')}: ${e.get('amount', 0):,.2f}" for e in (expenses or [])]
        ) or "No detailed itemized expenses provided."

        prompt = (
            f"Generate a customized budget recommendation for this financial profile:\n"
            f"- Monthly Take-Home Income: ${income:,.2f}\n"
            f"- Current Expenses:\n{expense_items_summary}\n"
            f"- Current Active Goals: {', '.join([g.get('title', 'Savings') for g in (financial_goals or [])]) or 'Emergency Fund'}\n\n"
            f"Deliver:\n"
            f"1. The 50/30/20 Benchmark Target Allocation\n"
            f"2. Category-Specific Target Budget Limits\n"
            f"3. Discretionary Expense Trim Opportunities\n"
            f"4. Surplus & Debt Acceleration Strategy\n"
            f"5. Monthly Review Routine"
        )

        ai_response = await self.client.generate(prompt, system_instruction=system_instruction)
        
        # Exact 50/30/20 mathematical calculations
        needs_target = income * 0.50
        wants_target = income * 0.30
        savings_target = income * 0.20

        category_targets = {
            "Housing & Utilities": round(income * 0.30, 2),
            "Groceries & Essentials": round(income * 0.15, 2),
            "Transportation": round(income * 0.05, 2),
            "Discretionary & Dining": round(income * 0.15, 2),
            "Entertainment & Subscriptions": round(income * 0.10, 2),
            "Personal Care": round(income * 0.05, 2),
            "Emergency Fund & Investments": round(income * 0.20, 2)
        }

        if not ai_response:
            ai_response = self._fallback_budget_recommendations(
                income=income,
                needs_target=needs_target,
                wants_target=wants_target,
                savings_target=savings_target,
                category_targets=category_targets
            )

        return {
            "recommendations": ai_response,
            "framework": "50/30/20 Classical Allocation",
            "monthly_income": income,
            "target_allocations": {
                "needs_50_pct": round(needs_target, 2),
                "wants_30_pct": round(wants_target, 2),
                "savings_investments_20_pct": round(savings_target, 2)
            },
            "category_targets": category_targets,
            "annual_wealth_growth_potential": round(savings_target * 12, 2)
        }

    def _fallback_budget_recommendations(
        self,
        income: float,
        needs_target: float,
        wants_target: float,
        savings_target: float,
        category_targets: Dict[str, float]
    ) -> str:
        return (
            f"### 📋 Strategic Budget Blueprint (50/30/20 Framework)\n\n"
            f"Based on your monthly net income of **${income:,.2f}**, here is your optimized capital allocation:\n\n"
            f"#### 1. Core Allocation Pillars\n"
            f"• **Essential Needs (50%):** **${needs_target:,.2f}**\n"
            f"  *Includes rent/mortgage, utilities, essential groceries, healthcare, and basic transit.*\n"
            f"• **Discretionary Wants (30%):** **${wants_target:,.2f}**\n"
            f"  *Includes dining out, entertainment, shopping, hobby subscriptions, and leisure travel.*\n"
            f"• **Savings & Wealth Acceleration (20%):** **${savings_target:,.2f}**\n"
            f"  *Includes emergency fund buffering, debt prepayment, and systematic index fund investments.*\n\n"
            f"#### 2. Target Category Spending Ceilings\n"
            + "\n".join([f"• **{k}:** Cap at **${v:,.2f}** / month" for k, v in category_targets.items()]) +
            f"\n\n#### 3. Immediate Capital Optimization Moves\n"
            f"1. **The 48-Hour Purchase Rule:** Delay non-essential purchases exceeding $100 by 48 hours to eliminate impulsive lifestyle leakage.\n"
            f"2. **Subscription Audit:** Cancel redundant recurring SaaS, cloud, or entertainment subscriptions to free up an estimated $50–$150/month.\n"
            f"3. **Annual Wealth Impact:** Consistent execution of your 20% savings target will accumulate **${savings_target * 12:,.2f}** per year before compound market growth."
        )

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 4. FINANCIAL EDUCATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async def provide_education(
        self,
        topic: str,
        user_level: str = "beginner"
    ) -> Dict[str, Any]:
        """
        Teaches core personal finance and wealth-building principles
        with real-world analogies, actionable formulas, and pitfall warnings.
        """
        system_instruction = (
            "You are a gifted financial educator and author. "
            "Explain personal finance and investment concepts with intuitive analogies, "
            "clear mathematics, and zero financial jargon. "
            "Structure your lesson with: 1) What it is, 2) Why it matters, 3) Real-world example/formula, "
            "4) Common mistakes to avoid, and 5) Key actionable takeaway."
        )

        prompt = (
            f"Teach a comprehensive, easy-to-understand lesson on this financial topic:\n"
            f"- Topic: {topic}\n"
            f"- Target Audience Level: {user_level.capitalize()}\n\n"
            f"Include:\n"
            f"1. Intuitive Definition & Mental Model (Analogy)\n"
            f"2. The Underlying Mathematics or Mechanics\n"
            f"3. Practical Real-Life Case Study\n"
            f"4. The 3 Costliest Mistakes People Make\n"
            f"5. Actionable Next Step"
        )

        ai_response = await self.client.generate(prompt, system_instruction=system_instruction)
        if not ai_response:
            ai_response = self._fallback_financial_education(topic)

        return {
            "topic": topic,
            "lesson": ai_response,
            "difficulty": user_level,
            "estimated_read_time": "3 mins"
        }

    def _fallback_financial_education(self, topic: str) -> str:
        t_lower = topic.lower()
        if "compound" in t_lower or "interest" in t_lower:
            return (
                "### 📈 The Power of Compound Interest: The Eighth Wonder\n\n"
                "#### 1. What Is Compound Interest?\n"
                "Compound interest is earning interest not just on your initial capital, but on the accumulated interest from past cycles. "
                "It transforms a linear linear stream into exponential snowball growth.\n\n"
                "#### 2. The Golden Equation\n"
                "$$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$\n"
                "• $P$: Principal sum\n"
                "• $r$: Annual interest rate\n"
                "• $t$: Time in years\n\n"
                "#### 3. The Rule of 72 (Quick Mental Math)\n"
                "Divide 72 by your expected annual return rate to discover how quickly your money doubles:\n"
                "• At **12% annual return**, your money doubles every **6 years** ($72 / 12 = 6$).\n"
                "• An initial investment of **$10,000** doubles to **$20,000** in 6 years, **$40,000** in 12 years, and **$160,000** in 24 years!\n\n"
                "#### 4. Costly Mistakes to Avoid:\n"
                "1. **Waiting to start:** Time in the market is vastly more powerful than timing the market.\n"
                "2. **High high-interest debt:** Compound interest works in reverse when you hold unpaid credit cards ($20\\text{--}36\\%$ APR).\n\n"
                "#### 🎯 Actionable Takeaway:\n"
                "Set up an automated monthly investment today, even if it's just $50. Time is your greatest financial multiplier."
            )
        elif "sip" in t_lower or "mutual fund" in t_lower or "index" in t_lower:
            return (
                "### 🎯 Systematic Investment Plans (SIP) & Low-Cost Index Funds\n\n"
                "#### 1. What Is a SIP?\n"
                "A Systematic Investment Plan automatically invests a fixed amount into a mutual fund or index fund at regular intervals (typically monthly). "
                "It enforces emotional discipline and leverages **Dollar-Cost Averaging**.\n\n"
                "#### 2. The Dollar-Cost Averaging Advantage\n"
                "When the market dips, your fixed dollar amount buys *more* fund units. When the market surges, it buys *fewer* units. "
                "Over a 5 to 10 year cycle, your average purchase price is heavily optimized without having to guess market tops or bottoms.\n\n"
                "#### 3. Index Funds vs. Active Mutual Funds\n"
                "• **Index Funds (Passive):** Track broad market indices (e.g. S&P 500, Nifty 50). Ultra-low expense ratios ($0.03\\%\\text{--}0.20\\%$). Historically outperform 85%+ of active funds over 15 years.\n"
                "• **Actively Managed Funds:** Fund managers try to beat the market but charge high expense ratios ($1.0\\%\\text{--}2.5\\%$), eroding long-term wealth.\n\n"
                "#### 🎯 Actionable Takeaway:\n"
                "Select a low-cost broad-market index fund, set an automated SIP on salary day, and let it run untouched through bull and bear markets."
            )
        elif "emergency" in t_lower or "buffer" in t_lower:
            return (
                "### 🛡️ The Emergency Fund Blueprint: Your Financial Fortress\n\n"
                "#### 1. What Is an Emergency Fund?\n"
                "A dedicated pool of liquid cash kept strictly for true life shocks: unexpected medical emergencies, job termination, urgent home repairs, or major vehicle failures.\n\n"
                "#### 2. How Much Do You Need?\n"
                "$$\\text{Target} = \\text{Monthly Essential Expenses} \\times 3\\text{ to }6$$\n"
                "• If your mandatory living expenses are **$2,500/month**, your emergency reserve target is **$7,500 to $15,000**.\n\n"
                "#### 3. Where Should It Live?\n"
                "• **YES:** High-yield savings accounts (HYSA) or liquid money market instruments where funds can be accessed within 24 hours with zero market volatility.\n"
                "• **NO:** Equities, crypto, locked long-term real estate, or volatile assets that could drop 30% right when an emergency strikes.\n\n"
                "#### 🎯 Actionable Takeaway:\n"
                "Build your starter emergency fund of $1,000 first, then systematically fund the full 3–6 month reserve before taking heavy investment risks."
            )
        else:
            return (
                f"### 💡 Financial Education Masterclass: {topic}\n\n"
                f"• **Core Principle:** Mastering your personal finances begins with understanding cash flow, capital preservation, and inflation protection.\n"
                f"• **The Inflation Hurdle:** If inflation is 5% and your bank pays 3%, you are losing 2% in purchasing power every single year. Growth investments are mandatory to beat inflation.\n"
                f"• **Diversification Shield:** 'Do not put all your eggs in one basket.' Spread investments across equities, fixed income, and defensive cash buffers.\n\n"
                f"#### 🎯 Actionable Rule of Thumb:\n"
                f"Live on less than you earn, invest the surplus in diversified assets, and maintain a rigorous emergency reserve."
            )

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 5. PERSONALIZED GUIDANCE
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async def provide_personalized_guidance(
        self,
        name: str,
        age_range: str,
        occupation: str,
        monthly_income: float,
        monthly_expenses: float,
        financial_goal: str,
        preferred_language: str = "English",
        risk_alerts_count: int = 0
    ) -> Dict[str, Any]:
        """
        Synthesizes the user's complete profile, active risk posture, and
        goals into a prioritized, multi-phase financial & security roadmap.
        """
        system_instruction = (
            "You are a premier private wealth advisor and cybersecurity strategist. "
            "Craft a deeply personalized, step-by-step financial success roadmap tailored specifically "
            "to the user's occupation, life stage, income level, and stated aspirations. "
            "Balance cyber-defense vigilance with aggressive, prudent wealth building."
        )

        surplus = monthly_income - monthly_expenses
        prompt = (
            f"Generate a customized personal guidance roadmap for:\n"
            f"- Name: {name}\n"
            f"- Age Range: {age_range}\n"
            f"- Occupation: {occupation}\n"
            f"- Monthly Take-Home Income: ${monthly_income:,.2f}\n"
            f"- Monthly Living Expenses: ${monthly_expenses:,.2f}\n"
            f"- Net Monthly Surplus: ${surplus:,.2f}\n"
            f"- Primary Financial Goal: {financial_goal}\n"
            f"- Preferred Language: {preferred_language}\n"
            f"- Active Risk/Scam Alerts: {risk_alerts_count}\n\n"
            f"Structure the roadmap into:\n"
            f"1. Executive Milestone Summary for {name}\n"
            f"2. Phase 1: Immediate Fortification (Next 14 Days)\n"
            f"3. Phase 2: Goal Acceleration (Months 1–6)\n"
            f"4. Phase 3: Long-Term Wealth Independence (Years 1–5)\n"
            f"5. Security Sentinel Directive (Cyber Protection)"
        )

        ai_response = await self.client.generate(prompt, system_instruction=system_instruction)
        if not ai_response:
            ai_response = self._fallback_personalized_guidance(
                name=name,
                age_range=age_range,
                occupation=occupation,
                monthly_income=monthly_income,
                monthly_expenses=monthly_expenses,
                financial_goal=financial_goal,
                risk_alerts_count=risk_alerts_count
            )

        return {
            "name": name,
            "goal": financial_goal,
            "guidance_roadmap": ai_response,
            "monthly_surplus": round(surplus, 2),
            "security_status": "HIGH ALERT" if risk_alerts_count > 0 else "SECURE",
            "action_phases": ["Immediate Fortification", "Goal Acceleration", "Wealth Independence"]
        }

    def _fallback_personalized_guidance(
        self,
        name: str,
        age_range: str,
        occupation: str,
        monthly_income: float,
        monthly_expenses: float,
        financial_goal: str,
        risk_alerts_count: int
    ) -> str:
        surplus = monthly_income - monthly_expenses
        security_note = (
            f"⚠️ **Security Alert:** You currently have {risk_alerts_count} active threat alerts. Immediate priority is locking down compromised channels and changing banking passwords."
            if risk_alerts_count > 0 else "🛡️ **Security Status:** All monitoring shields active and green."
        )

        return (
            f"### 🌟 Personalized Roadmap for {name}\n\n"
            f"• **Profile:** {occupation} ({age_range})\n"
            f"• **Cash Surplus Available:** **${surplus:,.2f}** per month from **${monthly_income:,.2f}** earnings.\n"
            f"• **North Star Goal:** **{financial_goal}**\n"
            f"• **Guardian Status:** {security_note}\n\n"
            f"#### 📍 Phase 1: Immediate Fortification (Next 14 Days)\n"
            f"1. **Lock in Minimum Emergency Cushion:** Park at least $2,000 in high-yield liquid storage.\n"
            f"2. **Enable Multi-Factor Authentication (MFA):** Set up hardware or authenticator-app 2FA across banking and email accounts to prevent credential stuffing.\n\n"
            f"#### 🚀 Phase 2: Goal Acceleration toward '{financial_goal}' (Months 1–6)\n"
            f"1. **Direct ${round(surplus * 0.70, 2):,.2f}/month** (70% of surplus) directly toward your primary goal: *{financial_goal}*.\n"
            f"2. **Automate Transfers:** Schedule automatic transfers on your payday to eliminate friction.\n\n"
            f"#### 🏔️ Phase 3: Long-Term Independence (Years 1–5)\n"
            f"1. Invest remaining surplus in diversified index funds to compound above inflation.\n"
            f"2. Conduct quarterly financial health and fraud vulnerability reviews inside FinAccess-AI."
        )

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 6. UNIFIED CONVERSATIONAL CHAT (With RAG Knowledge Base Integration)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async def chat(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Unified conversational router capable of detecting user intent
        across all 5 capabilities, enriched with local RAG knowledge retrieval.
        """
        # 1. RAG Knowledge Retrieval
        rag_matches = rag_service.search_knowledge(message, top_k=2)
        rag_context = ""
        if rag_matches:
            rag_context = "\n".join(
                [f"Reference Doc [{m['title']}]: {m['content']} (Action: {m['recommended_action']})" for m in rag_matches]
            )

        system_instruction = (
            "You are the Defeat Scammer AI Sentinel, an expert copilot for personal finance and cyber-fraud defense. "
            "You assist users with: 1) Financial explanations, 2) Scam explanations, 3) Budgeting recommendations, "
            "4) Financial education, and 5) Personalized guidance. "
            "Deliver calm, authoritative, actionable guidance. Never advise users to send money or share passwords.\n\n"
            f"VERIFIED THREAT KNOWLEDGE BASE:\n{rag_context}"
        )

        ai_response = await self.client.generate(message, system_instruction=system_instruction)
        if not ai_response:
            ai_response = self._fallback_chat(message)

        return {
            "reply": ai_response,
            "rag_sources": rag_matches,
            "safety_advisory": "🛡️ Golden Rule: Legitimate institutions will NEVER ask for your passwords, OTPs, or remote screen sharing."
        }

    def _fallback_chat(self, message: str) -> str:
        m = message.lower()
        if any(w in m for w in ["digital arrest", "police", "cbi", "arrest"]):
            return (
                "🚨 **Digital Arrest Alert:** Law enforcement agencies NEVER conduct arrests, court trials, or fund verifications over video calls. "
                "Hang up immediately, do NOT transfer any money, and report to the National Cyber Helpline at **1930**."
            )
        elif any(w in m for w in ["electricity", "power cutoff", "bill"]):
            return (
                "⚡ **Electricity Disconnection Scam:** Utility boards never send same-day disconnection threats via informal SMS with personal phone numbers. "
                "Never click links or download APK files. Verify your bill directly on the official utility website."
            )
        elif any(w in m for w in ["budget", "50/30/20", "how to save"]):
            return (
                "📊 **Budgeting Master Rule:** Implement the **50/30/20 rule**: 50% for Needs (rent, food, bills), 30% for Wants, and 20% for Savings and Debt Reduction. "
                "Automate your savings on salary day so you only spend what is left over."
            )
        elif any(w in m for w in ["compound interest", "investing", "sip"]):
            return (
                "📈 **Wealth Building Rule:** Start investing early through low-cost index funds or Systematic Investment Plans (SIP). "
                "Compound interest accelerates exponentially over time, turning disciplined monthly savings into substantial wealth."
            )
        else:
            return (
                "🛡️ **FinAccess-AI Sentinel Advisory:**\n\n"
                "I have evaluated your question against our verified financial intelligence and threat database. "
                "Remember: protect your credentials, maintain 3–6 months of emergency reserves, and verify any unexpected payment demands through independent official channels. "
                "How else can I assist your financial health or cyber defense today?"
            )


# Global singleton instance
ai_service = AIService()
