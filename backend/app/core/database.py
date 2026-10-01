import json
import os
from typing import List, Dict, Any
from app.models.schemas import (
    UserProfile, Transaction, BudgetCategory, FamilyMember, ActiveThreat
)

# Seed and In-Memory Data Store (persisted to JSON / SQLite)
DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "store.json")

INITIAL_PROFILE = {
    "id": "usr_001",
    "name": "Alex Morgan",
    "email": "alex.morgan@guardian.io",
    "phone": "+1 (555) 234-8901",
    "monthly_income": 6500.00,
    "risk_appetite": "Moderate",
    "protection_tier": "Ultra Sentinel",
    "family_members_count": 3,
    "security_score": 92,
    "financial_health_score": 85,
    "created_at": "2026-01-15T08:00:00Z"
}

INITIAL_TRANSACTIONS = [
    {
        "id": "tx_101",
        "title": "Grocery Market Supercenter",
        "amount": 142.50,
        "type": "debit",
        "category": "Groceries",
        "date": "2026-09-30 18:24",
        "merchant": "Whole Foods Market",
        "risk_score": 4,
        "is_anomaly": False,
        "risk_flags": [],
        "location": "Local Store (San Francisco)"
    },
    {
        "id": "tx_102",
        "title": "Rapid Wire to Off-Shore Crypto LLC",
        "amount": 2950.00,
        "type": "debit",
        "category": "Transfers",
        "date": "2026-09-30 02:41",
        "merchant": "BitQuick Exchange Seych.",
        "risk_score": 94,
        "is_anomaly": True,
        "risk_flags": [
            "Unusual 2:41 AM execution timestamp",
            "Amount 15x higher than average transaction",
            "High-risk offshore crypto gateway flagged by OFAC",
            "Device fingerprint changed 4 mins prior"
        ],
        "location": "Seychelles IP Proxy"
    },
    {
        "id": "tx_103",
        "title": "Monthly Cloud SaaS Subscription",
        "amount": 49.99,
        "type": "debit",
        "category": "Software",
        "date": "2026-09-29 09:15",
        "merchant": "GitHub Enterprise",
        "risk_score": 2,
        "is_anomaly": False,
        "risk_flags": [],
        "location": "Online Recurring"
    },
    {
        "id": "tx_104",
        "title": "Gift Card Mass Purchase (x5)",
        "amount": 1250.00,
        "type": "debit",
        "category": "Shopping",
        "date": "2026-09-28 23:11",
        "merchant": "Unknown Digital Card Depot",
        "risk_score": 88,
        "is_anomaly": True,
        "risk_flags": [
            "Frequent precursor to Phone/IRS extortion scam",
            "Unregistered e-voucher merchant",
            "Rapid succession split purchases"
        ],
        "location": "Online / VPN Masked"
    },
    {
        "id": "tx_105",
        "title": "Monthly Salary Credit",
        "amount": 6500.00,
        "type": "credit",
        "category": "Income",
        "date": "2026-09-28 08:00",
        "merchant": "Apex Technologies Payroll",
        "risk_score": 1,
        "is_anomaly": False,
        "risk_flags": [],
        "location": "Direct ACH Deposit"
    },
    {
        "id": "tx_106",
        "title": "City Electric Utilities",
        "amount": 89.20,
        "type": "debit",
        "category": "Utilities",
        "date": "2026-09-27 14:10",
        "merchant": "PG&E Utilities",
        "risk_score": 5,
        "is_anomaly": False,
        "risk_flags": [],
        "location": "Direct Debit"
    },
    {
        "id": "tx_107",
        "title": "Suspicious Micro Charge Verification",
        "amount": 1.15,
        "type": "debit",
        "category": "Services",
        "date": "2026-09-26 04:12",
        "merchant": "PAYPAL *TEST_ACC_982",
        "risk_score": 78,
        "is_anomaly": True,
        "risk_flags": [
            "Classic carding probe (testing active stolen card before draining)",
            "Automated midnight batch ping"
        ],
        "location": "International Gateway"
    }
]

INITIAL_BUDGETS = [
    {"category": "Housing & Utilities", "budgeted": 2200.0, "spent": 2089.20, "percentage": 94.9, "status": "Safe"},
    {"category": "Groceries & Dining", "budgeted": 850.0, "spent": 642.50, "percentage": 75.5, "status": "Safe"},
    {"category": "Transfers & Investments", "budgeted": 1200.0, "spent": 2950.00, "percentage": 245.8, "status": "Exceeded"},
    {"category": "Shopping & Discretionary", "budgeted": 600.0, "spent": 1250.00, "percentage": 208.3, "status": "Exceeded"},
    {"category": "Software & Services", "budgeted": 250.0, "spent": 51.14, "percentage": 20.4, "status": "Safe"}
]

