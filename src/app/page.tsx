'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Gamepad2, 
  Users, 
  Bot, 
  Trophy, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  PlayCircle,
  Award,
  Swords,
  Layers
} from 'lucide-react';
import { GameCard } from '@/components/cards/GameCard';
import { createNumberCard, createActionCard, createWildCard } from '@/game-engine/cards';

export default function HomePage() {
  const showcaseCards = [
    createNumberCard('RED', 7),
    createActionCard('BLUE', 'DRAW_TWO'),
    createWildCard('WILD_DRAW_FOUR'),
    createActionCard('GREEN', 'REVERSE'),
    createNumberCard('YELLOW', 0),
  ];

  const gameModes = [
    {
      title: 'Casual Multiplayer',
      description: 'Hop into standard 4-player lobbies with instant matchmaking and friendly vibes.',
      icon: Gamepad2,
      badge: 'POPULAR',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
      textColor: 'text-blue-400',
      href: '/play?mode=CASUAL',
    },
    {
      title: 'Competitive Ranked',
      description: 'Climb from Bronze to Grandmaster with seasonal ELO ratings and leaderboard rewards.',
      icon: Trophy,
      badge: 'RANKED',
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
      textColor: 'text-amber-400',
      href: '/play?mode=RANKED',
    },
    {
      title: 'Private Rooms',
      description: 'Host custom matches with friends using custom rules (+2/+4 stacking, 7-0 swaps, Jump-In).',
      icon: Users,
      badge: 'CUSTOM RULES',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
      textColor: 'text-purple-400',
      href: '/rooms',
    },
    {
      title: 'AI Arena & Bot Match',
      description: 'Challenge strategic heuristic bots or design and train your own custom AI strategies.',
      icon: Bot,
      badge: 'AI ENGINE',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      textColor: 'text-emerald-400',
      href: '/bots',
    },
    {
      title: 'Live Tournaments',
      description: 'Compete in single elimination, double elimination, and Swiss tournament brackets.',
      icon: Swords,
      badge: 'PRIZE POOL',
      color: 'from-red-500/20 to-orange-500/10 border-red-500/30',
      textColor: 'text-red-400',
      href: '/tournaments',
    },
    {
      title: 'Deck & Rule Creator',
      description: 'Craft unique custom cards, design specialized decks, and publish to the community.',
      icon: Layers,
      badge: 'LAB & WORKSHOP',
      color: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30',
      textColor: 'text-indigo-400',
      href: '/creator',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Decorative Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-red-600/15 blur-[120px]" />

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-300 backdrop-blur-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>SEASON 1 HAS BEGUN — COMPETE FOR GLORY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase">
            PLAY. COMPETE.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-blue-400">
              DOMINATE.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The next-generation competitive card arena. Play real-time multiplayer with custom rules, challenge advanced AI bots, compete in tournaments, and climb the ranks.
          </p>

          {/* Call To Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/play"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-red-500 via-purple-600 to-blue-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.8)] hover:scale-105 active:scale-95 transition-all"
            >
              <Gamepad2 className="w-5 h-5" />
              PLAY NOW
            </Link>

            <Link
              href="/rooms"
              className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm tracking-wider uppercase bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all"
            >
              <Users className="w-5 h-5 text-purple-400" />
              CREATE ROOM
            </Link>

            <Link
              href="/bots"
              className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm tracking-wider uppercase bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all"
            >
              <Bot className="w-5 h-5 text-emerald-400" />
              PLAY WITH BOTS
            </Link>

            <Link
              href="/tournaments"
              className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm tracking-wider uppercase bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              TOURNAMENTS
            </Link>
          </div>
        </div>

        {/* Interactive Card Showcase Deck */}
        <div className="mt-16 flex justify-center items-center">
          <div className="flex -space-x-8 sm:-space-x-12 hover:-space-x-4 transition-all duration-300 py-6 overflow-visible">
            {showcaseCards.map((card, idx) => (
              <div
                key={card.id}
                className="transform transition-transform duration-300 hover:scale-110 hover:-translate-y-4 hover:z-20 cursor-pointer"
                style={{
                  transform: `rotate(${(idx - 2) * 6}deg)`,
                }}
              >
                <GameCard card={card} isPlayable />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes Grid */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-black tracking-widest text-purple-400 uppercase">
            CHOOSE YOUR BATTLEGROUND
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            COMPREHENSIVE GAME MODES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.title}
                href={mode.href}
                className={`glass-panel p-6 rounded-2xl border bg-gradient-to-br ${mode.color} hover:scale-[1.02] hover:border-purple-500/50 transition-all group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
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

                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  <span>Enter Mode</span>
                  <PlayCircle className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Platform Architecture Highlights */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Server-Authoritative</h4>
            <p className="text-xs text-slate-400">
              Zero client trust. Card validation, turn rules, draws, and bluff checks occur strictly on the backend engine.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Anti-Cheat Masking</h4>
            <p className="text-xs text-slate-400">
              Opponent hands are never transmitted across the wire, ensuring total fair play for competitive matches.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Smart AI Personalities</h4>
            <p className="text-xs text-slate-400">
              From Aggressive and Defensive to Strategic risk calculators with custom color preferences and bluffing heuristics.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Event Replays</h4>
            <p className="text-xs text-slate-400">
              Full event-sourced playback of every match with step controls and post-match AI decision analysis.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
