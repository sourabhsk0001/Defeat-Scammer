import re
import math
from typing import List, Dict, Any

KNOWLEDGE_DOCS = [
    {
        "id": "rag_01",
        "title": "Digital Arrest & Law Enforcement Impersonation SOP",
        "category": "Extortion & Impersonation",
        "content": "Criminals pose as Police, Narcotics Control Bureau (NCB), CBI, or Customs officers. They claim a parcel with passport, drugs, or bank cards has been intercepted in your name. They simulate fake police station backgrounds, show forged supreme court warrants or ID cards, and demand money transfer to a 'safe RBI audit account' or 'reserve escrow' for verification. Key rule: No legal entity or police conducts trial or arrest on Skype/WhatsApp, nor demands money transfers.",
        "keywords": ["digital arrest", "police", "customs", "parcel", "drugs", "cbi", "warrant", "court", "skype", "law enforcement", "courier", "fedex"],
        "recommended_action": "Hang up immediately. Block caller. Dial 1930 (Cyber Crime Helpline) or lodge complaint on cybercrime.gov.in / ic3.gov."
    },
    {
        "id": "rag_02",
        "title": "Electricity / Utility Disconnection Phishing Schemes",
        "category": "Urgency & Utility Scam",
        "content": "Messages claim 'Dear Consumer, your electricity bill was not updated. Power will be disconnected tonight at 9:30 PM. Contact officer at 98xxxx'. Victims are made to install a screen-sharing app (QuickSupport, AnyDesk) or click an APK link that installs an SMS forwarder. The fraudster steals OTPs and empties bank accounts.",
        "keywords": ["electricity", "power", "disconnection", "unpaid bill", "tonight", "officer", "electrician", "bill update", "meter"],
        "recommended_action": "Never call the phone number in the SMS. Pay bills only via official utility portal or verified banking app."
    },
    {
        "id": "rag_03",
        "title": "UPI / QR Code Reversal Fraud ('PIN to Receive Money')",
        "category": "Payment Gateway Scam",
        "content": "Common on OLX, Facebook Marketplace, or refund requests. The fraudster sends a QR code or payment link claiming 'Scan this to receive your refund/advance payment'. Remember: You NEVER need to enter your UPI PIN, ATM PIN, or password to receive money. Entering your PIN ALWAYS debits money from your account.",
        "keywords": ["qr code", "upi pin", "receive money", "olx", "refund", "scan to receive", "enter pin to get cash"],
        "recommended_action": "Never enter your UPI PIN to receive funds. Report the UPI ID to NPCI / Bank immediately."
    },
    {
        "id": "rag_04",
        "title": "Remote Access Trojan (AnyDesk / RustDesk / TeamViewer) Scam",
        "category": "Tech Support / Screen Takeover",
        "content": "Scammers pose as bank tech support, airline helpline, or courier customer service. They ask victims to download AnyDesk or RustDesk and read out the 9-digit session code under the pretext of 'fixing a pending transaction'. Once screen access is granted, they monitor the victim typing OTPs or lock the device while making high-value transfers.",
        "keywords": ["anydesk", "teamviewer", "rustdesk", "quicksupport", "screen share", "9 digit code", "customer care", "helpline"],
        "recommended_action": "Immediately disable WiFi/Mobile Data. Uninstall the remote application. Change bank login passwords."
    },
    {
        "id": "rag_05",
        "title": "Pig Butchering (Sha Zhu Pan) & Fake Crypto Investment Scam",
        "category": "Investment Ponzi / Crypto",
        "content": "Begins with a 'wrong number' WhatsApp/LinkedIn text or dating app match. The scammer builds romantic rapport over weeks, then introduces an exclusive crypto/gold trading platform with guaranteed 20-50% daily returns. The platform shows fake massive profits, but when the victim attempts withdrawal, the platform demands a 30% 'tax/clearance fee'.",
        "keywords": ["crypto", "investment", "guaranteed profit", "high returns", "trading platform", "pig butchering", "wrong number", "telegram vip"],
        "recommended_action": "Cease all transfers. Never pay 'tax' to withdraw funds. Retain chat transcripts and wallet addresses for forensic filing."
    },
    {
        "id": "rag_06",
        "title": "Part-Time Task Scam (YouTube Like / Hotel Rating / Telegram Tasks)",
        "category": "Employment Fraud",
        "content": "Unsolicited WhatsApp or SMS offers flexible work from home: earn $50-$200 per day by rating hotels or liking YouTube videos. Scammers pay $10-$20 for the first 3 tasks to establish credibility. They then require prepaid 'merchant tasks' or crypto deposits of escalating amounts ($500 to $10,000) that can never be withdrawn.",
        "keywords": ["part time", "rating task", "youtube like", "work from home", "daily payout", "hotel review", "telegram group", "prepaid task"],
        "recommended_action": "Do not send any deposits. Exit the Telegram channel and report group to anti-fraud authorities."
    },
    {
        "id": "rag_07",
        "title": "Malicious APK Banking Trojan ('KYC Update' / 'e-Challan')",
        "category": "Malware & Device Takeover",
        "content": "Victim receives an SMS stating their SIM card will be deactivated or traffic fine (e-challan) is pending, containing a link to download an .APK file (e.g., 'SBI_KYC_Update.apk' or 'Parivahan_Challan.apk'). Once installed, it requests SMS permissions, contacts, and notification access to steal two-factor authentication OTPs silently.",
        "keywords": [".apk", "apk file", "kyc update", "sim block", "e-challan", "download apk", "install app", "pan card update"],
        "recommended_action": "Never install APK files sent via WhatsApp or SMS. If installed, immediately boot phone into Safe Mode and uninstall."
    }
]

