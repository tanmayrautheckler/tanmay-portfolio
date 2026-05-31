"use client";

/**
 * HeroProjectCard — sticky stacking cards with live animated UI demos.
 *
 * position:sticky + staggered top + z-index → KD-style card deck effect.
 * Right side: animated React mockups (no static screenshots).
 * Colors: soft muted darks — not pure black.
 */

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { VendorPortalDemo } from "./demos/vendor-portal-demo";
import { QCRMADemo } from "./demos/qc-rma-demo";

// ── Per-project config ─────────────────────────────────────────────────────────
interface CardConfig {
  bg: string;
  accent: string;
  highlight: string;
  headlinePlain: string;
  headlineColor: string;
  annotation: string;
  demoType: "vendor-portal" | "qc-rma" | "mcp-terminal";
  terminal?: string[];
}

const CONFIGS: Record<string, CardConfig> = {
  "vendor-management-portal": {
    bg: "#0e1625",
    accent: "#38bdf8",
    highlight: "#38bdf8",
    headlinePlain: "Replacing the",
    headlineColor: "8,441-Row Spreadsheet",
    annotation: "8 modules · 398 products · live in production",
    demoType: "vendor-portal",
  },
  "qc-vendor-rma": {
    bg: "#1c1108",
    accent: "#fb923c",
    highlight: "#fb923c",
    headlinePlain: "End-to-End",
    headlineColor: "Defect & RMA Workflow",
    annotation: "6 dispositions · auto credit notes · vendor portal",
    demoType: "qc-rma",
  },
  "ai-erp-connector": {
    bg: "#11091e",
    accent: "#a78bfa",
    highlight: "#a78bfa",
    headlinePlain: "Claude Talks",
    headlineColor: "Directly to the ERP",
    annotation: "Real-time Odoo queries · MCP · zero middleware",
    demoType: "mcp-terminal",
    terminal: [
      "$ mcp search_records product.product",
      '  filter: [["qty_available", ">", 0]]',
      "  ↳ 398 records · 12ms",
      "",
      "$ mcp aggregate sale.order",
      '  groupby: "date_order:month"',
      "  ↳ $2.4M total · 3 months",
      "",
      "$ mcp call_method account.move",
      '  method: "action_post"',
      "  ↳ invoice confirmed ✓",
    ],
  },
};

const FALLBACK: CardConfig = {
  bg: "#111827",
  accent: "#38bdf8",
  highlight: "#38bdf8",
  headlinePlain: "System",
  headlineColor: "Built for Production",
  annotation: "live project",
  demoType: "mcp-terminal",
};

// ── Main component ─────────────────────────────────────────────────────────────
export function HeroProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const cfg = CONFIGS[project.slug] ?? FALLBACK;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const demoY = useTransform(scrollYProgress, [0, 1], ["12px", "-24px"]);

  const stickyTop = 100 + index * 40;

  return (
    <div
      ref={ref}
      style={{ position: "sticky", top: stickyTop, zIndex: index + 1 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link href={`/projects/${project.slug}`} className="group block">
          <div
            style={{
              background: cfg.bg,
              borderRadius: 20,
              overflow: "hidden",
              minHeight: 460,
              boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.25)",
            }}
          >
            <div className="flex flex-col md:flex-row" style={{ minHeight: 460, alignItems: "stretch" }}>

              {/* ─── Left: text ─── */}
              <div className="flex flex-col justify-center px-10 py-12 md:px-14 md:py-14 md:w-[44%] md:flex-none">

                {/* Category chip + tech chips */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest"
                    style={{
                      background: `${cfg.accent}18`,
                      color: cfg.accent,
                      border: `1px solid ${cfg.accent}30`,
                    }}
                  >
                    {project.category}
                  </span>
                  {project.tech.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.32)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Headline */}
                <h3
                  className="font-bold leading-[1.05] tracking-tight mb-3"
                  style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.6rem)" }}
                >
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>{cfg.headlinePlain} </span>
                  <span style={{ color: cfg.highlight }}>{cfg.headlineColor}</span>
                </h3>

                {/* Annotation */}
                <p
                  className="text-[12px] font-mono mb-5"
                  style={{ color: `${cfg.accent}70`, fontStyle: "italic" }}
                >
                  ↗ {cfg.annotation}
                </p>

                {/* Description */}
                <p
                  className="text-[13px] leading-relaxed mb-7"
                  style={{ color: "rgba(255,255,255,0.35)", maxWidth: 320 }}
                >
                  {project.description.slice(0, 130)}…
                </p>

                {/* Impact bullets */}
                <ul className="space-y-2 mb-8">
                  {project.impact.slice(0, 2).map((imp, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5"
                      style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: cfg.accent,
                          marginTop: 5,
                          flexShrink: 0,
                        }}
                      />
                      {imp}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div
                  className="inline-flex items-center gap-2 text-[13px] font-semibold transition-all duration-200 group-hover:gap-3"
                  style={{ color: cfg.accent }}
                >
                  View case study <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* ─── Right: demo ─── */}
              <div
                className="relative flex-1 hidden md:flex items-center justify-center overflow-visible"
                style={{ paddingRight: 8 }}
              >
                <motion.div style={{ y: demoY }} className="w-full flex justify-center">
                  {cfg.demoType === "vendor-portal" && (
                    <VendorPortalDemo accent={cfg.accent} />
                  )}
                  {cfg.demoType === "qc-rma" && (
                    <QCRMADemo accent={cfg.accent} />
                  )}
                  {cfg.demoType === "mcp-terminal" && (
                    <TerminalDemo lines={cfg.terminal ?? []} accent={cfg.accent} />
                  )}
                </motion.div>
              </div>

            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

// ── MCP Terminal demo ──────────────────────────────────────────────────────────
function TerminalDemo({ lines, accent }: { lines: string[]; accent: string }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 400,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${accent}20`,
        transform: "rotate(-0.8deg)",
        background: "#0a0a12",
      }}
    >
      {/* Chrome */}
      <div
        style={{
          background: "#111118",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
          claude — mcp
        </span>
      </div>

      {/* Code lines */}
      <div style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.75 }}>
        {lines.map((line, i) => {
          const isCmd    = line.startsWith("$");
          const isResult = line.startsWith("  ↳");
          const isParam  = line.startsWith("  filter") || line.startsWith("  groupby") || line.startsWith("  method");
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              style={{
                color: isCmd ? accent : isResult ? "#73D277" : isParam ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.1)",
                minHeight: line === "" ? "0.8em" : undefined,
              }}
            >
              {line || " "}
            </motion.div>
          );
        })}
        <motion.span
          style={{ display: "inline-block", width: 7, height: 13, background: accent, verticalAlign: "middle" }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
