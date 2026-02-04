// API Types for SentinelAI

export type DatasetMode = 'clean' | 'biased' | 'drifted';
export type RiskStatus = 'PASS' | 'WARNING' | 'FAIL';
export type Severity = 'Critical' | 'High' | 'Moderate' | 'Low';

export interface RiskComponents {
  bias_contribution: number;
  drift_contribution: number;
  explainability_contribution: number;
}

export interface GenderDI {
  di_ratio: number;
  violation: boolean;
  privileged_group: string;
  privileged_rate: number;
  unprivileged_group: string;
  unprivileged_rate: number;
  threshold: number;
}

export interface AgeBias {
  di_ratio: number;
  violation: boolean;
  approval_rates: Record<string, number>;
  highest_group: string;
  lowest_group: string;
}

export interface IncomeProxy {
  proxy_detected: boolean;
  income_gap_percent: number;
  male_approved_avg_income: number;
  female_approved_avg_income: number;
  explanation: string;
}

export interface BiasViolation {
  type: string;
  severity: string;
  value?: number;
  threshold?: number;
  description: string;
}

export interface BiasDetails {
  score: number;
  gender_di: GenderDI;
  age_bias: AgeBias;
  income_proxy: IncomeProxy;
  violations: BiasViolation[];
  explanation: string;
}

export interface AccuracyDrift {
  baseline_accuracy: number;
  current_accuracy: number;
  accuracy_drop: number;
  accuracy_drop_percent: number;
  significant_drop: boolean;
}

export interface PredictionDrift {
  baseline_approval_rate: number;
  current_approval_rate: number;
  rate_change: number;
  rate_change_percent: number;
  significant_change: boolean;
}

export interface DriftedFeature {
  feature: string;
  mean_shift: number;
  ks_statistic: number;
}

export interface DriftDetails {
  score: number;
  severity: string;
  accuracy_drift: AccuracyDrift;
  prediction_drift: PredictionDrift;
  drifted_features: DriftedFeature[];
  explanation: string;
}

export interface ExplainabilityDetails {
  score: number;
  explanation: string;
  gaps: string[];
}

export interface Recommendation {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  action: string;
  impact?: string;
  effort?: string;
}

export interface DatasetStats {
  total_records: number;
  approval_rate: number;
  accuracy: number;
}

export interface AuditResult {
  audit_id: string;
  timestamp: string;
  dataset_mode: DatasetMode;
  ai_risk_score: number;
  risk_status: RiskStatus;
  risk_components: RiskComponents;
  bias_risk_score: number;
  drift_risk_score: number;
  explainability_score: number;
  bias_details: BiasDetails;
  drift_details: DriftDetails;
  explainability_details: ExplainabilityDetails;
  recommendations: Recommendation[];
  executive_summary: string;
  dataset_stats: DatasetStats;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  version: string;
  database: string;
}
