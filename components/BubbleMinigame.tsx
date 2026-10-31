'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Zap, RotateCcw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface BubbleMinigameProps {
  onComplete: () => void;
  onBack: () => void;
  alreadyWon?: boolean;
}

interface Bubble {
  id: number;
  x: number; // percentage 10% - 85%
  y: number; // percentage 10% - 85%
  size: number; // in pixels (e.g. 55 to 75)
  type: 'normal' | 'gold' | 'time';
  color: string;
  points: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const BubbleMinigame: React.FC<BubbleMinigameProps> = ({
  onComplete,
  onBack,
  alreadyWon = false,
}) => {
  const [score, setScore] = useState(0);
  const targetScore = 20;
  const [timeLeft, setTimeLeft] = useState(20);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const bubbleIdRef = useRef(0);
  const textIdRef = useRef(0);

  // Spawn bubbles interval
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Initial batch of 5 bubbles
    const initial: Bubble[] = [];
    for (let i = 0; i < 5; i++) {
      initial.push(createRandomBubble());
    }
    setBubbles(initial);

    const spawnInterval = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length < 8) {
          return [...prev, createRandomBubble()];
        }
        return prev;
      });
    }, 700);

    return () => clearInterval(spawnInterval);
  }, [gameState]);

  // Timer interval
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      if (score >= targetScore) {
        handleWin();
      } else {
        setGameState('lost');
        sounds.playMiss();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, score]);

  function createRandomBubble(): Bubble {
    bubbleIdRef.current += 1;
    const rand = Math.random();

    let type: 'normal' | 'gold' | 'time' = 'normal';
    let color = 'from-cyan-400 to-blue-500 border-cyan-300';
    let points = 1;

    if (rand < 0.2) {
      type = 'gold';
      color = 'from-amber-300 to-yellow-500 border-yellow-200';
      points = 3;
    } else if (rand < 0.35) {
      type = 'time';
      color = 'from-emerald-400 to-teal-500 border-emerald-200';
      points = 0;
    }

    return {
      id: bubbleIdRef.current,
      x: 8 + Math.random() * 74,
      y: 10 + Math.random() * 72,
      size: type === 'gold' ? 58 : 64,
      type,
      color,
      points,
    };
  }

  const handlePop = (bubble: Bubble) => {
    if (gameState !== 'playing') return;

    sounds.playPop();

    // Remove popped bubble
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

    // Handle score / bonus
    let addText = `+${bubble.points}`;
    let textColor = 'text-cyan-300';

    if (bubble.type === 'gold') {
      textColor = 'text-amber-300';
      addText = '+3 👑';
    } else if (bubble.type === 'time') {
      setTimeLeft((t) => Math.min(t + 3, 30));
      textColor = 'text-emerald-300';
      addText = '+3s ⏱️';
    }

    const newScore = score + bubble.points;
    setScore(newScore);

    // Floating text indicator
    textIdRef.current += 1;
    const newTextId = textIdRef.current;
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: newTextId,
        text: addText,
        x: bubble.x,
        y: bubble.y,
        color: textColor,
      },
    ]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newTextId));
    }, 700);

    // Check Win condition
    if (newScore >= targetScore) {
      handleWin();
    }
  };

  const handleWin = () => {
    setGameState('won');
    sounds.playWin();
    if (!alreadyWon) {
      setTimeout(() => {
        onComplete();
      }, 1200);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setTimeLeft(20);
    setBubbles([]);
    setFloatingTexts([]);
    setGameState('playing');
  };

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
            timeLeft <= 5
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
              : 'bg-slate-900/80 border-slate-800 text-amber-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}s</span>
        </div>

        {/* Score Goal */}
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-cyan-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          <span>
            {score}/{targetScore} Puntos
          </span>
        </div>
      </div>

      {/* Intro info */}
      <div className="text-center space-y-0.5">
        <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Tapper Veloz
        </span>
        <h2 className="text-lg font-black text-white">¡Revienta las Burbujas!</h2>
        <p className="text-[11px] text-slate-400">
          Doradas = <strong className="text-amber-300">+3 pts</strong> • Verdes ={' '}
          <strong className="text-emerald-300">+3 seg</strong>
        </p>
      </div>

      {/* Main Touch Canvas Arena */}
      <div className="relative flex-1 min-h-[380px] w-full bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950/40 rounded-3xl border-2 border-slate-800 overflow-hidden shadow-inner select-none touch-none">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* Floating texts (+1, +3, etc.) */}
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            className={`absolute pointer-events-none font-black text-base drop-shadow-lg transition-transform duration-700 -translate-y-6 ${f.color}`}
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          >
            {f.text}
          </div>
        ))}

        {/* Bubbles */}
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={() => handlePop(b)}
            className={`absolute rounded-full bg-gradient-to-tr ${b.color} border-2 shadow-lg active:scale-75 transition-transform duration-75 flex items-center justify-center cursor-pointer select-none`}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              boxShadow:
                b.type === 'gold'
                  ? '0 0 16px rgba(245, 158, 11, 0.6)'
                  : b.type === 'time'
                  ? '0 0 16px rgba(16, 185, 129, 0.6)'
                  : '0 0 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            {b.type === 'gold' && <span className="text-base select-none">👑</span>}
            {b.type === 'time' && <span className="text-base select-none">⏱️</span>}
            {b.type === 'normal' && (
              <span className="w-2.5 h-2.5 rounded-full bg-white/60 absolute top-2 right-2.5" />
            )}
          </button>
        ))}
      </div>

      {/* Footer State */}
      <div className="pt-1">
        {gameState === 'won' ? (
          <div className="text-center py-3 space-y-2">
            <div className="text-emerald-400 font-black text-base flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5" />
              ¡META DE PUNTOS ALCANZADA!
            </div>
            {alreadyWon ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  ¡Gran velocidad! Ya habías reclamado el tiro de ruleta de este juego.
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
              ¡Te faltaron puntos! Sé más rápido en la siguiente.
            </div>
            <button
              onClick={handleRestart}
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reintentar Minijuego
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-[11px] text-slate-500 font-medium">
              Alcanza 20 puntos antes de que el reloj llegue a 0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
