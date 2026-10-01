# 🛠️ FinAccess-AI Developer Setup Guide

## Requirements
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10, 3.11, or 3.12
- **npm** or **pnpm**

---

## 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
Interactive Swagger Documentation will be available at: `http://localhost:8000/docs`

---

## 2. Frontend Setup (Next.js & Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Open application at: `http://localhost:3001` (or `http://localhost:3000`)

---

## 3. Running AI & ML Pipelines
```bash
# Evaluate ML anomaly detection benchmark
python -m ml.train

# Generate synthetic transaction streams
python -m ml.synthetic_data_generator
```
