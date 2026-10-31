'use client';

import React, { useState } from 'react';
import { MinigameId, MinigameMeta } from '../types/game';
import {
  Target,
  Layers,
  Sparkles,
  Play,
  Clock,
  Zap,
  Type,
  CheckCircle2,
  KeyRound,
  X,
  Delete,
  Lock,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface MinigameSelectorProps {
  onSelectGame: (id: MinigameId) => void;
  onDirectRoulette: () => void;
  wonGames?: MinigameId[];
  onResetProgress?: () => void;
}

const MINIGAMES: MinigameMeta[] = [
  {
    id: 'hunter',
    title: 'El Cazador del Momento',
    subtitle: 'Timing y Reflejos',
    badge: 'REFLEJOS',
    icon: 'target',
    color: 'from-amber-500 to-orange-600',
    difficulty: 'Fácil',
    estimatedTime: '30s',
    description: 'Frena el cursor justo en la zona dorada. ¡Acierta 3 veces para ganar tu tiro de ruleta!',
  },
  {
    id: 'memory',
    title: 'Busca-Parejas',
    subtitle: 'Memoria Exprés',
    badge: 'MEMORIA',
    icon: 'layers',
    color: 'from-purple-500 to-indigo-600',
    difficulty: 'Medio',
    estimatedTime: '45s',
    description: 'Encuentra las 6 parejas de fotos antes de que se acabe el tiempo. ¡Concentración total!',
  },
  {
    id: 'bubbles',
    title: 'Rompe-Burbujas',
    subtitle: 'Tapper Veloz',
    badge: 'VELOCIDAD',
    icon: 'sparkles',
    color: 'from-cyan-500 to-blue-600',
    difficulty: 'Rápido',
    estimatedTime: '20s',
    description: 'Burbujas flotantes en la pantalla. ¡Revienta suficientes burbujas para alcanzar los 20 puntos!',
  },
  {
    id: 'wordle',
    title: 'Adivina la Palabra',
    subtitle: 'Modo Wordle',
    badge: 'INGENIO',
    icon: 'type',
    color: 'from-emerald-500 to-teal-600',
    difficulty: 'Ingenio',
    estimatedTime: '1-2m',
    description: 'Adivina la palabra secreta de 7 letras en 6 intentos con pistas de colores verde, amarillo y gris.',
  },
];

// Valid secret PINs to trigger extra roulette spins
const VALID_PINS = ['1234', '2026', '7777'];

export const MinigameSelector: React.FC<MinigameSelectorProps> = ({
  onSelectGame,
  onDirectRoulette,
  wonGames = [],
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'target':
        return <Target className="w-6 h-6 text-white" />;
      case 'layers':
        return <Layers className="w-6 h-6 text-white" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6 text-white" />;
      case 'type':
        return <Type className="w-6 h-6 text-white" />;
      default:
        return <Zap className="w-6 h-6 text-white" />;
    }
  };

  const handleStart = (id: MinigameId) => {
    sounds.playHit();
    onSelectGame(id);
  };

  const handleKeypadPress = (val: string) => {
    sounds.playPop();

    if (val === 'C') {
      setPin('');
      setPinError(false);
      return;
    }

    if (val === '⌫') {
      setPin((prev) => prev.slice(0, -1));
      setPinError(false);
      return;
    }

    if (pin.length < 4) {
      const nextPin = pin + val;
      setPin(nextPin);

      // When 4th digit is entered, validate immediately!
      if (nextPin.length === 4) {
        if (VALID_PINS.includes(nextPin)) {
          sounds.playWin();
          setShowPinModal(false);
          setPin('');
          setPinError(false);
          // Unlock roulette!
          setTimeout(() => {
            onDirectRoulette();
          }, 300);
        } else {
          sounds.playMiss();
          setPinError(true);
          setTimeout(() => {
            setPin('');
            setPinError(false);
          }, 600);
        }
      }
    }
  };

  return (
    <div className="space-y-4 pb-12 pt-1">
      {/* Title Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black text-slate-100 tracking-wide uppercase flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Selecciona tu juego:
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          {wonGames.length}/4 Ruletas ganadas
        </span>
      </div>

      {/* Minigames Grid Cards */}
      <div className="grid gap-3.5">
        {MINIGAMES.map((game) => {
          const isCompleted = wonGames.includes(game.id);

          return (
            <div
              key={game.id}
              onClick={() => handleStart(game.id)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98] shadow-md ${
                isCompleted
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon box */}
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}
                >
                  {getIcon(game.icon)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 uppercase tracking-wider text-[10px]">
                      {game.badge}
                    </span>

                    {isCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Ruleta Reclamada
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        🎡 Da 1 tiro
                      </span>
                    )}

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {game.estimatedTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {game.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Action arrow */}
                <div className="self-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-amber-500 text-slate-400 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret Cheat Code PIN Trigger (Discreet footer button) */}
      <div className="pt-2 flex flex-col items-center justify-center text-center">
        <button
          onClick={() => {
            sounds.playFlip();
            setPin('');
            setPinError(false);
            setShowPinModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-500 hover:text-amber-400 text-[11px] font-bold hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all active:scale-95"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Ingresar PIN secreto</span>
        </button>
      </div>

      {/* Secret PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xs rounded-3xl bg-slate-900 border-2 border-amber-500/40 p-5 shadow-2xl flex flex-col items-center space-y-4">
            {/* Close Button */}
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">
                Desbloqueo Secreto
              </h3>
              <p className="text-xs text-slate-400">
                Ingresa el PIN de 4 dígitos para obtener un tiro extra en la ruleta
              </p>
            </div>

            {/* PIN Dots (4 indicators) */}
            <div
              className={`flex items-center justify-center gap-3 py-1 transition-all ${
                pinError ? 'animate-shake' : ''
              }`}
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = idx < pin.length;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      pinError
                        ? 'border-rose-500 bg-rose-500/40 scale-110'
                        : isFilled
                        ? 'border-amber-400 bg-amber-400 shadow-md shadow-amber-400/50 scale-110'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-[11px] font-bold text-rose-400 -mt-1 animate-pulse">
                PIN incorrecto, intenta de nuevo
              </p>
            )}

            {/* Numeric Keypad (3x4) */}
            <div className="grid grid-cols-3 gap-2 w-full pt-1 select-none">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(
                (btn) => (
                  <button
                    key={btn}
                    onClick={() => handleKeypadPress(btn)}
                    className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-black text-base border border-slate-700/60 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {btn === '⌫' ? (
                      <Delete className="w-5 h-5 text-slate-300" />
                    ) : (
                      btn
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
