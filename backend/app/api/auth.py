import uuid
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import UserLogin, UserSignUp, OnboardingData, UserProfile
from app.core.database import db

router = APIRouter(prefix="/auth", tags=["Authentication & Onboarding"])

@router.post("/signup")
def signup(creds: UserSignUp):
    if not creds.email or "@" not in creds.email:
        raise HTTPException(status_code=400, detail="Valid email address is required")
    if len(creds.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Update profile in database store
    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    db.profile["id"] = user_id
    db.profile["email"] = creds.email
    db.profile["name"] = creds.full_name
    db.profile["is_onboarded"] = False
    db.save()

    return {
        "status": "success",
        "access_token": f"sentinel_token_{user_id}",
        "token_type": "bearer",
        "user": db.profile,
        "requires_onboarding": True
    }

@router.post("/login")
def login(creds: UserLogin):
    if not creds.email or "@" not in creds.email:
        raise HTTPException(status_code=400, detail="Valid email address is required")

    # If login email matches, use current profile, else adapt
    if creds.email != db.profile.get("email"):
        db.profile["email"] = creds.email

    is_onboarded = db.profile.get("is_onboarded", True)
    return {
        "status": "success",
        "access_token": "sentinel_sec_jwt_token_2026_valid",
        "token_type": "bearer",
        "user": db.profile,
        "requires_onboarding": not is_onboarded
    }

@router.post("/onboarding")
def complete_onboarding(data: OnboardingData):
    # Calculate initial tailored financial health & security score baseline
    savings_margin = (data.monthly_income - data.monthly_expenses) if data.monthly_income > 0 else 0
    savings_rate = (savings_margin / data.monthly_income * 100) if data.monthly_income > 0 else 0

    health_score = 75
    if savings_rate >= 30:
        health_score = 92
    elif savings_rate >= 15:
        health_score = 85
    elif savings_rate >= 0:
        health_score = 70
    else:
        health_score = 55

    # Age risk factor (seniors 65+ receive extra high-alert protective sentinel tier)
    tier = "Ultra Sentinel"
    if data.age_range in ("51-65", "65+"):
        tier = "Elder Shield Ultra"

    db.profile.update({
        "name": data.name,
        "monthly_income": data.monthly_income,
        "monthly_expenses": data.monthly_expenses,
        "age_range": data.age_range,
        "occupation": data.occupation,
        "financial_goal": data.financial_goal,
        "preferred_language": data.preferred_language,
        "protection_tier": tier,
        "financial_health_score": health_score,
        "security_score": 90,
        "is_onboarded": True
    })
    db.save()

    return {
        "status": "success",
        "message": "Onboarding completed successfully",
        "user": db.profile
    }

@router.get("/me", response_model=UserProfile)
def get_current_user():
    return db.profile

@router.post("/logout")
def logout():
    return {"status": "success", "message": "Logged out successfully"}
