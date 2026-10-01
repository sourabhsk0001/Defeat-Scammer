# 📡 FinAccess-AI REST API Specification

Base Endpoint: `http://localhost:8000/api`

## Core Routes

### 1. Authentication & Profile
- `POST /api/auth/login`: Authenticate user and issue session token.
- `GET /api/profile`: Retrieve user profile, risk appetite, and security score.
- `PUT /api/profile`: Update user profile, monthly income, and risk parameters.

### 2. Transactions & Risk Detection
- `GET /api/transactions`: Retrieve full transaction stream with risk flags.
- `POST /api/transactions`: Submit transaction for immediate ML anomaly evaluation.
- `POST /api/transactions/re-scan-all`: Re-evaluate entire transaction ledger against ML baseline.

### 3. Budget Analysis
- `GET /api/budgets`: Get budget categories, spending limits, savings rate, and financial health advice.

### 4. Scam Shield Multi-Channel Engine
- `POST /api/scam-shield/analyze-message`: Scan text/SMS/WhatsApp for coercion and urgency.
- `POST /api/scam-shield/analyze-url`: Inspect target domain for phishing, typosquatting, and SSL validity.
- `POST /api/scam-shield/analyze-screenshot`: Run image OCR heuristics on fake payment receipts.
- `POST /api/scam-shield/analyze-voice`: Detect AI deepfake voice synthesis and intimidation tactics.

### 5. AI Sentinel Assistant & RAG
- `POST /api/ai-assistant/chat`: Converse with Gemini AI copilot enriched by RAG citations.

### 6. Safety Center & Emergency SOS
- `GET /api/safety-center/threats`: Fetch real-time active cyber threat bulletins.
- `GET /api/safety-center/family-members`: List protected family members and intercepted scam counts.
- `GET /api/safety-center/money-trail`: Return graph nodes and hops for money trail visualizer.
- `GET /api/safety-center/emergency-sos/{scenario}`: Retrieve hotlines, Golden Hour checklist, and formal dispute letter.
