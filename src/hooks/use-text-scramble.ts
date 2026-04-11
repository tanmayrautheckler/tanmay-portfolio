"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
const SCRAMBLE_TICK = 30; // ms between random char swaps
const REVEAL_TICK = 45; // ms per character lock-in
const PAUSE_DURATION = 3500; // ms to show completed word

interface ScrambleState {
  phase: "scrambling" | "revealing" | "paused";
  wordIndex: number;
  revealIndex: number;
  lastTick: number;
  lastReveal: number;
  pauseStart: number;
}

export function useTextScramble(words: string[]) {
  const [display, setDisplay] = useState(words[0]);
  const state = useRef<ScrambleState>({
    phase: "paused",
    wordIndex: 0,
    revealIndex: words[0].length,
    lastTick: 0,
    lastReveal: 0,
    pauseStart: 0,
  });
  const rafId = useRef<number>(0);

  const animate = useCallback((timestamp: number) => {
    const s = state.current;
    const targetWord = words[s.wordIndex];

    if (s.phase === "paused") {
      if (s.pauseStart === 0) s.pauseStart = timestamp;
      if (timestamp - s.pauseStart >= PAUSE_DURATION) {
        // Move to next word
        s.wordIndex = (s.wordIndex + 1) % words.length;
        s.phase = "scrambling";
        s.revealIndex = 0;
        s.lastTick = timestamp;
        s.lastReveal = timestamp;
        s.pauseStart = 0;
      }
    } else if (s.phase === "scrambling") {
      // Pure scramble for a brief moment before revealing
      if (timestamp - s.lastTick >= SCRAMBLE_TICK) {
        const word = words[s.wordIndex];
        let result = "";
        for (let i = 0; i < word.length; i++) {
          if (word[i] === " ") {
            result += " ";
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setDisplay(result);
        s.lastTick = timestamp;
      }
      // Start revealing after 300ms of pure scramble
      if (timestamp - s.lastReveal >= 300) {
        s.phase = "revealing";
        s.lastReveal = timestamp;
      }
    } else if (s.phase === "revealing") {
      const word = words[s.wordIndex];

      // Scramble unlocked chars
      if (timestamp - s.lastTick >= SCRAMBLE_TICK) {
        let result = "";
        for (let i = 0; i < word.length; i++) {
          if (i < s.revealIndex) {
            result += word[i]; // locked
          } else if (word[i] === " ") {
            result += " ";
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setDisplay(result);
        s.lastTick = timestamp;
      }

      // Lock next character
      if (timestamp - s.lastReveal >= REVEAL_TICK) {
        s.revealIndex++;
        s.lastReveal = timestamp;
        if (s.revealIndex >= word.length) {
          setDisplay(word);
          s.phase = "paused";
          s.pauseStart = timestamp;
        }
      }
    }

    rafId.current = requestAnimationFrame(animate);
  }, [words]);

  useEffect(() => {
    // Start with first word visible, begin cycling after initial pause
    state.current.pauseStart = performance.now();
    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  return { display, currentIndex: state.current.wordIndex, revealIndex: state.current.revealIndex, phase: state.current.phase };
}
