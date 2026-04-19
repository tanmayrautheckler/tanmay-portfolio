"use client";

import { motion, useInView, useMotionValue, useReducedMotion, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SCOPE, SECONDARY_SCOPE, type ScopeStat } from "@/data/case-studies/odoo-17/scope";

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function Count({ value, formatted, inView }: { value: number; formatted?: string; inView: boolean }) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(formatted ?? formatNumber(value));
      return;
    }
    const controls = animate(mv, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (formatted) {
          // For pre-formatted (e.g. "~300K"), show formatted at end but approximate during
          const pct = v / value;
          if (pct < 0.98) setDisplay(formatNumber(Math.round(v)));
          else setDisplay(formatted);
        } else {
          setDisplay(formatNumber(Math.round(v)));
        }
      },
    });
    return () => controls.stop();
  }, [inView, value, formatted, mv, reduced]);

  return <>{display}</>;
}

function Cell({ stat, inView, index }: { stat: ScopeStat; inView: boolean; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const showTip = hovered || focused;
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay: 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-describedby={`scope-tip-${stat.key}`}
        className="w-full text-left py-10 md:py-14 px-6 md:px-8 border-t border-border/60 hover:border-foreground/30 focus:border-foreground/40 focus:outline-none transition-colors cursor-help"
      >
        <div className="serif-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground leading-none">
          {stat.formatted ? (
            <Count value={stat.value} formatted={stat.formatted} inView={inView} />
          ) : (
            <Count value={stat.value} inView={inView} />
          )}
          {stat.suffix ? <span className="text-text-secondary">{stat.suffix}</span> : null}
        </div>
        <div className="mt-4 text-xs md:text-sm font-mono uppercase tracking-[0.18em] text-text-secondary">
          {stat.label}
        </div>
      </button>

      {/* Tooltip */}
      <div
        id={`scope-tip-${stat.key}`}
        role="tooltip"
        className={`absolute left-4 right-4 md:left-8 md:right-8 bottom-4 md:bottom-6 z-10 transition-all duration-200 pointer-events-none ${
          showTip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        <div className="bg-foreground text-background px-4 py-3 rounded-md text-xs md:text-[13px] leading-relaxed shadow-lg max-w-md">
          {stat.tooltip}
        </div>
      </div>
    </motion.div>
  );
}

export function ScopeGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-16 md:mb-20"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4">
            Scope at a glance
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground">
            The environment I owned.
          </h2>
          <p className="mt-6 text-base md:text-lg text-text-secondary serif-prose">
            One Odoo instance running the entire company — manufacturing, finance, purchasing,
            sales, inventory, quality, CRM, shipping. ~{(SECONDARY_SCOPE.salesOrders / 1000).toFixed(0)}K
            lifetime sales orders, ~{(SECONDARY_SCOPE.manufacturingOrders / 1000).toFixed(0)}K
            manufacturing orders, ~{(SECONDARY_SCOPE.purchaseOrders / 1000).toFixed(0)}K purchase
            orders — the full historical ledger the upgrade had to carry forward intact.
          </p>
        </motion.div>

        {/* 3 × 2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-border/60">
          {SCOPE.map((stat, i) => (
            <Cell key={stat.key} stat={stat} inView={inView} index={i} />
          ))}
        </div>

        <p className="mt-6 text-[11px] font-mono text-text-secondary/50">
          Hover or focus any number for context.
        </p>
      </div>
    </section>
  );
}
