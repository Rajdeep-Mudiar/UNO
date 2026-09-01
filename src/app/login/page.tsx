'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { 
  User, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { status } = useSession();

  const [guestName, setGuestName] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated, redirect
  if (status === 'authenticated') {
    router.push(callbackUrl);
  }

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setErrorMsg('');
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to initiate Google Sign-In. Please check your credentials.');
      setLoadingGoogle(false);
    }
  };

  const handleGuestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    setLoadingGuest(true);
    setErrorMsg('');
    try {
      const res = await signIn('guest', {
        username: guestName.trim(),
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMsg('Could not log in as guest. Please try another name.');
        setLoadingGuest(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Guest sign-in encountered an error.');
      setLoadingGuest(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-red-600/20 blur-[140px]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-amber-400 to-blue-500 p-0.5 shadow-xl group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-blue-400 tracking-tighter text-xl">
                  UNO
                </span>
              </div>
            </div>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            ENTER CARD ARENA
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Sign in with Google to sync your ranked rating, tournament trophies, cosmetic unlocks, and custom bots.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Card Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-6">
          {/* Primary: Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            {/* Official Google Vector Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loadingGoogle ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">
              OR QUICK GUEST LOGIN
            </span>
          </div>

          {/* Secondary: Guest / Demo Login Form */}
          <form onSubmit={handleGuestSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Choose Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CardMaster99"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingGuest || !guestName.trim()}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>{loadingGuest ? 'Creating Session...' : 'Play as Guest'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Perks Highlight */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Free 500 Coins & 25 Gems on sign-up</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Full ELO ranked rating & matchmaking progression</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>No passwords needed — Instant Google OAuth</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-purple-400 transition-colors"
          >
            ← Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
