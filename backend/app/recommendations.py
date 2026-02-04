"""
Recommendation Engine for SentinelAI
Generates actionable recommendations based on audit findings
"""
from typing import Dict, Any, List

def generate_bias_recommendations(bias_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate recommendations for bias issues"""
    recommendations = []
    
    bias_score = bias_result["bias_risk_score"]
    violations = bias_result.get("violations", [])
    
    if bias_score > 70:
        recommendations.append({
            "id": "BIAS_001",
            "severity": "Critical",
            "category": "Bias",
            "title": "Immediate Model Retraining Required",
            "description": "Disparate Impact ratio is below regulatory threshold. Retrain model with balanced demographic data.",
            "action": "Schedule emergency review with ML team within 48 hours",
            "impact": "High",
            "effort": "High"
        })
    
    if any(v.get("type") == "Gender Disparate Impact" for v in violations):
        recommendations.append({
            "id": "BIAS_002",
            "severity": "Critical",
            "category": "Bias",
            "title": "Address Gender-Based Approval Disparity",
            "description": f"Female applicants have significantly lower approval rates. Review feature weights and remove any gender-correlated proxies.",
            "action": "Conduct feature audit to identify proxy variables",
            "impact": "High",
            "effort": "Medium"
        })
    
    if bias_result.get("income_proxy", {}).get("proxy_detected"):
        recommendations.append({
            "id": "BIAS_003",
            "severity": "High",
            "category": "Bias",
            "title": "Remove Income Proxy Bias",
            "description": "Income feature may be acting as a proxy for protected characteristics.",
            "action": "Consider removing or re-weighting income feature in model",
            "impact": "Medium",
            "effort": "Medium"
        })
    
    if 40 < bias_score <= 70:
        recommendations.append({
            "id": "BIAS_004",
            "severity": "Moderate",
            "category": "Bias",
            "title": "Implement Bias Monitoring",
            "description": "Moderate bias detected. Set up continuous monitoring for approval rate disparities.",
            "action": "Configure weekly bias reports by demographic group",
            "impact": "Medium",
            "effort": "Low"
        })
    
    return recommendations

def generate_drift_recommendations(drift_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate recommendations for drift issues"""
    recommendations = []
    
    drift_score = drift_result["drift_risk_score"]
    accuracy_drift = drift_result.get("accuracy_drift", {})
    drifted_features = drift_result.get("drifted_features", [])
    
    if drift_score > 60:
        recommendations.append({
            "id": "DRIFT_001",
            "severity": "Critical",
            "category": "Drift",
            "title": "Immediate Model Retraining Required",
            "description": f"Model accuracy has dropped by {accuracy_drift.get('accuracy_drop_percent', 0):.1f}%. Data distribution has shifted significantly.",
            "action": "Schedule model retraining with current data distribution within 7 days",
            "impact": "High",
            "effort": "High"
        })
    
    if drifted_features:
        feature_names = ", ".join([f["feature"] for f in drifted_features])
        recommendations.append({
            "id": "DRIFT_002",
            "severity": "High",
            "category": "Drift",
            "title": "Feature Distribution Shift Detected",
            "description": f"Significant distribution shift in: {feature_names}",
            "action": "Investigate root cause of distribution changes (market shift, data quality, etc.)",
            "impact": "High",
            "effort": "Medium"
        })
    
    if accuracy_drift.get("significant_drop"):
        recommendations.append({
            "id": "DRIFT_003",
            "severity": "High",
            "category": "Drift",
            "title": "Model Performance Degradation",
            "description": f"Accuracy dropped from {accuracy_drift.get('baseline_accuracy', 0):.1%} to {accuracy_drift.get('current_accuracy', 0):.1%}",
            "action": "Evaluate if model assumptions still hold with current data",
            "impact": "High",
            "effort": "Medium"
        })
    
    if 30 < drift_score <= 60:
        recommendations.append({
            "id": "DRIFT_004",
            "severity": "Moderate",
            "category": "Drift",
            "title": "Schedule Proactive Retraining",
            "description": "Moderate drift detected. Plan for model retraining to prevent further degradation.",
            "action": "Schedule retraining within 14 days",
            "impact": "Medium",
            "effort": "Medium"
        })
    
    return recommendations

def generate_explainability_recommendations(explainability_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate recommendations for explainability gaps"""
    recommendations = []
    
    score = explainability_result["explainability_score"]
    gaps = explainability_result.get("gaps", [])
    
    if score < 60:
        recommendations.append({
            "id": "EXPLAIN_001",
            "severity": "High",
            "category": "Explainability",
            "title": "Improve Model Documentation",
            "description": "Model lacks sufficient documentation for regulatory compliance.",
            "action": "Create comprehensive model card with feature importance and decision logic",
            "impact": "High",
            "effort": "Medium"
        })
    
    if "Feature importance documentation incomplete" in gaps:
        recommendations.append({
            "id": "EXPLAIN_002",
            "severity": "Moderate",
            "category": "Explainability",
            "title": "Document Feature Importance",
            "description": "Feature importance rankings are not fully documented.",
            "action": "Generate SHAP values and document feature contributions",
            "impact": "Medium",
            "effort": "Low"
        })
    
    if "Decision boundaries are unclear" in gaps:
        recommendations.append({
            "id": "EXPLAIN_003",
            "severity": "Moderate",
            "category": "Explainability",
            "title": "Clarify Decision Boundaries",
            "description": "Many predictions are near the decision boundary, making explanations difficult.",
            "action": "Consider implementing confidence thresholds for marginal cases",
            "impact": "Medium",
            "effort": "Medium"
        })
    
    return recommendations

def generate_all_recommendations(
    bias_result: Dict[str, Any],
    drift_result: Dict[str, Any],
    explainability_result: Dict[str, Any],
    ai_risk_score: float
) -> List[Dict[str, Any]]:
    """Generate all recommendations sorted by severity"""
    
    all_recommendations = []
    
    # Collect all recommendations
    all_recommendations.extend(generate_bias_recommendations(bias_result))
    all_recommendations.extend(generate_drift_recommendations(drift_result))
    all_recommendations.extend(generate_explainability_recommendations(explainability_result))
    
    # Add general recommendations based on overall risk
    if ai_risk_score > 70:
        all_recommendations.insert(0, {
            "id": "GENERAL_001",
            "severity": "Critical",
            "category": "Overall",
            "title": "Model Deployment at Risk",
            "description": "AI Risk Score exceeds acceptable threshold. Consider temporary model suspension.",
            "action": "Convene risk committee to evaluate continued deployment",
            "impact": "Critical",
            "effort": "High"
        })
    elif ai_risk_score > 50:
        all_recommendations.append({
            "id": "GENERAL_002",
            "severity": "Moderate",
            "category": "Overall",
            "title": "Increase Monitoring Frequency",
            "description": "Elevated risk score detected. Increase audit frequency.",
            "action": "Switch from weekly to daily monitoring",
            "impact": "Medium",
            "effort": "Low"
        })
    
    # Sort by severity
    severity_order = {"Critical": 0, "High": 1, "Moderate": 2, "Low": 3}
    all_recommendations.sort(key=lambda x: severity_order.get(x["severity"], 4))
    
    return all_recommendations
