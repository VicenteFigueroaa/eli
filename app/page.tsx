'use client';

import React, { useState, useEffect } from 'react';
import { MinigameId, WonPrize } from '../types/game';
import { Header } from '../components/Header';
import { MinigameSelector } from '../components/MinigameSelector';
import { HunterMinigame } from '../components/HunterMinigame';
import { MemoryMinigame } from '../components/MemoryMinigame';
import { BubbleMinigame } from '../components/BubbleMinigame';
import { WordleMinigame } from '../components/WordleMinigame';
import { RouletteModal } from '../components/RouletteModal';
import { PrizeInventoryModal } from '../components/PrizeInventoryModal';

export default function Home() {
  const [activeView, setActiveView] = useState<'selector' | MinigameId>('selector');
  const [wonPrizes, setWonPrizes] = useState<WonPrize[]>([]);
  const [wonGames, setWonGames] = useState<MinigameId[]>([]);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [lastGameTitle, setLastGameTitle] = useState('Minijuego');
  const [isClient, setIsClient] = useState(false);

  // Load saved prizes and won games from localStorage safely on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedPrizes = localStorage.getItem('fortuna_won_prizes');
      if (savedPrizes) {
        setWonPrizes(JSON.parse(savedPrizes));
      }
      const savedGames = localStorage.getItem('fortuna_won_games');
      if (savedGames) {
        setWonGames(JSON.parse(savedGames));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const savePrizes = (updated: WonPrize[]) => {
    setWonPrizes(updated);
    try {
      localStorage.setItem('fortuna_won_prizes', JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
  };

  const saveWonGames = (updated: MinigameId[]) => {
    setWonGames(updated);
    try {
      localStorage.setItem('fortuna_won_games', JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
  };

  const handleSelectGame = (id: MinigameId) => {
    setActiveView(id);
  };

  // Called when a minigame is completed
  const handleGameComplete = (gameId: MinigameId, gameName: string) => {
    setLastGameTitle(gameName);

    // If game has NOT been won yet -> Record win and open roulette!
    if (!wonGames.includes(gameId)) {
      const updated = [...wonGames, gameId];
      saveWonGames(updated);
      setIsRouletteOpen(true);
    }
    // If it was already won, minigame handles congratulating without triggering roulette.
  };

  const handlePrizeWon = (prize: WonPrize) => {
    const updated = [prize, ...wonPrizes];
    savePrizes(updated);
  };

  const handleClearPrizes = () => {
    savePrizes([]);
  };

  const handleResetProgress = () => {
    saveWonGames([]);
  };

  const handleBackToHome = () => {
    setActiveView('selector');
  };

  const handleDirectRoulette = () => {
    setLastGameTitle('Tiro Especial Directo');
    setIsRouletteOpen(true);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Sound button only header */}
      <Header />

      {/* Main Mobile App Frame Viewport */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-1 pb-8 flex flex-col">
        {activeView === 'selector' && (
          <MinigameSelector
            onSelectGame={handleSelectGame}
            onDirectRoulette={handleDirectRoulette}
            wonGames={wonGames}
            onResetProgress={handleResetProgress}
          />
        )}

        {activeView === 'hunter' && (
          <HunterMinigame
            alreadyWon={wonGames.includes('hunter')}
            onComplete={() => handleGameComplete('hunter', 'El Cazador del Momento')}
            onBack={handleBackToHome}
          />
        )}

        {activeView === 'memory' && (
          <MemoryMinigame
            alreadyWon={wonGames.includes('memory')}
            onComplete={() => handleGameComplete('memory', 'Busca-Parejas')}
            onBack={handleBackToHome}
          />
        )}

        {activeView === 'bubbles' && (
          <BubbleMinigame
            alreadyWon={wonGames.includes('bubbles')}
            onComplete={() => handleGameComplete('bubbles', 'Rompe-Burbujas')}
            onBack={handleBackToHome}
          />
        )}

        {activeView === 'wordle' && (
          <WordleMinigame
            alreadyWon={wonGames.includes('wordle')}
            onComplete={() => handleGameComplete('wordle', 'Adivina la Palabra (Wordle)')}
            onBack={handleBackToHome}
          />
        )}
      </main>

      {/* Roulette Modal Overlay */}
      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => {
          setIsRouletteOpen(false);
          setActiveView('selector');
        }}
        onPrizeWon={handlePrizeWon}
        triggerGameTitle={lastGameTitle}
      />

      {/* Prize Inventory / Wallet Modal */}
      <PrizeInventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        wonPrizes={wonPrizes}
        onClearPrizes={handleClearPrizes}
      />
    </div>
  );
}
