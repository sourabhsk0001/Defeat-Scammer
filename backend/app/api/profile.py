from fastapi import APIRouter
from app.models.schemas import UserProfile, ProfileUpdate
from app.core.database import db

router = APIRouter(prefix="/profile", tags=["Financial Profile"])

@router.get("", response_model=UserProfile)
def get_profile():
    return db.profile

@router.put("", response_model=UserProfile)
def update_profile(update: ProfileUpdate):
    if update.name is not None:
        db.profile["name"] = update.name
    if update.phone is not None:
        db.profile["phone"] = update.phone
    if update.monthly_income is not None:
        db.profile["monthly_income"] = update.monthly_income
    if update.risk_appetite is not None:
        db.profile["risk_appetite"] = update.risk_appetite
    db.save()
    return db.profile
