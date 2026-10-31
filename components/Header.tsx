'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/sound';

interface HeaderProps {
  wonPrizes?: unknown;
  onOpenInventory?: () => void;
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
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

  return (
    <header className="sticky top-0 z-30 w-full px-4 py-2.5 pointer-events-none">
      <div className="flex items-center justify-end max-w-md mx-auto pointer-events-auto">
        {/* Sound Toggle Button Only */}
        <button
          onClick={handleToggleSound}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          className="p-2.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/90 backdrop-blur-md shadow-lg transition-all active:scale-95"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>
      </div>
    </header>
  );
};
