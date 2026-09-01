'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Bot, 
  ShoppingBag, 
  ShieldAlert, 
  Menu, 
  X, 
  Flame,
  UserCheck,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'HOME', icon: Flame },
    { href: '/play', label: 'PLAY', icon: Gamepad2 },
    { href: '/rooms', label: 'ROOMS', icon: Users },
    { href: '/tournaments', label: 'TOURNAMENTS', icon: Trophy },
    { href: '/leaderboard', label: 'LEADERBOARD', icon: UserCheck },
    { href: '/bots', label: 'AI ARENA', icon: Bot },
    { href: '/clubs', label: 'CLUBS', icon: ShieldAlert },
    { href: '/store', label: 'STORE', icon: ShoppingBag },
  ];

  const user = session?.user;
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-amber-400 to-blue-500 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-blue-400 tracking-tighter text-lg">
                UNO
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-wider text-white text-base leading-none">
              CARD ARENA
            </span>
            <span className="text-[10px] font-semibold text-purple-400 tracking-widest leading-tight">
              MULTIPLAYER
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors tracking-wide',
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Authentication Section */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Virtual Treasury Coins & Gems */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
                <span>🪙 {user?.coins ?? 500}</span>
                <span className="text-slate-600">|</span>
                <span className="text-purple-400">💎 {user?.gems ?? 25}</span>
              </div>

              {/* User Dropdown Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-colors"
                >
                  {user?.image ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-purple-500/40">
                      <Image
                        src={user.image}
                        alt={user.name || 'Player'}
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-black">
                      {(user?.name || 'P')[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-200 leading-none max-w-[100px] truncate">
                      {user?.name || 'Player 1'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold leading-none">
                      Lv. {user?.level ?? 1}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu Box */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 animate-fadeIn space-y-1">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user?.name || 'Player 1'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Guest Session'}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      View Career Profile
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          {isAuthenticated ? (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {user?.image ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-purple-500/40">
                    <Image
                      src={user.image}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs">
                    {(user?.name || 'P')[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-white">{user?.name || 'Player 1'}</p>
                  <p className="text-[10px] text-amber-400 font-bold">🪙 {user?.coins ?? 500} | 💎 {user?.gems ?? 25}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 text-slate-400 hover:text-red-400 text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase text-center flex items-center justify-center gap-2 shadow"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Google
            </Link>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors',
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
