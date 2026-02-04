import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricStream {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export default function RealTimeMonitor() {
  const [metrics, setMetrics] = useState<MetricStream[]>([
    { label: 'Model Latency', value: 45, unit: 'ms', trend: 'stable', color: 'text-teal' },
    { label: 'Predictions/sec', value: 1247, unit: '', trend: 'up', color: 'text-gold' },
    { label: 'Memory Usage', value: 68, unit: '%', trend: 'stable', color: 'text-sky-400' },
    { label: 'Error Rate', value: 0.02, unit: '%', trend: 'down', color: 'text-emerald' },
  ]);

  const [pulseOpacity, setPulseOpacity] = useState(1);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.label === 'Predictions/sec' 
          ? metric.value + Math.floor(Math.random() * 20 - 10)
          : metric.label === 'Model Latency'
          ? Math.max(20, Math.min(100, metric.value + (Math.random() * 6 - 3)))
          : metric.label === 'Memory Usage'
          ? Math.max(50, Math.min(90, metric.value + (Math.random() * 4 - 2)))
          : Math.max(0, Math.min(1, metric.value + (Math.random() * 0.02 - 0.01))),
        trend: Math.random() > 0.6 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'
      })));
      
      // Pulse animation
      setPulseOpacity(0.5);
      setTimeout(() => setPulseOpacity(1), 200);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={12} className="text-teal" />;
      case 'down': return <TrendingDown size={12} className="text-rose" />;
      default: return <Minus size={12} className="text-white/30" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-space font-semibold text-sm flex items-center gap-2">
          <Activity size={16} className="text-gold" />
          Live Monitoring
        </h3>
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-2 h-2 bg-teal rounded-full"
            animate={{ opacity: pulseOpacity, scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
          />
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="p-3 rounded-xl bg-charcoal/50 border border-white/5"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{metric.label}</span>
              {getTrendIcon(metric.trend)}
            </div>
            <motion.div
              key={metric.value}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`text-xl font-space font-bold ${metric.color}`}
            >
              {metric.label === 'Error Rate' ? metric.value.toFixed(2) : Math.round(metric.value)}
              <span className="text-xs text-white/30 ml-1">{metric.unit}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Mini activity graph */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/40">Request Volume (24h)</span>
          <span className="text-[10px] text-gold">↑ 12.4%</span>
        </div>
        <div className="h-8 flex items-end gap-0.5">
          {Array.from({ length: 24 }).map((_, i) => {
            const height = 30 + Math.sin(i * 0.5) * 20 + Math.random() * 30;
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
                className="flex-1 rounded-sm"
                style={{
                  background: i === 23 
                    ? 'linear-gradient(to top, #D4AF37, #F4D03F)' 
                    : 'rgba(212, 175, 55, 0.2)'
                }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
