'use client';

import React from 'react';
import { WonPrize } from '../types/game';
import { X, Wallet, Package, Trophy, Sparkles, Check, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/sound';

interface PrizeInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  wonPrizes: WonPrize[];
  onClearPrizes: () => void;
}

export const PrizeInventoryModal: React.FC<PrizeInventoryModalProps> = ({
  isOpen,
  onClose,
  wonPrizes,
  onClearPrizes,
}) => {
  if (!isOpen) return null;

  const cashPrizes = wonPrizes.filter((p) => p.type === 'cash');
  const productPrizes = wonPrizes.filter((p) => p.type === 'product');

  const totalCash = cashPrizes.reduce((sum, p) => {
    const match = p.valueText.match(/\d+/);
    return sum + (match ? parseInt(match[0], 10) : 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Mis Premios</h3>
            <p className="text-[11px] text-slate-400">Tus recompensas acumuladas</p>
          </div>
        </div>

        {/* Cash Summary Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-4 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
              Efectivo Acumulado
            </span>
            <div className="text-2xl font-black text-white">
              ${totalCash}{' '}
              <span className="text-sm font-bold text-emerald-400">MXN</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {cashPrizes.length}{' '}
              {cashPrizes.length === 1 ? 'premio en efectivo' : 'premios en efectivo'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Prizes List Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px]">
          {wonPrizes.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Aún no has ganado premios.
              </p>
              <p className="text-[11px] text-slate-500">
                ¡Supera cualquiera de los 3 minijuegos para hacer girar la ruleta!
              </p>
            </div>
          ) : (
            wonPrizes.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-md"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.prizeId.includes('shein')
                      ? '🛍️'
                      : p.type === 'cash'
                      ? '💵'
                      : '🎁'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-snug">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span>De: {p.wonFromGame}</span>
                      <span>•</span>
                      <span>{p.date}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 shrink-0">
                  {p.valueText}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          {wonPrizes.length > 0 && (
            <button
              onClick={() => {
                sounds.playMiss();
                onClearPrizes();
              }}
              className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
            >
              Reiniciar Premios
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
