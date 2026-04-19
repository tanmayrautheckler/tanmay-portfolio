"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { RAMP_GAP } from "@/data/case-studies/odoo-17/content";

export function RampGap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduced = useReducedMotion();

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-24 md:py-36">
      <div className="max-w-4xl mx-auto">
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] font-mono uppercase tracking-[0.25em] text-yellow-700 dark:text-yellow-500 mb-4"
        >
          {RAMP_GAP.label}
        </motion.p>
        <motion.h2
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground max-w-3xl"
        >
          {RAMP_GAP.headline}
        </motion.h2>

        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-base md:text-lg text-text-secondary serif-prose leading-[1.7] max-w-3xl"
        >
          {RAMP_GAP.body}
        </motion.p>

        {/* Gap bar visualization */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 md:mt-20"
        >
          {/* Date anchors */}
          <div className="flex justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-3">
            <span>Oct 18 · Freeze</span>
            <span>Oct 24</span>
            <span>Oct 30 · Backfill</span>
          </div>

          {/* Bar */}
          <div className="relative h-14 md:h-16 rounded-md overflow-hidden border border-yellow-500/30 bg-yellow-500/5">
            {/* Striped gap fill */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(234,179,8,0.12) 0px, rgba(234,179,8,0.12) 8px, transparent 8px, transparent 16px)",
              }}
            />

            {/* Animated gap-fill progression */}
            <motion.div
              initial={reduced ? { width: "100%" } : { width: 0 }}
              animate={inView ? { width: "100%" } : undefined}
              transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 left-0 border-r-2 border-yellow-600/60"
              style={{ background: "linear-gradient(90deg, rgba(234,179,8,0.18), rgba(234,179,8,0.3))" }}
            />

            {/* Backfill spike at the end */}
            <motion.div
              initial={reduced ? undefined : { opacity: 0, scaleY: 0.2 }}
              animate={inView ? { opacity: 1, scaleY: 1 } : undefined}
              transition={{ duration: 0.6, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 bottom-0 w-2 md:w-3 bg-yellow-500 origin-bottom"
            />

            {/* "12 days" center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-mono text-xs md:text-sm uppercase tracking-[0.18em] text-yellow-700 dark:text-yellow-500 bg-background/70 px-3 py-1 rounded">
                {RAMP_GAP.days} days · no Ramp sync
              </span>
            </div>
          </div>

          {/* Backfill callout */}
          <div className="mt-4 flex justify-end">
            <motion.div
              initial={reduced ? undefined : { opacity: 0, x: 6 }}
              animate={inView ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.6, delay: 2.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-right max-w-xs"
            >
              <p className="serif-display text-2xl md:text-3xl text-foreground leading-none">
                {RAMP_GAP.backfillTransactions}
              </p>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary mt-1">
                Transactions backfilled
              </p>
              <p className="text-xs text-text-secondary/70 serif-prose mt-1">
                Single batch · Oct 30 · zero reconciliation errors
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Reassurance */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 md:mt-16 border-l-2 border-yellow-500/40 pl-5 md:pl-6 max-w-3xl"
        >
          <p className="serif-prose text-base md:text-lg leading-[1.7] text-foreground/85">
            {RAMP_GAP.reassurance}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
