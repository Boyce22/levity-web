'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AuthBackgroundProps {
  mode: 'login' | 'register';
}

export function AuthBackground({ mode }: AuthBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isRegister = mode === 'register';

  if (!isMounted) {
    return <div className="fixed inset-0 -z-10 bg-[#050507]" />;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050507]">
      {/* Dynamic Fluid Mesh Gradient */}
      <motion.div 
        className="absolute inset-0 transition-opacity duration-1000"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Primary Ambient Glow (Using radial-gradient instead of blur for Chromium performance) */}
        <motion.div
           animate={{
             scale: isRegister ? [1, 1.2, 1] : [1, 1.05, 1],
             opacity: isRegister ? 0.4 : 0.25,
           }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
           className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(79,70,229,0.4)_0%,transparent_100%)]"
        />
        
        {/* Secondary Orb */}
        <motion.div
           animate={{
             rotate: isRegister ? [0, -360] : [0, 360],
             scale: isRegister ? 1.1 : 1,
           }}
           transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
           className="absolute top-[10%] right-[5%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(109,40,217,0.3)_0%,transparent_100%)]"
           style={{ transformOrigin: 'center center' }}
        />

        {/* Deep background accent */}
        <motion.div
           animate={{
             scale: [1, 1.15, 1],
             opacity: [0.15, 0.2, 0.15],
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(30,64,175,0.3)_0%,transparent_100%)]"
        />
      </motion.div>

      {/* Decorative Grid - Ultra lightweight */}
      <div 
        className="absolute inset-0 opacity-[0.03] transition-opacity duration-700 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #818cf8 1px, transparent 1px),
            linear-gradient(to bottom, #818cf8 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
        }}
      />

      {/* Finishing Grain Overlay (Removed mix-blend-mode for Chromium perf) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      {/* Subtle Vignette to focus the center */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,7,0.8)_100%)]" />
    </div>
  );
}
