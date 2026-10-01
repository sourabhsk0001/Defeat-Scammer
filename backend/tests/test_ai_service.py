import unittest
import asyncio
from app.services.ai_service import AIService

class TestAIService(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.ai = AIService()

    async def test_financial_explanation(self):
        res = await self.ai.explain_finances(
            income=30000.0,
            expenses=21500.0,
            savings=8500.0,
            savings_rate=28.3,
            categories={"Living": 12000.0, "Food": 5500.0, "Transport": 4000.0},
            anomalies_count=2
        )
        self.assertIn("explanation", res)
        self.assertIn(res["health_tier"], ["HEALTHY", "EXCELLENT", "MODERATE"])
        self.assertEqual(res["metrics_evaluated"]["income"], 30000.0)
        self.assertEqual(res["metrics_evaluated"]["anomalies_detected"], 2)

    async def test_scam_explanation(self):
        res = await self.ai.explain_scam(
            content="Your electricity power will be disconnected tonight at 9:30 PM. Call officer at 98112-99881.",
            channel="SMS",
            scam_category="Electricity Bill Fraud",
            threat_level="CRITICAL",
            indicators=["Urgent language", "Threat of disconnection"]
        )
        self.assertIn("scam_explanation", res)
        self.assertEqual(res["channel"], "SMS")
        self.assertEqual(res["threat_level"], "CRITICAL")
        self.assertIn("1930", res["reporting_helpline"])

    async def test_budget_recommendations(self):
        res = await self.ai.recommend_budget(
            income=30000.0,
            expenses=[
                {"category": "Rent", "amount": 10000.0},
                {"category": "Groceries", "amount": 5000.0}
            ]
        )
        self.assertIn("recommendations", res)
        self.assertEqual(res["framework"], "50/30/20 Classical Allocation")
        # 50% of 30,000 = 15,000
        self.assertEqual(res["target_allocations"]["needs_50_pct"], 15000.0)
        # 30% of 30,000 = 9,000
        self.assertEqual(res["target_allocations"]["wants_30_pct"], 9000.0)
        # 20% of 30,000 = 6,000
        self.assertEqual(res["target_allocations"]["savings_investments_20_pct"], 6000.0)

    async def test_financial_education(self):
        res = await self.ai.provide_education("compound_interest", user_level="beginner")
        self.assertIn("lesson", res)
        self.assertEqual(res["topic"], "compound_interest")
        self.assertIn("Rule of 72", res["lesson"])

    async def test_personalized_guidance(self):
        res = await self.ai.provide_personalized_guidance(
            name="Alex Morgan",
            age_range="26-35",
            occupation="Product Engineer",
            monthly_income=6500.0,
            monthly_expenses=4250.0,
            financial_goal="Buy First Home & Secure Family",
            risk_alerts_count=1
        )
        self.assertIn("guidance_roadmap", res)
        self.assertEqual(res["name"], "Alex Morgan")
        self.assertEqual(res["monthly_surplus"], 2250.0)
        self.assertEqual(res["security_status"], "HIGH ALERT")

    async def test_unified_chat(self):
        res = await self.ai.chat("What should I do if a caller claims to be CBI police on video call?")
        self.assertIn("reply", res)
        self.assertIn("Digital Arrest", res["reply"])

if __name__ == "__main__":
    unittest.main()
