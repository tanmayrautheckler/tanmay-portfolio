"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CinematicLoader() {
  const [phase, setPhase] = useState<"typing" | "reveal" | "done">("typing");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1800);
    const t2 = setTimeout(() => setPhase("done"), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          {/* Typing name */}
          <div className="text-center">
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-[-0.04em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.span
                className="gradient-text inline-block"
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                Tanmay Raut
              </motion.span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="mt-3"
            >
              <span className="text-accent text-xs font-mono tracking-[0.3em] uppercase">
                Systems Architect
              </span>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              className="mt-8 mx-auto h-[1px] bg-border overflow-hidden"
              style={{ width: 200 }}
            >
              <motion.div
                className="h-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.6, ease: "linear" }}
              />
            </motion.div>
          </div>

          {/* Curtain reveal */}
          {phase === "reveal" && (
            <>
              <motion.div
                className="absolute inset-0 bg-background origin-top"
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              />
            </>
          )}
        </motion.div>
    </AnimatePresence>
  );
}
