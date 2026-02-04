"""
Bias Detection Engine for SentinelAI
Real statistical calculations for bias detection
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.config import DI_THRESHOLD

def calculate_disparate_impact(df: pd.DataFrame, protected_col: str, outcome_col: str = "prediction") -> Dict[str, Any]:
    """
    Calculate Disparate Impact Ratio for a protected attribute
    DI = (Favorable outcome rate for unprivileged) / (Favorable outcome rate for privileged)
    """
    groups = df.groupby(protected_col)[outcome_col].mean()
    
    if len(groups) < 2:
        return {"di_ratio": 1.0, "violation": False, "details": {}}
    
    # For gender: Male is typically privileged group in lending
    if protected_col == "gender":
        privileged_rate = groups.get("Male", 0)
        unprivileged_rate = groups.get("Female", 0)
        privileged_group = "Male"
        unprivileged_group = "Female"
    else:
        # For other attributes, use max rate as privileged
        privileged_group = groups.idxmax()
        unprivileged_group = groups.idxmin()
        privileged_rate = groups.max()
        unprivileged_rate = groups.min()
    
    # Calculate DI ratio (avoid division by zero)
    di_ratio = unprivileged_rate / privileged_rate if privileged_rate > 0 else 1.0
    
    return {
        "di_ratio": float(round(di_ratio, 3)),
        "violation": bool(di_ratio < DI_THRESHOLD),
        "privileged_group": privileged_group,
        "privileged_rate": float(round(privileged_rate, 3)),
        "unprivileged_group": unprivileged_group,
        "unprivileged_rate": float(round(unprivileged_rate, 3)),
        "threshold": DI_THRESHOLD
    }

def calculate_age_group_bias(df: pd.DataFrame, outcome_col: str = "prediction") -> Dict[str, Any]:
    """
    Calculate bias across age groups
    """
    # Create age bins
    df_copy = df.copy()
    df_copy["age_group"] = pd.cut(
        df_copy["age"],
        bins=[18, 30, 45, 60, 100],
        labels=["18-30", "31-45", "46-60", "60+"]
    )
    
    approval_by_age = df_copy.groupby("age_group")[outcome_col].mean()
    
    max_rate = approval_by_age.max()
    min_rate = approval_by_age.min()
    
    age_di = min_rate / max_rate if max_rate > 0 else 1.0
    
    return {
        "di_ratio": float(round(age_di, 3)),
        "violation": bool(age_di < DI_THRESHOLD),
        "approval_rates": {str(k): float(round(v, 3)) for k, v in approval_by_age.items()},
        "highest_group": str(approval_by_age.idxmax()),
        "lowest_group": str(approval_by_age.idxmin())
    }

def detect_income_proxy_bias(df: pd.DataFrame, outcome_col: str = "prediction") -> Dict[str, Any]:
    """
    Detect if income is being used as a proxy that correlates with protected attributes
    """
    # Check correlation between income and approval by gender
    male_income_approved = df[(df["gender"] == "Male") & (df[outcome_col] == 1)]["income"].mean()
    female_income_approved = df[(df["gender"] == "Female") & (df[outcome_col] == 1)]["income"].mean()
    
    male_income_denied = df[(df["gender"] == "Male") & (df[outcome_col] == 0)]["income"].mean()
    female_income_denied = df[(df["gender"] == "Female") & (df[outcome_col] == 0)]["income"].mean()
    
    # Calculate income gap for approvals
    income_gap = abs(male_income_approved - female_income_approved) / max(male_income_approved, female_income_approved)
    
    # Check if denied females have higher income than denied males (proxy bias indicator)
    proxy_detected = bool(female_income_denied > male_income_denied * 1.1)
    
    return {
        "proxy_detected": proxy_detected,
        "income_gap_percent": float(round(income_gap * 100, 1)),
        "male_approved_avg_income": float(round(male_income_approved, 0)),
        "female_approved_avg_income": float(round(female_income_approved, 0)),
        "explanation": "Income may be used as a proxy that disadvantages female applicants" if proxy_detected else "No significant income proxy bias detected"
    }

def calculate_bias_risk_score(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate comprehensive bias risk score (0-100)
    Higher score = more bias = higher risk
    """
    # Gender bias (most critical)
    gender_di = calculate_disparate_impact(df, "gender")
    
    # Age group bias
    age_bias = calculate_age_group_bias(df)
    
    # Income proxy bias
    income_proxy = detect_income_proxy_bias(df)
    
    # Calculate component scores
    # Gender DI: 0.8 = threshold, 1.0 = perfect
    # Convert to risk: DI of 0.6 = high risk, DI of 1.0 = no risk
    gender_risk = max(0, (DI_THRESHOLD - gender_di["di_ratio"]) / DI_THRESHOLD) * 100 if gender_di["di_ratio"] < DI_THRESHOLD else max(0, (1 - gender_di["di_ratio"]) * 20)
    
    # If DI is below threshold, amplify risk
    if gender_di["di_ratio"] < DI_THRESHOLD:
        gender_risk = 50 + (DI_THRESHOLD - gender_di["di_ratio"]) * 200
    
    # Age bias contribution
    age_risk = max(0, (DI_THRESHOLD - age_bias["di_ratio"]) / DI_THRESHOLD) * 100 if age_bias["di_ratio"] < DI_THRESHOLD else 0
    
    # Income proxy contribution
    proxy_risk = 20 if income_proxy["proxy_detected"] else 0
    
    # Weighted combination
    bias_risk_score = min(100, (
        0.6 * gender_risk +
        0.25 * age_risk +
        0.15 * proxy_risk
    ))
    
    # Generate explanation
    if bias_risk_score < 20:
        explanation = "No significant bias detected. Model shows fair treatment across demographic groups."
    elif bias_risk_score < 50:
        explanation = "Minor bias indicators present. Monitor approval rates across demographics."
    elif bias_risk_score < 75:
        explanation = f"Moderate bias detected. Female approval rate is {(1-gender_di['di_ratio'])*100:.0f}% lower than male approval rate."
    else:
        explanation = f"Severe bias detected. Disparate Impact ratio of {gender_di['di_ratio']:.2f} violates the 80% rule."
    
    # Determine violations
    violations = []
    if gender_di["violation"]:
        violations.append({
            "type": "Gender Disparate Impact",
            "severity": "Critical" if gender_di["di_ratio"] < 0.7 else "High",
            "value": gender_di["di_ratio"],
            "threshold": DI_THRESHOLD,
            "description": f"Female approval rate ({gender_di['unprivileged_rate']:.1%}) is significantly lower than male rate ({gender_di['privileged_rate']:.1%})"
        })
    
    if age_bias["violation"]:
        violations.append({
            "type": "Age Group Disparate Impact",
            "severity": "Moderate",
            "value": age_bias["di_ratio"],
            "threshold": DI_THRESHOLD,
            "description": f"Age group '{age_bias['lowest_group']}' has significantly lower approval rate"
        })
    
    if income_proxy["proxy_detected"]:
        violations.append({
            "type": "Income Proxy Bias",
            "severity": "Moderate",
            "description": income_proxy["explanation"]
        })
    
    return {
        "bias_risk_score": round(bias_risk_score, 1),
        "gender_di": gender_di,
        "age_bias": age_bias,
        "income_proxy": income_proxy,
        "violations": violations,
        "explanation": explanation,
        "total_violations": len(violations)
    }
