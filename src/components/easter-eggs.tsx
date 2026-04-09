"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];

export function KonamiEasterEgg() {
  const [index, setIndex] = useState(0);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === KONAMI[index]) {
        const next = index + 1;
        if (next === KONAMI.length) {
          setActivated(true);
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
  }, [index]);

  return (
    <AnimatePresence>
      {activated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-8 py-5 text-center shadow-[0_0_40px_rgba(14,187,255,0.3)]"
        >
          <div className="text-3xl mb-2">🎮</div>
          <div className="text-cyan-400 font-mono text-sm font-bold">You found the secret!</div>
          <div className="text-gray-400 text-xs mt-1">Built with Next.js, Three.js, and too much chai ☕</div>
          <div className="text-gray-600 text-[10px] mt-2">↑↑↓↓←→←→BA</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══ LOGO CLICK ANIMATION ═══
export function LogoSparkle() {
  const [sparks, setSparks] = useState<number[]>([]);

  const handleClick = () => {
    const id = Date.now();
    setSparks(prev => [...prev, id]);
    setTimeout(() => setSparks(prev => prev.filter(s => s !== id)), 1500);
  };

  return (
    <span onClick={handleClick} className="cursor-pointer relative">
      <AnimatePresence>
        {sparks.map(id => (
          <motion.span
            key={id}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 rounded-full bg-cyan-400"
                style={{ left: "50%", top: "50%" }}
                initial={{ x: 0, y: 0, scale: 1 }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 25,
                  y: Math.sin((i / 6) * Math.PI * 2) * 25,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}