INITIAL_FAMILY_MEMBERS = [
    {
        "id": "fam_01",
        "name": "Eleanor Morgan",
        "relation": "Mother (Senior)",
        "phone": "+1 (555) 349-1102",
        "protection_status": "Active Shield",
        "scams_intercepted": 4,
        "last_checkup": "Today, 10:15 AM"
    },
    {
        "id": "fam_02",
        "name": "David Morgan",
        "relation": "Father (Senior)",
        "phone": "+1 (555) 349-1103",
        "protection_status": "Secured",
        "scams_intercepted": 2,
        "last_checkup": "Yesterday, 4:20 PM"
    },
    {
        "id": "fam_03",
        "name": "Chloe Morgan",
        "relation": "Daughter (Student)",
        "phone": "+1 (555) 891-2300",
        "protection_status": "Active Shield",
        "scams_intercepted": 1,
        "last_checkup": "Sep 28, 2026"
    }
]

INITIAL_THREATS = [
    {
        "id": "thr_001",
        "title": "Fake 'Digital Arrest' & Law Enforcement Video Call Scam",
        "category": "Extortion / Impersonation",
        "severity": "CRITICAL",
        "victim_count_today": 342,
        "description": "Criminals pose as CBI/Interpol/Police officers via Skype/WhatsApp video calls claiming parcels containing illegal passports or drugs were seized. They force victims to transfer money to a 'security verification reserve'.",
        "indicator_of_compromise": "Video calls showing fake police backdrops, urgent demands to stay on camera for 24h, requests to transfer life savings.",
        "preventative_tip": "Law enforcement agencies NEVER arrest anyone over Skype or demand money transfers for verification.",
        "date_reported": "2026-10-01"
    },
    {
        "id": "thr_002",
        "title": "Electricity Bill Power Disconnection SMS Threat",
        "category": "SMS Phishing",
        "severity": "HIGH",
        "victim_count_today": 890,
        "description": "Bulk SMS sent stating 'Dear Customer, your electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Immediately call 98xxxx or click update APK'.",
        "indicator_of_compromise": "Shortcodes disguised as utility vendors, phone numbers for direct WhatsApp contact, malicious APK download links.",
        "preventative_tip": "Utility companies do not issue instant same-night disconnection notices via personal mobile numbers.",
        "date_reported": "2026-10-01"
    },
    {
        "id": "thr_003",
        "title": "Remote Screen Sharing / AnyDesk Customer Support Fraud",
        "category": "Tech Support / Remote Access",
        "severity": "HIGH",
        "victim_count_today": 512,
        "description": "Scammers pose as bank or airline customer service agents assisting with a refund, asking victims to install RustDesk, AnyDesk, or TeamViewer to steal OTPs and passwords.",
        "indicator_of_compromise": "Requests to install 9-digit code remote management apps or screen broadcast apps on mobile phones.",
        "preventative_tip": "Never allow anyone access to your screen. Legitimate support staff never request remote desktop access to your phone.",
        "date_reported": "2026-09-30"
    },
    {
        "id": "thr_004",
        "title": "Part-Time YouTube/Telegram 'Like & Earn' Task Scam",
        "category": "Ponzi / Work-from-Home Scam",
        "severity": "MEDIUM",
        "victim_count_today": 1240,
        "description": "Victims are lured into liking YouTube videos or Google reviews for $5 each, then persuaded into VIP deposit schemes with promises of 300% returns, before funds are locked.",
        "indicator_of_compromise": "Telegram task groups, screenshot proofs, initial small payouts ($10) to build trust, followed by demands for $1000+ deposits.",
        "preventative_tip": "Legitimate brands do not pay random Telegram users high rates for rating videos.",
        "date_reported": "2026-09-29"
    }
]

class DatabaseManager:
    def __init__(self):
        self.profile = INITIAL_PROFILE.copy()
        self.transactions = [t.copy() for t in INITIAL_TRANSACTIONS]
        self.budgets = [b.copy() for b in INITIAL_BUDGETS]
        self.family_members = [f.copy() for f in INITIAL_FAMILY_MEMBERS]
        self.threats = [t.copy() for t in INITIAL_THREATS]
        self.load()

    def save(self):
        try:
            os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "profile": self.profile,
                    "transactions": self.transactions,
                    "budgets": self.budgets,
                    "family_members": self.family_members,
                    "threats": self.threats
                }, f, indent=2)
        except Exception as e:
            print(f"Failed to persist DB: {e}")

    def load(self):
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.profile = data.get("profile", self.profile)
                    self.transactions = data.get("transactions", self.transactions)
                    self.budgets = data.get("budgets", self.budgets)
                    self.family_members = data.get("family_members", self.family_members)
                    self.threats = data.get("threats", self.threats)
            except Exception as e:
                print(f"Error loading persisted data: {e}")

db = DatabaseManager()
