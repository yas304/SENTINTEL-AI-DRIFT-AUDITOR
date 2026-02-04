import { motion } from 'framer-motion';
import { DatasetMode } from '../types';

interface DatasetToggleProps {
  activeMode: DatasetMode;
  onModeChange: (mode: DatasetMode) => void;
  isLoading?: boolean;
}

const modes: { value: DatasetMode; label: string; description: string }[] = [
  { 
    value: 'clean', 
    label: 'Clean', 
    description: 'Balanced, unbiased data' 
  },
  { 
    value: 'biased', 
    label: 'Biased', 
    description: 'Gender bias present' 
  },
  { 
    value: 'drifted', 
    label: 'Drifted', 
    description: 'Distribution shift' 
  },
];

export default function DatasetToggle({ 
  activeMode, 
  onModeChange, 
  isLoading 
}: DatasetToggleProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-sm text-white/50 mb-3">Dataset Mode</span>
      
      <div className="toggle-group">
        {modes.map((mode) => (
          <motion.button
            key={mode.value}
            onClick={() => !isLoading && onModeChange(mode.value)}
            className={`toggle-item relative ${activeMode === mode.value ? 'active' : ''}`}
            whileHover={!isLoading ? { scale: 1.02 } : undefined}
            whileTap={!isLoading ? { scale: 0.98 } : undefined}
            disabled={isLoading}
          >
            {mode.label}
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-navy-lighter border border-white/10 rounded-lg text-xs text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              {mode.description}
            </div>
          </motion.button>
        ))}
      </div>
      
      <motion.p
        key={activeMode}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-white/30 mt-2"
      >
        {modes.find(m => m.value === activeMode)?.description}
      </motion.p>
    </div>
  );
}
