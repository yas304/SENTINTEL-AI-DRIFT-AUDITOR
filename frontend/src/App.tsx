import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

type View = 'landing' | 'dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  return (
    <div className="min-h-screen bg-navy">
      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onStartAudit={() => setCurrentView('dashboard')} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard onBack={() => setCurrentView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
