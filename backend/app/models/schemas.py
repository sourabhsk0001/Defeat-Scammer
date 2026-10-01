from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth & User Schemas ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserSignUp(BaseModel):
    email: str
    password: str
    full_name: str

class OnboardingData(BaseModel):
    name: str
    age_range: str
    occupation: str
    monthly_income: float
    monthly_expenses: float
    financial_goal: str
    preferred_language: str

class UserProfile(BaseModel):
    id: str = "usr_001"
    name: str = "Alex Morgan"
    email: str = "alex.morgan@guardian.io"
    phone: str = "+1 (555) 234-8901"
    monthly_income: float = 6500.00
    monthly_expenses: float = 3200.00
    age_range: str = "26-35"
    occupation: str = "Software Engineer"
    financial_goal: str = "Build Emergency Fraud Reserve"
    preferred_language: str = "English"
    risk_appetite: str = "Moderate"  # Conservative, Moderate, Aggressive
    protection_tier: str = "Ultra Sentinel"
    family_members_count: int = 3
    security_score: int = 88 # 0-100
    financial_health_score: int = 84 # 0-100
    is_onboarded: bool = True
    created_at: str = "2026-01-15T08:00:00Z"

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    risk_appetite: Optional[str] = None
    financial_goal: Optional[str] = None
    preferred_language: Optional[str] = None

# --- Transaction & Budget Schemas ---
class Transaction(BaseModel):
    id: str
    title: str
    amount: float
    type: str  # "debit" or "credit"
    category: str
    date: str
    merchant: str
    risk_score: int  # 0 to 100
    is_anomaly: bool
    risk_flags: List[str] = []
    location: Optional[str] = "Online / Domestic"

class TransactionCreate(BaseModel):
    title: str
    amount: float
    type: str = "debit"
    category: str = "General"
    merchant: str = "Unknown"
    location: Optional[str] = "Online"

class BudgetCategory(BaseModel):
    category: str
    budgeted: float
    spent: float
    percentage: float
    status: str  # "Safe", "Warning", "Exceeded"

class BudgetSummary(BaseModel):
    total_budget: float
    total_spent: float
    remaining: float
    categories: List[BudgetCategory]
    savings_rate: float
    health_advice: str

# --- Phase 5: Financial Management Schemas ---
class ExpenseItem(BaseModel):
    id: str
    category: str
    amount: float
    payment_method: str = "card"
    date: str
    notes: Optional[str] = None

class ExpenseCreate(BaseModel):
    category: str
    amount: float
    payment_method: str = "card"
    notes: Optional[str] = None

class IncomeItem(BaseModel):
    id: str
    source: str
    amount: float
    frequency: str = "monthly"
    is_verified: bool = True
    date: str

class IncomeCreate(BaseModel):
    source: str
    amount: float
    frequency: str = "monthly"
    is_verified: bool = True

class BudgetCreate(BaseModel):
    category: str
    budgeted: float

class GoalItem(BaseModel):
    id: str
    title: str
    target_amount: float
    current_amount: float
    target_date: Optional[str] = None
    category: str = "emergency_fund"
    status: str = "active"

class GoalCreate(BaseModel):
    title: str
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[str] = None
    category: str = "emergency_fund"

# --- Scam & Threat Detection Schemas ---
class MessageAnalysisRequest(BaseModel):
    content: str
    sender_info: Optional[str] = None
    channel: Optional[str] = "SMS"  # SMS, WhatsApp, Email, Call, Telegram

class MessageAnalysisResult(BaseModel):
    is_scam: bool
    threat_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    risk_score: int  # 0 to 100
    scam_category: str  # e.g., "Electricity Bill Fraud", "Digital Arrest", "Lottery Prize", "Phishing"
    detected_patterns: List[str]
    urgency_rating: str  # "Severe", "Moderate", "Normal"
    psychological_triggers: List[str]  # "Fear of penalty", "Artificial scarcity", "Authority spoofing"
    evidence: List[str]
    recommended_actions: List[str]
    reporting_advice: str

class URLAnalysisRequest(BaseModel):
    url: str

class URLAnalysisResult(BaseModel):
    url: str
    is_phishing: bool
    threat_level: str
    risk_score: int
    detected_tricks: List[str]
    domain_reputation: str
    ssl_status: str
    impersonated_brand: Optional[str] = None
    verdict_summary: str
    recommended_actions: List[str]
    url_components: Optional[Dict[str, Any]] = None
    domain_analysis: Optional[Dict[str, Any]] = None
    threat_intelligence: Optional[Dict[str, Any]] = None


class ScreenshotAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    simulated_scenario: Optional[str] = None  # e.g. "fake_receipt", "fake_bank_sms", "apk_warning"
    extracted_text: Optional[str] = None

class ScreenshotAnalysisResult(BaseModel):
    scenario: str
    risk_score: int
    threat_level: str
    is_fraudulent: bool
    detected_manipulations: List[str]
    extracted_text_preview: str
    fraud_indicators: List[str]
    action_plan: List[str]

class VoiceAnalysisRequest(BaseModel):
    audio_transcript: str
    caller_claimed_identity: Optional[str] = None
    call_duration_seconds: Optional[int] = 60

class VoiceAnalysisResult(BaseModel):
    threat_level: str
    risk_score: int
    impersonation_target: str
    voice_social_engineering_tactics: List[str]
    urgency_stress_level: str
    immediate_instruction: str
    is_deepfake_or_ai_voice_suspected: bool
    defense_script: str

# --- AI Assistant & RAG Schemas ---
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class AIChatResponse(BaseModel):
    reply: str
    rag_sources: List[Dict[str, Any]] = []
    safety_advisory: Optional[str] = None

# --- Phase 11: AI Engine Responsibilities Schemas ---
class FinancialExplanationRequest(BaseModel):
    income: float = 6500.0
    expenses: float = 4250.0
    savings: Optional[float] = None
    savings_rate: Optional[float] = None
    categories: Optional[Dict[str, float]] = None
    anomalies_count: int = 0
    query: Optional[str] = None

class FinancialExplanationResponse(BaseModel):
    explanation: str
    health_tier: str
    health_summary: str
    metrics_evaluated: Dict[str, Any]

class ScamExplanationRequest(BaseModel):
    content: str
    channel: Optional[str] = "SMS"
    scam_category: Optional[str] = None
    threat_level: Optional[str] = "HIGH"
    indicators: Optional[List[str]] = None

class ScamExplanationResponse(BaseModel):
    scam_explanation: str
    channel: str
    category: str
    threat_level: str
    golden_rule: str
    reporting_helpline: str

class BudgetRecommendationRequest(BaseModel):
    income: float = 6500.0
    expenses: Optional[List[Dict[str, Any]]] = None
    current_budgets: Optional[List[Dict[str, Any]]] = None
    financial_goals: Optional[List[Dict[str, Any]]] = None

class BudgetRecommendationResponse(BaseModel):
    recommendations: str
    framework: str
    monthly_income: float
    target_allocations: Dict[str, float]
    category_targets: Dict[str, float]
    annual_wealth_growth_potential: float

class FinancialEducationRequest(BaseModel):
    topic: str
    difficulty_level: Optional[str] = "beginner"

class FinancialEducationResponse(BaseModel):
    topic: str
    lesson: str
    difficulty: str
    estimated_read_time: str

class PersonalizedGuidanceRequest(BaseModel):
    name: Optional[str] = "Alex Morgan"
    age_range: Optional[str] = "26-35"
    occupation: Optional[str] = "Software Engineer"
    monthly_income: Optional[float] = 6500.0
    monthly_expenses: Optional[float] = 4250.0
    financial_goal: Optional[str] = "Build 6-Month Emergency Fund & First Home Downpayment"
    preferred_language: Optional[str] = "English"
    risk_alerts_count: Optional[int] = 0

class PersonalizedGuidanceResponse(BaseModel):
    name: str
    goal: str
    guidance_roadmap: str
    monthly_surplus: float
    security_status: str
    action_phases: List[str]

# --- Phase 12: RAG & Knowledge Base Schemas ---
class RAGSourceCitation(BaseModel):
    source: str
    title: str
    publication_date: str
    update_date: Optional[str] = None
    jurisdiction: str
    document_type: str
    url: str
    category: str
    relevance_score: float
    excerpt: str

class RAGQueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3
    category_filter: Optional[str] = None

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    sources: List[RAGSourceCitation]
    total_sources_cited: int
    pipeline_trace: Dict[str, Any]

class OfficialDocumentMetadata(BaseModel):
    id: str
    category: str
    title: str
    source: str
    publication_date: str
    update_date: Optional[str] = None
    jurisdiction: str
    document_type: str
    url: str
    content: str


# --- Safety Center, Family Protection & Money Trail ---
class FamilyMember(BaseModel):
    id: str
    name: str
    relation: str
    phone: str
    protection_status: str  # "Active Shield", "Warning Alert", "Secured"
    scams_intercepted: int
    last_checkup: str

