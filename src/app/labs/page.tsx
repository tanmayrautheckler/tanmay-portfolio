"use client";

import { motion } from "framer-motion";
import { FlaskConical, Zap, Terminal } from "lucide-react";
import { BackorderDemoCard } from "@/components/labs/demo-card";

export default function LabsPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono text-text-secondary uppercase tracking-widest">
              interactive demos
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="text-foreground">Labs</span>
          </h1>

          <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
            Real tools I&apos;ve built — running live in your browser. Sanitized data, full interactivity.
          </p>
        </motion.div>

        {/* Divider / terminal hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 flex items-center gap-3"
        >
          <Terminal className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-mono text-text-secondary/60">
            hover to preview · click to explore
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </motion.div>
      </section>

      {/* ── Demo grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Demo 1 — Backorder Dashboard */}
          <BackorderDemoCard />

          {/* Placeholder cards — more demos coming */}
          <ComingSoonCard
            index={1}
            title="Vendor Portal"
            subtitle="Supplier RMA + credit flow · Odoo 19"
            tags={["Odoo 19", "Portal", "RMA"]}
            icon="📦"
          />
          <ComingSoonCard
            index={2}
            title="MCP Cowork Agent"
            subtitle="Multi-agent orchestration · Claude API"
            tags={["Claude API", "MCP", "Agents"]}
            icon="🤖"
          />
        </div>
      </section>

      {/* ── Bottom note ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
          style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}
        >
          <Zap className="w-5 h-5 text-accent shrink-0" />
          <div>
            <div className="font-semibold text-sm mb-1">How these are built</div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Each demo started as a Claude Live Artifact — built during a real work session connected to production data via MCP. Sanitized and ported here so you can see the actual interaction model, not a mockup.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// ── Coming soon placeholder card ──────────────────────────────────────────────
function ComingSoonCard({
  index,
  title,
  subtitle,
  tags,
  icon,
}: {
  index: number;
  title: string;
  subtitle: string;
  tags: string[];
  icon: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative rounded-2xl border overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--surface-hover)", opacity: 0.55 }}
    >
      {/* Coming soon badge */}
      <div
        className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-mono font-bold"
        style={{ background: "var(--border)", color: "var(--text-secondary)" }}
      >
        COMING SOON
      </div>

      <div className="p-4 pb-2">
        {/* Placeholder metric strip */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {["—", "—", "—", "—"].map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-2.5 skeleton"
              style={{ height: 52, background: "#F4F1EA44" }}
            />
          ))}
        </div>
        {/* Placeholder bar */}
        <div className="rounded-lg p-3 mb-2.5 skeleton" style={{ height: 72, background: "#F4F1EA44" }} />
        <div className="rounded-lg p-3 skeleton" style={{ height: 64, background: "#F4F1EA44" }} />
      </div>

      <div className="px-4 pb-4 pt-1">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="font-semibold text-sm text-foreground mb-0.5">{title}</div>
        <div className="text-[11px] mb-2" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full font-mono"
              style={{ background: "var(--border)", color: "var(--text-secondary)" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
