'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ApiError } from '@/infra/http/errors';
import { ZodError } from 'zod';
import { AuthHeader } from './AuthHeader';
import { AuthInputs } from './AuthInputs';
import { AuthFooter } from './AuthFooter';
import { loginAction, registerAction } from '../server/actions';

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
      const action = isRegister ? registerAction : loginAction;
      await action({ username, password });

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
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof ZodError) {
        setError(err.issues[0]?.message ?? 'Dados inválidos.');
      } else {
        setError('Ocorreu um erro inesperado.');
      }
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
      className="relative w-full max-w-[360px] overflow-hidden rounded-sm border p-7 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
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
            className="mb-6 rounded-sm border border-red-400/20 bg-red-400/10 p-3.5 text-center text-[12px] font-semibold text-red-400"
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

      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[var(--app-primary)]/5 blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[var(--app-primary)]/5 blur-[60px]" />
    </motion.div>
  );
}
