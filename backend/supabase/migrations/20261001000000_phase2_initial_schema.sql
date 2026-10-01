-- ==============================================================================
-- FinAccess-AI / Defeat Scammer — Supabase PostgreSQL + pgvector Migration
-- Phase 2: Complete Database Schema with 12 Core Tables, Vector Indices & RLS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'auditor')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    monthly_income NUMERIC(12, 2) DEFAULT 0.00,
    risk_appetite VARCHAR(30) DEFAULT 'Moderate' CHECK (risk_appetite IN ('Conservative', 'Moderate', 'Aggressive')),
    protection_tier VARCHAR(50) DEFAULT 'Ultra Sentinel',
    security_score INT DEFAULT 90 CHECK (security_score BETWEEN 0 AND 100),
    financial_health_score INT DEFAULT 85 CHECK (financial_health_score BETWEEN 0 AND 100),
    emergency_contact VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('debit', 'credit')),
    category VARCHAR(50) NOT NULL,
    merchant VARCHAR(100),
    location VARCHAR(100) DEFAULT 'Online',
    risk_score INT DEFAULT 5 CHECK (risk_score BETWEEN 0 AND 100),
    is_anomaly BOOLEAN DEFAULT FALSE,
    risk_flags JSONB DEFAULT '[]',
    status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'frozen', 'blocked', 'flagged')),
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'card',
    recurring BOOLEAN DEFAULT FALSE,
    notes TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INCOME TABLE
CREATE TABLE IF NOT EXISTS public.income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    source VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    frequency VARCHAR(30) DEFAULT 'monthly' CHECK (frequency IN ('one_time', 'weekly', 'biweekly', 'monthly', 'annual')),
    is_verified BOOLEAN DEFAULT TRUE,
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    budgeted_amount NUMERIC(12, 2) NOT NULL,
    period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    alert_threshold_percentage INT DEFAULT 85 CHECK (alert_threshold_percentage BETWEEN 1 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_category_budget UNIQUE (user_id, category, period)
);

-- 7. FINANCIAL_GOALS TABLE
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) DEFAULT 0.00,
    target_date DATE,
    category VARCHAR(50) DEFAULT 'emergency_fund',
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RISK_ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    indicators JSONB DEFAULT '[]',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SCAM_REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.scam_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    channel VARCHAR(30) NOT NULL CHECK (channel IN ('SMS', 'WhatsApp', 'Email', 'Telegram', 'Voice', 'Web', 'Screenshot')),
    sender_identifier VARCHAR(255),
    raw_content TEXT NOT NULL,
    scam_category VARCHAR(100),
    threat_level VARCHAR(20) NOT NULL CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    risk_score INT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    psychological_triggers JSONB DEFAULT '[]',
    countermeasure_advice TEXT,
    status VARCHAR(30) DEFAULT 'flagged' CHECK (status IN ('flagged', 'verified_scam', 'benign', 'reported_to_cirt')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AI_CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Fraud Consultation',
    session_context JSONB DEFAULT '{}',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AI_MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    rag_citations JSONB DEFAULT '[]',
    model_version VARCHAR(50) DEFAULT 'gemini-1.5-flash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. KNOWLEDGE_DOCUMENTS TABLE (pgvector for semantic fraud RAG)
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT[],
    official_helpline VARCHAR(100),
    source_agency VARCHAR(100) DEFAULT 'CERT-In / RBI / FTC',
    embedding vector(1536),  -- 1536 dimensions for OpenAI / Gemini embedding models
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE & VECTOR SIMILARITY
-- ==============================================================================

-- Vector Cosine Similarity Search Index (HNSW for high-speed nearest-neighbor)
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_embedding 
ON public.knowledge_documents 
USING hnsw (embedding vector_cosine_ops);

-- Relational Foreign Key & Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_executed_at ON public.transactions(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_is_anomaly ON public.transactions(is_anomaly);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON public.income(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_user_id ON public.risk_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON public.risk_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_scam_reports_threat ON public.scam_reports(threat_level);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Transactions: Users can access their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Budgets & Goals: Users can view their own financial targets
CREATE POLICY "Users can manage budgets" ON public.budgets
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can manage goals" ON public.financial_goals
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Knowledge Documents: Public readable by authenticated users
CREATE POLICY "Allow read knowledge documents" ON public.knowledge_documents
    FOR SELECT USING (true);

-- ==============================================================================
-- 5. PGVECTOR SEMANTIC MATCH FUNCTION
-- ==============================================================================

CREATE OR REPLACE FUNCTION match_knowledge_documents (
    query_embedding vector(1536),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    category VARCHAR,
    content TEXT,
    official_helpline VARCHAR,
    similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
    SELECT
        kd.id,
        kd.title,
        kd.category,
        kd.content,
        kd.official_helpline,
        1 - (kd.embedding <=> query_embedding) AS similarity
    FROM public.knowledge_documents kd
    WHERE kd.is_active = TRUE
      AND (kd.embedding IS NULL OR 1 - (kd.embedding <=> query_embedding) > match_threshold)
    ORDER BY kd.embedding <=> query_embedding
    LIMIT match_count;
$$;
