"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ExternalLink } from "lucide-react";
import { OUTCOME_METRICS, OUTCOME_FOLLOWON, PLATFORM_CONTEXT, META } from "@/data/case-studies/odoo-17/content";

export function Outcome() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-28 md:py-40 bg-foreground text-background">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] font-mono uppercase tracking-[0.25em] text-background/60 mb-5"
        >
          Upgrade outcome
        </motion.p>
        <motion.h2
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="serif-display text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.05] max-w-4xl"
        >
          Cutover executed clean. Platform preserved.
        </motion.h2>

        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-base md:text-lg text-background/70 serif-prose max-w-2xl leading-[1.65]"
        >
          The measurable output of this upgrade is the event itself: a 65-hour frozen window on a
          production ERP, with nothing broken, nothing lost, and no stakeholder confidence dented.
        </motion.p>

        {/* 4-column metrics */}
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-background/10">
          {OUTCOME_METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={reduced ? undefined : { opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-foreground p-6 md:p-8"
            >
              <p className="serif-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none text-background">
                {metric.value}
              </p>
              <p className="mt-4 text-[11px] font-mono uppercase tracking-[0.2em] text-background/70">
                {metric.label}
              </p>
              <p className="mt-2 text-xs md:text-[13px] text-background/55 serif-prose leading-[1.55]">
                {metric.caption}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Follow-on facts */}
        <motion.ul
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 md:mt-20 space-y-4 max-w-3xl"
        >
          {OUTCOME_FOLLOWON.map((line, i) => (
            <li key={i} className="flex items-start gap-3 text-sm md:text-base text-background/80 serif-prose leading-[1.65]">
              <span className="w-1 h-1 mt-3 rounded-full bg-background/50 shrink-0" />
              {line}
            </li>
          ))}
        </motion.ul>

        {/* Platform context — published Odoo figures. Shown as context, not causation. */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 md:mt-28 pt-10 border-t border-background/15"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-background/60 mb-3">
            Platform context
          </p>
          <h3 className="serif-display text-xl md:text-3xl font-normal tracking-tight leading-[1.2] max-w-3xl">
            What the upgrade kept running.
          </h3>
          <p className="mt-4 text-sm md:text-base text-background/65 serif-prose leading-[1.65] max-w-3xl">
            These published figures predate this upgrade — they come from Heckler&apos;s earlier
            Xero-to-Odoo accounting migration (14 → 16, which I was not lead on). The 17 upgrade
            kept them intact by keeping the platform on a supported LTS version.
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-background/10">
            {PLATFORM_CONTEXT.map((m) => (
              <div key={m.label} className="bg-foreground p-5 md:p-6">
                <p className="serif-display text-2xl md:text-3xl tracking-tight leading-none text-background/90">
                  {m.value}
                </p>
                <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.2em] text-background/60">
                  {m.label}
                </p>
                <p className="mt-1.5 text-[11px] text-background/50 serif-prose leading-[1.55]">
                  {m.caption}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Source */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.9, delay: 0.95 }}
          className="mt-12 md:mt-14 pt-6 border-t border-background/10 flex items-start gap-3 text-xs font-mono uppercase tracking-[0.2em] text-background/55"
        >
          <ExternalLink className="w-3.5 h-3.5 mt-0.5" />
          <div>
            <p>Source for platform figures</p>
            <p className="mt-1.5 normal-case tracking-normal text-[12px] font-sans text-background/70">
              {META.publishedSourceStory}
              {META.publishedSourceUrl ? (
                <>
                  {" — "}
                  <a
                    href={META.publishedSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    read the story
                  </a>
                </>
              ) : null}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
