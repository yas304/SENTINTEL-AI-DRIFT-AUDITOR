import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Recommendation, Severity } from '../types';
import { useState } from 'react';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  isLoading?: boolean;
}

export default function RecommendationsPanel({ 
  recommendations, 
  isLoading 
}: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'Critical':
        return <AlertTriangle size={18} className="text-red-500" />;
      case 'High':
        return <AlertCircle size={18} className="text-yellow-500" />;
      case 'Moderate':
        return <Info size={18} className="text-teal" />;
      default:
        return <Info size={18} className="text-white/50" />;
    }
  };

  const getSeverityClass = (severity: Severity) => {
    switch (severity) {
      case 'Critical': return 'recommendation-critical';
      case 'High': return 'recommendation-high';
      case 'Moderate': return 'recommendation-moderate';
      default: return 'recommendation-low';
    }
  };

  const getSeverityBadgeClass = (severity: Severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-400';
      case 'High': return 'bg-yellow-500/20 text-yellow-400';
      case 'Moderate': return 'bg-teal/20 text-teal';
      default: return 'bg-white/10 text-white/50';
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="skeleton w-48 h-8 mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4">
            <div className="skeleton w-full h-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-space text-xl font-semibold">Recommendations</h3>
        <span className="text-sm text-white/50">
          {recommendations.length} items
        </span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {recommendations.slice(0, 5).map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={`recommendation-item ${getSeverityClass(rec.severity)} cursor-pointer`}
              onClick={() => toggleExpand(rec.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getSeverityIcon(rec.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadgeClass(rec.severity)}`}>
                      {rec.severity}
                    </span>
                    <span className="text-xs text-white/30">{rec.category}</span>
                  </div>
                  
                  <h4 className="font-medium text-white mb-1 truncate">
                    {rec.title}
                  </h4>
                  
                  <p className={`text-sm text-white/60 mb-2 ${expandedId === rec.id ? '' : 'line-clamp-2'}`}>
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-teal">
                      <span className={expandedId === rec.id ? '' : 'truncate'}>{rec.action}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedId === rec.id ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={14} className="text-gold flex-shrink-0 ml-1" />
                    </motion.div>
                  </div>
                  
                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedId === rec.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-white/10"
                      >
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-white/40">Impact</span>
                            <p className="text-white/80 font-medium">{rec.impact || 'High'}</p>
                          </div>
                          <div>
                            <span className="text-white/40">Effort</span>
                            <p className="text-white/80 font-medium">{rec.effort || 'Medium'}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {recommendations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-white/40"
          >
            <Info size={32} className="mx-auto mb-2" />
            <p>No recommendations at this time</p>
            <p className="text-sm">Model performance is within acceptable parameters</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
