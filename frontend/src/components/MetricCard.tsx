import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  status: 'good' | 'warning' | 'bad';
  tooltip: string;
  icon: ReactNode;
  suffix?: string;
  isLoading?: boolean;
  delay?: number;
}

export default function MetricCard({
  title,
  value,
  status,
  tooltip,
  icon,
  suffix = '',
  isLoading,
  delay = 0
}: MetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-emerald';
      case 'warning': return 'text-yellow-500';
      case 'bad': return 'text-red-500';
      default: return 'text-white';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'good': return 'bg-emerald/10';
      case 'warning': return 'bg-yellow-500/10';
      case 'bad': return 'bg-red-500/10';
      default: return 'bg-white/10';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'good': return 'border-emerald/30';
      case 'warning': return 'border-yellow-500/30';
      case 'bad': return 'border-red-500/30';
      default: return 'border-white/10';
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="skeleton w-32 h-6" />
          <div className="skeleton w-6 h-6 rounded-full" />
        </div>
        <div className="skeleton w-24 h-10" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-card glass-card-hover p-6 border ${getBorderColor()}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getStatusBg()}`}>
            <span className={getStatusColor()}>{icon}</span>
          </div>
          <span className="text-white/70 font-medium">{title}</span>
        </div>
        
        <div className="tooltip">
          <HelpCircle size={16} className="text-white/30 cursor-help" />
          <div className="tooltip-content">{tooltip}</div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        <span className={`text-4xl font-space font-bold ${getStatusColor()}`}>
          {value.toFixed(1)}{suffix}
        </span>
      </motion.div>
    </motion.div>
  );
}
