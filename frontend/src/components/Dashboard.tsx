import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  Eye, 
  FileText, 
  ArrowLeft,
  Download,
  Loader2,
  History,
  RefreshCw,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';
import { AuditResult, DatasetMode } from '../types';
import { startAudit, generateReport, downloadReport, getAuditHistory } from '../api';
import RiskGauge from './RiskGauge';
import MetricCard from './MetricCard';
import RecommendationsPanel from './RecommendationsPanel';
import DatasetToggle from './DatasetToggle';
import AnimatedBackground from './AnimatedBackground';
import ToastContainer, { Toast } from './ToastContainer';
import AuditHistorySidebar from './AuditHistorySidebar';
import StatusIndicator from './StatusIndicator';
import MiniChart from './MiniChart';
import CompliancePanel from './CompliancePanel';
import RealTimeMonitor from './RealTimeMonitor';
import ModelHealth from './ModelHealth';

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [datasetMode, setDatasetMode] = useState<DatasetMode>('biased');
  const [isExporting, setIsExporting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);

  const addToast = useCallback((type: Toast['type'], title: string, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Run audit on mount
  useEffect(() => {
    runAudit(datasetMode);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = await getAuditHistory(10);
      setAuditHistory(history);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const runAudit = async (mode: DatasetMode) => {
    setIsTransitioning(true);
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await startAudit(mode);
      setAuditResult(result);
      setIsConnected(true);
      
      // Update score history for mini chart
      setScoreHistory(prev => [...prev.slice(-9), result.ai_risk_score]);
      
      // Show appropriate toast
      if (result.risk_status === 'FAIL') {
        addToast('error', 'Critical Risk Detected', 'AI Risk Score exceeds acceptable threshold');
      } else if (result.risk_status === 'WARNING') {
        addToast('warning', 'Elevated Risk', 'Review recommended for identified issues');
      } else {
        addToast('success', 'Audit Complete', 'Model performance is within acceptable parameters');
      }
      
      // Refresh history
      fetchHistory();
      
    } catch (error) {
      console.error('Audit failed:', error);
      setIsConnected(false);
      addToast('error', 'Connection Error', 'Failed to connect to audit service');
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  const handleModeChange = (mode: DatasetMode) => {
    if (mode === datasetMode || isLoading) return;
    setDatasetMode(mode);
    runAudit(mode);
  };

  const handleRefresh = () => {
    runAudit(datasetMode);
  };

  const handleExportPDF = async () => {
    if (!auditResult || isExporting) return;
    
    setIsExporting(true);
    addToast('info', 'Generating Report', 'Preparing your PDF audit report...');
    
    try {
      const blob = await generateReport(auditResult.audit_id);
      downloadReport(blob, auditResult.audit_id);
      addToast('success', 'Report Downloaded', 'PDF audit report saved successfully');
    } catch (error) {
      console.error('Export failed:', error);
      addToast('error', 'Export Failed', 'Could not generate PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectAudit = async (auditId: string) => {
    setIsHistoryOpen(false);
    addToast('info', 'Audit Selected', `Viewing audit ${auditId.slice(-8)}`);
  };

  const getMetricStatus = (score: number, isHigherBetter: boolean = false) => {
    if (isHigherBetter) {
      if (score >= 70) return 'good';
      if (score >= 50) return 'warning';
      return 'bad';
    } else {
      if (score <= 30) return 'good';
      if (score <= 60) return 'warning';
      return 'bad';
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <AnimatedBackground />
      <div className="grid-bg" />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Audit History Sidebar */}
      <AuditHistorySidebar
        history={auditHistory}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectAudit={handleSelectAudit}
        currentAuditId={auditResult?.audit_id}
      />

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="loading-overlay"
          >
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Shield size={48} className="text-teal" />
              </motion.div>
              <p className="mt-4 text-white/60 font-medium">Running AI Audit...</p>
              <p className="text-sm text-white/40 mt-1">Analyzing model behavior</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-navy/70 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} className="text-white/60" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Shield size={28} className="text-teal" />
                </motion.div>
                <div>
                  <h1 className="font-space text-xl font-bold">SentinelAI</h1>
                  <StatusIndicator 
                    isConnected={isConnected} 
                    lastUpdated={auditResult?.timestamp}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DatasetToggle
                activeMode={datasetMode}
                onModeChange={handleModeChange}
                isLoading={isLoading}
              />
              
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Refresh Audit"
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </motion.button>
                
                <motion.button
                  onClick={() => setIsHistoryOpen(true)}
                  className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Audit History"
                >
                  <History size={18} />
                </motion.button>
                
                <motion.button
                  onClick={handleExportPDF}
                  disabled={isExporting || !auditResult}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-gold to-gold-dark text-navy font-medium hover:opacity-90 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isExporting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  <span className="text-sm">Export PDF</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Quick Stats Bar */}
        {auditResult && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-4 mb-6"
          >
            {[
              { icon: BarChart3, label: 'Records Analyzed', value: auditResult.dataset_stats.total_records.toLocaleString() },
              { icon: Users, label: 'Approval Rate', value: `${(auditResult.dataset_stats.approval_rate * 100).toFixed(1)}%` },
              { icon: Zap, label: 'Model Accuracy', value: `${(auditResult.dataset_stats.accuracy * 100).toFixed(1)}%` },
              { icon: AlertTriangle, label: 'Issues Found', value: auditResult.recommendations.filter((r: any) => r.severity === 'Critical' || r.severity === 'High').length.toString() },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 flex items-center gap-3 card-shine"
              >
                <div className="p-2 rounded-lg bg-gold/10">
                  <stat.icon size={18} className="text-gold" />
                </div>
                <div>
                  <div className="text-lg font-space font-bold">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Executive Summary */}
        {auditResult && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gold/10">
                <FileText size={24} className="text-gold" />
              </div>
              <div className="flex-1">
                <h2 className="font-space font-semibold text-lg mb-1">Executive Summary</h2>
                <p className="text-white/70">{auditResult.executive_summary}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                  <span>Audit ID: {auditResult.audit_id}</span>
                  <span>•</span>
                  <span>{new Date(auditResult.timestamp).toLocaleString()}</span>
                </div>
              </div>
              {/* Mini trend chart */}
              {scoreHistory.length > 1 && (
                <div className="w-32">
                  <div className="text-xs text-white/40 mb-1">Risk Trend</div>
                  <MiniChart data={scoreHistory} height={40} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left column - Main gauge and metrics */}
          <div className="col-span-12 lg:col-span-8">
            {/* Risk Gauge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-8 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-space text-2xl font-semibold">AI Risk Assessment</h2>
                <div className="text-xs text-white/40">
                  Dataset: <span className="text-teal capitalize">{datasetMode}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <RiskGauge
                  score={auditResult?.ai_risk_score || 0}
                  status={auditResult?.risk_status || 'PASS'}
                  isLoading={isLoading}
                />
                
                {/* Risk breakdown */}
                {auditResult && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="mt-8 grid grid-cols-3 gap-6 w-full max-w-lg"
                  >
                    {[
                      { label: 'Bias', value: auditResult.risk_components.bias_contribution, color: 'text-rose-400' },
                      { label: 'Drift', value: auditResult.risk_components.drift_contribution, color: 'text-amber-400' },
                      { label: 'Explainability', value: auditResult.risk_components.explainability_contribution, color: 'text-sky-400' },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-3 rounded-xl bg-white/5">
                        <div className={`text-2xl font-space font-bold ${item.color}`}>
                          {item.value.toFixed(1)}
                        </div>
                        <div className="text-xs text-white/40 mt-1">{item.label}</div>
                        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              item.label === 'Bias' ? 'bg-rose-400' :
                              item.label === 'Drift' ? 'bg-amber-400' :
                              'bg-sky-400'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / 40) * 100}%` }}
                            transition={{ duration: 1, delay: 1.7 }}
                          />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Bias Risk"
                value={auditResult?.bias_risk_score || 0}
                status={getMetricStatus(auditResult?.bias_risk_score || 0)}
                tooltip="Measures disparate impact across demographic groups. Lower is better."
                icon={<AlertTriangle size={20} />}
                isLoading={isLoading}
                delay={0.2}
              />
              
              <MetricCard
                title="Drift Risk"
                value={auditResult?.drift_risk_score || 0}
                status={getMetricStatus(auditResult?.drift_risk_score || 0)}
                tooltip="Measures distribution shift from baseline. Lower is better."
                icon={<TrendingDown size={20} />}
                isLoading={isLoading}
                delay={0.3}
              />
              
              <MetricCard
                title="Explainability"
                value={auditResult?.explainability_score || 0}
                status={getMetricStatus(auditResult?.explainability_score || 0, true)}
                tooltip="Measures model transparency and interpretability. Higher is better."
                icon={<Eye size={20} />}
                suffix="%"
                isLoading={isLoading}
                delay={0.4}
              />
            </div>
          </div>

          {/* Right column - Recommendations + New Panels */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <RecommendationsPanel
              recommendations={auditResult?.recommendations || []}
              isLoading={isLoading}
            />
            
            {/* Real-time Monitor */}
            {!isLoading && <RealTimeMonitor />}
          </div>
        </div>

        {/* New row: Model Health + Compliance */}
        {auditResult && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ModelHealth 
              accuracy={auditResult.dataset_stats.accuracy * 100}
              riskScore={auditResult.ai_risk_score}
            />
            <CompliancePanel
              biasScore={auditResult.bias_risk_score}
              driftScore={auditResult.drift_risk_score}
              explainabilityScore={auditResult.explainability_score}
              onExportPDF={handleExportPDF}
            />
          </motion.div>
        )}

        {/* Detailed metrics (optional expansion) */}
        {auditResult && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Bias Details */}
            <div className="glass-card p-6">
              <h3 className="font-space font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-gold" />
                Bias Analysis
              </h3>
              <p className="text-sm text-white/60 mb-4">{auditResult.bias_details.explanation}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-charcoal/50 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-1">Disparate Impact</div>
                  <div className="text-2xl font-space font-bold text-gold">
                    {auditResult.bias_details.gender_di.di_ratio.toFixed(3)}
                  </div>
                  <div className={`text-xs mt-1 ${auditResult.bias_details.gender_di.violation ? 'text-rose' : 'text-teal'}`}>
                    {auditResult.bias_details.gender_di.violation ? '⚠ Below 0.8 threshold' : '✓ Above 0.8 threshold'}
                  </div>
                </div>
                
                <div className="bg-charcoal/50 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-1">Violations Found</div>
                  <div className="text-2xl font-space font-bold text-gold">
                    {auditResult.bias_details.violations.length}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    {auditResult.bias_details.violations.length > 0 ? 'Action required' : 'No issues'}
                  </div>
                </div>
              </div>
              
              {/* Gender comparison bars */}
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Male Approval</span>
                    <span className="text-white/80">{(auditResult.bias_details.gender_di.privileged_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-sky-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${auditResult.bias_details.gender_di.privileged_rate * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Female Approval</span>
                    <span className="text-white/80">{(auditResult.bias_details.gender_di.unprivileged_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-pink-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${auditResult.bias_details.gender_di.unprivileged_rate * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Drift Details */}
            <div className="glass-card p-6">
              <h3 className="font-space font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingDown size={18} className="text-gold" />
                Drift Analysis
              </h3>
              <p className="text-sm text-white/60 mb-4">{auditResult.drift_details.explanation}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-charcoal/50 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-1">Accuracy Drop</div>
                  <div className="text-2xl font-space font-bold text-gold">
                    {auditResult.drift_details.accuracy_drift.accuracy_drop_percent.toFixed(1)}%
                  </div>
                  <div className={`text-xs mt-1 ${auditResult.drift_details.accuracy_drift.significant_drop ? 'text-rose' : 'text-teal'}`}>
                    {auditResult.drift_details.accuracy_drift.significant_drop ? '⚠ Significant drop' : '✓ Within tolerance'}
                  </div>
                </div>
                
                <div className="bg-charcoal/50 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-1">Features Drifted</div>
                  <div className="text-2xl font-space font-bold text-gold">
                    {auditResult.drift_details.drifted_features.length}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    of 4 tracked features
                  </div>
                </div>
              </div>
              
              {/* Accuracy comparison */}
              <div className="mt-4 p-4 bg-charcoal/50 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/60">Accuracy Comparison</span>
                </div>
                <div className="flex items-end gap-4 h-24">
                  <div className="flex-1 flex flex-col items-center">
                    <motion.div
                      className="w-full bg-teal/30 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${auditResult.drift_details.accuracy_drift.baseline_accuracy * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                    <span className="text-xs text-white/40 mt-2">Baseline</span>
                    <span className="text-sm font-bold text-teal">{(auditResult.drift_details.accuracy_drift.baseline_accuracy * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <motion.div
                      className="w-full bg-gold/30 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${auditResult.drift_details.accuracy_drift.current_accuracy * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                    <span className="text-xs text-white/40 mt-2">Current</span>
                    <span className="text-sm font-bold text-gold">{(auditResult.drift_details.accuracy_drift.current_accuracy * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-white/30">
            <span>© 2026 SentinelAI. Making deployed AI accountable.</span>
            <div className="flex items-center gap-4">
              <span>v1.0.0</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
