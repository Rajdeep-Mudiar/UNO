import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 py-10 text-slate-500 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">UNO Card Arena</span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              Online
            </span>
          </div>
          <p className="text-slate-500 text-[11px] max-w-md text-center md:text-left">
            An original competitive multiplayer card game platform inspired by classic shed-style card mechanics.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 font-semibold">
          <Link href="/play" className="hover:text-purple-400 transition-colors">Play</Link>
          <Link href="/rooms" className="hover:text-purple-400 transition-colors">Custom Rooms</Link>
          <Link href="/tournaments" className="hover:text-purple-400 transition-colors">Tournaments</Link>
          <Link href="/bots" className="hover:text-purple-400 transition-colors">AI Arena</Link>
          <Link href="/leaderboard" className="hover:text-purple-400 transition-colors">Rankings</Link>
        </div>

        <div className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} UNO Card Arena. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
