'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LevityLogo } from './LevityLogo';
import { useEffect, useState } from 'react';

interface ProgressLoaderProps {
  message?: string;
  isStatic?: boolean;
  isComplete?: boolean;
}

export function ProgressLoader({ 
  message = "Synchronizing", 
  isStatic = false,
  isComplete = false
}: ProgressLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }

    if (isStatic) return;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) {
          clearInterval(timer);
          return prev;
        }
        const step = prev < 40 ? 4 : prev < 70 ? 1.5 : 0.3;
        return prev + step;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [isStatic, isComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.02,
        filter: "blur(40px)",
        transition: { duration: 1, ease: [0.19, 1, 0.22, 1] }
      }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#050507] overflow-hidden"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.35, 0.2],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[140px]" 
        />
      </div>

      <div className="relative flex flex-col items-center gap-14">
        {/* Breathing Logo */}
        <motion.div
          animate={{
            scale: [1, 1.03, 1],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="absolute inset-0 blur-3xl bg-indigo-500/15 rounded-full" />
          <LevityLogo size={72} className="relative z-10" />
        </motion.div>

        {/* Minimal Progress System */}
        <div className="w-40 flex flex-col items-center gap-4">
          <div className="relative h-[1px] w-full bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-indigo-500/60"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", damping: 30, stiffness: 35 }}
            />
            {/* Subtle Lead Glow */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-indigo-400 blur-[2px] opacity-30"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[9px] font-bold uppercase tracking-[0.4em] text-indigo-400/40"
          >
            {isComplete ? "Initialized" : message}
          </motion.span>
        </div>
      </div>

      {/* Subtle Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
          backgroundSize: '300px 300px',
        }}
      />
    </motion.div>
  );
}
