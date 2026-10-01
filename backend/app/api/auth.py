from fastapi import APIRouter, HTTPException
from app.models.schemas import UserLogin, UserProfile
from app.core.database import db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(creds: UserLogin):
    # Simulated quick auth for demonstration
    if "@" not in creds.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    return {
        "access_token": "sentinel_sec_jwt_token_2026_valid",
        "token_type": "bearer",
        "user": db.profile
    }

@router.get("/me", response_model=UserProfile)
def get_current_user():
    return db.profile
