"""
Drift Detection Engine for SentinelAI
Statistical tests for distribution shift detection
"""
import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List
from app.dataset_generator import get_baseline_dataset

def ks_test_feature(baseline: np.ndarray, current: np.ndarray) -> Dict[str, Any]:
    """
    Perform Kolmogorov-Smirnov test for distribution shift
    Returns statistic and p-value
    """
    statistic, p_value = stats.ks_2samp(baseline, current)
    
    # Drift detected if p-value < 0.05 (significant difference)
    drift_detected = bool(p_value < 0.05)
    
    return {
        "statistic": float(round(statistic, 4)),
        "p_value": float(round(p_value, 4)),
        "drift_detected": drift_detected
    }

def calculate_feature_drift(baseline_df: pd.DataFrame, current_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate drift for all numerical features
    """
    numerical_features = ["age", "income", "credit_score", "debt_ratio"]
    
    drift_results = {}
    
    for feature in numerical_features:
        baseline_values = baseline_df[feature].values
        current_values = current_df[feature].values
        
        ks_result = ks_test_feature(baseline_values, current_values)
        
        # Calculate distribution statistics
        baseline_mean = float(np.mean(baseline_values))
        current_mean = float(np.mean(current_values))
        mean_shift = ((current_mean - baseline_mean) / baseline_mean) * 100
        
        baseline_std = float(np.std(baseline_values))
        current_std = float(np.std(current_values))
        
        drift_results[feature] = {
            "ks_test": ks_result,
            "baseline_mean": round(baseline_mean, 2),
            "current_mean": round(current_mean, 2),
            "mean_shift_percent": round(mean_shift, 2),
            "baseline_std": round(baseline_std, 2),
            "current_std": round(current_std, 2)
        }
    
    return drift_results

def calculate_accuracy_drift(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate model accuracy and compare to baseline
    Baseline accuracy: 87% (clean dataset)
    """
    baseline_accuracy = 0.87
    
    current_accuracy = (df["prediction"] == df["actual_outcome"]).mean()
    accuracy_drop = baseline_accuracy - current_accuracy
    accuracy_drop_percent = (accuracy_drop / baseline_accuracy) * 100
    
    return {
        "baseline_accuracy": baseline_accuracy,
        "current_accuracy": float(round(current_accuracy, 3)),
        "accuracy_drop": float(round(accuracy_drop, 3)),
        "accuracy_drop_percent": float(round(accuracy_drop_percent, 1)),
        "significant_drop": bool(accuracy_drop > 0.05)  # More than 5% drop is significant
    }

def calculate_prediction_drift(baseline_df: pd.DataFrame, current_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate drift in prediction distribution
    """
    baseline_approval_rate = baseline_df["prediction"].mean()
    current_approval_rate = current_df["prediction"].mean()
    
    rate_change = current_approval_rate - baseline_approval_rate
    rate_change_percent = (rate_change / baseline_approval_rate) * 100
    
    return {
        "baseline_approval_rate": float(round(baseline_approval_rate, 3)),
        "current_approval_rate": float(round(current_approval_rate, 3)),
        "rate_change": float(round(rate_change, 3)),
        "rate_change_percent": float(round(rate_change_percent, 1)),
        "significant_change": bool(abs(rate_change) > 0.05)
    }

def calculate_drift_risk_score(current_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate comprehensive drift risk score (0-100)
    Higher score = more drift = higher risk
    """
    baseline_df = get_baseline_dataset()
    
    # Feature drift
    feature_drift = calculate_feature_drift(baseline_df, current_df)
    
    # Accuracy drift
    accuracy_drift = calculate_accuracy_drift(current_df)
    
    # Prediction distribution drift
    prediction_drift = calculate_prediction_drift(baseline_df, current_df)
    
    # Count features with significant drift
    features_with_drift = sum(
        1 for f in feature_drift.values() 
        if f["ks_test"]["drift_detected"]
    )
    
    # Calculate component scores
    # Feature drift contribution (0-40)
    feature_drift_score = (features_with_drift / 4) * 40
    
    # Accuracy drop contribution (0-40)
    accuracy_drop_score = min(40, accuracy_drift["accuracy_drop_percent"] * 4)
    
    # Prediction distribution shift (0-20)
    prediction_shift_score = min(20, abs(prediction_drift["rate_change_percent"]) * 2)
    
    # Total drift risk score
    drift_risk_score = feature_drift_score + accuracy_drop_score + prediction_shift_score
    
    # Determine severity
    if drift_risk_score < 20:
        severity = "Low"
        explanation = "Model performance is stable. No significant distribution shift detected."
    elif drift_risk_score < 40:
        severity = "Moderate"
        explanation = f"Minor drift detected. Model accuracy dropped by {accuracy_drift['accuracy_drop_percent']:.1f}%."
    elif drift_risk_score < 60:
        severity = "High"
        explanation = f"Significant drift detected. {features_with_drift} features show distribution shift. Accuracy dropped by {accuracy_drift['accuracy_drop_percent']:.1f}%."
    else:
        severity = "Critical"
        explanation = f"Severe drift detected. Model performance degraded significantly. Immediate retraining recommended."
    
    # Identify drifted features
    drifted_features = [
        {
            "feature": feature,
            "mean_shift": data["mean_shift_percent"],
            "ks_statistic": data["ks_test"]["statistic"]
        }
        for feature, data in feature_drift.items()
        if data["ks_test"]["drift_detected"]
    ]
    
    return {
        "drift_risk_score": round(drift_risk_score, 1),
        "severity": severity,
        "feature_drift": feature_drift,
        "accuracy_drift": accuracy_drift,
        "prediction_drift": prediction_drift,
        "features_with_drift": features_with_drift,
        "drifted_features": drifted_features,
        "explanation": explanation
    }
