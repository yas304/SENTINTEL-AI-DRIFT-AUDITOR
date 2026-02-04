"""
Explainability Analysis for SentinelAI
Calculates model explainability coverage
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List

def calculate_feature_importance_coverage(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze if key features are documented and their importance is understood
    In production, this would integrate with SHAP/LIME
    For demo, we simulate based on feature presence and variability
    """
    key_features = ["age", "income", "credit_score", "debt_ratio", "employment_type"]
    
    feature_analysis = {}
    documented_features = 0
    
    for feature in key_features:
        if feature in df.columns:
            # Check if feature has meaningful variation
            if df[feature].dtype in ['int64', 'float64']:
                variance = df[feature].var()
                has_variation = variance > 0
                correlation_with_outcome = abs(df[feature].corr(df["prediction"]))
            else:
                # Categorical
                unique_ratio = df[feature].nunique() / len(df)
                has_variation = unique_ratio > 0.01
                # Calculate point-biserial correlation for categorical
                encoded = pd.factorize(df[feature])[0]
                correlation_with_outcome = abs(np.corrcoef(encoded, df["prediction"])[0, 1])
            
            feature_analysis[feature] = {
                "present": True,
                "has_variation": has_variation,
                "influence_score": round(correlation_with_outcome, 3) if not np.isnan(correlation_with_outcome) else 0,
                "documented": True  # Simulated - in production would check model documentation
            }
            documented_features += 1
        else:
            feature_analysis[feature] = {
                "present": False,
                "documented": False
            }
    
    documentation_coverage = (documented_features / len(key_features)) * 100
    
    return {
        "feature_analysis": feature_analysis,
        "documentation_coverage": round(documentation_coverage, 1),
        "documented_features": documented_features,
        "total_features": len(key_features)
    }

def calculate_decision_transparency(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze how transparent/interpretable the model decisions are
    """
    # Calculate decision boundary clarity
    # Higher variance in predictions around 0.5 threshold indicates unclear boundaries
    
    # Simulate prediction probabilities based on features
    approval_score = (
        0.3 * (df["credit_score"] - 300) / 550 +
        0.25 * (df["income"] - 20000) / 180000 +
        0.25 * (1 - df["debt_ratio"]) +
        0.2 * df["employment_type"].map({
            "Full-time": 1.0,
            "Part-time": 0.6,
            "Self-employed": 0.7,
            "Unemployed": 0.2
        })
    )
    
    # Check how many decisions are near the boundary (0.4-0.6)
    near_boundary = ((approval_score > 0.4) & (approval_score < 0.6)).mean()
    
    # High percentage near boundary = less clear decisions
    clarity_score = (1 - near_boundary) * 100
    
    return {
        "clarity_score": round(clarity_score, 1),
        "near_boundary_percent": round(near_boundary * 100, 1),
        "interpretation": "Clear" if clarity_score > 70 else "Moderate" if clarity_score > 50 else "Unclear"
    }

def calculate_audit_trail_coverage(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Check if necessary audit trail information is available
    """
    required_fields = ["customer_id", "prediction", "actual_outcome"]
    optional_fields = ["age", "gender", "income", "credit_score", "employment_type", "debt_ratio"]
    
    required_present = sum(1 for f in required_fields if f in df.columns)
    optional_present = sum(1 for f in optional_fields if f in df.columns)
    
    required_coverage = (required_present / len(required_fields)) * 100
    optional_coverage = (optional_present / len(optional_fields)) * 100
    
    total_coverage = (required_coverage * 0.7 + optional_coverage * 0.3)
    
    return {
        "required_fields_coverage": round(required_coverage, 1),
        "optional_fields_coverage": round(optional_coverage, 1),
        "total_coverage": round(total_coverage, 1),
        "missing_required": [f for f in required_fields if f not in df.columns],
        "missing_optional": [f for f in optional_fields if f not in df.columns]
    }

def calculate_explainability_score(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate comprehensive explainability score (0-100)
    Higher score = better explainability
    """
    # Feature importance coverage
    feature_coverage = calculate_feature_importance_coverage(df)
    
    # Decision transparency
    transparency = calculate_decision_transparency(df)
    
    # Audit trail coverage
    audit_trail = calculate_audit_trail_coverage(df)
    
    # Weighted combination
    explainability_score = (
        0.4 * feature_coverage["documentation_coverage"] +
        0.35 * transparency["clarity_score"] +
        0.25 * audit_trail["total_coverage"]
    )
    
    # Generate explanation
    if explainability_score > 80:
        explanation = "Excellent explainability. Model decisions are well-documented and transparent."
    elif explainability_score > 60:
        explanation = "Good explainability. Most model decisions can be explained to stakeholders."
    elif explainability_score > 40:
        explanation = "Moderate explainability. Some decisions may be difficult to explain to regulators."
    else:
        explanation = "Poor explainability. Model lacks transparency required for regulatory compliance."
    
    # Identify gaps
    gaps = []
    if feature_coverage["documentation_coverage"] < 80:
        gaps.append("Feature importance documentation incomplete")
    if transparency["clarity_score"] < 60:
        gaps.append("Decision boundaries are unclear")
    if audit_trail["total_coverage"] < 90:
        gaps.append("Audit trail coverage is insufficient")
    
    return {
        "explainability_score": round(explainability_score, 1),
        "feature_coverage": feature_coverage,
        "transparency": transparency,
        "audit_trail": audit_trail,
        "explanation": explanation,
        "gaps": gaps
    }
