'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layout } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151515] text-slate-100 font-sans">
      <div className="w-full max-w-[380px] p-8 bg-[#1c1c1e] border border-white/5 rounded-[2rem] shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-inner">
            <Layout className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2 text-center tracking-tight text-white/90">Create an account</h1>
        <p className="text-sm text-center text-white/40 mb-6 font-medium">Start organizing your tasks today.</p>
        
        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] text-center text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5 text-white/60 ml-1" htmlFor="user">Username</label>
            <input
              id="user"
              type="text"
              autoFocus
              className="w-full px-4 py-3 bg-[#212124] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-white/20 transition-all text-[14px] text-white/90"
              placeholder="e.g. myusername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5 text-white/60 ml-1" htmlFor="pass">Password</label>
            <input
              id="pass"
              type="password"
              className="w-full px-4 py-3 bg-[#212124] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-white/20 transition-all text-[14px] text-white/90"
              placeholder="Min. 5 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 mt-6 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.25)] transition-all flex justify-center items-center text-[14px] ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-[13px] text-white/40 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
