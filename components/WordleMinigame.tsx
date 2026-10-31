'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Sparkles, Delete } from 'lucide-react';
import { sounds } from '../utils/sound';

interface WordleMinigameProps {
  onComplete: () => void;
  onBack: () => void;
}

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

// Secret word: ANNYELI (7 letters)
const SECRET_WORD = 'ANNYELI';
const WORD_LENGTH = 7;
const MAX_ATTEMPTS = 6;

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export const WordleMinigame: React.FC<WordleMinigameProps> = ({
  onComplete,
  onBack,
}) => {
  const [targetWord, setTargetWord] = useState(SECRET_WORD);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Initialize or restart game
  const startNewGame = useCallback(() => {
    setTargetWord(SECRET_WORD);
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setToastMessage(null);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 1800);
  };

  // Evaluate letters with proper duplicate handling
  const evaluateGuess = (guess: string, target: string): LetterStatus[] => {
    const result: LetterStatus[] = Array(WORD_LENGTH).fill('absent');
    const targetArr = target.split('');
    const guessArr = guess.split('');
    const letterCounts: { [key: string]: number } = {};

    // Count available letters in target
    for (const char of targetArr) {
      letterCounts[char] = (letterCounts[char] || 0) + 1;
    }

    // 1st pass: Exact matches (Green)
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = 'correct';
        letterCounts[guessArr[i]] -= 1;
      }
    }

    // 2nd pass: Present matches (Yellow)
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] !== 'correct') {
        const char = guessArr[i];
        if (letterCounts[char] && letterCounts[char] > 0) {
          result[i] = 'present';
          letterCounts[char] -= 1;
        }
      }
    }

    return result;
  };

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameState !== 'playing') return;

      const upper = key.toUpperCase();

      if (upper === 'BACKSPACE' || upper === 'DELETE' || upper === '⌫') {
        sounds.playFlip();
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (upper === 'ENTER') {
        if (currentGuess.length < WORD_LENGTH) {
          sounds.playMiss();
          setIsShaking(true);
          showToast(`Faltan letras (${WORD_LENGTH} requeridas)`);
          setTimeout(() => setIsShaking(false), 500);
          return;
        }

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);

        // Check Win
        if (currentGuess === targetWord) {
          setGameState('won');
          sounds.playWin();
          showToast('¡EXCELENTE! ¡ADIVINASTE! 🎉');
          setTimeout(() => {
            onComplete();
          }, 1500);
        } else if (newGuesses.length >= MAX_ATTEMPTS) {
          // Lost
          setGameState('lost');
          sounds.playMiss();
          showToast(`La palabra era: ${targetWord}`);
        } else {
          sounds.playHit();
        }

        setCurrentGuess('');
        return;
      }

      // Add letter
      if (/^[A-ZÑ]$/.test(upper)) {
        if (currentGuess.length < WORD_LENGTH) {
          sounds.playPop();
          setCurrentGuess((prev) => prev + upper);
        }
      }
    },
    [currentGuess, gameState, guesses, onComplete, targetWord]
  );

  // Listen to physical keyboard if available
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      handleKeyPress(e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyPress]);

  // Compute keyboard letter colors based on previous guesses
  const keyboardLetterStatus = React.useMemo(() => {
    const statuses: { [key: string]: LetterStatus } = {};

    guesses.forEach((guess) => {
      const evaluation = evaluateGuess(guess, targetWord);
      guess.split('').forEach((char, idx) => {
        const current = statuses[char];
        const status = evaluation[idx];

        if (status === 'correct') {
          statuses[char] = 'correct';
        } else if (status === 'present' && current !== 'correct') {
          statuses[char] = 'present';
        } else if (status === 'absent' && !current) {
          statuses[char] = 'absent';
        }
      });
    });

    return statuses;
  }, [guesses, targetWord]);

  return (
    <div className="flex flex-col min-h-[580px] justify-between p-3 max-w-md mx-auto space-y-3">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="text-center">
          <h2 className="text-base font-black text-white tracking-wide">
            Adivina la Palabra Secreta
          </h2>
          <span className="text-[10px] text-amber-300 font-bold">
            Intento {Math.min(guesses.length + 1, MAX_ATTEMPTS)} de {MAX_ATTEMPTS} • 7 Letras
          </span>
        </div>

        <button
          onClick={startNewGame}
          aria-label="Reiniciar"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Rules pill guide */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          🟩 Exacta
        </span>
        <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
          🟨 Otra posición
        </span>
        <span className="flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
          ⬛ Ausente
        </span>
      </div>

      {/* Toast Notification message */}
      <div className="h-6 flex items-center justify-center">
        {toastMessage && (
          <div className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-lg animate-bounce">
            {toastMessage}
          </div>
        )}
      </div>

      {/* Wordle Grid (6 rows x 7 tiles) */}
      <div className="flex flex-col items-center justify-center gap-1.5 py-1">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guess = guesses[rowIndex] || (isCurrentRow ? currentGuess : '');
          const isRowSubmitted = rowIndex < guesses.length;
          const evaluation = isRowSubmitted
            ? evaluateGuess(guess, targetWord)
            : Array(WORD_LENGTH).fill('empty');

          return (
            <div
              key={rowIndex}
              className={`flex gap-1 sm:gap-1.5 ${
                isCurrentRow && isShaking ? 'animate-shake' : ''
              }`}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const letter = guess[colIndex] || '';
                const status = evaluation[colIndex];

                let bgClass = 'bg-slate-900 border-slate-800 text-slate-300';
                if (isRowSubmitted) {
                  if (status === 'correct') {
                    bgClass =
                      'bg-emerald-600 border-emerald-500 text-white font-black shadow-md shadow-emerald-600/30';
                  } else if (status === 'present') {
                    bgClass =
                      'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/30';
                  } else {
                    bgClass = 'bg-slate-800 border-slate-700 text-slate-400';
                  }
                } else if (letter) {
                  bgClass =
                    'bg-slate-800/90 border-slate-600 text-white scale-105 font-black shadow-sm';
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-9 h-11 sm:w-10 sm:h-12 rounded-xl border-2 flex items-center justify-center text-base sm:text-lg font-black select-none uppercase transition-all duration-200 ${bgClass}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Status banner when won or lost */}
      {gameState === 'won' ? (
        <div className="text-center py-2 space-y-1">
          <div className="text-emerald-400 font-black text-sm flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            ¡ADIVINASTE EL NOMBRE!
          </div>
          <p className="text-xs text-amber-300 font-semibold animate-pulse">
            Desbloqueando la Ruleta de Premios...
          </p>
        </div>
      ) : gameState === 'lost' ? (
        <div className="text-center py-2 space-y-2">
          <p className="text-xs text-rose-400 font-bold">
            ¡Se agotaron los intentos! El nombre era:{' '}
            <strong className="text-amber-300 uppercase tracking-widest">
              {targetWord}
            </strong>
          </p>
          <button
            onClick={startNewGame}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Volver a Intentar
          </button>
        </div>
      ) : null}

      {/* On-screen Virtual Keyboard */}
      <div className="w-full flex flex-col gap-1.5 pt-1 select-none">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((k) => {
              const status = keyboardLetterStatus[k];
              const isActionKey = k === 'ENTER' || k === 'BACKSPACE';

              let keyColor =
                'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/80';
              if (status === 'correct') {
                keyColor = 'bg-emerald-600 text-white border-emerald-500 font-bold';
              } else if (status === 'present') {
                keyColor = 'bg-amber-500 text-slate-950 border-amber-400 font-black';
              } else if (status === 'absent') {
                keyColor =
                  'bg-slate-900 text-slate-600 border-slate-800 opacity-60';
              }

              return (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  className={`h-11 rounded-lg border font-bold text-xs flex items-center justify-center active:scale-95 transition-all select-none ${
                    isActionKey ? 'px-2.5 text-[10px] bg-slate-700/80 text-white' : 'flex-1 min-w-[28px]'
                  } ${keyColor}`}
                >
                  {k === 'BACKSPACE' ? (
                    <Delete className="w-4 h-4" />
                  ) : k === 'ENTER' ? (
                    'ENVIAR'
                  ) : (
                    k
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
