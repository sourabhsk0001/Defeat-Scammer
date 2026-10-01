from typing import List, Dict, Any
from app.services.rag.documents import OFFICIAL_KNOWLEDGE_DOCUMENTS

class DocumentLoader:
    """
    Ingests and validates authoritative official documents across:
    1. Financial literacy
    2. UPI safety
    3. Cyber safety
    4. Banking basics
    5. Loan terminology
    6. Insurance basics
    7. Government schemes
    8. Official fraud-reporting guidance

    Ensures all 6 mandatory metadata fields are strictly present:
    - source
    - title
    - publication/update date
    - jurisdiction
    - document type
    - URL
    """

    REQUIRED_METADATA_FIELDS = [
        "source", "title", "publication_date", "jurisdiction", "document_type", "url"
    ]

    def __init__(self, raw_documents: List[Dict[str, Any]] = None):
        self.raw_documents = raw_documents or OFFICIAL_KNOWLEDGE_DOCUMENTS

    def load(self) -> List[Dict[str, Any]]:
        """Loads and validates documents, ensuring complete metadata compliance."""
        validated_documents = []

        for doc in self.raw_documents:
            # Validate required fields
            missing_fields = [f for f in self.REQUIRED_METADATA_FIELDS if not doc.get(f)]
            if missing_fields:
                raise ValueError(f"Document '{doc.get('id', 'unknown')}' missing mandatory fields: {missing_fields}")

            validated_documents.append({
                "id": doc["id"],
                "category": doc["category"],
                "title": doc["title"],
                "source": doc["source"],
                "publication_date": doc["publication_date"],
                "update_date": doc.get("update_date", doc["publication_date"]),
                "jurisdiction": doc["jurisdiction"],
                "document_type": doc["document_type"],
                "url": doc["url"],
                "content": doc["content"].strip(),
                "keywords": doc.get("keywords", [])
            })

        return validated_documents