from app.services.rag.pipeline import rag_pipeline
from app.services.rag.documents import OFFICIAL_KNOWLEDGE_DOCUMENTS

class RAGService:
    """
    Phase 12 — RAG Service interfacing with the Supabase pgvector pipeline
    and authoritative official documents knowledge base.
    """
    def __init__(self):
        self.docs = KNOWLEDGE_DOCS
        self.pipeline = rag_pipeline
        self.official_documents = OFFICIAL_KNOWLEDGE_DOCUMENTS

    def search_knowledge(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        # Retrieve from pgvector vector store first
        vector_results = self.pipeline.vector_store.similarity_search(
            query_embedding=self.pipeline.embedding_engine.get_embedding(query),
            top_k=top_k
        )
        if vector_results:
            return [
                {
                    "id": r["chunk_id"],
                    "title": f"{r['title']} ({r['source']})",
                    "category": r["category"],
                    "content": r["text"],
                    "recommended_action": f"Reference official {r['document_type']} at {r['url']}",
                    "relevance_score": r["similarity_score"],
                    "source": r["source"],
                    "url": r["url"],
                    "publication_date": r["publication_date"],
                    "jurisdiction": r["jurisdiction"],
                    "document_type": r["document_type"]
                }
                for r in vector_results
            ]

        # Heuristic fallback if vector index returned zero matches
        query_terms = set(re.findall(r"\w+", query.lower()))
        scored_docs = []

        for doc in self.docs:
            score = 0
            doc_text = (doc["title"] + " " + doc["content"] + " " + " ".join(doc["keywords"])).lower()
            
            for kw in doc["keywords"]:
                if kw in query.lower():
                    score += 5
            
            for term in query_terms:
                if len(term) > 3 and term in doc_text:
                    score += 2

            if score > 0:
                scored_docs.append({
                    "id": doc["id"],
                    "title": doc["title"],
                    "category": doc["category"],
                    "content": doc["content"],
                    "recommended_action": doc["recommended_action"],
                    "relevance_score": min(score * 10, 100)
                })

        scored_docs.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_docs[:top_k]

    async def answer_with_sources(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """Executes full RAG flow: Official Docs ➔ Loader ➔ Chunking ➔ Embeddings ➔ pgvector ➔ Retriever ➔ Gemini ➔ Answer + Sources."""
        return await self.pipeline.query(user_query=query, top_k=top_k)

rag_service = RAGService()

