"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SlackCard } from "@/components/case-studies/slack-card";
import { TIMELINE, FROZEN_WINDOW_HOURS, type TimelineMilestone } from "@/data/case-studies/odoo-17/timeline";

/** Parse "#general · 2024-10-18 15:50 MST" → { channel: "general", timestamp: "2024-10-18 15:50 MST" } */
function parseSource(source: string) {
  const match = source.match(/#([a-z0-9-]+)\s*·\s*(.+)/i);
  if (!match) return { channel: "general", timestamp: source };
  return { channel: match[1], timestamp: match[2] };
}

const tierStyle: Record<TimelineMilestone["tier"], { dot: string; label: string }> = {
  freeze: { dot: "bg-yellow-500", label: "Freeze" },
  test: { dot: "bg-blue-500", label: "Test" },
  decision: { dot: "bg-purple-500", label: "Decision" },
  live: { dot: "bg-green-600", label: "Live" },
  stabilize: { dot: "bg-text-secondary", label: "Stabilize" },
};

function Milestone({ m, i, total }: { m: TimelineMilestone; i: number; total: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const tier = tierStyle[m.tier];
  const isLast = i === total - 1;

  return (
    <motion.li
      ref={ref}
      initial={reduced ? undefined : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative pl-10 md:pl-14 pb-14 md:pb-20 last:pb-0"
    >
      {/* Vertical line segment (connects this dot to the next) */}
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute left-[11px] md:left-[15px] top-4 bottom-0 w-px bg-border"
        />
      ) : null}

      {/* Dot */}
      <span
        aria-hidden="true"
        className={`absolute left-[5px] md:left-[9px] top-2 w-3 h-3 rounded-full ring-4 ring-background ${tier.dot}`}
      />

      {/* Time + tier badge */}
      <div className="flex items-center gap-3 mb-2">
        <time className="text-[11px] md:text-xs font-mono uppercase tracking-[0.18em] text-foreground">
          {m.time}
        </time>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary px-2 py-0.5 rounded-full border border-border">
          {tier.label}
        </span>
      </div>

      {/* Title + detail */}
      <h3 className="serif-display text-xl md:text-3xl tracking-tight text-foreground leading-[1.2] mb-3">
        {m.title}
      </h3>
      <p className="serif-prose text-sm md:text-base text-text-secondary leading-[1.7] max-w-2xl">
        {m.detail}
      </p>

      {/* Slack card */}
      {m.quote ? (() => {
        const { channel, timestamp } = parseSource(m.quote.source);
        return (
          <div className="mt-6">
            <SlackCard
              author={m.quote.author}
              channel={channel}
              timestamp={timestamp}
              body={m.quote.text}
              me={m.quote.author === "Tanmay"}
            />
          </div>
        );
      })() : null}
    </motion.li>
  );
}

export function CutoverTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 30%"],
  });
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="px-6 md:px-12 lg:px-20 py-24 md:py-36 bg-foreground/[0.015]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-16 md:mb-24">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4">
            Cutover weekend
          </p>
          <h2 className="serif-display text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.05] text-foreground">
            <span className="text-foreground/40">65 hours</span> from freeze to live.
          </h2>
          <p className="mt-5 text-base md:text-lg text-text-secondary serif-prose">
            Friday 4 PM AZT to Monday 9:57 AM AZT. Every inflection point, every quote, pulled from
            the actual Slack record.
          </p>

          {/* Frozen window counter */}
          <div className="mt-10 flex items-baseline gap-4 border-t border-border/60 pt-6">
            <span className="serif-display text-5xl md:text-6xl tracking-tight text-foreground leading-none">
              {FROZEN_WINDOW_HOURS}
            </span>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground">
                hours production frozen
              </p>
              <p className="text-xs text-text-secondary serif-prose mt-0.5">
                No orders intake, no shipping, no invoicing.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div ref={containerRef} className="relative">
          {/* Scroll-driven progress line overlay */}
          {!reduced ? (
            <motion.span
              aria-hidden="true"
              style={{ height: progressHeight }}
              className="absolute left-[11px] md:left-[15px] top-0 w-px bg-foreground origin-top"
            />
          ) : null}

          <ol className="relative">
            {TIMELINE.map((m, i) => (
              <Milestone key={m.id} m={m} i={i} total={TIMELINE.length} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
