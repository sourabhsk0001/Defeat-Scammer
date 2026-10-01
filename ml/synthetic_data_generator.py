import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

def generate_synthetic_transactions(n_samples: int = 100, fraud_ratio: float = 0.1) -> List[Dict[str, Any]]:
    """Generates synthetic dataset of typical personal banking + simulated fraud vectors."""
    normal_merchants = [
        ("Whole Foods", "Groceries", 25.0, 180.0),
        ("Starbucks Coffee", "Dining", 4.5, 18.0),
        ("Amazon Retail", "Shopping", 15.0, 120.0),
        ("Netflix Subscription", "Entertainment", 15.99, 15.99),
        ("Shell Fuel", "Transportation", 35.0, 75.0),
        ("City Electric Utilities", "Utilities", 80.0, 160.0),
        ("Salary Direct Deposit", "Income", 3000.0, 6500.0)
    ]

    fraud_merchants = [
        ("BitQuick Crypto Exchange", "Transfers", 1500.0, 5000.0),
        ("Unknown Digital Card Depot", "Shopping", 800.0, 2500.0),
        ("PAYPAL *TEST_PROBE_MICRO", "Services", 0.99, 2.50),
        ("Rapid Offshore Remittance LLC", "Transfers", 2200.0, 4800.0)
    ]

    dataset = []
    base_time = datetime.now() - timedelta(days=30)

    for i in range(n_samples):
        is_fraud = random.random() < fraud_ratio
        timestamp = base_time + timedelta(hours=i * 7 + random.randint(0, 5))

        if is_fraud:
            m_name, cat, min_a, max_a = random.choice(fraud_merchants)
            amt = round(random.uniform(min_a, max_a), 2)
            # Simulated midnight execution for fraud
            date_str = timestamp.strftime("%Y-%m-%d 02:%M")
            dataset.append({
                "id": f"syn_{i:04d}",
                "title": f"Charge: {m_name}",
                "amount": amt,
                "type": "debit",
                "category": cat,
                "merchant": m_name,
                "date": date_str,
                "is_fraud_ground_truth": True
            })
        else:
            m_name, cat, min_a, max_a = random.choice(normal_merchants)
            amt = round(random.uniform(min_a, max_a), 2)
            date_str = timestamp.strftime("%Y-%m-%d %H:%M")
            dataset.append({
                "id": f"syn_{i:04d}",
                "title": f"Payment to {m_name}",
                "amount": amt,
                "type": "credit" if cat == "Income" else "debit",
                "category": cat,
                "merchant": m_name,
                "date": date_str,
                "is_fraud_ground_truth": False
            })

    return dataset

if __name__ == "__main__":
    data = generate_synthetic_transactions(50, 0.15)
    print(f"Generated {len(data)} synthetic samples. Fraud count: {sum(1 for d in data if d['is_fraud_ground_truth'])}")
