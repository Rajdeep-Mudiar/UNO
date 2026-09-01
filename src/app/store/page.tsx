'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Gift
} from 'lucide-react';
import { GameCard } from '@/components/cards/GameCard';
import { createWildCard } from '@/game-engine/cards';

interface StoreItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: 'CARD_BACK' | 'CARD_SKIN' | 'TABLE_THEME' | 'AVATAR_FRAME' | 'EMOTE';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  priceCoins: number;
  priceGems: number;
  previewGradient: string;
  iconText: string;
}

const STORE_ITEMS: StoreItem[] = [
  {
    id: 'skin-1',
    sku: 'SKIN_CYBER_NEON',
    name: 'Cyberpunk Neon Holo',
    description: 'Electrifying neon borders and holographic sheen that pulses when playing special action cards.',
    category: 'CARD_SKIN',
    rarity: 'LEGENDARY',
    priceCoins: 1200,
    priceGems: 20,
    previewGradient: 'from-pink-500 via-purple-600 to-cyan-400',
    iconText: '⚡',
  },
  {
    id: 'skin-2',
    sku: 'SKIN_GOLD_FOIL',
    name: '24K Royal Gold Foil',
    description: 'Opulent gold embossed edges with reflective metallic textures reserved for champions.',
    category: 'CARD_SKIN',
    rarity: 'MYTHIC',
    priceCoins: 3000,
    priceGems: 50,
    previewGradient: 'from-amber-300 via-yellow-500 to-amber-700',
    iconText: '👑',
  },
  {
    id: 'back-1',
    sku: 'BACK_RETRO_SYNTH',
    name: 'Retro Synthwave Grid',
    description: '1980s neon grid card back with sunset aesthetics and glowing wireframe wireframes.',
    category: 'CARD_BACK',
    rarity: 'EPIC',
    priceCoins: 800,
    priceGems: 0,
    previewGradient: 'from-violet-600 via-fuchsia-600 to-amber-500',
    iconText: '🌆',
  },
  {
    id: 'back-2',
    sku: 'BACK_PIXEL_ARCADE',
    name: '8-Bit Pixel Nostalgia',
    description: 'Chunky arcade pixels with vibrant retro gaming color palettes.',
    category: 'CARD_BACK',
    rarity: 'RARE',
    priceCoins: 450,
    priceGems: 0,
    previewGradient: 'from-emerald-400 via-teal-600 to-blue-800',
    iconText: '👾',
  },
  {
    id: 'table-1',
    sku: 'TABLE_OBSIDIAN_ARENA',
    name: 'Obsidian Magma Arena',
    description: 'Molten volcanic table mat with glowing lava runes beneath the card discard pile.',
    category: 'TABLE_THEME',
    rarity: 'EPIC',
    priceCoins: 950,
    priceGems: 15,
    previewGradient: 'from-red-900 via-slate-900 to-orange-950',
    iconText: '🌋',
  },
  {
    id: 'frame-1',
    sku: 'FRAME_NEON_VORTEX',
    name: 'Cosmic Vortex Avatar Frame',
    description: 'Swirling celestial aura that surrounds your player profile avatar during matches.',
    category: 'AVATAR_FRAME',
    rarity: 'RARE',
    priceCoins: 350,
    priceGems: 5,
    previewGradient: 'from-indigo-500 to-purple-600',
    iconText: '🌌',
  },
  {
    id: 'emote-1',
    sku: 'EMOTE_SALT_SHAKER',
    name: 'Salty & Spicy Emote Pack',
    description: 'Animated in-game chat reactions including the Salty Shaker, Reverse Tears, and Flex Crown.',
    category: 'EMOTE',
    rarity: 'COMMON',
    priceCoins: 200,
    priceGems: 0,
    previewGradient: 'from-blue-400 to-teal-500',
    iconText: '🧂',
  },
];

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [coinsBalance, setCoinsBalance] = useState<number>(1450);
  const [gemsBalance, setGemsBalance] = useState<number>(35);
  const [inventory, setInventory] = useState<Record<string, boolean>>({
    'skin-1': true,
  });
  const [equippedSkin, setEquippedSkin] = useState<string>('skin-1');
  const [previewItem, setPreviewItem] = useState<StoreItem>(STORE_ITEMS[0]!);
  const [claimedDaily, setClaimedDaily] = useState(false);

  const previewCard = createWildCard('WILD_DRAW_FOUR');

  const handleClaimDaily = () => {
    if (claimedDaily) return;
    setCoinsBalance((prev) => prev + 100);
    setClaimedDaily(true);
  };

  const handlePurchase = (item: StoreItem) => {
    if (inventory[item.id]) {
      // Toggle equip
      setEquippedSkin(item.id);
      return;
    }

    if (item.priceGems > 0 && gemsBalance >= item.priceGems) {
      setGemsBalance((prev) => prev - item.priceGems);
    } else if (coinsBalance >= item.priceCoins) {
      setCoinsBalance((prev) => prev - item.priceCoins);
    } else {
      alert('Not enough coins or gems! Claim daily reward or play matches.');
      return;
    }

    setInventory((prev) => ({ ...prev, [item.id]: true }));
    setEquippedSkin(item.id);
  };

  const filteredItems = STORE_ITEMS.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const getRarityBadge = (rarity: StoreItem['rarity']) => {
    switch (rarity) {
      case 'MYTHIC':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-900/30';
      case 'LEGENDARY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-900/30';
      case 'EPIC':
        return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40';
      case 'RARE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
            <span>CUSTOMIZE YOUR DECK & TABLE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            COSMETICS STORE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Unlock premium holographic card skins, retro animated backs, magma mats, and custom avatar frames.
          </p>
        </div>

        {/* Currency Wallet & Daily Bonus */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center gap-1.5 font-black text-sm text-amber-400">
              <span>🪙</span>
              <span>{coinsBalance.toLocaleString()}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 font-black text-sm text-purple-400">
              <span>💎</span>
              <span>{gemsBalance}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClaimDaily}
            disabled={claimedDaily}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              claimedDaily
                ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-lg shadow-amber-950/40 hover:scale-105'
            }`}
          >
            <Gift className="w-4 h-4" />
            {claimedDaily ? 'Claimed Today' : 'Daily Free +100'}
          </button>
        </div>
      </div>

      {/* Live Showcase Preview Box */}
      {previewItem && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-slate-900/90 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Left Preview Card Container */}
            <div className="flex justify-center items-center py-4">
              <div
                className={`p-3 rounded-2xl bg-gradient-to-tr ${previewItem.previewGradient} shadow-[0_0_35px_rgba(168,85,247,0.4)] transform hover:scale-105 transition-transform`}
              >
                <div className="bg-slate-950 p-2 rounded-xl">
                  <GameCard card={previewCard} isPlayable />
                </div>
              </div>
            </div>

            {/* Middle Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black tracking-wider ${getRarityBadge(
                      previewItem.rarity
                    )}`}
                  >
                    {previewItem.rarity}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{previewItem.category}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">{previewItem.name}</h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                  {previewItem.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800">
                  {previewItem.priceGems > 0 ? (
                    <span className="text-sm font-black text-purple-400 flex items-center gap-1">
                      💎 {previewItem.priceGems} Gems
                    </span>
                  ) : (
                    <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                      🪙 {previewItem.priceCoins} Coins
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchase(previewItem)}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md ${
                    equippedSkin === previewItem.id
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                      : inventory[previewItem.id]
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white hover:scale-105'
                  }`}
                >
                  {equippedSkin === previewItem.id
                    ? 'Equipped ✓'
                    : inventory[previewItem.id]
                    ? 'Equip Skin'
                    : 'Unlock Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Catalog' },
          { id: 'CARD_SKIN', label: '✨ Card Skins' },
          { id: 'CARD_BACK', label: '🃏 Card Backs' },
          { id: 'TABLE_THEME', label: '🏟️ Table Mats' },
          { id: 'AVATAR_FRAME', label: '👑 Avatar Frames' },
          { id: 'EMOTE', label: '💬 Emotes' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Store Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isOwned = inventory[item.id];
          const isEquipped = equippedSkin === item.id;
          const isSelected = previewItem?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setPreviewItem(item)}
              className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'border-purple-500/60 bg-slate-900/90 shadow-lg shadow-purple-950/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="space-y-3">
                {/* Visual Thumbnail */}
                <div
                  className={`h-36 rounded-xl bg-gradient-to-br ${item.previewGradient} flex items-center justify-center text-4xl shadow-inner relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
                  <span className="relative z-10 transform group-hover:scale-125 transition-transform duration-300">
                    {item.iconText}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getRarityBadge(
                        item.rarity
                      )}`}
                    >
                      {item.rarity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                </div>
              </div>

              {/* Price & Purchase Button */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="font-bold text-xs">
                  {item.priceGems > 0 ? (
                    <span className="text-purple-400 flex items-center gap-1">💎 {item.priceGems}</span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">🪙 {item.priceCoins}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(item);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isEquipped
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : isOwned
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow'
                  }`}
                >
                  {isEquipped ? 'Equipped' : isOwned ? 'Equip' : 'Buy'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
