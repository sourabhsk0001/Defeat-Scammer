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
