'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Gift, Wallet, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';
import { WonPrize } from '../types/game';

interface HeaderProps {
  wonPrizes: WonPrize[];
  onOpenInventory: () => void;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wonPrizes,
  onOpenInventory,
  onHomeClick,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sounds.getMuted());
  }, []);

  const handleToggleSound = () => {
    const nextState = sounds.toggleMute();
    setIsMuted(nextState);
    if (!nextState) {
      sounds.playPop();
    }
  };

  const totalCash = wonPrizes
    .filter((p) => p.type === 'cash')
    .reduce((sum, p) => {
      const match = p.valueText.match(/\d+/);
      return sum + (match ? parseInt(match[0], 10) : 0);
    }, 0);

  const productCount = wonPrizes.filter((p) => p.type === 'product').length;

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Brand / Logo */}
        <button
          onClick={onHomeClick}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 text-base tracking-wide">
                FORTUNA
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                PLAY
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Juega y Gira la Ruleta</p>
          </div>
        </button>

        {/* Action Controls & Wallet */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-all active:scale-95"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Wallet / Prizes Button */}
          <button
            onClick={onOpenInventory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/40 text-emerald-300 shadow-sm active:scale-95 transition-all"
          >
            <div className="relative">
              <Wallet className="w-4 h-4 text-emerald-400" />
              {productCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {productCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-white tracking-tight">
              ${totalCash} <span className="text-[10px] text-emerald-400">MXN</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
