'use client';

import React from 'react';
import { MinigameId, MinigameMeta } from '../types/game';
import { Target, Layers, Sparkles, Play, Trophy, Clock, Zap, Gift, Type } from 'lucide-react';
import { sounds } from '../utils/sound';

interface MinigameSelectorProps {
  onSelectGame: (id: MinigameId) => void;
  onDirectRoulette: () => void;
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
    description: 'Frena el cursor justo en la zona dorada. ¡Acierta 3 veces consecutivas para desbloquear la ruleta!',
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

export const MinigameSelector: React.FC<MinigameSelectorProps> = ({
  onSelectGame,
  onDirectRoulette,
}) => {
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

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-5 shadow-2xl">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Premios Mayores en Efectivo + Productos</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
            Supera un Minijuego y{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200">
              Gira la Ruleta
            </span>
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed">
            Elige tu minijuego favorito. Al completarlo correctamente ganarás un giro en la ruleta con premios de{' '}
            <strong className="text-pink-400">Carrito de SHEIN</strong>,{' '}
            <strong className="text-emerald-400">$150, $200 y $300 MXN</strong> y productos sorpresa.
          </p>

          {/* Quick prize pills preview */}
          <div className="pt-1 flex flex-wrap gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40">
              🛍️ Carrito de SHEIN
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              👑 Hasta $300 MXN
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
              🎁 Productos
            </span>
          </div>
        </div>
      </div>

      {/* Minigames Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-200 tracking-wide uppercase flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Selecciona tu Desafío
          </h2>
          <span className="text-xs text-slate-400">4 Minijuegos disponibles</span>
        </div>

        <div className="grid gap-3.5">
          {MINIGAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => handleStart(game.id)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 p-4 transition-all duration-200 active:scale-[0.98] shadow-md"
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
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 uppercase tracking-wider text-[10px]">
                      {game.badge}
                    </span>
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
          ))}
        </div>
      </div>

      {/* Direct Sandbox Access (For testing/previewing the roulette anytime) */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center space-y-2">
        <p className="text-xs text-slate-400">
          ¿Quieres probar directamente cómo gira la ruleta y los premios sin jugar antes?
        </p>
        <button
          onClick={() => {
            sounds.playPop();
            onDirectRoulette();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95"
        >
          <Gift className="w-4 h-4" />
          Probar Ruleta Directamente
        </button>
      </div>
    </div>
  );
};
