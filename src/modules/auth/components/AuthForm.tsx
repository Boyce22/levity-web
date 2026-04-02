'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { LevityLogo } from '@/modules/shared/components/LevityLogo';
import { api } from '@/lib/api';

interface AuthFormProps {
  initialMode: 'login' | 'register';
}

export function AuthForm({ initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await api.post(endpoint, { username, password });

      if (res.ok) {
        if (!isRegister) {
          const urlParams = new URLSearchParams(window.location.search);
          const callbackUrl = urlParams.get('callbackUrl');
          if (callbackUrl && callbackUrl.match(/^\/invite\/[a-zA-Z0-9-]+$/)) {
            window.location.href = callbackUrl;
          } else {
            window.location.href = '/';
          }
        } else {
          window.location.href = '/';
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Authentication failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred');
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setError('');
    const newUrl = isRegister ? '/login' : '/register';
    window.history.pushState({}, '', newUrl);
  };

  return (
    <motion.div
      layout
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full max-w-[360px] p-7 rounded-sm border shadow-[0_24px_60px_rgba(0,0,0,0.5)] overflow-hidden relative"
      style={{
        background: 'rgba(28, 28, 30, 0.75)',
        backdropFilter: 'blur(20px)',
        borderColor: 'var(--app-border)',
      }}
    >
      <div className="relative z-10">
        <motion.div 
          layoutId="auth-icon"
          className="flex justify-center mb-6"
        >
          <div className="w-12 h-12 rounded-sm flex items-center justify-center">
            <LevityLogo size={48} />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold tracking-tight text-[var(--app-text)] mb-2">
              {isRegister ? 'Join the network' : 'Welcome back'}
            </h1>
            <p className="text-[13px] text-[var(--app-text-muted)] font-medium opacity-70 px-4">
              {isRegister ? 'Create your identity to start building.' : 'Your workspace is ready and waiting.'}
            </p>
          </motion.div>
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-3.5 bg-red-400/10 border border-red-400/20 rounded-sm text-[12px] text-center text-red-400 font-semibold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div layout>
            <label className="block text-[11px] font-bold mb-1.5 text-[var(--app-text-muted)] ml-1 uppercase tracking-[0.1em] opacity-60" htmlFor="user">Username</label>
            <input
              id="user"
              type="text"
              autoFocus
              className="w-full px-4 py-3 bg-[var(--app-bg)]/50 border border-[var(--app-border)] rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-[var(--app-text-muted)]/20 transition-all text-[14px] text-[var(--app-text)] disabled:opacity-50"
              placeholder="e.g. spaceman"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </motion.div>

          <motion.div layout>
            <label className="block text-[11px] font-bold mb-1.5 text-[var(--app-text-muted)] ml-1 uppercase tracking-[0.1em] opacity-60" htmlFor="pass">Password</label>
            <div className="relative group">
              <input
                id="pass"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 pr-11 py-3 bg-[var(--app-bg)]/50 border border-[var(--app-border)] rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-[var(--app-text-muted)]/20 transition-all text-[14px] text-[var(--app-text)] disabled:opacity-50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-[11px] font-bold mb-1.5 text-[var(--app-text-muted)] ml-1 uppercase tracking-[0.1em] opacity-60" htmlFor="confirm-pass">Confirm Password</label>
                <div className="relative group">
                  <input
                    id="confirm-pass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 pr-11 py-3 bg-[var(--app-bg)]/50 border border-[var(--app-border)] rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-[var(--app-text-muted)]/20 transition-all text-[14px] text-[var(--app-text)]"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            layout
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 mt-8 rounded-sm text-white font-bold transition-all text-[14px] focus:ring-2 focus:ring-indigo-500/20 shadow-lg shadow-indigo-950/20"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
            }}
            whileHover={{ filter: 'brightness(1.15)', scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isRegister ? 'Initialize Workspace' : 'Enter Workspace'}
                <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
              </>
            )}
          </motion.button>
        </form>

        <motion.div 
          layout
          className="mt-8 text-center text-[12px] font-medium"
        >
          <span className="text-[var(--app-text-muted)] opacity-60">
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}
          </span>
          <button 
            type="button"
            onClick={toggleMode}
            className="ml-2 text-indigo-400 hover:text-indigo-300 hover:brightness-125 font-bold transition-all"
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </motion.div>
      </div>

      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--app-primary)]/5 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--app-primary)]/5 blur-[60px] rounded-full pointer-events-none" />
    </motion.div>
  );
}
