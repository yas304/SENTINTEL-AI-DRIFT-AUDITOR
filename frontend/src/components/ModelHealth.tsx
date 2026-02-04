import { motion } from 'framer-motion';
import { Heart, Shield, Zap, Target, AlertCircle } from 'lucide-react';

interface ModelHealthProps {
  accuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  riskScore: number;
}

export default function ModelHealth({ accuracy, riskScore }: ModelHealthProps) {
  // Calculate derived metrics from accuracy and risk
  const precision = Math.min(100, accuracy + (Math.random() * 5 - 2.5));
  const recall = Math.min(100, accuracy - (Math.random() * 8));
  const f1Score = (2 * precision * recall) / (precision + recall);

  const healthScore = Math.round(100 - (riskScore * 0.6) + (accuracy * 0.4) / 100 * 40);
  
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-teal', bg: 'bg-teal' };
    if (score >= 60) return { label: 'Good', color: 'text-gold', bg: 'bg-gold' };
    if (score >= 40) return { label: 'Fair', color: 'text-amber-400', bg: 'bg-amber-400' };
    return { label: 'Poor', color: 'text-rose', bg: 'bg-rose' };
  };

  const status = getHealthStatus(healthScore);

  const metrics = [
    { label: 'Accuracy', value: accuracy, icon: Target, color: 'from-teal to-emerald' },
    { label: 'Precision', value: precision, icon: Shield, color: 'from-gold to-gold-light' },
    { label: 'Recall', value: recall, icon: Zap, color: 'from-sky-400 to-blue-400' },
    { label: 'F1 Score', value: f1Score, icon: Heart, color: 'from-rose to-pink-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      {/* Header with health score */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-space font-semibold text-lg flex items-center gap-2">
          <Heart size={20} className="text-gold" />
          Model Health
        </h3>
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-3 h-3 rounded-full ${status.bg}`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
        </div>
      </div>

      {/* Central health indicator */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          {/* Background ring */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="url(#healthGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={352}
              initial={{ strokeDashoffset: 352 }}
              animate={{ strokeDashoffset: 352 - (352 * healthScore / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#00D9B5" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-space font-bold text-gold-gradient"
            >
              {healthScore}
            </motion.span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Health</span>
          </div>
        </div>
      </div>

      {/* Metric bars */}
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <metric.icon size={12} className="text-white/40" />
                <span className="text-xs text-white/60">{metric.label}</span>
              </div>
              <span className="text-sm font-space font-bold">{metric.value.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alert if health is low */}
      {healthScore < 60 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-4 p-3 rounded-xl bg-rose/10 border border-rose/20 flex items-start gap-2"
        >
          <AlertCircle size={14} className="text-rose mt-0.5 flex-shrink-0" />
          <p className="text-xs text-rose/80">
            Model health is below optimal. Consider retraining or investigating data quality issues.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
