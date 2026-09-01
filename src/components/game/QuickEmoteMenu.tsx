'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Smile, X, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickEmoteMenuProps {
  onSendEmote: (emote: string) => void;
}

const EMOJI_REACTIONS = [
  { emoji: '😂', label: 'Laugh' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😱', label: 'Shocked' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '💀', label: 'Dead' },
  { emoji: '🤡', label: 'Clown' },
  { emoji: '🚀', label: 'Rocket' },
];

const QUICK_CHATS = [
  'Good Game! 🤝',
  'Nice Move! 👏',
  'Watch out! ⚠️',
  'Almost won! 🎯',
  'No way! 🤯',
  'Play faster! ⏱️',
];

export const QuickEmoteMenu: React.FC<QuickEmoteMenuProps> = ({ onSendEmote }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'EMOJIS' | 'CHATS'>('EMOJIS');
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSelect = (emote: string) => {
    onSendEmote(emote);
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-14 right-0 z-50 w-72 p-3.5 rounded-3xl glass-panel border border-purple-500/30 bg-slate-950/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] space-y-3 animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('EMOJIS')}
                className={cn(
                  'flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all',
                  activeTab === 'EMOJIS'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Sparkles className="w-3 h-3" />
                <span>Emotes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('CHATS')}
                className={cn(
                  'flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all',
                  activeTab === 'CHATS'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Quick Chat</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Content: Emojis Grid */}
          {activeTab === 'EMOJIS' && (
            <div className="grid grid-cols-4 gap-2">
              {EMOJI_REACTIONS.map((item) => (
                <button
                  key={item.emoji}
                  type="button"
                  onClick={() => handleSelect(item.emoji)}
                  title={item.label}
                  className="w-full aspect-square rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-purple-400 hover:bg-purple-950/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-2xl shadow-inner group"
                >
                  <span className="transform group-hover:scale-125 transition-transform duration-200">
                    {item.emoji}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Tab Content: Quick Chat Phrases */}
          {activeTab === 'CHATS' && (
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
              {QUICK_CHATS.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => handleSelect(phrase)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-400 hover:bg-purple-950/30 text-left text-xs font-semibold text-slate-200 hover:text-white hover:translate-x-1 transition-all flex items-center justify-between"
                >
                  <span>{phrase}</span>
                  <span className="text-[10px] text-purple-400 font-bold opacity-0 hover:opacity-100">Send →</span>
                </button>
              ))}
            </div>
          )}

          <div className="text-[10px] text-center text-slate-500 font-medium pt-1 border-t border-slate-800/60">
            Click any emote to broadcast instantly to all players
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Emotes & Chat"
        title="Quick Emotes & Chat"
        className={cn(
          'w-11 h-11 rounded-2xl border transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95',
          isOpen
            ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 border-white text-white shadow-[0_0_20px_rgba(168,85,247,0.7)] rotate-90 scale-105'
            : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-purple-400 hover:text-white hover:scale-105'
        )}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Smile className="w-5 h-5 text-amber-400" />}
      </button>
    </div>
  );
};
