-- ==============================================================================
-- FinAccess-AI / Defeat Scammer — Supabase Seed Data
-- Populates all 12 tables with verified real-world fraud scenarios & baseline finance data
-- ==============================================================================

-- 1. Create Default User
INSERT INTO public.users (id, email, full_name, phone, role)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'alex.morgan@guardian.io',
    'Alex Morgan',
    '+1 (555) 234-8901',
    'user'
) ON CONFLICT (email) DO NOTHING;

-- 2. User Profile
INSERT INTO public.profiles (
    user_id, monthly_income, risk_appetite, protection_tier, 
    security_score, financial_health_score, emergency_contact, currency
)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    6500.00,
    'Moderate',
    'Ultra Sentinel',
    88,
    84,
    'Eleanor Morgan (+1 555-349-1102)',
    'USD'
) ON CONFLICT (user_id) DO UPDATE SET security_score = 88;

-- 3. Initial Transactions
INSERT INTO public.transactions (
    id, user_id, title, amount, type, category, merchant, location, risk_score, is_anomaly, risk_flags, status, executed_at
)
VALUES 
(
    '11111111-1111-1111-1111-111111111101',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Grocery Superstore',
    142.50,
    'debit',
    'Groceries',
    'Whole Foods Market',
    'San Francisco, CA',
    4,
    FALSE,
    '[]'::jsonb,
    'completed',
    NOW() - INTERVAL '1 day'
),
(
    '11111111-1111-1111-1111-111111111102',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Rapid Wire to Off-Shore Crypto LLC',
    2950.00,
    'debit',
    'Transfers',
    'BitQuick Exchange Seych.',
    'Seychelles Proxy Gateway',
    94,
    TRUE,
    '["Unusual 02:41 AM execution timestamp", "Amount is 15x higher than average transaction baseline", "Beneficiary flagged by OFAC AML monitoring"]'::jsonb,
    'flagged',
    NOW() - INTERVAL '2 days'
),
(
    '11111111-1111-1111-1111-111111111103',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Monthly Salary Payroll Credit',
    6500.00,
    'credit',
    'Income',
    'Apex Technologies Inc',
    'Direct Deposit ACH',
    1,
    FALSE,
    '[]'::jsonb,
    'completed',
    NOW() - INTERVAL '3 days'
),
(
    '11111111-1111-1111-1111-111111111104',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Suspicious Micro Charge Probe',
    1.15,
    'debit',
    'Services',
    'PAYPAL *TEST_ACC_982',
    'International Proxy Gateway',
    78,
    TRUE,
    '["Suspected automated carding probe micro-charge", "Off-peak midnight execution"]'::jsonb,
    'flagged',
    NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Expenses
INSERT INTO public.expenses (user_id, transaction_id, category, amount, payment_method, expense_date)
VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '11111111-1111-1111-1111-111111111101', 'Groceries', 142.50, 'debit_card', CURRENT_DATE - 1),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '11111111-1111-1111-1111-111111111102', 'Transfers', 2950.00, 'wire', CURRENT_DATE - 2)
ON CONFLICT DO NOTHING;

-- 5. Initial Income
INSERT INTO public.income (user_id, transaction_id, source, amount, frequency, is_verified, received_date)
VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '11111111-1111-1111-1111-111111111103', 'Apex Technologies Payroll', 6500.00, 'monthly', TRUE, CURRENT_DATE - 3)
ON CONFLICT DO NOTHING;

-- 6. Initial Budgets
INSERT INTO public.budgets (user_id, category, budgeted_amount, period, alert_threshold_percentage)
VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Housing & Utilities', 2200.00, 'monthly', 90),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Groceries & Dining', 850.00, 'monthly', 85),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Transfers & Investments', 1200.00, 'monthly', 80),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Shopping & Discretionary', 600.00, 'monthly', 85)
ON CONFLICT ON CONSTRAINT unique_user_category_budget DO NOTHING;

-- 7. Financial Goals
INSERT INTO public.financial_goals (user_id, title, target_amount, current_amount, target_date, category, status)
VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Emergency Fraud Shield Reserve', 15000.00, 11400.00, CURRENT_DATE + INTERVAL '180 days', 'safety_cushion', 'active'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'High-Yield Certificate Ladder', 8000.00, 3200.00, CURRENT_DATE + INTERVAL '365 days', 'investment', 'active')
ON CONFLICT DO NOTHING;

