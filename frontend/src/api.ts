import axios from 'axios';
import { AuditResult, DatasetMode, HealthCheck } from './types';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const checkHealth = async (): Promise<HealthCheck> => {
  const response = await api.get<HealthCheck>('/health');
  return response.data;
};

// Start audit
export const startAudit = async (datasetMode: DatasetMode): Promise<AuditResult> => {
  const response = await api.post<AuditResult>('/audit/start', {
    dataset_mode: datasetMode,
  });
  return response.data;
};

// Get audit result
export const getAuditResult = async (auditId: string): Promise<AuditResult> => {
  const response = await api.get<AuditResult>(`/audit/result/${auditId}`);
  return response.data;
};

// Get audit history
export const getAuditHistory = async (limit: number = 10) => {
  const response = await api.get(`/audit/history?limit=${limit}`);
  return response.data;
};

// Generate PDF report
export const generateReport = async (auditId: string): Promise<Blob> => {
  const response = await api.post(`/audit/report/${auditId}`, null, {
    responseType: 'blob',
  });
  return response.data;
};

// Generate quick report (audit + PDF in one call)
export const generateQuickReport = async (datasetMode: DatasetMode): Promise<Blob> => {
  const response = await api.post('/audit/quick-report', {
    dataset_mode: datasetMode,
  }, {
    responseType: 'blob',
  });
  return response.data;
};

// Download helper
export const downloadReport = (blob: Blob, auditId: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sentinelai_report_${auditId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
