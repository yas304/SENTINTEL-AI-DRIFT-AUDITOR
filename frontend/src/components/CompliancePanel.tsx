import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, FileCheck, Scale, Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ComplianceItem {
  name: string;
  status: 'compliant' | 'warning' | 'violation';
  score: number;
  details: string;
  link?: string;
}

interface CompliancePanelProps {
  biasScore: number;
  driftScore: number;
  explainabilityScore: number;
  onExportPDF?: () => void;
}

export default function CompliancePanel({ biasScore, driftScore, explainabilityScore, onExportPDF }: CompliancePanelProps) {
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null);
  const frameworks: ComplianceItem[] = [
    {
      name: 'EU AI Act',
      status: biasScore < 40 && driftScore < 40 ? 'compliant' : biasScore > 60 || driftScore > 60 ? 'violation' : 'warning',
      score: Math.max(0, 100 - (biasScore * 0.5 + driftScore * 0.5)),
      details: 'Article 9 - Risk Management',
      link: 'https://artificialintelligenceact.eu/'
    },
    {
      name: 'NIST AI RMF',
      status: explainabilityScore > 70 ? 'compliant' : explainabilityScore > 50 ? 'warning' : 'violation',
      score: explainabilityScore,
      details: 'Govern, Map, Measure, Manage',
      link: 'https://www.nist.gov/itl/ai-risk-management-framework'
    },
    {
      name: 'NYC Local Law 144',
      status: biasScore < 30 ? 'compliant' : biasScore < 50 ? 'warning' : 'violation',
      score: Math.max(0, 100 - biasScore),
      details: 'Automated Employment Decision Tools',
      link: 'https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page'
    },
    {
      name: 'IEEE 7000',
      status: biasScore < 35 && explainabilityScore > 60 ? 'compliant' : 'warning',
      score: Math.round((100 - biasScore + explainabilityScore) / 2),
      details: 'Ethical AI Systems Standard',
      link: 'https://standards.ieee.org/ieee/7000/6781/'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle size={16} className="text-teal" />;
      case 'warning': return <AlertTriangle size={16} className="text-gold" />;
      case 'violation': return <XCircle size={16} className="text-rose" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      compliant: 'badge-compliant',
      warning: 'badge-warning',
      violation: 'badge-critical'
    };
    return classes[status as keyof typeof classes] || '';
  };

  const overallCompliance = Math.round(frameworks.reduce((acc, f) => acc + f.score, 0) / frameworks.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-space font-semibold text-lg flex items-center gap-2">
          <Scale size={20} className="text-gold" />
          Regulatory Compliance
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Overall</span>
          <span className={`text-lg font-bold font-space ${
            overallCompliance >= 70 ? 'text-teal' : overallCompliance >= 50 ? 'text-gold' : 'text-rose'
          }`}>
            {overallCompliance}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {frameworks.map((framework, index) => (
          <motion.div
            key={framework.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="p-4 rounded-xl bg-charcoal/50 border border-white/5 hover:border-gold/20 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(framework.status)}
                <div>
                  <div className="font-medium text-sm">{framework.name}</div>
                  <div className="text-xs text-white/30">{framework.details}</div>
                </div>
              </div>
              <span className={`compliance-badge ${getStatusBadge(framework.status)}`}>
                {framework.status}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  framework.status === 'compliant' ? 'bg-teal' :
                  framework.status === 'warning' ? 'bg-gold' :
                  'bg-rose'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${framework.score}%` }}
                transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 text-xs">
          <button 
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          >
            <FileCheck size={12} />
            Generate Report
          </button>
          <button 
            onClick={() => setExpandedFramework(expandedFramework ? null : frameworks[0].name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
          >
            <Eye size={12} />
            {expandedFramework ? 'Hide Details' : 'View Details'}
          </button>
        </div>
        
        {/* Expanded details */}
        {expandedFramework && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-xl bg-charcoal/30 border border-white/5"
          >
            <h4 className="text-sm font-medium text-gold mb-3">Framework Links</h4>
            <div className="space-y-2">
              {frameworks.map((f) => (
                <a
                  key={f.name}
                  href={f.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <span className="text-sm text-white/70">{f.name}</span>
                  <ExternalLink size={14} className="text-white/30 group-hover:text-gold transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
