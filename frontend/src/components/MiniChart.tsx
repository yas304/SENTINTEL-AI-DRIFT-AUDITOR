import { motion } from 'framer-motion';

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function MiniChart({ data, color = '#00D9B5', height = 40 }: MiniChartProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((max - value) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} 100,${height}`;

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <motion.polygon
          points={areaPoints}
          fill={`url(#gradient-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Line */}
        <motion.polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

interface TrendIndicatorProps {
  current: number;
  previous: number;
  suffix?: string;
  higherIsBetter?: boolean;
}

export function TrendIndicator({ current, previous, suffix = '', higherIsBetter = false }: TrendIndicatorProps) {
  const change = current - previous;
  const percentChange = previous !== 0 ? (change / previous) * 100 : 0;
  
  const isPositive = higherIsBetter ? change > 0 : change < 0;
  const isNeutral = Math.abs(percentChange) < 1;

  if (isNeutral) {
    return (
      <span className="text-xs text-white/40 flex items-center gap-1">
        <span className="w-4 h-4 flex items-center justify-center">→</span>
        No change
      </span>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-xs flex items-center gap-1 ${
        isPositive ? 'text-emerald' : 'text-red-400'
      }`}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {change > 0 ? '↑' : '↓'}
      </span>
      {Math.abs(percentChange).toFixed(1)}%{suffix}
    </motion.span>
  );
}
