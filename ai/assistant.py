import sys
import os

# Ensure backend directory is in path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.services.ai_assistant_service import ai_assistant_service, AIAssistantService
from app.services.financial_calculator import financial_calculator, FinancialCalculator

__all__ = ["ai_assistant_service", "AIAssistantService", "financial_calculator", "FinancialCalculator"]
