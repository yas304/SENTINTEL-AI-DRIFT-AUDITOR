import { motion } from 'framer-motion';
import { Shield, ArrowRight, Sparkles, CheckCircle, Zap, Activity, BarChart3, Award, Lock, Globe } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

interface LandingPageProps {
  onStartAudit: () => void;
}

export default function LandingPage({ onStartAudit }: LandingPageProps) {
  const features = [
    { icon: CheckCircle, text: 'Bias Detection', color: 'text-rose-400' },
    { icon: Activity, text: 'Drift Monitoring', color: 'text-gold' },
    { icon: Zap, text: 'Explainability', color: 'text-sky-400' },
    { icon: BarChart3, text: 'Risk Scoring', color: 'text-teal' },
  ];

  const stats = [
    { value: '99.9%', label: 'Accuracy' },
    { value: '<2s', label: 'Analysis Time' },
    { value: '50+', label: 'Bias Metrics' },
    { value: '24/7', label: 'Monitoring' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Premium animated background */}
      <AnimatedBackground />
      
      {/* Animated grid background */}
      <div className="grid-bg" />
      
      {/* Premium gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/80 pointer-events-none" />
      
      {/* Floating gold particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: i % 3 === 0 ? '#D4AF37' : i % 3 === 1 ? '#00D9B5' : '#F4D03F',
              opacity: 0.3,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-8"
        >
          <Award size={14} className="text-gold" />
          <span className="text-xs font-medium text-gold">Enterprise AI Governance Platform</span>
        </motion.div>

        {/* Logo/Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <motion.div
            className="relative inline-block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative w-36 h-36 mx-auto">
              {/* Outer glow rings */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-4 rounded-full"
                style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
              
              {/* Gold glow effect */}
              <div className="absolute inset-0 bg-gold/10 rounded-full blur-2xl" />
              <div className="absolute inset-4 bg-gold/5 rounded-full blur-xl" />
              
              {/* Shield icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Shield 
                    size={64} 
                    className="text-gold drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]" 
                    strokeWidth={1.5}
                  />
                  {/* Inner sparkle */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={20} className="text-gold-light" />
                  </motion.div>
                </div>
              </div>
              
              {/* Orbiting particles */}
              {[0, 120, 240].map((_angle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ 
                    top: '50%', 
                    left: '50%',
                    background: i === 0 ? '#D4AF37' : i === 1 ? '#00D9B5' : '#F4D03F',
                    boxShadow: `0 0 10px ${i === 0 ? '#D4AF37' : i === 1 ? '#00D9B5' : '#F4D03F'}`,
                  }}
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                >
                  <motion.div
                    style={{ 
                      position: 'absolute',
                      top: -55,
                      left: -3,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Title with gold gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-space text-6xl md:text-8xl font-bold mb-6 tracking-tight"
        >
          <span className="bg-gradient-to-r from-white via-platinum to-white/80 bg-clip-text text-transparent">
            Sentinel
          </span>
          <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            AI
          </span>
        </motion.h1>

        {/* Premium tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-3xl font-space font-medium mb-4"
        >
          <span className="text-gold-gradient">Verify to Trust AI</span>
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg text-white/40 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Enterprise-grade continuous AI auditing. Detect bias, monitor drift, 
          ensure explainability — all in real-time.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center justify-center gap-8 mb-10"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-space font-bold text-gold">{stat.value}</div>
              <div className="text-xs text-white/30 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button
            onClick={onStartAudit}
            className="glow-button group relative overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-3 font-space font-semibold text-lg">
              Start AI Audit
              <ArrowRight 
                size={22} 
                className="transition-transform group-hover:translate-x-1" 
              />
            </span>
          </motion.button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-14 flex items-center justify-center gap-4 flex-wrap"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + index * 0.1 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal/50 border border-gold/10 backdrop-blur-sm"
            >
              <feature.icon size={16} className={feature.color} />
              <span className="text-sm text-white/50">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges - Premium styling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-14 flex items-center justify-center gap-6"
        >
          {[
            { icon: Lock, text: 'SOC 2 Type II' },
            { icon: Globe, text: 'GDPR Compliant' },
            { icon: Award, text: 'ISO 27001' },
          ].map((badge, _i) => (
            <div key={badge.text} className="flex items-center gap-2 text-white/20">
              <badge.icon size={12} />
              <span className="text-xs">{badge.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
