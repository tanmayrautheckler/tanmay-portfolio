"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Zap } from "lucide-react";
import dynamic from "next/dynamic";

const BackorderDashboard = dynamic(
  () => import("./backorder-dashboard").then((m) => ({ default: m.BackorderDashboard })),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9B9891", fontSize: 13 }}>
        Loading dashboard…
      </div>
    ),
  }
);

interface DemoMeta {
  title: string;
  subtitle: string;
  tags: string[];
  stats: { label: string; value: string; color: string }[];
  statusBars: { label: string; pct: number; color: string }[];
}

const BACKORDER_META: DemoMeta = {
  title: "Backorder Dashboard",
  subtitle: "Customer order fulfillment status · Odoo 17 live artifact",
  tags: ["Odoo 17", "Live Artifact", "MCP", "Chart.js", "Heckler Design"],
  stats: [
    { label: "Open SOs", value: "25", color: "#2F3234" },
    { label: "Total Value", value: "$321K", color: "#0EBBFF" },
    { label: "Overdue", value: "7", color: "#F66F51" },
    { label: "Ready", value: "8", color: "#73D277" },
  ],
  statusBars: [
    { label: "Ready",     pct: 24, color: "#73D277" },
    { label: "Waiting",   pct: 36, color: "#EFC761" },
    { label: "Wait (op)", pct: 28, color: "#F66F51" },
    { label: "WTS",       pct: 12, color: "#2F3234" },
  ],
};

// ── Main export ───────────────────────────────────────────────────────────────
export function BackorderDemoCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DemoCardPreview meta={BACKORDER_META} onOpen={() => setOpen(true)} />

      <AnimatePresence>
        {open && (
          <motion.div
            key="demo-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          >
            <div
              className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ background: "#2F3234", borderBottom: "1px solid #444" }}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4" style={{ color: "#0EBBFF" }} />
                <span style={{ color: "#FDFCF8", fontWeight: 600, fontSize: 14 }}>
                  Backorder Dashboard
                </span>
                <span style={{ color: "#9B9891", fontSize: 11 }}>
                  · Interactive demo · Sanitized data
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: "#9B9891" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto" style={{ background: "#FDFCF8" }}>
              <BackorderDashboard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Animated preview card ─────────────────────────────────────────────────────
function DemoCardPreview({ meta, onOpen }: { meta: DemoMeta; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const inflow = [44, 52, 38, 61, 46, 65, 51, 38];
  const shipped = [42, 50, 55, 41, 49, 44, 62, 25];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border cursor-pointer overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      {/* Accent glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ boxShadow: "inset 0 0 50px rgba(14,187,255,0.07)" }}
      />

      {/* LIVE badge */}
      <div
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono font-bold"
        style={{ background: "#73D277", color: "#1a1a1a" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        LIVE DEMO
      </div>

      <div className="p-4 pb-2">
        {/* Metric strip */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {meta.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg p-2.5"
              style={{ background: "#F4F1EA", border: "1px solid #E5E1D8" }}
            >
              <div style={{ fontSize: 9, color: "#9B9891", marginBottom: 2, fontFamily: "monospace" }}>
                {s.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div
          className="rounded-lg p-3 mb-2.5"
          style={{ background: "#F4F1EA", border: "1px solid #E5E1D8" }}
        >
          <div style={{ fontSize: 9, color: "#9B9891", fontFamily: "monospace", marginBottom: 8 }}>
            STATUS BREAKDOWN
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-2.5">
            {meta.statusBars.map((b, idx) => (
              <motion.div
                key={b.label}
                style={{ background: b.color, height: "100%" }}
                initial={{ width: 0 }}
                animate={{ width: hovered ? `${b.pct}%` : "0%" }}
                transition={{ duration: 0.55, delay: idx * 0.07, ease: [0.25, 1, 0.5, 1] }}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {meta.statusBars.map((b) => (
              <div key={b.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: b.color }} />
                <span style={{ fontSize: 9, color: "#6B6762" }}>
                  {b.label} {b.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini bar chart */}
        <div
          className="rounded-lg p-3"
          style={{ background: "#F4F1EA", border: "1px solid #E5E1D8" }}
        >
          <div style={{ fontSize: 9, color: "#9B9891", fontFamily: "monospace", marginBottom: 8 }}>
            GP FLOW — INFLOW vs SHIPPED (8 weeks)
          </div>
          <div className="flex items-end gap-1" style={{ height: 36 }}>
            {inflow.map((v, i) => (
              <div key={i} className="flex gap-0.5 items-end flex-1">
                <motion.div
                  style={{ background: "#0EBBFF99", borderRadius: "2px 2px 0 0", flexShrink: 0, flex: 1 }}
                  initial={{ height: 0 }}
                  animate={{ height: hovered ? `${(v / 65) * 34}px` : "0px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                />
                <motion.div
                  style={{ background: "#73D27799", borderRadius: "2px 2px 0 0", flexShrink: 0, flex: 1 }}
                  initial={{ height: 0 }}
                  animate={{ height: hovered ? `${(shipped[i] / 65) * 34}px` : "0px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 + 0.04 }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-1.5">
            {[{ c: "#0EBBFF", l: "Inflow GP" }, { c: "#73D277", l: "Shipped GP" }].map((x) => (
              <div key={x.l} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: x.c }} />
                <span style={{ fontSize: 9, color: "#6B6762" }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-1">
        <div className="mb-2">
          <div className="font-semibold text-sm text-foreground mb-0.5">{meta.title}</div>
          <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            {meta.subtitle}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {meta.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full font-mono"
              style={{ background: "var(--accent)", color: "#000", opacity: 0.85 }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Sort · filter · expand rows · export CSV
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent)" }}>
            Launch demo <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Click overlay hint */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
          style={{ background: "#0EBBFF", color: "#000" }}
        >
          Click to explore →
        </div>
      </motion.div>
    </motion.div>
  );
}
