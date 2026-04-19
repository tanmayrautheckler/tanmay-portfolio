"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { META } from "@/data/case-studies/odoo-17/content";

export function HeroCS() {
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto w-full">
        {/* Role / Date eyebrow */}
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] md:text-xs font-mono uppercase tracking-[0.25em] text-text-secondary mb-8 md:mb-12 flex items-center gap-3"
        >
          <span className="w-8 h-px bg-text-secondary/40" />
          Case Study 01 · ERP Cutover
          <span className="hidden md:inline w-8 h-px bg-text-secondary/40" />
          <span className="hidden md:inline opacity-60">{META.date}</span>
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={reduced ? undefined : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="serif-display text-[2.5rem] leading-[1.05] md:text-[4.25rem] md:leading-[1.02] lg:text-[5.5rem] lg:leading-[1] font-normal tracking-tight text-foreground"
        >
          {META.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 md:mt-8 text-lg md:text-2xl text-text-secondary serif-prose max-w-3xl"
        >
          {META.subtitle}
        </motion.p>

        {/* The single big number */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 md:mt-24 lg:mt-28 grid grid-cols-1 md:grid-cols-[auto_1fr] md:items-end gap-6 md:gap-10"
        >
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-3">
              Production freeze
            </p>
            <p className="serif-display text-6xl md:text-8xl lg:text-[9rem] font-normal tracking-tight text-foreground leading-none">
              65
              <span className="text-3xl md:text-4xl lg:text-5xl text-text-secondary ml-2">hours</span>
            </p>
          </div>
          <p className="text-sm md:text-base text-text-secondary serif-prose max-w-sm md:pb-4">
            Fri 4:00 PM to Mon 9:57 AM. Zero data loss, zero stakeholder re-work, zero rollback
            executed.
            <br />
            <span className="text-text-secondary/60">
              On a platform already publishing $250K+ in annual savings — kept running.
            </span>
          </p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.4 }}
          className="mt-16 md:mt-24 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary/60"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
