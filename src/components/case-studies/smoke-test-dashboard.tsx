"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Check, Zap } from "lucide-react";

interface Tile {
  label: string;
  system: string;
  value: string;
  status: "live" | "degraded";
}

const TILES: Tile[] = [
  { label: "Order intake", system: "Shopify → Odoo", value: "Verified", status: "live" },
  { label: "Manufacturing", system: "MO pipeline", value: "Verified", status: "live" },
  { label: "Shipping", system: "ShipStation", value: "Auto-validate restored", status: "live" },
  { label: "Tax calc", system: "Avalara", value: "US + CA", status: "live" },
  { label: "Payment portal", system: "Stripe", value: "Online", status: "live" },
  { label: "Purchase orders", system: "PO receive flow", value: "Verified", status: "live" },
  { label: "Invoicing", system: "Native Odoo", value: "Verified", status: "live" },
  { label: "Ramp sync", system: "Connector rebuild", value: "Deferred · ETA Oct 30", status: "degraded" },
];

export function SmokeTestDashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-foreground/[0.015]">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4">
            Monday · 9:57 AM · live
          </p>
          <h2 className="serif-display text-2xl md:text-4xl font-normal tracking-tight leading-[1.15] text-foreground">
            Smoke tests passed. System hot.
          </h2>
          <p className="mt-4 text-sm md:text-base text-text-secondary serif-prose leading-[1.65]">
            First five minutes on 17. Every Critical-tier path verified before the first real user
            order landed. Ramp stayed amber — disclosed, expected, pre-workarounded.
          </p>
          <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.18em] text-text-secondary/50">
            Illustrative reconstruction of the go-live verification grid.
          </p>
        </div>

        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl overflow-hidden border border-border shadow-2xl"
        >
          {/* Odoo-branded header */}
          <div className="flex items-center gap-3 px-5 py-2.5 bg-[#714B67]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium text-white/80">
              <span className="text-white">Dashboard</span>
              <span className="opacity-50">Sales</span>
              <span className="opacity-50">Inventory</span>
              <span className="opacity-50">Manufacturing</span>
              <span className="opacity-50">Accounting</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Odoo 17 · Production
            </div>
          </div>

          {/* Tile grid */}
          <div className="bg-[#f8f9fa] dark:bg-[#111316] p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-foreground">Go-live verification</h3>
              <span className="text-[11px] font-mono text-text-secondary">
                7 of 8 green · 1 disclosed amber
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TILES.map((tile, i) => {
                const isLive = tile.status === "live";
                return (
                  <motion.div
                    key={tile.label}
                    initial={reduced ? undefined : { opacity: 0, y: 12 }}
                    animate={inView ? { opacity: 1, y: 0 } : undefined}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className={`rounded-lg border p-3.5 ${
                      isLive
                        ? "border-green-500/30 bg-green-500/5 dark:bg-green-500/[0.04]"
                        : "border-yellow-500/40 bg-yellow-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[9px] font-mono uppercase tracking-[0.18em] ${
                          isLive
                            ? "text-green-700 dark:text-green-500"
                            : "text-yellow-700 dark:text-yellow-500"
                        }`}
                      >
                        {isLive ? "LIVE" : "DEFERRED"}
                      </span>
                      {isLive ? (
                        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500" />
                      )}
                    </div>
                    <div className="text-[13px] font-semibold text-foreground mb-0.5">
                      {tile.label}
                    </div>
                    <div className="text-[10px] text-text-secondary mb-2.5">{tile.system}</div>
                    <div
                      className={`text-[11px] font-mono ${
                        isLive ? "text-foreground/80" : "text-yellow-700 dark:text-yellow-500"
                      }`}
                    >
                      {tile.value}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between text-[11px] text-text-secondary">
              <span className="font-mono">Last checked: 09:57 MST · Mon Oct 21 2024</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono uppercase tracking-[0.15em]">Healthy</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
