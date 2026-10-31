'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/sound';

interface MemoryMinigameProps {
  onComplete: () => void;
  onBack: () => void;
  alreadyWon?: boolean;
}

interface CardItem {
  uid: number;
  pairId: string;
  image: string;
  label: string;
}

const CARD_PAIRS = [
  { pairId: 'pair-1', image: '/cards/card-1.jpeg', label: 'Foto 1' },
  { pairId: 'pair-2', image: '/cards/card-2.jpeg', label: 'Gato Siamés' },
  { pairId: 'pair-3', image: '/cards/card-3.jpeg', label: 'Traviesos' },
  { pairId: 'pair-4', image: '/cards/card-4.jpeg', label: 'Patito Biker' },
  { pairId: 'pair-5', image: '/cards/card-5.jpeg', label: 'Selfie Divertida' },
  { pairId: 'pair-6', image: '/cards/card-6.jpeg', label: 'Gatito Colmillos' },
];

function generateShuffledCards(): CardItem[] {
  const cards: CardItem[] = [];
  CARD_PAIRS.forEach((item, index) => {
    // 2 cards for each pair
    cards.push({ uid: index * 2, ...item });
    cards.push({ uid: index * 2 + 1, ...item });
  });

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export const MemoryMinigame: React.FC<MemoryMinigameProps> = ({
  onComplete,
  onBack,
  alreadyWon = false,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]); // indexes
  const [matched, setMatched] = useState<number[]>([]); // matched indexes
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const lockBoardRef = useRef(false);

  // Initialize cards
  useEffect(() => {
    setCards(generateShuffledCards());
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      setGameState('lost');
      sounds.playMiss();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleCardClick = (index: number) => {
    if (
      lockBoardRef.current ||
      gameState !== 'playing' ||
      flipped.includes(index) ||
      matched.includes(index)
    ) {
      return;
    }

    sounds.playFlip();
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      lockBoardRef.current = true;

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH!
        sounds.playMatch();
        const newMatched = [...matched, firstIdx, secondIdx];
        setMatched(newMatched);
        setFlipped([]);
        lockBoardRef.current = false;

        // Check if all pairs are found
        if (newMatched.length === cards.length) {
          setGameState('won');
          sounds.playWin();
          if (!alreadyWon) {
            setTimeout(() => {
              onComplete();
            }, 1200);
          }
        }
      } else {
        // NO MATCH
        setTimeout(() => {
          setFlipped([]);
          lockBoardRef.current = false;
        }, 800);
      }
    }
  };

  const handleRestart = () => {
    setCards(generateShuffledCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimeLeft(45);
    setGameState('playing');
    lockBoardRef.current = false;
  };

  const matchedPairs = matched.length / 2;

  return (
    <div className="flex flex-col min-h-[580px] justify-between p-4 max-w-md mx-auto space-y-3">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
            timeLeft <= 10
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
              : 'bg-slate-900/80 border-slate-800 text-amber-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}s</span>
        </div>

        {/* Score & Matches */}
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{matchedPairs}/6 Pares</span>
        </div>
      </div>

      {/* Intro info */}
      <div className="text-center space-y-0.5">
        <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Memoria y Enfoque
        </span>
        <h2 className="text-lg font-black text-white">Busca las 6 Parejas de Fotos</h2>
        <p className="text-[11px] text-slate-400">
          Movimientos: <strong className="text-slate-200">{moves}</strong> • Destapa 2 fotos iguales
        </p>
      </div>

      {/* 4x3 Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 px-1 py-1">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index);
          const isMatched = matched.includes(index);
          const showFace = isFlipped || isMatched;

          return (
            <div
              key={card.uid}
              onClick={() => handleCardClick(index)}
              className="aspect-[3/4] cursor-pointer perspective-1000 select-none"
            >
              <div
                className={`w-full h-full rounded-2xl relative transition-all duration-300 transform-style-3d ${
                  showFace ? 'rotate-y-180' : 'hover:scale-[1.02]'
                } ${
                  isMatched
                    ? 'ring-2 ring-emerald-400/90 shadow-lg shadow-emerald-500/30'
                    : isFlipped
                    ? 'ring-2 ring-amber-400/90 shadow-lg shadow-amber-500/30'
                    : 'shadow-md'
                }`}
              >
                {/* Back of Card (Hidden Face) */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 border border-slate-700/80 flex flex-col items-center justify-center p-2 backface-hidden">
                  <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-inner">
                    <span className="text-amber-400 text-sm font-black">?</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                    Toca
                  </span>
                </div>

                {/* Front of Card (Revealed Photo) */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-amber-400/80 rotate-y-180 backface-hidden shadow-inner bg-slate-900 flex items-center justify-center">
                  <img
                    src={card.image}
                    alt={card.label}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    loading="eager"
                  />

                  {/* Matched Overlay with Checkmark */}
                  {isMatched && (
                    <div className="absolute inset-0 bg-emerald-950/40 border-2 border-emerald-400 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shadow-lg">
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Game State / Action */}
      <div className="pt-1">
        {gameState === 'won' ? (
          <div className="text-center py-3 space-y-2">
            <div className="text-emerald-400 font-black text-base flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5" />
              ¡TODAS LAS FOTOS ENCONTRADAS!
            </div>
            {alreadyWon ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  ¡Gran memoria! Ya habías reclamado el tiro de ruleta de este juego.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 active:scale-95 transition-all"
                  >
                    Jugar de Nuevo
                  </button>
                  <button
                    onClick={onBack}
                    className="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs active:scale-95 transition-all"
                  >
                    Volver al Menú
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-300 font-semibold animate-pulse">
                Desbloqueando la Ruleta de Premios...
              </p>
            )}
          </div>
        ) : gameState === 'lost' ? (
          <div className="space-y-2">
            <div className="text-center text-rose-400 font-bold text-xs">
              ¡Se agotó el tiempo! No te rindas, inténtalo de nuevo.
            </div>
            <button
              onClick={handleRestart}
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Volver a Intentar
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-[11px] text-slate-500 font-medium">
              Encuentra los 6 pares antes de que el reloj llegue a 0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
