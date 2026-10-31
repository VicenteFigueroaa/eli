'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Target, Heart, RotateCcw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface HunterMinigameProps {
  onComplete: () => void;
  onBack: () => void;
}

export const HunterMinigame: React.FC<HunterMinigameProps> = ({
  onComplete,
  onBack,
}) => {
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [hits, setHits] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackColor, setFeedbackColor] = useState<string>('text-amber-400');

  // Animation refs
  const cursorRef = useRef<number>(0);
  const directionRef = useRef<number>(1);
  const speedRef = useRef<number>(1.2);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic visual cursor state for rendering
  const [cursorPos, setCursorPos] = useState<number>(0); // 0 to 100

  // Target zone boundaries (percentage)
  // Round 1: 35% to 65% (width 30%)
  // Round 2: 38% to 62% (width 24%)
  // Round 3: 42% to 58% (width 16%)
  const getTargetZone = useCallback(() => {
    if (hits === 0) return { min: 35, max: 65, perfectMin: 45, perfectMax: 55 };
    if (hits === 1) return { min: 38, max: 62, perfectMin: 46, perfectMax: 54 };
    return { min: 42, max: 58, perfectMin: 48, perfectMax: 52 };
  }, [hits]);

  const target = getTargetZone();

  // Reset or initialize loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    // Set speed based on hits
    speedRef.current = 1.2 + hits * 0.45;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 16.6;
      lastTime = currentTime;

      cursorRef.current += directionRef.current * speedRef.current * dt;

      if (cursorRef.current >= 100) {
        cursorRef.current = 100;
        directionRef.current = -1;
      } else if (cursorRef.current <= 0) {
        cursorRef.current = 0;
        directionRef.current = 1;
      }

      setCursorPos(cursorRef.current);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, hits]);

  // Handle Tap
  const handleTap = () => {
    if (gameState !== 'playing') return;

    const current = cursorRef.current;
    const isHit = current >= target.min && current <= target.max;
    const isPerfect = current >= target.perfectMin && current <= target.perfectMax;

    if (isHit) {
      const newHits = hits + 1;
      setHits(newHits);
      sounds.playHit();

      if (isPerfect) {
        setFeedback('¡PERFECTO! 🎯🎯🎯');
        setFeedbackColor('text-amber-300');
      } else {
        setFeedback('¡EN EL BLANCO! 🎯');
        setFeedbackColor('text-emerald-400');
      }

      if (newHits >= 3) {
        setGameState('won');
        sounds.playWin();
        setTimeout(() => {
          onComplete();
        }, 1200);
      }
    } else {
      sounds.playMiss();
      setFeedback('¡FALLASTE!');
      setFeedbackColor('text-rose-400');
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setGameState('lost');
      }
    }

    // Clear feedback text after 600ms
    setTimeout(() => {
      setFeedback(null);
    }, 600);
  };

  const handleRestart = () => {
    setHits(0);
    setLives(3);
    setFeedback(null);
    cursorRef.current = 0;
    directionRef.current = 1;
    setGameState('playing');
  };

  return (
    <div className="flex flex-col min-h-[580px] justify-between p-4 max-w-md mx-auto space-y-4">
      {/* Top Bar Navigation & Stats */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Lives (Hearts) */}
        <div className="flex items-center gap-1 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          {[1, 2, 3].map((heart) => (
            <Heart
              key={heart}
              className={`w-4 h-4 transition-colors ${
                heart <= lives
                  ? 'text-rose-500 fill-rose-500'
                  : 'text-slate-700 fill-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Hits Goal */}
        <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          <span>{hits}/3 Aciertos</span>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Ronda {hits + 1} de 3
          </span>
          <h2 className="text-xl font-black text-white">El Cazador del Momento</h2>
          <p className="text-xs text-slate-400">
            Toca la pantalla cuando la aguja esté dentro de la zona iluminada
          </p>
        </div>

        {/* Feedback pop-up */}
        <div className="h-7 flex items-center justify-center">
          {feedback && (
            <span
              className={`text-sm font-black tracking-wider animate-bounce ${feedbackColor}`}
            >
              {feedback}
            </span>
          )}
        </div>

        {/* Timing Meter Container */}
        <div className="w-full max-w-sm px-2">
          {/* Target Zone Info */}
          <div className="relative h-14 bg-slate-900 rounded-2xl border-2 border-slate-800 p-2 overflow-hidden shadow-inner flex items-center">
            {/* The Target Zone (Green/Golden area) */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500/40 via-amber-400/50 to-emerald-500/40 border-x-2 border-amber-400 flex items-center justify-center transition-all duration-300"
              style={{
                left: `${target.min}%`,
                width: `${target.max - target.min}%`,
              }}
            >
              <div className="text-[10px] font-black text-amber-300 tracking-wider">
                ZONA
              </div>
            </div>

            {/* Perfect center zone */}
            <div
              className="absolute top-0 bottom-0 bg-amber-400/40 border-x border-amber-300/80"
              style={{
                left: `${target.perfectMin}%`,
                width: `${target.perfectMax - target.perfectMin}%`,
              }}
            />

            {/* The Moving Needle / Cursor */}
            <div
              className="absolute top-1 bottom-1 w-2 rounded-full bg-white shadow-[0_0_15px_#ffffff] transition-none -translate-x-1/2 z-10"
              style={{
                left: `${cursorPos}%`,
              }}
            >
              <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white absolute -top-1 -left-1 shadow-md" />
              <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white absolute -bottom-1 -left-1 shadow-md" />
            </div>
          </div>

          {/* Meter Guides */}
          <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1 mt-1">
            <span>0%</span>
            <span className="text-amber-400">ZONA DE IMPACTO</span>
            <span>100%</span>
          </div>
        </div>

        {/* Progress Gems */}
        <div className="flex gap-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border transition-all duration-300 ${
                idx < hits
                  ? 'bg-amber-500 border-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
            >
              {idx < hits ? '✓' : idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Big Action Tap Area (Full responsive touch trigger) */}
      <div className="pt-2">
        {gameState === 'playing' ? (
          <button
            onClick={handleTap}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg tracking-wider uppercase shadow-xl shadow-amber-500/25 active:scale-95 transition-all animate-pulse-ring flex items-center justify-center gap-2"
          >
            <Target className="w-6 h-6 text-slate-950 fill-current" />
            ¡TOCAR AHORA!
          </button>
        ) : gameState === 'won' ? (
          <div className="text-center py-4 space-y-2">
            <div className="text-emerald-400 font-black text-lg flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              ¡DESAFÍO COMPLETADO!
            </div>
            <p className="text-xs text-amber-300 font-semibold animate-pulse">
              Desbloqueando la Ruleta de Premios...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center text-rose-400 font-bold text-sm">
              ¡Te quedaste sin vidas! Inténtalo de nuevo.
            </div>
            <button
              onClick={handleRestart}
              className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reintentar Minijuego
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
