from ml.synthetic_data_generator import generate_synthetic_transactions
from ml.risk_scorer import risk_scorer

def evaluate_model():
    """Generates synthetic dataset and benchmarks precision/recall of the risk engine."""
    dataset = generate_synthetic_transactions(n_samples=200, fraud_ratio=0.15)
    history = [d for d in dataset if not d["is_fraud_ground_truth"]][:50]
    test_set = dataset[50:]

    tp, fp, fn, tn = 0, 0, 0, 0

    for tx in test_set:
        score, is_flagged, flags = risk_scorer.score(tx, history)
        actual_fraud = tx["is_fraud_ground_truth"]

        if is_flagged and actual_fraud:
            tp += 1
        elif is_flagged and not actual_fraud:
            fp += 1
        elif not is_flagged and actual_fraud:
            fn += 1
        else:
            tn += 1

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

    print("--- ML Anomaly Detector Evaluation ---")
    print(f"Total Evaluated: {len(test_set)}")
    print(f"True Positives: {tp}, False Positives: {fp}, False Negatives: {fn}, True Negatives: {tn}")
    print(f"Precision: {precision:.2%}")
    print(f"Recall:    {recall:.2%}")
    print(f"F1 Score:  {f1:.2%}")

if __name__ == "__main__":
    evaluate_model()
