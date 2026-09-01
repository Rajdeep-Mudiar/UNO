'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Sliders, 
  Plus, 
  Save, 
  Play, 
  Trash2, 
  Check
} from 'lucide-react';
import { CardColor, CardType } from '@/game-engine/types';

interface CustomCardSpec {
  id: string;
  name: string;
  color: CardColor;
  type: CardType;
  value?: number;
  customEffect: string;
  count: number;
}

export default function CreatorPage() {
  const [deckName, setDeckName] = useState('Chaos Overdrive Deck');
  const [deckDescription, setDeckDescription] = useState('An ultra volatile 120-card custom deck with +6 Wilds and Targeted Swaps.');
  const [cards, setCards] = useState<CustomCardSpec[]>([
    {
      id: 'c1',
      name: 'Wild Draw Six (+6)',
      color: 'WILD',
      type: 'WILD_DRAW_FOUR',
      customEffect: 'Next player draws 6 cards and is skipped unless they stack another Wild +4/+6.',
      count: 4,
    },
    {
      id: 'c2',
      name: 'Color Wipeout',
      color: 'WILD',
      type: 'WILD',
      customEffect: 'All players must discard all cards matching the chosen color into the void.',
      count: 2,
    },
    {
      id: 'c3',
      name: 'Aegis Shield Reflect',
      color: 'BLUE',
      type: 'REVERSE',
      customEffect: 'Reflects incoming draw attacks back to the sender.',
      count: 4,
    },
    {
      id: 'c4',
      name: 'Hand Roulette (0)',
      color: 'RED',
      type: 'NUMBER',
      value: 0,
      customEffect: 'All hands rotate in the current direction of play.',
      count: 4,
    },
  ]);

  const [newCardColor, setNewCardColor] = useState<CardColor>('WILD');
  const [newCardName, setNewCardName] = useState('');
  const [newCardEffect, setNewCardEffect] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName) return;

    const newCard: CustomCardSpec = {
      id: `c-${Date.now()}`,
      name: newCardName,
      color: newCardColor,
      type: newCardColor === 'WILD' ? 'WILD' : 'CUSTOM',
      customEffect: newCardEffect || 'Custom card behavior during match.',
      count: 2,
    };

    setCards([...cards, newCard]);
    setNewCardName('');
    setNewCardEffect('');
  };

  const handleRemoveCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  const handleSaveDeck = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const totalCardsCount = cards.reduce((sum, c) => sum + c.count, 0) + 76; // Standard base deck + custom

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-300 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>CARD WORKSHOP & RULE DESIGNER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            DECK & RULE CREATOR
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Craft custom cards, design specialized decks, configure novel rule sets, and publish to the community workshop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDeck}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all shadow"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Deck Saved!' : 'Save Deck'}
          </button>

          <Link
            href="/play/practice"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-950/50 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Test in Sandbox
          </Link>
        </div>
      </div>

      {/* Workshop Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Deck Configuration & Custom Card Creator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-5">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Deck Metadata
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Deck Name</label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Cards in Deck</span>
                <span className="font-black text-indigo-400 text-sm">{totalCardsCount} Cards</span>
              </div>
            </div>
          </div>

          {/* New Custom Card Form */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-5">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              Add Custom Card
            </h3>

            <form onSubmit={handleAddCard} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Card Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reverse Skip Combo"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Card Color</label>
                <select
                  value={newCardColor}
                  onChange={(e) => setNewCardColor(e.target.value as CardColor)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="WILD">🌈 Wild Card</option>
                  <option value="RED">🔴 Red</option>
                  <option value="BLUE">🔵 Blue</option>
                  <option value="GREEN">🟢 Green</option>
                  <option value="YELLOW">🟡 Yellow</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Custom Effect Description</label>
                <textarea
                  rows={2}
                  placeholder="What happens when this card is played?"
                  value={newCardEffect}
                  onChange={(e) => setNewCardEffect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow"
              >
                + Inject Into Deck
              </button>
            </form>
          </div>
        </div>

        {/* Right: Active Cards in Deck List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-white">CUSTOM CARDS IN THIS DECK</h3>
              <span className="text-xs font-bold text-slate-400">{cards.length} Unique Special Cards</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3 relative group hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black">
                          {card.color}
                        </span>
                        <h4 className="font-bold text-white text-sm">{card.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{card.customEffect}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCard(card.id)}
                      className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Copies in Deck:</span>
                    <span className="text-white font-mono font-bold">{card.count}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
