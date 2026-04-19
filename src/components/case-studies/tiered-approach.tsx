"use client";

import { motion, useInView, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { APPROACH, TIERS, SIGN_OFF } from "@/data/case-studies/odoo-17/content";

function PillarCard({ title, body, index, inView }: {
  title: string;
  body: string;
  index: number;
  inView: boolean;
}) {
  const [open, setOpen] = useState(index === 0);
  const reduced = useReducedMotion();

  return (
    <motion.button
      initial={reduced ? undefined : { opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className="w-full text-left border-t border-border/60 py-6 md:py-7 hover:border-foreground/25 transition-colors group"
    >
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-text-secondary w-6 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="serif-display flex-1 text-xl md:text-2xl tracking-tight text-foreground leading-tight">
          {title}
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-text-secondary transition-transform duration-300 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-4 md:mt-5 pl-10 text-base md:text-lg text-text-secondary serif-prose leading-[1.65]">
              {body}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

function TierColumn({
  label,
  blurb,
  items,
  tone,
  index,
  inView,
}: {
  label: string;
  blurb: string;
  items: readonly { label: string; owner?: string; shipped: boolean }[];
  tone: "critical" | "soon" | "deferred";
  index: number;
  inView: boolean;
}) {
  const reduced = useReducedMotion();
  const toneClasses = {
    critical: "border-foreground/30 bg-foreground/[0.02]",
    soon: "border-border",
    deferred: "border-yellow-500/40 bg-yellow-500/5",
  } as const;
  const dotClasses = {
    critical: "bg-foreground",
    soon: "bg-text-secondary",
    deferred: "bg-yellow-500",
  } as const;

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay: 0.1 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-lg border ${toneClasses[tone]} p-5 md:p-6`}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${dotClasses[tone]}`} />
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
          {label}
        </h3>
      </div>
      <p className="text-xs text-text-secondary serif-prose mb-5 leading-relaxed">{blurb}</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2 text-[13px]">
            <Check
              className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                item.shipped ? "text-green-600 dark:text-green-500" : "text-text-secondary/40"
              }`}
            />
            <div>
              <span className="text-foreground/90">{item.label}</span>
              {item.owner ? (
                <span className="text-text-secondary/70 text-[11px] ml-1">· {item.owner}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function TieredApproach() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">
        {/* Approach pillars */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4">
            Approach
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground">
            Scoped engagement, not a technical event.
          </h2>
          <p className="mt-5 text-base md:text-lg text-text-secondary serif-prose">
            Five strategic decisions shaped the project. Tap any to expand.
          </p>
        </div>

        <div className="mb-20 md:mb-28 border-b border-border/60">
          {APPROACH.map((pillar, i) => (
            <PillarCard
              key={pillar.title}
              title={pillar.title}
              body={pillar.body}
              index={i}
              inView={inView}
            />
          ))}
        </div>

        {/* Tiered framework */}
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4">
            Tiered go/no-go framework
          </p>
          <h3 className="serif-display text-2xl md:text-4xl font-normal tracking-tight text-foreground leading-[1.15]">
            Not &ldquo;everything must work Day 1.&rdquo; Three buckets, published before cutover.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <TierColumn
            label={TIERS.critical.label}
            blurb={TIERS.critical.blurb}
            items={TIERS.critical.items}
            tone="critical"
            index={0}
            inView={inView}
          />
          <TierColumn
            label={TIERS.oneWeek.label}
            blurb={TIERS.oneWeek.blurb}
            items={TIERS.oneWeek.items}
            tone="soon"
            index={1}
            inView={inView}
          />
          <TierColumn
            label={TIERS.moreThanWeek.label}
            blurb={TIERS.moreThanWeek.blurb}
            items={TIERS.moreThanWeek.items}
            tone="deferred"
            index={2}
            inView={inView}
          />
        </div>

        {/* Sign-off rail */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 md:mt-20 pt-8 border-t border-border/60"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-5">
            Go/no-go sign-off · Sun Oct 20, 2:00 PM AZT
          </p>
          <div className="flex flex-wrap gap-2">
            {SIGN_OFF.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-2 border border-border rounded-full px-3 py-1.5 bg-surface"
              >
                <Check className="w-3 h-3 text-green-600 dark:text-green-500" />
                <span className="text-[13px] font-medium text-foreground">{person.name}</span>
                <span className="text-[11px] text-text-secondary">{person.role}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-text-secondary/70 serif-prose">
            Shared accountability for the cutover, not my call alone.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
