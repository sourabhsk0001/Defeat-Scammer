from typing import List, Dict, Any

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OFFICIAL AUTHORITATIVE DOCUMENTS REGISTRY
# Domains:
# 1. Financial literacy
# 2. UPI safety
# 3. Cyber safety
# 4. Banking basics
# 5. Loan terminology
# 6. Insurance basics
# 7. Government schemes
# 8. Official fraud-reporting guidance
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OFFICIAL_KNOWLEDGE_DOCUMENTS: List[Dict[str, Any]] = [
    # 1. FINANCIAL LITERACY
    {
        "id": "doc_fin_lit_01",
        "category": "Financial literacy",
        "title": "National Strategy for Financial Education (NSFE 2020-2025): 5Cs Financial Competency Framework",
        "source": "Reserve Bank of India (RBI)",
        "publication_date": "2020-08-20",
        "update_date": "2024-03-15",
        "jurisdiction": "India",
        "document_type": "Regulatory Policy Framework",
        "url": "https://rbi.org.in/Scripts/PublicationReportDetails.aspx?ID=995",
        "content": (
            "The Reserve Bank of India, alongside SEBI, IRDAI, and PFRDA under the Technical Group on Financial Inclusion and Financial Literacy (TGFIFL), "
            "established the 5Cs Framework: Content, Capacity, Community, Communication, and Collaboration. "
            "Key Financial Literacy Pillars: "
            "1. Budgeting and Cash-Flow Discipline: Differentiating strictly between mandatory needs and discretionary wants; tracking monthly burn rates. "
            "2. Emergency Fund Buffering: Establishing a non-negotiable liquidity reserve equal to 3 to 6 months of basic living expenses kept in safe, liquid instruments. "
            "3. Compounding Capital Accumulation: Leveraging early, continuous systematic investments into regulated vehicles. "
            "4. Debt Prudence: Avoiding high-interest unhedged revolving credit; maintaining total debt service ratio (EMI-to-income) strictly below 40%. "
            "5. Ponzi & Unregulated Scheme Prohibition: Strict statutory warning under the Banning of Unregulated Deposit Schemes Act, 2019 against collective investment schemes promising unrealistic guaranteed returns."
        ),
        "keywords": ["financial literacy", "nsfe", "budgeting", "emergency fund", "compounding", "rbi", "sebi", "5cs framework", "unregulated deposit schemes"]
    },

    # 2. UPI SAFETY
    {
        "id": "doc_upi_safety_02",
        "category": "UPI safety",
        "title": "Unified Payments Interface (UPI) Procedural Security Guidelines & Consumer Protection Directives",
        "source": "National Payments Corporation of India (NPCI)",
        "publication_date": "2023-11-10",
        "update_date": "2024-06-01",
        "jurisdiction": "India",
        "document_type": "Statutory Operating Standard",
        "url": "https://www.npci.org.in/what-we-do/upi/product-overview",
        "content": (
            "The National Payments Corporation of India (NPCI) mandates strict security protocols for all UPI transactions across PSP banks and third-party app providers (TPAPs): "
            "1. Golden Rule of UPI PIN: A UPI PIN is solely and exclusively an authorization credential to DEBIT money from a bank account. A user NEVER needs to enter a UPI PIN or scan a QR code to RECEIVE money. "
            "2. Collect Request Vulnerability: Fraudsters impersonating buyers on platforms like OLX or Quikr initiate UPI 'Collect Requests' masquerading as credits. Approving a collect request immediately debits funds. "
            "3. QR Code Safety: QR codes encode destination payment addresses. Scanning a QR code only initiates an outgoing transfer; scanning can never deposit funds into the scanner's account. "
            "4. Transaction Limits & Biometrics: Standard P2P transaction caps of ₹1 Lakh per day (₹5 Lakh for hospitals and educational institutions). Always verify the payee verified merchant name displayed on the confirmation screen before entering the 4 or 6-digit MPIN. "
            "5. Dispute Resolution: Use the Online Dispute Resolution (ODR) / UPI Help feature inside the app immediately if an erroneous or fraudulent transaction occurs."
        ),
        "keywords": ["upi safety", "npci", "upi pin", "qr code", "collect request", "olx scam", "mpin", "rbi kehta hai", "dispute resolution"]
    },

    # 3. CYBER SAFETY
    {
        "id": "doc_cyber_safety_03",
        "category": "Cyber safety",
        "title": "Citizen Cyber Defense Advisory: Device Hardening, Remote Access Mitigation & Sideloading Prevention",
        "source": "Indian Computer Emergency Response Team (CERT-In) & I4C",
        "publication_date": "2022-04-28",
        "update_date": "2024-05-18",
        "jurisdiction": "India / Global",
        "document_type": "National Security Advisory",
        "url": "https://www.cert-in.org.in/",
        "content": (
            "CERT-In and the Indian Cyber Crime Coordination Centre (I4C) issue standard defensive baselines for citizen cyber safety: "
            "1. Remote Access Trojans (RATs): Never install remote desktop management applications (AnyDesk, TeamViewer, RustDesk, QuickSupport) at the behest of callers claiming to be bank executives, telecom agents, or courier support. Disclosing the 9-digit session passkey gives full device control to the adversary. "
            "2. Malicious Android APK Sideloading: Never install .apk files delivered via WhatsApp, SMS, or Telegram (e.g., 'SBI_KYC.apk', 'e-Challan_Update.apk', 'Wedding_Invitation.apk'). These banking trojans request accessibility permissions to capture SMS OTPs and keyboard inputs silently. "
            "3. Two-Factor Authentication (2FA): Enable app-based authenticator (TOTP) or hardware FIDO keys rather than plain SMS where available, preventing SIM-swap interception. "
            "4. Digital Arrest Hoax: Law enforcement agencies (CBI, State Police, ED, Customs) NEVER conduct court proceedings, arrests, or trials over video calls (Skype, WhatsApp). Disconnect and report immediately."
        ),
        "keywords": ["cyber safety", "cert-in", "i4c", "anydesk", "teamviewer", "sideloading", "apk trojan", "digital arrest", "mfa", "remote access"]
    },

    # 4. BANKING BASICS
    {
        "id": "doc_banking_basics_04",
        "category": "Banking basics",
        "title": "Charter of Customer Rights & Master Direction on Know Your Customer (KYC)",
        "source": "Reserve Bank of India (RBI)",
        "publication_date": "2016-02-25",
        "update_date": "2024-04-30",
        "jurisdiction": "India",
        "document_type": "Master Direction",
        "url": "https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11566",
        "content": (
            "The RBI Charter of Customer Rights enshrines five fundamental consumer protections across all scheduled commercial banks: "
            "1. Right to Fair Treatment: Freedom from discrimination and unfair contract terms. "
            "2. Right to Transparency, Freedom and Choice: Clear disclosure of all banking tariffs, penalty charges, and minimum balance rules. "
            "3. Right to Suitability: Products offered must align with customer needs. "
            "4. Right to Privacy & Confidentiality: Personal customer data must be safeguarded. Banks NEVER solicit confidential credentials (passwords, ATM PINs, OTPs, CVV, UPI PINs) via email, SMS, phone calls, or unverified links. "
            "5. Periodic KYC Update Protocol: KYC updates must be conducted through secure bank branch visits, official net-banking portals, or certified Video-based Customer Identification Processes (V-CIP). Banks will NEVER threaten same-day account suspension via casual SMS demanding third-party document uploads."
        ),
        "keywords": ["banking basics", "rbi", "charter of customer rights", "kyc update", "v-cip", "customer privacy", "grievance redress", "confidential credentials"]
    },

    # 5. LOAN TERMINOLOGY
    {
        "id": "doc_loan_terminology_05",
        "category": "Loan terminology",
        "title": "Regulatory Framework for Digital Lending & Fair Practices Code for Lenders",
        "source": "Reserve Bank of India (RBI)",
        "publication_date": "2022-09-02",
        "update_date": "2023-12-28",
        "jurisdiction": "India",
        "document_type": "Regulatory Master Circular",
        "url": "https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12382",
        "content": (
            "RBI guidelines mandate transparent digital lending standards for Regulated Entities (REs) and Lending Service Providers (LSPs): "
            "1. Key Fact Statement (KFS): Lenders must provide a standardized KFS to borrowers before executing any loan contract, disclosing all inclusive costs. "
            "2. Annual Percentage Rate (APR): The all-inclusive annualized cost of credit to the borrower, incorporating interest rate and all processing, origination, and legal fees. "
            "3. Cooling-Off / Look-Up Period: Borrowers have a minimum look-up window (typically 3 days for loans < 7 days, 1 day for others) to exit the digital loan by paying principal and proportionate APR without penalty. "
            "4. Privacy Prohibitions: Lending apps are strictly forbidden from accessing mobile device storage, contact lists, call logs, and personal media files. "
            "5. Direct Disbursement: Loan disbursals and repayments must execute directly between the borrower's bank account and the Regulated Entity, without pass-through to third-party pool accounts. "
            "6. Recovery Agent Conduct: Lenders cannot resort to intimidation, harassment, or calling borrowers at unreasonable hours."
        ),
        "keywords": ["loan terminology", "digital lending", "kfs", "key fact statement", "apr", "annual percentage rate", "cooling-off period", "recovery guidelines", "rbi"]
    },

    # 6. INSURANCE BASICS
    {
        "id": "doc_insurance_basics_06",
        "category": "Insurance basics",
        "title": "Master Circular on Protection of Policyholders' Interests & Claims Settlement Norms",
        "source": "Insurance Regulatory and Development Authority of India (IRDAI)",
        "publication_date": "2024-06-19",
        "update_date": "2024-06-19",
        "jurisdiction": "India",
        "document_type": "Regulatory Master Circular",
        "url": "https://irdai.gov.in/master-circulars",
        "content": (
            "IRDAI Consolidated Master Circular defines key operational standards protecting policyholders: "
            "1. Free-Look Period: Policyholders are entitled to a mandatory 30-day Free-Look window (for electronic or distance policies) from receipt of policy documents to review terms and return the policy for a full refund minus stamp duty and medical expenses. "
            "2. Grace Period: 30 days for policies on annual/half-yearly/quarterly modes, and 15 days for monthly modes, during which insurance coverage remains active. "
            "3. Claim Settlement Timelines: Life and health insurers must settle claims or issue queries within 30 days of receiving all required documents. Delay invites penal interest 2% above bank rate. "
            "4. Principle of Utmost Good Faith (Uberrimae Fidei): Material disclosure of pre-existing health conditions is required; Section 45 of Insurance Act protects policies after 3 years against rejection on grounds of misstatement. "
            "5. Spurious Call Warning: Beware of fraudsters posing as IRDAI officials promising bonus payouts or claiming lapsed policies have unclaimed cash. IRDAI does not sell insurance or invest funds."
        ),
        "keywords": ["insurance basics", "irdai", "free-look period", "grace period", "claims settlement", "policyholder protection", "spurious calls", "term insurance"]
    },

    # 7. GOVERNMENT SCHEMES
    {
        "id": "doc_gov_schemes_07",
        "category": "Government schemes",
        "title": "National Financial Inclusion & Social Security Schemes Compendium: PMJDY, PMJJBY, PMSBY, APY",
        "source": "Department of Financial Services, Ministry of Finance (Govt of India)",
        "publication_date": "2014-08-28",
        "update_date": "2024-01-15",
        "jurisdiction": "India",
        "document_type": "Statutory Scheme Charter",
        "url": "https://financialservices.gov.in/schemes",
        "content": (
            "Official specifications for national social security and financial inclusion programs: "
            "1. Pradhan Mantri Jan Dhan Yojana (PMJDY): Zero-balance basic savings bank deposit (BSBD) accounts with RuPay debit card, ₹2 Lakh accidental insurance cover, and overdraft facility up to ₹10,000 for eligible account holders. "
            "2. Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY): One-year life insurance cover of ₹2 Lakh for death due to any cause, renewable annually. Eligible for age 18-50 years at an annual premium of ₹436 auto-debited from bank account. "
            "3. Pradhan Mantri Suraksha Bima Yojana (PMSBY): One-year accidental death and full disability cover of ₹2 Lakh (₹1 Lakh for partial disability) for age 18-70 years at an annual premium of ₹20 auto-debited. "
            "4. Atal Pension Yojana (APY): Guaranteed monthly pension of ₹1,000 to ₹5,000 post age 60 for unorganized sector workers joining between age 18-40. Administered by PFRDA. "
            "Official advice: Enroll exclusively through verified public/private sector bank branches or official mobile banking apps. Never pay cash fees to private intermediaries."
        ),
        "keywords": ["government schemes", "pmjdy", "pmjjby", "pmsby", "atal pension yojana", "financial inclusion", "social security", "life cover", "ministry of finance"]
    },

    # 8. OFFICIAL FRAUD-REPORTING GUIDANCE
    {
        "id": "doc_fraud_reporting_08",
        "category": "Official fraud-reporting guidance",
        "title": "Standard Operating Procedure: Citizen Financial Cyber Fraud Reporting & Helpline 1930 Protocol",
        "source": "Ministry of Home Affairs (MHA) & Indian Cyber Crime Coordination Centre (I4C)",
        "publication_date": "2021-04-01",
        "update_date": "2024-05-10",
        "jurisdiction": "India",
        "document_type": "Standard Operating Procedure (SOP)",
        "url": "https://cybercrime.gov.in/",
        "content": (
            "Comprehensive procedure for reporting financial cyber fraud to maximize funds recovery: "
            "1. The Golden Hour Window: The first 1 to 2 hours immediately following unauthorized fund deduction are critical. Reporting during this period allows law enforcement and banks to freeze fraudulent money in transit before cash-out at ATMs or crypto conversions. "
            "2. Immediate Action - Dial 1930: Dial the National Cyber Crime Helpline '1930' (formerly 155260). The automated Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS) logs transaction details and triggers real-time alerts to the sending bank, intermediary payment gateways, and recipient banks to place a lien on defrauded funds. "
            "3. Evidentiary Data Required: Keep ready: a) Victim bank account number and UPI ID, b) Exact timestamp of transaction, c) Unique Transaction Reference (UTR) number or Transaction ID, d) Beneficiary account/UPI details, e) Screenshots of deceptive communications. "
            "4. Formal Electronic Filing: Complete formal FIR / e-complaint on the National Cyber Crime Reporting Portal at 'https://cybercrime.gov.in' within 24 hours using the acknowledgement token received via SMS from 1930."
        ),
        "keywords": ["fraud-reporting", "helpline 1930", "golden hour", "cfcfrms", "cybercrime.gov.in", "utr number", "lien on funds", "mha", "i4c", "police complaint"]
    }
]
