import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { RiskStatus } from '../types';

interface AuditHistoryItem {
  audit_id: string;
  timestamp: string;
  dataset_mode: string;
  ai_risk_score: number;
  risk_status: RiskStatus;
}

interface AuditHistorySidebarProps {
  history: AuditHistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAudit: (auditId: string) => void;
  currentAuditId?: string;
}

export default function AuditHistorySidebar({
  history,
  isOpen,
  onClose,
  onSelectAudit,
  currentAuditId,
}: AuditHistorySidebarProps) {
  const getStatusIcon = (status: RiskStatus) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle size={16} className="text-emerald" />;
      case 'WARNING':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'FAIL':
        return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'PASS': return 'text-emerald';
      case 'WARNING': return 'text-yellow-500';
      case 'FAIL': return 'text-red-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed right-0 top-0 h-full w-96 bg-navy-light border-l border-white/10 z-50 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-teal" />
              <h2 className="font-space text-lg font-semibold">Audit History</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <p className="text-sm text-white/50 mt-2">
            {history.length} audit{history.length !== 1 ? 's' : ''} recorded
          </p>
        </div>

        <div className="overflow-y-auto h-[calc(100%-120px)] p-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No audits recorded yet</p>
              <p className="text-sm mt-1">Run an audit to see history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((audit, index) => (
                <motion.button
                  key={audit.audit_id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectAudit(audit.audit_id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    currentAuditId === audit.audit_id
                      ? 'bg-teal/20 border border-teal/30'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(audit.risk_status)}
                      <span className={`font-semibold ${getStatusColor(audit.risk_status)}`}>
                        {audit.risk_status}
                      </span>
                    </div>
                    <span className="text-2xl font-space font-bold">
                      {audit.ai_risk_score.toFixed(0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span className="capitalize">{audit.dataset_mode}</span>
                    <span>{formatTimestamp(audit.timestamp)}</span>
                  </div>
                  
                  <div className="mt-2 text-xs text-white/30 font-mono truncate">
                    {audit.audit_id}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
