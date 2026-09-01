'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Gamepad2, 
  Bot, 
  Users, 
  Trophy, 
  Swords, 
  Sparkles, 
  Play, 
  Sliders
} from 'lucide-react';

export default function PlayPortalPage() {
  const modes = [
    {
      id: 'practice',
      title: 'Practice with Bots',
      description: 'Zero-pressure single-player practice match against 3 AI opponents with standard + custom rules.',
      icon: Bot,
      color: 'from-emerald-600/30 to-teal-700/20 border-emerald-500/40 text-emerald-400',
      href: '/play/practice',
      buttonText: 'Play Practice Match',
      isReady: true,
      badge: 'OFFLINE READY',
    },
    {
      id: 'casual',
      title: 'Casual Matchmaking',
      description: 'Quick match with random online players. Standard 4-player lobbies with fast turn timers.',
      icon: Gamepad2,
      color: 'from-blue-600/30 to-cyan-700/20 border-blue-500/40 text-blue-400',
      href: '/play/practice',
      buttonText: 'Find Casual Match',
      isReady: true,
      badge: 'INSTANT MATCH',
    },
    {
      id: 'custom_room',
      title: 'Private Rooms',
      description: 'Create a private lobby, configure custom house rules, and invite your friends with a shareable URL.',
      icon: Users,
      color: 'from-purple-600/30 to-indigo-700/20 border-purple-500/40 text-purple-400',
      href: '/rooms',
      buttonText: 'Create / Join Room',
      isReady: true,
      badge: 'CUSTOM RULES',
    },
    {
      id: 'ranked',
      title: 'Ranked Ladder',
      description: 'Competitive ladder with ELO rating progression from Bronze to Grandmaster.',
      icon: Trophy,
      color: 'from-amber-600/30 to-yellow-700/20 border-amber-500/40 text-amber-400',
      href: '/play/practice',
      buttonText: 'Enter Ranked Queue',
      isReady: true,
      badge: 'SEASON 1 ACTIVE',
    },
    {
      id: 'tournaments',
      title: 'Live Tournaments',
      description: 'Join bracket tournaments (Single Elimination / Swiss) and battle for coin prize pools.',
      icon: Swords,
      color: 'from-red-600/30 to-rose-700/20 border-red-500/40 text-red-400',
      href: '/tournaments',
      buttonText: 'Browse Tournaments',
      isReady: false,
      badge: 'COMING SOON',
    },
    {
      id: 'bot_builder',
      title: 'AI Arena & Bot Builder',
      description: 'Configure and test custom AI bot personalities with sliders for aggression, risk, and color bias.',
      icon: Sliders,
      color: 'from-indigo-600/30 to-purple-700/20 border-indigo-500/40 text-indigo-400',
      href: '/bots',
      buttonText: 'Open Bot Builder',
      isReady: true,
      badge: 'LABORATORY',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>SELECT YOUR GAME FORMAT</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
          PLAY ARENA
        </h1>
        <p className="text-sm text-slate-400">
          Choose a play mode to begin. Practice against heuristic bots or jump straight into casual matches.
        </p>
      </div>

      {/* Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.id}
              className={`glass-panel rounded-3xl p-6 border bg-gradient-to-br ${mode.color} flex flex-col justify-between hover:scale-[1.02] transition-all group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-center text-white">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-black tracking-wider text-slate-300">
                    {mode.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {mode.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href={mode.href}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-purple-500/50 font-bold text-xs text-white flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:border-purple-400 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {mode.buttonText}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
