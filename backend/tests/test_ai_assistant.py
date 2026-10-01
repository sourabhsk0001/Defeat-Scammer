import unittest
import asyncio
from app.services.financial_calculator import FinancialCalculator, financial_calculator
from app.services.ai_assistant_service import AIAssistantService, ai_assistant_service

class TestAIAssistantPhase13(unittest.TestCase):
    def setUp(self):
        self.fin_calc = financial_calculator
        self.assistant = ai_assistant_service

    def test_financial_calculator_emi(self):
        # Principal 500,000, 8.5% per annum, 5 years (60 months)
        res = self.fin_calc.calculate_emi(500000, 8.5, 60)
        self.assertAlmostEqual(res["monthly_emi"], 10258.33, delta=1.0)
        self.assertGreater(res["total_interest"], 100000.0)
        self.assertEqual(res["tenure_months"], 60)

    def test_financial_calculator_50_30_20(self):
        res = self.fin_calc.calculate_50_30_20_budget(60000)
        self.assertEqual(res["needs_50"], 30000.0)
        self.assertEqual(res["wants_30"], 18000.0)
        self.assertEqual(res["savings_20"], 12000.0)
        self.assertEqual(res["annual_savings_potential"], 144000.0)

    def test_financial_calculator_emergency_fund(self):
        res = self.fin_calc.calculate_emergency_fund(35000, months=6)
        self.assertEqual(res["minimum_target_3_months"], 105000.0)
        self.assertEqual(res["recommended_target"], 210000.0)

    def test_canonical_kyc_scam_inquiry(self):
        """
        Tests the Phase 13 canonical example:
        'I received a message saying my KYC will expire. Is it safe?'
        Verifies:
        Analyze message -> Extract URL -> Check indicators -> Retrieve relevant safety guidance -> Gemini explanation -> Action steps
        """
        query = "I received a message saying my KYC will expire. Is it safe?"
        response = asyncio.run(self.assistant.assist(query=query, channel="sms"))

        self.assertIsNotNone(response)
        self.assertEqual(response.query, query)
        
        # Verify Safety Engine & Indicators
        self.assertTrue(response.safety_assessment.is_suspicious or len(response.safety_assessment.detected_indicators) > 0)
        self.assertTrue(any("sensitive" in ind.lower() or "threat" in ind.lower() or "urgent" in ind.lower() for ind in response.safety_assessment.detected_indicators))

        # Verify RAG Knowledge Retrieval
        self.assertGreater(len(response.sources), 0)
        self.assertTrue(any(s.jurisdiction for s in response.sources))
        self.assertTrue(any(s.url for s in response.sources))

        # Verify Explanation & Action Steps
        self.assertIn("KYC", response.answer)
        self.assertGreater(len(response.action_steps), 2)
        # Check canonical actions
        action_text = " ".join(response.action_steps).lower()
        self.assertTrue("link" in action_text or "otp" in action_text or "official" in action_text or "branch" in action_text)

        # Verify Pipeline Trace
        self.assertEqual(response.pipeline_trace["step_1_message_analysis"], "Completed")
        self.assertIn("indicators detected", response.pipeline_trace["step_3_indicator_check"])
        self.assertIn("authoritative source", response.pipeline_trace["step_4_rag_retrieval"])

    def test_suspicious_url_phishing_message(self):
        """Tests message with malicious phishing URL."""
        query = "URGENT: Your account suspended. Update KYC at http://sbi-kyc-verify.xyz/login immediately or card blocked."
        response = asyncio.run(self.assistant.assist(query=query, channel="sms"))

        # Verify URL extracted
        self.assertGreater(len(response.safety_assessment.extracted_urls), 0)
        self.assertTrue(any("sbi-kyc-verify.xyz" in u for u in response.safety_assessment.extracted_urls))
        self.assertIn(response.safety_assessment.risk_level, ["HIGH", "CRITICAL"])
        self.assertGreater(len(response.action_steps), 0)

    def test_financial_calculation_query(self):
        """Tests financial question that triggers Financial Calculator."""
        query = "What is the loan EMI of 500000 at 8.5% for 5 years?"
        response = asyncio.run(self.assistant.assist(query=query))

        self.assertIsNotNone(response.financial_calculations)
        self.assertEqual(response.financial_calculations.calculation_type, "emi_calculation")
        self.assertAlmostEqual(response.financial_calculations.details["monthly_emi"], 10258.33, delta=1.0)
        self.assertIn("EMI", response.answer)
        self.assertGreater(len(response.action_steps), 0)

if __name__ == "__main__":
    unittest.main()
