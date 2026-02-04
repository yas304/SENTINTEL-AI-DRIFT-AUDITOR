import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RiskStatus } from '../types';

interface RiskGaugeProps {
  score: number;
  status: RiskStatus;
  isLoading?: boolean;
}

export default function RiskGauge({ score, status, isLoading }: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showStatus, setShowStatus] = useState(false);
  
  const radius = 120;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  // Animate score counting up
  useEffect(() => {
    if (isLoading) {
      setDisplayScore(0);
      setShowStatus(false);
      return;
    }
    
    setShowStatus(false);
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
        setTimeout(() => setShowStatus(true), 200);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [score, isLoading]);

  const getStatusColor = () => {
    switch (status) {
      case 'PASS': return '#10B981';
      case 'WARNING': return '#F59E0B';
      case 'FAIL': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'PASS': return 'status-pass';
      case 'WARNING': return 'status-warning';
      case 'FAIL': return 'status-fail';
      default: return '';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'PASS': return 'Model Healthy';
      case 'WARNING': return 'Review Required';
      case 'FAIL': return 'Action Required';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="risk-gauge flex items-center justify-center">
        <div className="relative">
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={strokeWidth}
            />
            {/* Animated loading ring */}
            <motion.circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="rgba(0, 217, 181, 0.3)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference * 0.25}
              strokeDashoffset={0}
              style={{ transformOrigin: 'center' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="skeleton w-24 h-12 mb-2" />
            <div className="skeleton w-20 h-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-gauge flex items-center justify-center">
      <div className="relative">
        {/* Outer glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ backgroundColor: getStatusColor() }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-[-10px] rounded-full border-2"
          style={{ borderColor: getStatusColor() }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: [0.5, 0, 0.5], 
            scale: [1, 1.1, 1] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            delay: 1.5 
          }}
        />
        
        <svg width="280" height="280" viewBox="0 0 280 280">
          {/* Gradient and filter definitions */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getStatusColor()} stopOpacity="1" />
              <stop offset="100%" stopColor={getStatusColor()} stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Track */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          
          {/* Tick marks */}
          {[...Array(10)].map((_, i) => {
            const angle = (i * 36 - 90) * (Math.PI / 180);
            const innerRadius = radius - 20;
            const outerRadius = radius - 10;
            const x1 = 140 + Math.cos(angle) * innerRadius;
            const y1 = 140 + Math.sin(angle) * innerRadius;
            const x2 = 140 + Math.cos(angle) * outerRadius;
            const y2 = 140 + Math.sin(angle) * outerRadius;
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
          
          {/* Progress circle */}
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              filter: 'url(#glow)'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Score */}
          <motion.div
            className="relative"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-6xl font-space font-bold tracking-tight">
              {Math.round(displayScore)}
            </span>
          </motion.div>
          
          <span className="text-sm text-white/40 mb-2">AI Risk Score</span>
          
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ 
              opacity: showStatus ? 1 : 0, 
              scale: showStatus ? 1 : 0.8,
              y: showStatus ? 0 : 10
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`px-4 py-1.5 rounded-full ${
              status === 'PASS' ? 'bg-emerald/20' :
              status === 'WARNING' ? 'bg-yellow-500/20' :
              'bg-red-500/20'
            }`}
          >
            <span className={`text-lg font-space font-bold ${getStatusClass()}`}>
              {status}
            </span>
          </motion.div>
          
          {/* Status message */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: showStatus ? 1 : 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-white/40 mt-2"
          >
            {getStatusMessage()}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
