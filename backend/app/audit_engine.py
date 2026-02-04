"""
Core Audit Engine for SentinelAI
Orchestrates all audit components and calculates composite AI Risk Score
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Literal
import pandas as pd

from app.config import RISK_WEIGHTS, RISK_THRESHOLDS
from app.dataset_generator import get_dataset, DatasetMode
from app.bias_detection import calculate_bias_risk_score
from app.drift_detection import calculate_drift_risk_score
from app.explainability import calculate_explainability_score
from app.recommendations import generate_all_recommendations

def calculate_ai_risk_score(
    bias_score: float,
    drift_score: float,
    explainability_score: float
) -> Dict[str, Any]:
    """
    Calculate composite AI Risk Score
    
    Formula:
    AI_RISK_SCORE = 0.4 × Bias_Risk + 0.35 × Drift_Risk + 0.25 × (100 - Explainability)
    
    Status:
    - 0-40: PASS
    - 40-70: WARNING
    - 70-100: FAIL
    """
    # Explainability is inverted (higher is better, but we want higher risk = worse)
    explainability_risk = 100 - explainability_score
    
    ai_risk_score = (
        RISK_WEIGHTS["bias"] * bias_score +
        RISK_WEIGHTS["drift"] * drift_score +
        RISK_WEIGHTS["explainability"] * explainability_risk
    )
    
    ai_risk_score = min(100, max(0, ai_risk_score))
    
    # Determine status
    if ai_risk_score <= RISK_THRESHOLDS["PASS"][1]:
        status = "PASS"
    elif ai_risk_score <= RISK_THRESHOLDS["WARNING"][1]:
        status = "WARNING"
    else:
        status = "FAIL"
    
    return {
        "score": round(ai_risk_score, 1),
        "status": status,
        "components": {
            "bias_contribution": round(RISK_WEIGHTS["bias"] * bias_score, 1),
            "drift_contribution": round(RISK_WEIGHTS["drift"] * drift_score, 1),
            "explainability_contribution": round(RISK_WEIGHTS["explainability"] * explainability_risk, 1)
        }
    }

def generate_executive_summary(
    ai_risk: Dict[str, Any],
    bias_result: Dict[str, Any],
    drift_result: Dict[str, Any],
    dataset_mode: str
) -> str:
    """Generate one-line executive summary"""
    
    status = ai_risk["status"]
    score = ai_risk["score"]
    
    if status == "PASS":
        return f"Model performance is healthy with an AI Risk Score of {score:.0f}. No critical issues detected."
    elif status == "WARNING":
        # Identify primary concern
        if bias_result["bias_risk_score"] > drift_result["drift_risk_score"]:
            concern = f"bias concerns (DI: {bias_result['gender_di']['di_ratio']:.2f})"
        else:
            concern = f"performance drift (accuracy drop: {drift_result['accuracy_drift']['accuracy_drop_percent']:.1f}%)"
        return f"Elevated AI Risk Score of {score:.0f} due to {concern}. Review recommended."
    else:
        return f"Critical AI Risk Score of {score:.0f}. Immediate action required to address compliance violations."

def run_audit(dataset_mode: DatasetMode) -> Dict[str, Any]:
    """
    Run complete audit on specified dataset
    Returns comprehensive audit results
    """
    # Generate unique audit ID
    audit_id = f"AUDIT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.utcnow().isoformat()
    
    # Get dataset
    df = get_dataset(dataset_mode)
    
    # Run all analyses
    bias_result = calculate_bias_risk_score(df)
    drift_result = calculate_drift_risk_score(df)
    explainability_result = calculate_explainability_score(df)
    
    # Calculate composite score
    ai_risk = calculate_ai_risk_score(
        bias_result["bias_risk_score"],
        drift_result["drift_risk_score"],
        explainability_result["explainability_score"]
    )
    
    # Generate recommendations
    recommendations = generate_all_recommendations(
        bias_result,
        drift_result,
        explainability_result,
        ai_risk["score"]
    )
    
    # Generate executive summary
    executive_summary = generate_executive_summary(
        ai_risk,
        bias_result,
        drift_result,
        dataset_mode
    )
    
    # Compile full audit result
    audit_result = {
        "audit_id": audit_id,
        "timestamp": timestamp,
        "dataset_mode": dataset_mode,
        
        # Core metrics
        "ai_risk_score": ai_risk["score"],
        "risk_status": ai_risk["status"],
        "risk_components": ai_risk["components"],
        
        # Component scores
        "bias_risk_score": bias_result["bias_risk_score"],
        "drift_risk_score": drift_result["drift_risk_score"],
        "explainability_score": explainability_result["explainability_score"],
        
        # Detailed results
        "bias_details": {
            "score": bias_result["bias_risk_score"],
            "gender_di": bias_result["gender_di"],
            "age_bias": bias_result["age_bias"],
            "income_proxy": bias_result["income_proxy"],
            "violations": bias_result["violations"],
            "explanation": bias_result["explanation"]
        },
        "drift_details": {
            "score": drift_result["drift_risk_score"],
            "severity": drift_result["severity"],
            "accuracy_drift": drift_result["accuracy_drift"],
            "prediction_drift": drift_result["prediction_drift"],
            "drifted_features": drift_result["drifted_features"],
            "explanation": drift_result["explanation"]
        },
        "explainability_details": {
            "score": explainability_result["explainability_score"],
            "feature_coverage": explainability_result["feature_coverage"],
            "transparency": explainability_result["transparency"],
            "gaps": explainability_result["gaps"],
            "explanation": explainability_result["explanation"]
        },
        
        # Recommendations
        "recommendations": recommendations,
        
        # Executive summary
        "executive_summary": executive_summary,
        
        # Dataset statistics
        "dataset_stats": {
            "total_records": len(df),
            "approval_rate": round(df["prediction"].mean(), 3),
            "accuracy": round((df["prediction"] == df["actual_outcome"]).mean(), 3)
        }
    }
    
    return audit_result
