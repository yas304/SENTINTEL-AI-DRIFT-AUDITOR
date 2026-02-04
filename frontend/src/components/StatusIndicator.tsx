import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatusIndicatorProps {
  isConnected: boolean;
  lastUpdated?: string;
}

export default function StatusIndicator({ isConnected, lastUpdated }: StatusIndicatorProps) {
  const [timeSince, setTimeSince] = useState('');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeSince = () => {
      const now = new Date();
      const updated = new Date(lastUpdated);
      const diffMs = now.getTime() - updated.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      
      if (diffSec < 60) {
        setTimeSince('Just now');
      } else if (diffSec < 3600) {
        setTimeSince(`${Math.floor(diffSec / 60)}m ago`);
      } else {
        setTimeSince(`${Math.floor(diffSec / 3600)}h ago`);
      }
    };

    updateTimeSince();
    const interval = setInterval(updateTimeSince, 10000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 text-xs"
    >
      {/* Connection status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <motion.div
              className="w-2 h-2 bg-emerald rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Wifi size={14} className="text-emerald" />
            <span className="text-white/60">Connected</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <WifiOff size={14} className="text-red-500" />
            <span className="text-white/60">Offline</span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10" />

      {/* Last updated */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-white/40">
          <Clock size={14} />
          <span>Updated {timeSince}</span>
        </div>
      )}

      {/* Activity indicator */}
      <div className="flex items-center gap-2 text-white/40">
        <Activity size={14} className="text-teal" />
        <span>Live</span>
      </div>
    </motion.div>
  );
}
