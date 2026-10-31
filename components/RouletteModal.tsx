'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Prize, WonPrize } from '../types/game';
import { PRIZES, getRandomPrize } from '../data/prizes';
import { sounds } from '../utils/sound';
import {
  Trophy,
  Sparkles,
  RotateCcw,
  Gift,
  X,
  CheckCircle,
  Coins,
  Package,
  ShoppingBag,
} from 'lucide-react';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrizeWon: (prize: WonPrize) => void;
  triggerGameTitle?: string;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  onClose,
  onPrizeWon,
  triggerGameTitle = 'Minijuego',
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0); // Current angle in degrees
  const animIdRef = useRef<number | null>(null);
  const lastSectorRef = useRef<number>(-1);

  const numSlices = PRIZES.length;
  const sliceAngle = 360 / numSlices; // 45 degrees for 8 slices

  // Draw the wheel onto the canvas
  const drawWheel = (currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 16;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((currentRotation * Math.PI) / 180);

    // 1. Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const prize = PRIZES[i];
      const startAngle = (i * sliceAngle * Math.PI) / 180;
      const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Wedge background color
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Border between slices
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // 2. Draw Text and Icons inside the slice
      ctx.save();
      const midAngle = startAngle + (sliceAngle * Math.PI) / 360;
      ctx.rotate(midAngle);

      // Icon / Label position
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Cash vs Product styling
      if (prize.id === 'shein-cart') {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('SHEIN', radius - 24, 0);

        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('CARRITO 🛍️', radius - 24, 15);
      } else if (prize.type === 'cash') {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(prize.valueText, radius - 24, 0);

        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('EFECTIVO', radius - 24, 16);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('PRODUCTO', radius - 24, 0);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('PREMIO 🎁', radius - 24, 14);
      }

      ctx.restore();
    }

    // 3. Draw Outer rim with Casino LED Lights
    ctx.restore(); // back to normal canvas orientation

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Golden inner/outer border
    ctx.beginPath();
    ctx.arc(center, center, radius + 5, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius - 5, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#FEF08A';
    ctx.stroke();

    // Draw 16 LED bulb pegs around rim
    const totalPegs = 16;
    for (let p = 0; p < totalPegs; p++) {
      const angle = (p * (360 / totalPegs) * Math.PI) / 180;
      const pegX = center + (radius + 1) * Math.cos(angle);
      const pegY = center + (radius + 1) * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(pegX, pegY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = p % 2 === 0 ? '#FEF08A' : '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 4. Center Golden Hub
    ctx.beginPath();
    ctx.arc(center, center, 32, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(center, center, 4, center, center, 32);
    grad.addColorStop(0, '#FEF08A');
    grad.addColorStop(0.6, '#F59E0B');
    grad.addColorStop(1, '#B45309');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Central star or dot
    ctx.beginPath();
    ctx.arc(center, center, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
  };

  // Re-draw initial state when opened
  useEffect(() => {
    if (isOpen) {
      setHasSpun(false);
      setWonPrize(null);
      setShowResultModal(false);
      // Wait for canvas to mount
      setTimeout(() => {
        drawWheel(rotationRef.current);
      }, 50);
    }
  }, [isOpen]);

  // Handle the physical spin
  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setWonPrize(null);

    // 1. Pick target prize based on weighted probability
    const targetPrize = getRandomPrize();
    const targetIndex = PRIZES.findIndex((p) => p.id === targetPrize.id);

    // 2. Compute target angle
    // Needle is at top (270 degrees in standard cartesian).
    // Center of target slice: (targetIndex * sliceAngle) + (sliceAngle / 2)
    // Small random jitter between -12 and +12 deg to look organic without crossing boundaries
    const jitter = (Math.random() - 0.5) * 24;
    const sliceCenter = targetIndex * sliceAngle + sliceAngle / 2 + jitter;

    // We want: (270 - finalAngle) % 360 == sliceCenter
    // finalAngle = 270 - sliceCenter
    let targetNormalized = (270 - sliceCenter) % 360;
    if (targetNormalized < 0) targetNormalized += 360;

    // Number of full spins (5 to 7 full rotations)
    const extraSpins = (5 + Math.floor(Math.random() * 2)) * 360;
    const currentRot = rotationRef.current;
    const baseRot = Math.ceil(currentRot / 360) * 360;
    const finalRotation = baseRot + extraSpins + targetNormalized;

    const startRot = currentRot;
    const totalDist = finalRotation - startRot;
    const duration = 5200; // 5.2 seconds
    const startTime = performance.now();

    // Ease out cubic function for smooth deceleration
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateSpin = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentAngle = startRot + totalDist * easedProgress;
      rotationRef.current = currentAngle;
      drawWheel(currentAngle);

      // Detect sector change to play tick sound
      const normalizedAngle = (270 - (currentAngle % 360) + 360) % 360;
      const sector = Math.floor(normalizedAngle / sliceAngle);
      if (sector !== lastSectorRef.current) {
        lastSectorRef.current = sector;
        sounds.playTick();
      }

      if (progress < 1) {
        animIdRef.current = requestAnimationFrame(animateSpin);
      } else {
        // Spin finished!
        setIsSpinning(false);
        setHasSpun(true);
        setWonPrize(targetPrize);

        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        sounds.playWin();

        // Show win modal after brief delay
        setTimeout(() => {
          setShowResultModal(true);
        }, 600);
      }
    };

    animIdRef.current = requestAnimationFrame(animateSpin);
  };

  const handleClaimPrize = () => {
    if (!wonPrize) return;

    const recordedPrize: WonPrize = {
      id: `${wonPrize.id}-${Date.now()}`,
      prizeId: wonPrize.id,
      name: wonPrize.name,
      type: wonPrize.type,
      valueText: wonPrize.valueText,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wonFromGame: triggerGameTitle,
      icon: wonPrize.icon,
      color: wonPrize.color,
    };

    onPrizeWon(recordedPrize);
    sounds.playHit();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col items-center space-y-4">
        {/* Close button (only when not spinning) */}
        {!isSpinning && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>Tiro de Recompensa</span>
          </div>
          <h2 className="text-xl font-black text-white">La Ruleta de Premios</h2>
          <p className="text-xs text-slate-400">
            ¡Ganaste tu turno por completar{' '}
            <strong className="text-slate-200">{triggerGameTitle}</strong>!
          </p>
        </div>

        {/* Wheel Display Container */}
        <div className="relative flex items-center justify-center my-2">
          {/* Top Indicator Arrow (Flapper Needle) */}
          <div className="absolute -top-3 z-20 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white -mt-5 shadow" />
          </div>

          {/* HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            width={310}
            height={310}
            className="rounded-full shadow-2xl filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Prize breakdown summary pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1 text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
            🛍️ Carrito SHEIN
          </span>
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <Coins className="w-3 h-3" /> $150, $200 y $300 MXN
          </span>
          <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
            <Package className="w-3 h-3" /> Productos
          </span>
        </div>

        {/* Spin Button */}
        <div className="w-full pt-1">
          <button
            onClick={handleSpin}
            disabled={isSpinning || hasSpun}
            className={`w-full py-4 rounded-2xl font-black text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
              isSpinning
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed animate-pulse'
                : hasSpun
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border border-amber-400 shadow-amber-500/30'
            }`}
          >
            {isSpinning ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin text-amber-400" />
                Girando la Ruleta...
              </>
            ) : hasSpun ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                ¡Premio Asignado!
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-current" />
                ¡GIRAR RULETA AHORA!
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Claim Modal Overlay */}
      {showResultModal && wonPrize && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-400/80 p-6 text-center space-y-5 shadow-2xl">
            {/* Crown / Sparkle badge */}
            <div className="w-16 h-16 rounded-2xl mx-auto bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-bounce">
              {wonPrize.id === 'shein-cart' ? (
                <ShoppingBag className="w-9 h-9 text-slate-950" />
              ) : wonPrize.type === 'cash' ? (
                <Coins className="w-9 h-9 text-slate-950" />
              ) : (
                <Gift className="w-9 h-9 text-slate-950" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {wonPrize.badgeText}
              </span>
              <h3 className="text-2xl font-black text-white pt-2">
                ¡FELICIDADES!
              </h3>
              <p className="text-xs text-slate-300">
                La ruleta se detuvo en:
              </p>
            </div>

            {/* Prize Highlight Box */}
            <div
              className="p-4 rounded-2xl border-2 text-center space-y-1.5 shadow-inner"
              style={{
                backgroundColor: `${wonPrize.color}18`,
                borderColor: wonPrize.color,
              }}
            >
              <div
                className="text-2xl font-black tracking-tight"
                style={{ color: wonPrize.color }}
              >
                {wonPrize.name}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed px-1">
                {wonPrize.description}
              </p>
            </div>

            {/* Claim Action */}
            <button
              onClick={handleClaimPrize}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-slate-950" />
              Guardar en Mis Premios
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
