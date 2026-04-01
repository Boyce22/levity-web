'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMemo, useRef, useState, useEffect } from 'react';

interface AuthBackgroundProps {
  mode: 'login' | 'register';
}

const PARTICLE_COUNT = 32;

export function AuthBackground({ mode }: AuthBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for parallax and lens flare
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  // Tilt effects for parallax
  const rotateX = useTransform(springY, [0, 1000], [2, -2]);
  const rotateY = useTransform(springX, [0, 1000], [-2, 2]);

  useEffect(() => {
    setIsMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 20 + 20,
      offset: Math.random() * 10,
    }));
  }, []);

  const isRegister = mode === 'register';

  if (!isMounted) {
    return <div className="fixed inset-0 -z-10 bg-[#0a0a0c]" />;
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden bg-[#050507]"
    >
      {/* 1. Deep Atmospheric Layers (Mesh Gradients) */}
      <motion.div 
        style={{ rotateX, rotateY, perspective: 1000 }}
        className="absolute inset-0 transition-all duration-1000"
      >
        {/* Deep Indigo Glow */}
        <motion.div
           animate={{
             scale: isRegister ? 1.2 : 1,
             opacity: isRegister ? 0.6 : 0.4,
           }}
           className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]"
        />
        
        {/* Soft Purple Aurora - Orbiting */}
        <motion.div
           animate={{
             rotate: [0, 360],
           }}
           transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
           className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/15 blur-[140px]"
           style={{ transformOrigin: 'center center' }}
        />

        {/* Center Breathing Light */}
        <motion.div
           animate={{
             scale: [1, 1.1, 1],
             opacity: [0.1, 0.15, 0.1],
           }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]"
        />
      </motion.div>

      {/* 2. Interactive Lens Flare Tracker */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="pointer-events-none absolute z-10 w-[400px] h-[400px] rounded-full opacity-[0.08]"
        animate={{
           background: `radial-gradient(circle at center, rgba(129, 140, 248, 0.8) 0%, transparent 60%)`,
        }}
      />
      
      {/* 3. Connective Web Layer (Logic based on state) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.14] pointer-events-none">
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(129, 140, 248, 0)" />
            <stop offset="50%" stopColor="rgba(129, 140, 248, 0.5)" />
            <stop offset="100%" stopColor="rgba(129, 140, 248, 0)" />
          </linearGradient>
        </defs>
        
        <motion.g animate={{ opacity: isRegister ? 1 : 0.4 }}>
          {particles.map((p, i) => {
            // Connect to nearest neighbors if in register mode
            const connections = isRegister ? 3 : 1;
            return Array.from({ length: connections }).map((_, idx) => {
              const next = particles[(i + idx + 1) % PARTICLE_COUNT];
              return (
                <motion.line
                  key={`line-${i}-${idx}`}
                  x1={`${p.x}%`}
                  y1={`${p.y}%`}
                  x2={`${next.x}%`}
                  y2={`${next.y}%`}
                  stroke="url(#line-grad)"
                  strokeWidth="0.5"
                  animate={{
                    pathLength: isRegister ? [0, 1, 0] : 0,
                    opacity: isRegister ? [0, 1, 0] : 0,
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              );
            });
          })}
        </motion.g>
      </svg>

      {/* 4. Drifting Nodes (Particles) */}
      {particles.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh` }}
          animate={{
            x: [`${p.x}vw`, `${p.x + (isRegister ? 8 : 4)}vw`, `${p.x}vw`],
            y: [`${p.y}vh`, `${p.y - (isRegister ? 12 : 6)}vh`, `${p.y}vh`],
            scale: isRegister ? [1, 1.3, 1] : 1,
            opacity: isRegister ? [0.2, 0.5, 0.2] : 0.15,
          }}
          transition={{
            duration: p.speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full bg-indigo-400 blur-[1px]"
          style={{ width: p.size, height: p.size }}
        />
      ))}

      {/* 5. Finishing Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      {/* Subtle Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
