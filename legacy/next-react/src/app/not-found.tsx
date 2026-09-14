'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LevityLogo } from '@/ui/components/LevityLogo';

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-1000 flex flex-col items-center justify-center overflow-hidden bg-[#050507]">
      {/* Background Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div 
          animate={{ 
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[140px]" 
        />
        
        {/* Film Grain Texture Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
            backgroundSize: '200px 200px',
          }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-12 px-6 text-center">
        {/* Floating Logo - Zero Gravity Effect */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 2, -2, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Outer Glow */}
          <div className="absolute inset-0 scale-150 rounded-full bg-indigo-500/20 blur-3xl" />
          <LevityLogo size={100} className="relative z-10 opacity-90" />
        </motion.div>

        {/* Content */}
        <div className="max-w-sm space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold tracking-tighter text-white"
          >
            Lost in the void
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-4 text-[14px] leading-relaxed font-medium text-indigo-200/40"
          >
            The workspace or page you are looking for has drifted into deep space.
          </motion.p>
        </div>

        {/* Return Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02, filter: 'brightness(1.2)' }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-3 rounded-2xl px-8 py-3.5 text-[13px] font-bold text-white shadow-2xl shadow-indigo-500/10 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <ArrowLeft className="h-4 w-4 text-indigo-400 transition-transform group-hover:-translate-x-1" />
              Return to Workspace
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* 404 Watermark */}
      <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 opacity-[0.02]">
        <span className="text-[120px] font-black tracking-tighter text-white select-none">
          404
        </span>
      </div>
    </div>
  );
}
