'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Swords, 
  Play, 
  Save, 
  Check
} from 'lucide-react';
import { BotDifficulty, BotPersonality, BotStrategyConfig, DEFAULT_BOT_PROFILES } from '@/bots/types';
import { CardColor } from '@/game-engine/types';

export default function BotBuilderPage() {
  const [botConfig, setBotConfig] = useState<BotStrategyConfig>({
    name: 'CyberTactician',
    difficulty: 'HARD',
    personality: 'STRATEGIC',
    aggression: 0.75,
    riskTolerance: 0.6,
    defenseBias: 0.7,
    attackBias: 0.85,
    bluffBias: 0.2,
    preferredColor: 'RED',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleDifficultyPreset = (difficulty: BotDifficulty) => {
    const preset = DEFAULT_BOT_PROFILES[difficulty];
    setBotConfig((prev) => ({
      ...prev,
      difficulty,
      personality: preset.personality,
      aggression: preset.aggression,
      riskTolerance: preset.riskTolerance,
      defenseBias: preset.defenseBias,
      attackBias: preset.attackBias,
      bluffBias: preset.bluffBias,
    }));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI LABORATORY & BOT BUILDER</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
          CUSTOM BOT ARCHITECT
        </h1>
        <p className="text-sm text-slate-400">
          Configure AI heuristics, fine-tune aggression, defense biases, and bluffing tendencies, then test your creation in live practice battles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Sliders & Settings (8 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8">
          {/* Identity & Preset Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Bot Name
              </label>
              <input
                type="text"
                value={botConfig.name}
                onChange={(e) => setBotConfig({ ...botConfig, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Personality Type
              </label>
              <select
                value={botConfig.personality}
                onChange={(e) => setBotConfig({ ...botConfig, personality: e.target.value as BotPersonality })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="STRATEGIC">Strategic (Calculated moves)</option>
                <option value="AGGRESSIVE">Aggressive (Attacks relentlessly)</option>
                <option value="DEFENSIVE">Defensive (Hoards counters)</option>
                <option value="RISKY">Risky (Plays wilds early)</option>
                <option value="BALANCED">Balanced (Adaptive)</option>
                <option value="RANDOM">Random (Casual unpredictable)</option>
              </select>
            </div>
          </div>

          {/* Difficulty Preset Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              Difficulty Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as BotDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => handleDifficultyPreset(diff)}
                  className={`py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                    botConfig.difficulty === diff
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Area */}
          <div className="space-y-6 pt-4 border-t border-slate-800">
            {/* Aggression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  Aggression (Prefers playing action/+2/+4 cards immediately)
                </span>
                <span className="text-red-400 font-mono">{Math.round(botConfig.aggression * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={botConfig.aggression}
                onChange={(e) => setBotConfig({ ...botConfig, aggression: parseFloat(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            {/* Defense Bias */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Defense Bias (Saves wild/+2 cards to counter opponent attacks)
                </span>
                <span className="text-blue-400 font-mono">{Math.round(botConfig.defenseBias * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={botConfig.defenseBias}
                onChange={(e) => setBotConfig({ ...botConfig, defenseBias: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Attack Bias */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  Threat Attack Bias (Targets leading player with 1-2 cards)
                </span>
                <span className="text-amber-400 font-mono">{Math.round(botConfig.attackBias * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={botConfig.attackBias}
                onChange={(e) => setBotConfig({ ...botConfig, attackBias: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Bluff Bias */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  Bluff Frequency (Plays Wild Draw Four even when holding matching color)
                </span>
                <span className="text-purple-400 font-mono">{Math.round(botConfig.bluffBias * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={botConfig.bluffBias}
                onChange={(e) => setBotConfig({ ...botConfig, bluffBias: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Preferred Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Preferred Color Choice on Wilds
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(['RED', 'BLUE', 'GREEN', 'YELLOW'] as CardColor[]).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBotConfig({ ...botConfig, preferredColor: color })}
                    className={`py-2.5 rounded-xl border text-xs font-black uppercase transition-all ${
                      botConfig.preferredColor === color
                        ? 'border-white ring-2 ring-white/50 text-white shadow-lg ' +
                          (color === 'RED' ? 'bg-red-600' : color === 'BLUE' ? 'bg-blue-600' : color === 'GREEN' ? 'bg-emerald-600' : 'bg-amber-500 text-slate-950')
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Bot Profile Preview & Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 text-center space-y-6">
            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 p-0.5 shadow-2xl">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-white">
                <Bot className="w-12 h-12 text-emerald-400" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">{botConfig.name}</h3>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-black text-purple-300">
                  {botConfig.difficulty}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-300">
                  {botConfig.personality}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800 text-left text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Threat Attack:</span>
                <span className="font-bold text-white">{Math.round(botConfig.attackBias * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Defense Hold:</span>
                <span className="font-bold text-white">{Math.round(botConfig.defenseBias * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Wild Risk:</span>
                <span className="font-bold text-white">{Math.round(botConfig.riskTolerance * 100)}%</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 font-bold text-xs text-white flex items-center justify-center gap-2 transition-colors"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                {savedSuccess ? 'Bot Configuration Saved!' : 'Save Configuration'}
              </button>

              <Link
                href="/play/practice"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg hover:scale-102 transition-transform"
              >
                <Play className="w-4 h-4 fill-current" />
                Test in Practice Match
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
