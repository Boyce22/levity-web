'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { AuthHeader } from './AuthHeader';
import { AuthInputs } from './AuthInputs';
import { AuthFooter } from './AuthFooter';

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
        <AuthHeader mode={mode} />

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-3.5 bg-red-400/10 border border-red-400/20 rounded-sm text-[12px] text-center text-red-400 font-semibold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <AuthInputs
            mode={mode}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            isLoading={isLoading}
          />

          <AuthFooter
            mode={mode}
            isLoading={isLoading}
            toggleMode={toggleMode}
          />
        </form>
      </div>

      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--app-primary)]/5 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--app-primary)]/5 blur-[60px] rounded-full pointer-events-none" />
    </motion.div>
  );
}
