"""
Pydantic Schemas for SentinelAI API
"""
from datetime import datetime
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

# Request schemas
class AuditRequest(BaseModel):
    dataset_mode: Literal["clean", "biased", "drifted"] = Field(
        default="biased",
        description="Dataset mode to audit: clean, biased, or drifted"
    )

# Response schemas
class RiskComponents(BaseModel):
    bias_contribution: float
    drift_contribution: float
    explainability_contribution: float

class GenderDI(BaseModel):
    di_ratio: float
    violation: bool
    privileged_group: str
    privileged_rate: float
    unprivileged_group: str
    unprivileged_rate: float
    threshold: float

class AgeBias(BaseModel):
    di_ratio: float
    violation: bool
    approval_rates: Dict[str, float]
    highest_group: str
    lowest_group: str

class IncomeProxy(BaseModel):
    proxy_detected: bool
    income_gap_percent: float
    male_approved_avg_income: float
    female_approved_avg_income: float
    explanation: str

class BiasViolation(BaseModel):
    type: str
    severity: str
    value: Optional[float] = None
    threshold: Optional[float] = None
    description: str

class BiasDetails(BaseModel):
    score: float
    gender_di: GenderDI
    age_bias: AgeBias
    income_proxy: IncomeProxy
    violations: List[BiasViolation]
    explanation: str

class AccuracyDrift(BaseModel):
    baseline_accuracy: float
    current_accuracy: float
    accuracy_drop: float
    accuracy_drop_percent: float
    significant_drop: bool

class PredictionDrift(BaseModel):
    baseline_approval_rate: float
    current_approval_rate: float
    rate_change: float
    rate_change_percent: float
    significant_change: bool

class DriftedFeature(BaseModel):
    feature: str
    mean_shift: float
    ks_statistic: float

class DriftDetails(BaseModel):
    score: float
    severity: str
    accuracy_drift: AccuracyDrift
    prediction_drift: PredictionDrift
    drifted_features: List[DriftedFeature]
    explanation: str

class ExplainabilityDetails(BaseModel):
    score: float
    explanation: str
    gaps: List[str]

class Recommendation(BaseModel):
    id: str
    severity: Literal["Critical", "High", "Moderate", "Low"]
    category: str
    title: str
    description: str
    action: str
    impact: Optional[str] = None
    effort: Optional[str] = None

class DatasetStats(BaseModel):
    total_records: int
    approval_rate: float
    accuracy: float

class AuditResponse(BaseModel):
    audit_id: str
    timestamp: str
    dataset_mode: str
    
    # Core metrics
    ai_risk_score: float
    risk_status: Literal["PASS", "WARNING", "FAIL"]
    risk_components: RiskComponents
    
    # Component scores
    bias_risk_score: float
    drift_risk_score: float
    explainability_score: float
    
    # Detailed results
    bias_details: BiasDetails
    drift_details: DriftDetails
    explainability_details: ExplainabilityDetails
    
    # Recommendations
    recommendations: List[Recommendation]
    
    # Summary
    executive_summary: str
    dataset_stats: DatasetStats

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    database: str

class ErrorResponse(BaseModel):
    error: str
    detail: str
    timestamp: str
