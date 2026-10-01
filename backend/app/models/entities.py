import uuid
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import (
    Column, String, Boolean, Integer, Numeric, Text, Date, DateTime, 
    ForeignKey, CheckConstraint, JSON
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB, ARRAY
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

# 1. USER ENTITY
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(30), nullable=True)
    role = Column(String(30), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    income = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    financial_goals = relationship("FinancialGoal", back_populates="user", cascade="all, delete-orphan")
    risk_alerts = relationship("RiskAlert", back_populates="user", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan")

# 2. PROFILE ENTITY
class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    monthly_income = Column(Numeric(12, 2), default=0.00)
    risk_appetite = Column(String(30), default="Moderate")
    protection_tier = Column(String(50), default="Ultra Sentinel")
    security_score = Column(Integer, default=90)
    financial_health_score = Column(Integer, default=85)
    emergency_contact = Column(String(100), nullable=True)
    currency = Column(String(10), default="USD")
    metadata_json = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

# 3. TRANSACTION ENTITY
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    type = Column(String(20), nullable=False)  # 'debit' or 'credit'
    category = Column(String(50), nullable=False)
    merchant = Column(String(100), nullable=True)
    location = Column(String(100), default="Online")
    risk_score = Column(Integer, default=5)
    is_anomaly = Column(Boolean, default=False, index=True)
    risk_flags = Column(JSON, default=list)
    status = Column(String(30), default="completed")
    executed_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    expenses = relationship("Expense", back_populates="transaction")
    income_records = relationship("Income", back_populates="transaction")
    risk_alerts = relationship("RiskAlert", back_populates="transaction")

# 4. EXPENSE ENTITY
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(50), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String(50), default="card")
    recurring = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    expense_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="expenses")
    transaction = relationship("Transaction", back_populates="expenses")

# 5. INCOME ENTITY
class Income(Base):
    __tablename__ = "income"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    source = Column(String(100), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    frequency = Column(String(30), default="monthly")
    is_verified = Column(Boolean, default=True)
    received_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="income")
    transaction = relationship("Transaction", back_populates="income_records")

# 6. BUDGET ENTITY
class Budget(Base):
    __tablename__ = "budgets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    budgeted_amount = Column(Numeric(12, 2), nullable=False)
    period = Column(String(20), default="monthly")
    start_date = Column(Date, default=date.today)
    end_date = Column(Date, nullable=True)
    alert_threshold_percentage = Column(Integer, default=85)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="budgets")

# 7. FINANCIAL GOAL ENTITY
class FinancialGoal(Base):
    __tablename__ = "financial_goals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    target_amount = Column(Numeric(12, 2), nullable=False)
    current_amount = Column(Numeric(12, 2), default=0.00)
    target_date = Column(Date, nullable=True)
    category = Column(String(50), default="savings")
    status = Column(String(30), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="financial_goals")

# 8. RISK ALERT ENTITY
class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    alert_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    indicators = Column(JSON, default=list)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="risk_alerts")
    transaction = relationship("Transaction", back_populates="risk_alerts")

# 9. SCAM REPORT ENTITY
class ScamReport(Base):
    __tablename__ = "scam_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    channel = Column(String(30), nullable=False)  # SMS, WhatsApp, Email, Telegram, Voice, Web
    sender_identifier = Column(String(255), nullable=True)
    raw_content = Column(Text, nullable=False)
    scam_category = Column(String(100), nullable=True)
    threat_level = Column(String(20), nullable=False)
    risk_score = Column(Integer, nullable=False)
    psychological_triggers = Column(JSON, default=list)
    countermeasure_advice = Column(Text, nullable=True)
    status = Column(String(30), default="flagged")
    created_at = Column(DateTime, default=datetime.utcnow)

# 10. AI CONVERSATION ENTITY
class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="New Fraud Consultation")
    session_context = Column(JSON, default=dict)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan")

# 11. AI MESSAGE ENTITY
class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    rag_citations = Column(JSON, default=list)
    model_version = Column(String(50), default="gemini-1.5-flash")
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("AIConversation", back_populates="messages")

# 12. KNOWLEDGE DOCUMENT ENTITY (RAG Knowledge Base)
class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    keywords = Column(JSON, default=list)
    official_helpline = Column(String(100), nullable=True)
    source_agency = Column(String(100), default="CERT-In / RBI / FTC")
    embedding = Column(JSON, nullable=True)  # Stores vector embedding array
    metadata_json = Column("metadata", JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
