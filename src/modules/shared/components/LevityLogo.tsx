'use client';

import { motion } from 'framer-motion';

interface LevityLogoProps {
  className?: string;
  size?: number;
}

export function LevityLogo({ className, size = 32 }: LevityLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main L shape with rounded corners and gradient */}
      <motion.path
        d="M30 20 C 30 20, 30 80, 30 80 L 80 80"
        stroke="url(#logo-gradient)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Translucent overlapping bar */}
      <motion.rect
        x="20"
        y="45"
        width="45"
        height="12"
        rx="6"
        fill="white"
        fillOpacity="0.15"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 20, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ transform: 'rotate(-30deg)', transformOrigin: 'center' }}
      />

      {/* The iconic Green Dot with Glow */}
      <motion.circle
        cx="52"
        cy="55"
        r="6"
        fill="#10b981"
        filter="url(#glow)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      />
    </svg>
  );
}
