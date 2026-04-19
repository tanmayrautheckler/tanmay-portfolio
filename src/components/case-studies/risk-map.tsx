"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { INTEGRATIONS, type Integration } from "@/data/case-studies/odoo-17/integrations";

const CENTER = { x: 400, y: 300 };
const RADIUS = 210;

// 6 nodes evenly spaced around the center, starting top and going clockwise
const nodePositions = INTEGRATIONS.map((_, i) => {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / INTEGRATIONS.length;
  return {
    x: CENTER.x + RADIUS * Math.cos(angle),
    y: CENTER.y + RADIUS * Math.sin(angle),
    angle,
  };
});

function labelAnchor(angle: number): { x: number; y: number; textAnchor: "start" | "middle" | "end" } {
  const cos = Math.cos(angle);
  const pad = 22;
  const x = CENTER.x + (RADIUS + pad) * Math.cos(angle);
  const y = CENTER.y + (RADIUS + pad) * Math.sin(angle);
  let textAnchor: "start" | "middle" | "end" = "middle";
  if (cos > 0.15) textAnchor = "start";
  else if (cos < -0.15) textAnchor = "end";
  return { x, y, textAnchor };
}

export function RiskMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState<Integration | null>(null);
  const reduced = useReducedMotion();

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-24 md:py-36 bg-surface-hover/40">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4">
            Risk surface
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground">
            Six production integrations, and three you couldn&apos;t test before going live.
          </h2>
          <p className="mt-5 text-base md:text-lg text-text-secondary serif-prose">
            Each connection below was a potential revenue outage. The amber-ringed nodes — Shopify,
            ShipStation, Ramp — had no sandbox environment on their 17-compatible connectors. Live
            production was the only place to validate them.
          </p>
        </div>

        {/* DESKTOP: SVG radial map */}
        <div className="hidden md:block">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-auto max-h-[540px]"
            role="img"
            aria-label="Integration risk map — 6 production integrations connected to a central Odoo core"
          >
            {/* Connection lines */}
            {nodePositions.map((pos, i) => {
              const integration = INTEGRATIONS[i];
              const isActive = active?.key === integration.key;
              return (
                <line
                  key={integration.key}
                  x1={CENTER.x}
                  y1={CENTER.y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={
                    integration.noSandbox
                      ? isActive ? "rgb(234,179,8)" : "rgba(234,179,8,0.45)"
                      : isActive ? "currentColor" : "rgba(115,115,115,0.3)"
                  }
                  strokeWidth={isActive ? 1.75 : 1}
                  strokeDasharray={integration.noSandbox ? "4,3" : "none"}
                  className={reduced ? "" : "cs-draw-line"}
                  style={
                    inView
                      ? { ["--dash-length" as string]: "400", animationDelay: `${0.2 + i * 0.08}s` }
                      : undefined
                  }
                />
              );
            })}

            {/* Central Odoo node */}
            <motion.g
              initial={reduced ? undefined : { scale: 0.7, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
            >
              <circle cx={CENTER.x} cy={CENTER.y} r={58} className="fill-foreground" />
              <text
                x={CENTER.x}
                y={CENTER.y - 4}
                textAnchor="middle"
                className="fill-background text-[16px] font-semibold"
              >
                Odoo
              </text>
              <text
                x={CENTER.x}
                y={CENTER.y + 16}
                textAnchor="middle"
                className="fill-background/70 text-[10px] font-mono uppercase tracking-[0.2em]"
              >
                core
              </text>
            </motion.g>

            {/* Perimeter nodes */}
            {nodePositions.map((pos, i) => {
              const integration = INTEGRATIONS[i];
              const label = labelAnchor(pos.angle);
              const isActive = active?.key === integration.key;
              return (
                <motion.g
                  key={integration.key}
                  initial={reduced ? undefined : { opacity: 0, scale: 0.6 }}
                  animate={inView ? { opacity: 1, scale: 1 } : undefined}
                  transition={{
                    duration: 0.6,
                    delay: 0.25 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                  onMouseEnter={() => setActive(integration)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(integration)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${integration.name} integration. ${integration.breaks}`}
                  className="cursor-pointer outline-none focus-visible:[&_circle]:stroke-foreground"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isActive ? 32 : 26}
                    className={`transition-[r] duration-200 ${
                      integration.noSandbox ? "fill-yellow-500/10" : "fill-background"
                    }`}
                    stroke={integration.noSandbox ? "rgb(234,179,8)" : "currentColor"}
                    strokeOpacity={isActive ? 1 : 0.55}
                    strokeWidth={integration.noSandbox ? 1.75 : 1.25}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    className="fill-foreground text-[11px] font-semibold pointer-events-none"
                  >
                    {integration.name.length > 10 ? integration.name.slice(0, 8) + "…" : integration.name}
                  </text>
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor={label.textAnchor}
                    className="fill-text-secondary text-[10px] font-mono uppercase tracking-[0.15em] pointer-events-none"
                  >
                    {integration.category}
                  </text>
                </motion.g>
              );
            })}
          </svg>

          {/* Detail panel */}
          <div className="mt-8 min-h-[120px]">
            {active ? (
              <motion.div
                initial={reduced ? undefined : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={active.key}
                className="max-w-2xl"
              >
                <div className="flex items-baseline gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{active.name}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-secondary">
                    {active.category}
                  </span>
                  {active.noSandbox ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.15em] text-yellow-600 dark:text-yellow-500">
                      <AlertTriangle className="w-3 h-3" />
                      No sandbox
                    </span>
                  ) : null}
                </div>
                <p className="text-sm md:text-base text-foreground/80 serif-prose">
                  <span className="text-text-secondary">If this broke: </span>
                  {active.breaks}
                </p>
              </motion.div>
            ) : (
              <p className="text-sm text-text-secondary/60 serif-prose">
                Hover or focus a node to see what would have broken if it failed mid-cutover.
              </p>
            )}
          </div>
        </div>

        {/* MOBILE: vertical list */}
        <ul className="md:hidden space-y-3">
          {INTEGRATIONS.map((integration) => (
            <li
              key={integration.key}
              className={`border rounded-lg p-4 ${
                integration.noSandbox
                  ? "border-yellow-500/40 bg-yellow-500/5"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <h3 className="font-semibold text-foreground text-sm">{integration.name}</h3>
                <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-text-secondary">
                  {integration.category}
                </span>
              </div>
              {integration.noSandbox ? (
                <div className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.15em] text-yellow-700 dark:text-yellow-500 mb-2">
                  <AlertTriangle className="w-3 h-3" />
                  No sandbox
                </div>
              ) : null}
              <p className="text-[13px] text-foreground/80 serif-prose">{integration.breaks}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
