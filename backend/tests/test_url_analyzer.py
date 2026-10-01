import unittest
from app.services.url_analyzer import URLParser, DomainAnalyzer, ThreatIntelligenceEngine, URLAnalyzer

class TestURLAnalyzerPipeline(unittest.TestCase):
    def setUp(self):
        self.analyzer = URLAnalyzer()

    def test_url_parser_standard(self):
        result = URLParser.parse("https://www.example.com/path/to/page?id=123")
        self.assertEqual(result["scheme"], "https")
        self.assertEqual(result["hostname"], "www.example.com")
        self.assertEqual(result["path"], "/path/to/page")
        self.assertEqual(result["query"], "id=123")
        self.assertFalse(result["has_at_symbol"])
        self.assertFalse(result["is_non_standard_port"])

    def test_url_parser_at_symbol_redirect(self):
        result = URLParser.parse("http://google.com@evil-attacker.top/login")
        self.assertTrue(result["has_at_symbol"])
        self.assertEqual(result["hostname"], "evil-attacker.top")

    def test_domain_analyzer_tldextract_and_entropy(self):
        # High entropy DGA-like string
        entropy = DomainAnalyzer.calculate_shannon_entropy("x89zq7a2b91cwk")
        self.assertGreater(entropy, 3.0)

        # Brand spoofing check
        analysis = DomainAnalyzer.analyze(
            hostname="sbi-banking-kyc-update.xyz",
            path="/verify",
            query=""
        )
        self.assertEqual(analysis["domain"], "sbi-banking-kyc-update")
        self.assertEqual(analysis["suffix"], "xyz")
        self.assertTrue(analysis["is_suspicious_tld"])
        self.assertTrue(analysis["is_brand_spoofing"])
        self.assertEqual(analysis["impersonated_brand"], "SBI")

    def test_threat_intelligence_feeds(self):
        intel = ThreatIntelligenceEngine.query_feeds(
            normalized_url="https://sbi-kyc-portal.xyz/login",
            hostname="sbi-kyc-portal.xyz",
            registered_domain="sbi-kyc-portal.xyz",
            is_suspicious_tld=True,
            is_brand_spoofing=True
        )
        self.assertIn("Google Safe Browsing", intel["providers_checked"])
        self.assertIn("VirusTotal", intel["providers_checked"])
        self.assertIn("PhishTank", intel["providers_checked"])
        self.assertIn("URLhaus", intel["providers_checked"])
        self.assertGreater(intel["positive_detections"], 0)
        self.assertEqual(intel["phishtank_status"], "VERIFIED_PHISH")

    def test_full_pipeline_critical_phishing(self):
        res = self.analyzer.analyze("http://sbi-banking-kyc-update.xyz/login?account=confirm")
        self.assertTrue(res.is_phishing)
        self.assertIn(res.threat_level, ["CRITICAL", "HIGH"])
        self.assertGreaterEqual(res.risk_score, 70)
        self.assertEqual(res.impersonated_brand, "SBI")
        self.assertIsNotNone(res.url_components)
        self.assertIsNotNone(res.domain_analysis)
        self.assertIsNotNone(res.threat_intelligence)

    def test_full_pipeline_clean_url(self):
        res = self.analyzer.analyze("https://www.onlinesbi.sbi/")
        self.assertFalse(res.is_phishing)
        self.assertEqual(res.threat_level, "LOW")
        self.assertLess(res.risk_score, 40)

if __name__ == "__main__":
    unittest.main()
