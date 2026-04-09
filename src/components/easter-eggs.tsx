"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];

interface Confetto {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  velocityX: number;
  velocityY: number;
}

export function KonamiEasterEgg() {
  const [index, setIndex] = useState(0);
  const [activated, setActivated] = useState(false);
  const [confetti, setConfetti] = useState<Confetto[]>([]);

  const launchConfetti = useCallback(() => {
    const colors = ["#0EBBFF", "#a855f7", "#ec4899", "#22c55e", "#f59e0b", "#ef4444", "#ffffff"];
    const pieces: Confetto[] = [];
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: 4 + Math.random() * 8,
        velocityX: (Math.random() - 0.5) * 10,
        velocityY: 2 + Math.random() * 5,
      });
    }
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 4000);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === KONAMI[index]) {
        const next = index + 1;
        if (next === KONAMI.length) {
          setActivated(true);
          launchConfetti();
          setIndex(0);
          setTimeout(() => setActivated(false), 5000);
        } else {
          setIndex(next);
        }
      } else {
        setIndex(0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, launchConfetti]);

  return (
    <>
      {/* Confetti */}
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="fixed pointer-events-none z-[10000]"
          initial={{ x: c.x, y: c.y, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 100,
            x: c.x + c.velocityX * 60,
            rotate: c.rotation + 720,
            opacity: [1, 1, 1, 0],
          }}
          transition={{ duration: 3 + Math.random() * 2, ease: "easeIn" }}
          style={{
            width: c.size,
            height: c.size * 0.6,
            backgroundColor: c.color,
            borderRadius: 1,
          }}
        />
      ))}

      {/* Message */}
      <AnimatePresence>
        {activated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] bg-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl px-12 py-8 text-center shadow-[0_0_80px_rgba(14,187,255,0.4)]"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-5xl mb-4"
            >
              🎮
            </motion.div>
            <div className="text-cyan-400 font-bold text-xl mb-2">Achievement Unlocked!</div>
            <div className="text-gray-300 text-sm">You found the Konami Code</div>
            <div className="text-gray-600 text-[10px] mt-3 font-mono">↑↑↓↓←→←→BA</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
