# 🛡️ Defeat Scammer — AI & Financial Cyber-Guardian

An enterprise-grade, multi-layer cyber-fraud defense and financial intelligence platform. Designed to protect citizens and families against social engineering, digital arrest scams, phishing, fake payment receipts, utility threats, and fraudulent transactions.

---

## 🏛️ Architecture Overview

```
                         ┌──────────────────────┐
                         │      USER            │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    NEXT.JS FRONTEND  │
                         │ TypeScript + Tailwind│ (Port 3001)
                         └──────────┬───────────┘
                                    │
                         REST API / JSON
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    FASTAPI BACKEND   │
                         │       Python         │ (Port 8000)
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌────────────┐        ┌────────────┐        ┌────────────┐
       │ PostgreSQL │        │ AI ENGINE  │        │ RISK ENGINE│
       │  Supabase  │        │   Gemini   │        │ Python/ML  │
       └────────────┘        └─────┬──────┘        └─────┬──────┘
                                   │                     │
                                   ▼                     ▼
                              ┌──────────┐         ┌────────────┐
                              │   RAG    │         │ Anomaly    │
                              │ pgvector │         │ Detection  │
                              └──────────┘         └────────────┘
                                   │                     │
                                   └──────────┬──────────┘
                                              ▼
                                   ┌────────────────────┐
                                   │ SAFETY / DECISION  │
                                   │      ENGINE        │
                                   └─────────┬──────────┘
                                             │
                                             ▼
                                   ┌────────────────────┐
                                   │ RESULT + EVIDENCE  │
                                   │ + RECOMMENDATION   │
                                   └─────────┬──────────┘
                                             │
                                             ▼
                                   ┌────────────────────┐
                                   │ USER DASHBOARD     │
                                   └────────────────────┘
```

---

## 🚀 Implemented Modules & Features

### 12 Core Capabilities:
1. **User Authentication & Session Management**: Secure user identity, token sessions, and role profiles.
2. **Financial Profile**: Dynamic risk tolerance (Conservative, Moderate, Aggressive), monthly income, and protection tiers.
3. **Income / Expense Tracking**: Real-time inflow/outflow ledger with category categorization.
4. **Budget Analysis**: Target thresholds, real-time burn rate, savings ratio, and automated resilience advice.
5. **Transaction Ledger & Risk Engine**: Statistical Z-score deviation heuristics, off-peak velocity checks (e.g. 2:00 AM - 5:00 AM), carding micro-charge detection, and automated anomaly flagging.
6. **Scam Message Analyzer**: Multi-channel (SMS, WhatsApp, Telegram, Email) natural language inspection for urgency coercion, psychological triggers, and known fraud patterns.
7. **URL Risk & Phishing Hunter**: Typosquatting detection, homograph inspection, direct IP proxy checks, suspicious TLD flagging (.xyz, .top, .buzz), and brand impersonation alerts.
8. **AI Financial Guardian Assistant**: Interactive copilot powered by Google Gemini (with smart offline heuristic fallback).
9. **Financial Knowledge RAG**: Semantic retrieval of verified fraud attack vectors (Digital Arrest, Electricity Cutoff, Task Scams, UPI QR Code reversal fraud) with citation cards.
10. **Financial Safety Center**: Real-time cyber threat intelligence bulletins, vulnerability score, and national advisories.
11. **Emergency Fraud SOS Protocol**: 1-click panic freeze mode, 24x7 cyber helplines (1930 / FTC), Golden Hour triage checklist, and auto-generated formal bank dispute letters.
12. **Financial Health Dashboard**: Real-time Cyber Safety score (0-100), financial health gauge, recent anomalies, and family shield status.

### Advanced Threat Defense Features:
- 🎙️ **Voice Call & Deepfake Scanner**: Scans live call transcripts for authority intimidation (fake CBI/Police) and AI voice synthesis artifacts (Grandparent emergency scam).
- 📸 **Screenshot & Receipt Inspector**: Detects fake payment receipts (GPay/Paytm spoof apps), repetitive mock UTRs, and altered banking alerts.
- 👥 **Family Protection Circle**: Connect vulnerable relatives and seniors with shared protection alerts and scam interception logs.
- 🕸️ **Money Trail & Graph Visualizer**: Multi-hop laundering topology (Victim → Mule #1 → Mule #2 → Crypto Bridge → Cash-out) with recovery probabilities and CIRT freeze tags.

---

## 🛠️ Quick Start

### 1. Run the FastAPI Backend (Port 8000)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
Interactive API Swagger Docs: `http://localhost:8000/docs`

### 2. Run the Next.js Frontend (Port 3001)
```bash
cd frontend
npm install
npm run dev
```
Open in browser: `http://localhost:3001`

---

## 🔑 Environment Variables (Optional)
Create `.env` in `backend/`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./data/defeat_scammer.db
JWT_SECRET=your_custom_jwt_secret
```
*(Note: If `GEMINI_API_KEY` is omitted, the system seamlessly runs on its built-in intelligent heuristic fraud defense engine).*
