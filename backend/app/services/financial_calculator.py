import re
import math
from typing import Dict, Any, Optional, List

class FinancialCalculator:
    """
    Phase 13 — Financial Calculator.
    Provides mathematically verified calculations for personal finance,
    lending, investments, and cash flow budgeting.
    """

    @staticmethod
    def calculate_emi(principal: float, annual_rate_pct: float, tenure_months: int) -> Dict[str, Any]:
        """
        Calculates Equated Monthly Installment (EMI).
        Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        where r is monthly interest rate, n is tenure in months.
        """
        if principal <= 0 or tenure_months <= 0:
            return {"emi": 0.0, "total_payment": 0.0, "total_interest": 0.0}

        monthly_rate = (annual_rate_pct / 100.0) / 12.0
        if monthly_rate == 0:
            emi = principal / tenure_months
        else:
            factor = math.pow(1 + monthly_rate, tenure_months)
            emi = principal * monthly_rate * factor / (factor - 1)

        total_payment = emi * tenure_months
        total_interest = total_payment - principal

        return {
            "principal": round(principal, 2),
            "annual_rate_pct": round(annual_rate_pct, 2),
            "tenure_months": tenure_months,
            "monthly_emi": round(emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2),
            "interest_to_principal_ratio": round((total_interest / principal) * 100, 1) if principal > 0 else 0.0
        }

    @staticmethod
    def calculate_50_30_20_budget(monthly_income: float) -> Dict[str, Any]:
        """
        Standard 50/30/20 Budgeting breakdown.
        Needs: 50%, Wants: 30%, Savings/Debt payoff: 20%
        """
        income = max(0.0, float(monthly_income))
        return {
            "monthly_income": round(income, 2),
            "needs_50": round(income * 0.50, 2),
            "wants_30": round(income * 0.30, 2),
            "savings_20": round(income * 0.20, 2),
            "annual_savings_potential": round(income * 0.20 * 12, 2)
        }

    @staticmethod
    def calculate_emergency_fund(monthly_expenses: float, months: int = 6) -> Dict[str, Any]:
        """
        Calculates recommended emergency fund reserves (3–6 months standard).
        """
        expenses = max(0.0, float(monthly_expenses))
        target_reserves = expenses * months
        return {
            "monthly_expenses": round(expenses, 2),
            "recommended_months": months,
            "minimum_target_3_months": round(expenses * 3, 2),
            "recommended_target": round(target_reserves, 2),
            "cushion_purpose": "Unforeseen medical expenses, job transition, or sudden cyber/emergency expenses"
        }

    @staticmethod
    def calculate_savings_rate(income: float, expenses: float) -> Dict[str, Any]:
        """Calculates savings rate and monthly surplus."""
        surplus = income - expenses
        rate = (surplus / income * 100.0) if income > 0 else 0.0
        tier = "Excellent" if rate >= 30 else ("Healthy" if rate >= 20 else ("Moderate" if rate >= 10 else "Vulnerable"))
        return {
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "monthly_surplus": round(surplus, 2),
            "savings_rate_pct": round(rate, 1),
            "tier": tier
        }

    @staticmethod
    def calculate_debt_to_income(monthly_debt_obligations: float, gross_monthly_income: float) -> Dict[str, Any]:
        """Calculates Debt-to-Income (DTI) ratio."""
        dti = (monthly_debt_obligations / gross_monthly_income * 100.0) if gross_monthly_income > 0 else 0.0
        health = "Healthy (<36%)" if dti <= 36 else ("Manageable (36-43%)" if dti <= 43 else "Dangerous (>43%)")
        return {
            "monthly_debt_obligations": round(monthly_debt_obligations, 2),
            "gross_monthly_income": round(gross_monthly_income, 2),
            "dti_percentage": round(dti, 1),
            "health_status": health,
            "max_safe_borrowing_limit": round(gross_monthly_income * 0.36, 2)
        }

    @staticmethod
    def calculate_compound_growth(monthly_sip: float, annual_return_pct: float, years: int) -> Dict[str, Any]:
        """
        Calculates SIP compound growth over given years.
        Formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
        """
        n = years * 12
        i = (annual_return_pct / 100.0) / 12.0
        if i == 0:
            fv = monthly_sip * n
        else:
            fv = monthly_sip * ((math.pow(1 + i, n) - 1) / i) * (1 + i)

        invested_capital = monthly_sip * n
        wealth_gain = fv - invested_capital

        return {
            "monthly_sip": round(monthly_sip, 2),
            "tenure_years": years,
            "annual_return_pct": round(annual_return_pct, 1),
            "total_invested": round(invested_capital, 2),
            "estimated_wealth_value": round(fv, 2),
            "wealth_gain": round(wealth_gain, 2)
        }

    def detect_and_calculate(self, text: str, user_context: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """
        Scans text for financial calculation triggers and executes appropriate computation.
        """
        text_lower = text.lower()
        context = user_context or {}

        # 1. EMI Calculation Detection
        emi_match = re.search(r"(?:emi|loan)\s+(?:for|of)?\s*₹?\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:at|@)\s*(\d+(?:\.\d+)?)\s*%\s*(?:for)?\s*(\d+)\s*(?:years|yrs|months|m)", text_lower)
        if emi_match:
            try:
                principal = float(emi_match.group(1).replace(",", ""))
                rate = float(emi_match.group(2))
                tenure_raw = int(emi_match.group(3))
                is_years = "month" not in text_lower[emi_match.start():emi_match.end()]
                tenure_months = tenure_raw * 12 if is_years else tenure_raw
                return {
                    "type": "emi_calculation",
                    "details": self.calculate_emi(principal, rate, tenure_months)
                }
            except Exception:
                pass

        # 2. Budget / 50-30-20 Detection
        budget_match = re.search(r"(?:earn|salary|income|make)\s*(?:of)?\s*₹?\$?(\d+(?:,\d+)*(?:\.\d+)?)", text_lower)
        if ("budget" in text_lower or "50/30/20" in text_lower or "save" in text_lower) and budget_match:
            try:
                income = float(budget_match.group(1).replace(",", ""))
                return {
                    "type": "budget_allocation",
                    "details": self.calculate_50_30_20_budget(income)
                }
            except Exception:
                pass

        # 3. Emergency Fund Detection
        if "emergency fund" in text_lower or "emergency reserve" in text_lower:
            exp_match = re.search(r"(?:spend|expense|costs?)\s*(?:is|of)?\s*₹?\$?(\d+(?:,\d+)*(?:\.\d+)?)", text_lower)
            expenses = float(exp_match.group(1).replace(",", "")) if exp_match else context.get("expenses", 25000.0)
            return {
                "type": "emergency_fund",
                "details": self.calculate_emergency_fund(expenses)
            }

        # 4. SIP / Investment Growth Detection
        sip_match = re.search(r"(?:sip|invest)\s*(?:of)?\s*₹?\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:for)?\s*(\d+)\s*(?:years|yrs)", text_lower)
        if sip_match:
            try:
                sip_amount = float(sip_match.group(1).replace(",", ""))
                years = int(sip_match.group(2))
                return {
                    "type": "compound_growth",
                    "details": self.calculate_compound_growth(sip_amount, annual_return_pct=12.0, years=years)
                }
            except Exception:
                pass

        # Check if context provides income & expenses
        if context.get("income") and context.get("expenses") and any(k in text_lower for k in ["rate", "saving", "health"]):
            return {
                "type": "savings_rate",
                "details": self.calculate_savings_rate(context["income"], context["expenses"])
            }

        return None

financial_calculator = FinancialCalculator()