-- 8. Risk Alerts
INSERT INTO public.risk_alerts (
    user_id, transaction_id, alert_type, severity, title, description, indicators, is_resolved
)
VALUES
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '11111111-1111-1111-1111-111111111102',
    'ANOMALY_OUTLIER',
    'CRITICAL',
    'High-Value Off-Peak Crypto Transfer',
    'An unauthorized wire transfer of $2,950 was initiated to an OFAC-flagged Seychelles crypto bridge at 02:41 AM.',
    '["Z-Score: 4.8σ", "Time-series off-peak", "Device fingerprint altered"]'::jsonb,
    FALSE
)
ON CONFLICT DO NOTHING;

-- 9. Scam Reports
INSERT INTO public.scam_reports (
    user_id, channel, sender_identifier, raw_content, scam_category, threat_level, risk_score, 
    psychological_triggers, countermeasure_advice, status
)
VALUES
(
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'SMS',
    '+1 (555) 981-2291',
    'Dear Consumer, your electricity power will be disconnected tonight at 09:30 PM due to unpaid bill. Call officer immediately.',
    'Utility Disconnection Scam',
    'CRITICAL',
    92,
    '["Panic deadline", "Loss of essential service", "Authority mimicry"]'::jsonb,
    'Do not call number. Verify power bill strictly on official utility web app.',
    'reported_to_cirt'
)
ON CONFLICT DO NOTHING;

-- 10. AI Conversations & Messages
INSERT INTO public.ai_conversations (id, user_id, title)
VALUES (
    '22222222-2222-2222-2222-222222222201',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Digital Arrest Coercion Inquiry'
) ON CONFLICT DO NOTHING;

INSERT INTO public.ai_messages (conversation_id, sender_role, content, model_version)
VALUES
(
    '22222222-2222-2222-2222-222222222201',
    'user',
    'Someone claiming to be CBI Officer Deshmukh said a parcel in my name has drugs and they are holding a digital arrest court over Skype.',
    'gemini-1.5-flash'
),
(
    '22222222-2222-2222-2222-222222222201',
    'assistant',
    '⚠️ CRITICAL ALERT: This is 100% a fraudulent Digital Arrest scheme. Police and CBI never hold court hearings or conduct arrests over Skype. Disconnect the call immediately, do not send any money, and report to 1930.',
    'gemini-1.5-flash'
)
ON CONFLICT DO NOTHING;

-- 11. Knowledge Documents (RAG Knowledge Base)
INSERT INTO public.knowledge_documents (
    title, category, content, keywords, official_helpline, source_agency
)
VALUES
(
    'Digital Arrest & Police Video Extortion Playbook',
    'Law Enforcement Impersonation',
    'Scammers impersonate Police, Narcotics Control Bureau (NCB), CBI, or Customs. They allege illegal contraband was confiscated in a package in your name and demand immediate fund transfers to an "audit escrow account". No legal authority arrests citizens via Skype/WhatsApp or demands asset transfers.',
    ARRAY['digital arrest', 'police', 'cbi', 'customs', 'drugs', 'skype', 'narcotics', 'warrant'],
    'Dial 1930 / cybercrime.gov.in',
    'CERT-In & Ministry of Home Affairs'
),
(
    'Electricity & Power Cutoff Phishing Scams',
    'Utility Urgent Phishing',
    'Phishing SMS messages claiming electricity will be disconnected tonight at 9:30 PM due to pending bill update. Scammers instruct victims to call personal phone numbers or download APK remote screen takeover trojans (AnyDesk, RustDesk, QuickSupport).',
    ARRAY['electricity', 'power cutoff', 'meter', 'unpaid bill', 'officer', 'disconnection'],
    'Contact official power board helpline directly',
    'National Consumer Protection Bureau'
),
(
    'UPI QR Code Reverse Transfer Fraud',
    'Payment Gateway Fraud',
    'Fraudsters targeting sellers on marketplace platforms (OLX, Craigslist, Facebook) claim to send an advance payment and transmit a QR code. They instruct the victim to scan the code and enter their UPI PIN to "receive" funds. In reality, entering a PIN always debits the account.',
    ARRAY['qr code', 'upi pin', 'receive money', 'scan to receive', 'olx', 'advance refund'],
    'Report UPI VPA to NPCI & Bank Fraud Desk',
    'NPCI & Reserve Bank Guidelines'
)
ON CONFLICT DO NOTHING;
