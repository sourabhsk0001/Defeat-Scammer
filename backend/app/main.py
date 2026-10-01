from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, profile, transactions, budgets, scam_detector, ai_assistant, safety_center, financial_management

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Next-Generation Cyber-Fraud Defense & AI Financial Sentinel API"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Sub-Routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(budgets.router, prefix=settings.API_V1_STR)
app.include_router(scam_detector.router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant.router, prefix=settings.API_V1_STR)
app.include_router(safety_center.router, prefix=settings.API_V1_STR)

# Register Phase 5 Financial Management & Analytics both under /api and top-level
app.include_router(financial_management.router, prefix=settings.API_V1_STR)
app.include_router(financial_management.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "engines": ["Gemini AI", "Risk Engine", "Pandas Analytics", "NumPy Vectorized", "RAG pgvector-ready", "URL Phish Hunter"]
    }
