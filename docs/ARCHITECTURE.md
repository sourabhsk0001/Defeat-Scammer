# 🏛️ FinAccess-AI Architecture Specification

## 1. System Topology
The platform implements a multi-tier defense system orchestrating:
1. **Next.js Web Presentation Layer** (App Router, TypeScript, Tailwind CSS, shadcn/ui components).
2. **FastAPI Application Gateway** (Python, REST contracts, Pydantic validation, CORS middleware).
3. **AI Cognitive Engine** (Google Gemini, Prompt engineering, System guardrails).
4. **RAG Vector Pipeline** (Semantic retrieval against curated anti-fraud knowledge corpus).
5. **ML Anomaly & Risk Engine** (Statistical Z-score deviations, time-series velocity, carding heuristics).
6. **Safety & Decision Engine** (Evidence synthesis, risk scores, emergency mitigation protocols).

```
[User Interface (Next.js / shadcn/ui)]
                 │
           REST API (JSON)
                 │
                 ▼
     [FastAPI Application Server]
         │            │           │
         ▼            ▼           ▼
   [Data Layer]   [AI Engine]  [ML Engine]
   (PostgreSQL /  (Gemini +    (Anomaly Detection +
    SQLite)        RAG KB)      Risk Scoring)
```

## 2. Directory Separation
- `/frontend`: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui primitives.
- `/backend`: FastAPI service with routers, SQL database models, and endpoints.
- `/ai`: Prompt engineering, Gemini LLM integrations, and RAG knowledge vectors.
- `/ml`: Feature engineering, anomaly prediction, synthetic transaction generation, and training scripts.
- `/docs`: Architecture, API specifications, threat matrix, and developer documentation.
