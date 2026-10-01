from fastapi import APIRouter
from typing import List, Dict, Any
from app.models.schemas import ActiveThreat, FamilyMember, EmergencyActionGuide, MoneyTrailData
from app.core.database import db
from app.services.risk_engine import risk_engine

router = APIRouter(prefix="/safety-center", tags=["Financial Safety Center & Emergency SOS"])

@router.get("/threats", response_model=List[ActiveThreat])
def get_active_threats():
    return db.threats

@router.get("/family-members", response_model=List[FamilyMember])
def get_family_members():
    return db.family_members

@router.post("/family-members")
def add_family_member(member: FamilyMember):
    db.family_members.append(member.dict())
    db.profile["family_members_count"] = len(db.family_members)
    db.save()
    return {"status": "success", "member": member}

@router.get("/money-trail", response_model=MoneyTrailData)
def get_money_trail():
    return risk_engine.generate_money_trail(victim_name=db.profile.get("name", "Alex Morgan"))

@router.get("/emergency-sos/{scenario}", response_model=EmergencyActionGuide)
def get_emergency_guide(scenario: str = "unauthorized_debit"):
    sample_letter = (
        "Subject: Urgent: Formal Dispute of Unauthorized Fraudulent Transaction\n\n"
        "To: The Fraud Disputes Department, [Bank Name]\n"
        "Account Number: [Your Account Number]\n\n"
        "I am writing to formally dispute the following unauthorized transaction detected on my account:\n"
        "- Date & Time: 2026-09-30 02:41 AM\n"
        "- Amount: $2,950.00\n"
        "- Beneficiary / Merchant: BitQuick Exchange Seych.\n\n"
        "I confirm that I did not initiate, authorize, or share credentials for this transaction. "
        "Pursuant to Electronic Fund Transfer Regulations and Central Banking Guidelines on Limited Liability of Customers in Unauthorized Electronic Banking Transactions, "
        "I request an immediate freeze on the transaction, recall from beneficiary bank, and full provisional credit.\n\n"
        "Sincerely,\n"
        "[Your Full Name]\n[Contact Information]"
    )

    hotlines = [
        {"name": "National Cyber Crime Helpline (India)", "number": "1930 / cybercrime.gov.in"},
        {"name": "FTC Fraud / Identity Theft Hotline (USA)", "number": "1-877-FTC-HELP (1-877-382-4357)"},
        {"name": "Action Fraud (UK)", "number": "+44 300 123 2040"},
        {"name": "Interpol Cyber Directorate", "number": "support@interpol.int"}
    ]

    steps = [
        "1. Instant Lock: Open your mobile banking app and immediately toggle 'Lock Card / Block UPI'.",
        "2. Call Bank Fraud Desk: Dial the official 24x7 phone number on the back of your physical debit/credit card.",
        "3. Register FIR / Police Complaint: File an incident immediately on the national cyber reporting portal (Within the Golden Hour of 2 hours for highest recovery rate).",
        "4. Revoke Active Sessions: Change master passwords and terminate all remote desktop tools (AnyDesk, TeamViewer) if applicable.",
        "5. Issue Written Dispute Letter: Send the formal dispute notice with reference complaint number to your bank's nodal grievance officer."
    ]

    return EmergencyActionGuide(
        emergency_type=scenario,
        hotlines=hotlines,
        step_by_step_checklist=steps,
        sample_dispute_letter=sample_letter
    )