class ActiveThreat(BaseModel):
    id: str
    title: str
    category: str
    severity: str  # "CRITICAL", "HIGH", "MEDIUM"
    victim_count_today: int
    description: str
    indicator_of_compromise: str
    preventative_tip: str
    date_reported: str

class EmergencyActionGuide(BaseModel):
    emergency_type: str
    hotlines: List[Dict[str, str]]
    step_by_step_checklist: List[str]
    sample_dispute_letter: str

class MoneyTrailNode(BaseModel):
    id: str
    label: str
    type: str  # "victim", "mule_account", "crypto_bridge", "scammer_hub", "cash_out"
    balance: float
    risk_level: str

class MoneyTrailLink(BaseModel):
    source: str
    target: str
    amount: float
    timestamp: str
    flagged: bool

class MoneyTrailData(BaseModel):
    nodes: List[MoneyTrailNode]
    links: List[MoneyTrailLink]
    total_stolen_tracked: float
    recovery_probability: str
    frozen_nodes_count: int

# --- Phase 7: Risk Engine Schemas ---
class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = []
    sanitized_fields: Dict[str, Any] = {}

class RiskIndicator(BaseModel):
    rule_id: str
    flag: str
    description: str
    severity: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    score_contribution: int
    category: str = "DETERMINISTIC"
    metadata: Dict[str, Any] = {}

class RiskEvaluationRequest(BaseModel):
    amount: float
    recipient: str
    title: Optional[str] = None
    type: str = "debit"
    category: Optional[str] = "Transfers"
    channel: Optional[str] = "UPI"
    location: Optional[str] = "Online / Domestic"
    timestamp: Optional[str] = None
    user_id: Optional[str] = "usr_001"
    force_new_recipient: Optional[bool] = None
    burst_count_override: Optional[int] = None

class RiskEvaluationResult(BaseModel):
    transaction_id: str
    validation: ValidationResult
    rules_evaluated_count: int
    risk_indicators: List[RiskIndicator]
    risk_score: int  # 0 to 100
    risk_level: str  # "LOW", "MODERATE", "HIGH", "CRITICAL"
    decision: str  # "APPROVE", "FLAG_REVIEW", "STEP_UP_AUTH", "BLOCK"
    is_anomaly: bool
    recommendations: List[str]
    telemetry: Dict[str, Any] = {}

class DeterministicRuleInfo(BaseModel):
    rule_id: str
    name: str
    category: str
    severity: str
    weight: int
    formula: str
    description: str

# --- Phase 8: ML Anomaly Detection Schemas ---
class MLFeatures(BaseModel):
    transaction_amount: float
    transaction_frequency: float
    time_of_day: float
    recipient_frequency: float
    amount_deviation: float
    daily_transaction_count: float

class MLAnomalyDetectionRequest(BaseModel):
    amount: float
    recipient: str
    timestamp: Optional[str] = None
    type: str = "debit"
    channel: str = "UPI"
    location: Optional[str] = "Online"
    feature_overrides: Optional[Dict[str, float]] = None

class MLAnomalyDetectionResult(BaseModel):
    transaction_id: str
    features: MLFeatures
    raw_decision_score: float
    anomaly_score: int  # 0 to 100
    is_anomaly: bool
    anomaly_flags: List[str]
    confidence_percent: float
    model_info: Dict[str, Any]

class MLModelInfo(BaseModel):
    model_name: str = "Scikit-Learn IsolationForest"
    n_estimators: int = 100
    contamination: float = 0.08
    training_samples_count: int
    features_used: List[str]
    algorithm: str = "Unsupervised Random Tree Partitioning"

# --- Phase 9: Unified Scam Shield Schemas ---
class ScamShieldScanRequest(BaseModel):
    content: str
    input_type: str = "sms"  # "sms", "whatsapp", "email", "url", "payment"
    sender_info: Optional[str] = None
    subject: Optional[str] = None

class ScamShieldScanResult(BaseModel):
    verdict_banner: str  # "⚠️ Potential Scam", "🚨 Critical Scam Threat", "✓ Verified Low Risk"
    risk_level: str  # "CRITICAL", "HIGH", "MODERATE", "LOW"
    risk_score: int  # 0 to 100
    indicators: List[str]
    recommended_actions: List[str]
    scam_category: str
    input_type: str
    extracted_text_clean: str
    extracted_urls: List[Dict[str, Any]] = []
    psychological_triggers: List[str] = []
    pipeline_trace: Dict[str, Any] = {}
    reporting_advice: str
    is_scam: bool



