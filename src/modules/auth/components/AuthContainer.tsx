'use client';

import { useState, useEffect } from 'react';
import { AuthBackground } from './AuthBackground';
import { AuthForm } from './AuthForm';

interface AuthContainerProps {
  initialMode: 'login' | 'register';
}

export function AuthContainer({ initialMode }: AuthContainerProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Listen to popstate to update mode when user uses back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('register')) setMode('register');
      else setMode('login');
    };

    window.addEventListener('popstate', handlePopState);
    
    // Check initial path in case of direct access or hydration
    handlePopState();

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync mode with window location changes initiated by AuthForm
  useEffect(() => {
    const interval = setInterval(() => {
      const path = window.location.pathname;
      const currentMode = path.includes('register') ? 'register' : 'login';
      if (currentMode !== mode) setMode(currentMode);
    }, 100);
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4">
      <AuthBackground mode={mode} />
      <AuthForm initialMode={initialMode} />
    </main>
  );
}
