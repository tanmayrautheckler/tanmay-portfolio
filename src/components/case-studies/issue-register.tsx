"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

type Tier = "critical" | "1w" | "1w+";
type Status = "open" | "in-progress" | "resolved";

interface Issue {
  num: number;
  ts: string;
  reporter: string;
  owner: "Tanmay" | "Marshall" | "Niraj";
  title: string;
  tier: Tier;
  status: Status;
}

/**
 * Verified post-upgrade issues pulled from #odoo-17-upgrade Slack channel
 * (Oct 21–22, 2024). Every row below is real — timestamps and quotes trace
 * to individual Slack messages. Ramp item sourced from the markdown case study.
 */
const ISSUES: Issue[] = [
  {
    num: 1,
    ts: "Mon · 07:25",
    reporter: "Regina",
    owner: "Marshall",
    title: "MRP pop-up on 2 assembler accounts (Jim, Erick)",
    tier: "1w",
    status: "resolved",
  },
  {
    num: 2,
    ts: "Mon · 10:59",
    reporter: "Regina",
    owner: "Tanmay",
    title: "D58414 test order — cannot cancel, shipped by ShipStation",
    tier: "1w",
    status: "resolved",
  },
  {
    num: 3,
    ts: "Mon · 11:59",
    reporter: "Regina",
    owner: "Tanmay",
    title: "MO priority — 3-star option missing in 17",
    tier: "1w",
    status: "resolved",
  },
  {
    num: 4,
    ts: "Mon · 12:19",
    reporter: "Regina",
    owner: "Tanmay",
    title: "Kenny's iPad — no \"Produce All\" button in MO view",
    tier: "critical",
    status: "resolved",
  },
  {
    num: 5,
    ts: "Tue · 07:33",
    reporter: "Regina",
    owner: "Tanmay",
    title: "Remove delete action from delivery orders (operator safety)",
    tier: "1w",
    status: "resolved",
  },
  {
    num: 6,
    ts: "Tue · 14:34",
    reporter: "Regina",
    owner: "Tanmay",
    title: "S12314 — partial ship created backorder with duplicate tracking",
    tier: "critical",
    status: "resolved",
  },
  {
    num: 7,
    ts: "Week +",
    reporter: "Catalina",
    owner: "Niraj",
    title: "Ramp connector rebuild — backfill Oct 30",
    tier: "1w+",
    status: "resolved",
  },
];

const tierLabel: Record<Tier, { label: string; tone: string }> = {
  critical: { label: "CRITICAL", tone: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30" },
  "1w": { label: "≤ 1 WEEK", tone: "bg-foreground/[0.04] text-text-secondary border-border" },
  "1w+": { label: "> 1 WEEK", tone: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/30" },
};

const statusLabel: Record<Status, { label: string; dot: string }> = {
  open: { label: "OPEN", dot: "bg-red-500" },
  "in-progress": { label: "IN PROGRESS", dot: "bg-yellow-500" },
  resolved: { label: "RESOLVED", dot: "bg-green-500" },
};

export function IssueRegister() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  const resolvedCount = ISSUES.filter((i) => i.status === "resolved").length;
  const inProgressCount = ISSUES.filter((i) => i.status === "in-progress").length;

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-4">
            Stabilization week · Oct 21–25
          </p>
          <h2 className="serif-display text-2xl md:text-4xl font-normal tracking-tight leading-[1.15] text-foreground">
            The running issue register.
          </h2>
          <p className="mt-4 text-sm md:text-base text-text-secondary serif-prose leading-[1.65]">
            Sample of the first 48 hours of post-go-live issues from #odoo-17-upgrade. Each row is
            a real Slack message — reporter, time, and title verified against the channel record.
            Numbered, triaged against the tiered criteria, owner-assigned, closed. No Jira, no
            hand-wringing — just the channel and the register.
          </p>
        </div>

        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl overflow-hidden border border-border shadow-2xl bg-background"
        >
          {/* Top bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1c1c1e] border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-[11px] text-white/40 font-mono">
                #odoo-17-upgrade · Post-Go-Live Issue Register
              </span>
            </div>
            <span className="text-[10px] font-mono text-green-500">
              {resolvedCount}/{ISSUES.length} resolved
            </span>
          </div>

          {/* Table */}
          <div className="bg-surface">
            <div className="grid grid-cols-[40px_80px_1fr_100px_80px_100px] md:grid-cols-[48px_100px_1fr_120px_100px_120px] gap-2 md:gap-3 px-3 md:px-5 py-3 border-b border-border text-[10px] font-mono uppercase tracking-[0.15em] text-text-secondary">
              <span>#</span>
              <span>When</span>
              <span>Issue</span>
              <span className="hidden md:inline">Reporter</span>
              <span>Owner</span>
              <span>Status</span>
            </div>

            <ul>
              {ISSUES.map((issue, i) => (
                <motion.li
                  key={issue.num}
                  initial={reduced ? undefined : { opacity: 0, y: 6 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-[40px_80px_1fr_100px_80px_100px] md:grid-cols-[48px_100px_1fr_120px_100px_120px] gap-2 md:gap-3 px-3 md:px-5 py-3 border-b border-border/60 last:border-b-0 hover:bg-surface-hover/50 transition-colors items-center"
                >
                  <span className="text-[12px] font-mono text-text-secondary">
                    #{String(issue.num).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] font-mono text-text-secondary">{issue.ts}</span>
                  <div className="min-w-0">
                    <div className="text-[13px] text-foreground/90 truncate md:whitespace-normal">
                      {issue.title}
                    </div>
                    <span
                      className={`inline-block mt-1 text-[9px] font-mono uppercase tracking-[0.18em] px-1.5 py-[1px] rounded border ${tierLabel[issue.tier].tone}`}
                    >
                      {tierLabel[issue.tier].label}
                    </span>
                  </div>
                  <span className="hidden md:inline text-[12px] text-text-secondary">{issue.reporter}</span>
                  <span className="text-[12px] text-foreground/80 font-medium">{issue.owner}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.15em]">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusLabel[issue.status].dot}`} />
                    <span className="text-text-secondary">{statusLabel[issue.status].label}</span>
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Footer summary */}
            <div className="flex items-center justify-between px-3 md:px-5 py-3 border-t border-border bg-surface-hover/40 text-[11px] font-mono text-text-secondary">
              <span>
                <span className="text-green-600 dark:text-green-500">{resolvedCount}</span> resolved ·{" "}
                <span className="text-yellow-600 dark:text-yellow-500">{inProgressCount}</span> in progress
              </span>
              <span>Week of Oct 21, 2024</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
