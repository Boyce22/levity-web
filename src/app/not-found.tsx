'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LevityLogo } from '@/modules/shared/components/LevityLogo';

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#050507] overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[140px]" 
        />
        
        {/* Film Grain Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
            backgroundSize: '200px 200px',
          }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-12 text-center px-6">
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
          <div className="absolute inset-0 blur-3xl bg-indigo-500/20 rounded-full scale-150" />
          <LevityLogo size={100} className="relative z-10 opacity-90" />
        </motion.div>

        {/* Content */}
        <div className="space-y-4 max-w-sm">
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
            className="text-[14px] text-indigo-200/40 font-medium leading-relaxed px-4"
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
              className="group flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[13px] font-bold text-white transition-all shadow-2xl shadow-indigo-500/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
              Return to Workspace
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* 404 Watermark */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.02]">
        <span className="text-[120px] font-black tracking-tighter text-white select-none">
          404
        </span>
      </div>
    </div>
  );
}
