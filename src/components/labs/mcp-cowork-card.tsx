"use client";

/**
 * MCP Cowork Agent demo — Claude querying Odoo live via MCP.
 *
 * Preview card → full-screen dark modal with a scripted-but-live agent run.
 * Pipeline nodes (Plan→Query→Analyze→Respond) light up, MCP tool calls stream,
 * results render as tables, final answer types out.
 *
 * Pure React/framer. Synthetic data. Timers cleaned on unmount.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Bot, Cpu, Database, Sparkles, Send } from "lucide-react";
import { useIsMobile } from "./use-is-mobile";

// ── Dark agent tokens ─────────────────────────────────────────────────────────────
const D = {
  bg: "#0b0b12", panel: "#14141f", panel2: "#1b1b29",
  border: "rgba(255,255,255,0.08)", border2: "rgba(255,255,255,0.14)",
  text: "#e8e8f0", sub: "#8b8b9e", faint: "#5a5a6e",
  accent: "#a78bfa", cyan: "#38bdf8", green: "#5ee6a0", amber: "#fbbf24", pink: "#f472b6",
};

const NODES = [
  { key: "plan",    label: "Plan",    icon: Cpu },
  { key: "query",   label: "Query",   icon: Database },
  { key: "analyze", label: "Analyze", icon: Sparkles },
  { key: "respond", label: "Respond", icon: Bot },
];

interface Call { tool: string; model: string; args: string; result: string; }
interface Scenario {
  q: string; plan: string; calls: Call[];
  table?: { title: string; cols: string[]; rows: string[][] };
  metrics?: { label: string; value: string; color: string }[];
  answer: string;
}

const SCENARIOS: Scenario[] = [
  {
    q: "Show overdue sale orders over $20K",
    plan: "Query sale.order where commitment_date is past and amount_total > 20,000, then rank by days late.",
    calls: [
      { tool: "search_records", model: "sale.order", args: 'domain: [["commitment_date","<","today"], ["amount_total",">",20000]]', result: "4 records · 38ms" },
    ],
    table: {
      title: "sale.order — overdue · >$20K",
      cols: ["SO", "Customer", "Value", "Days late"],
      rows: [
        ["S10250", "Pinnacle AV Solutions", "$42K", "5"],
        ["S10244", "Lakeside University", "$32K", "3"],
        ["S10254", "Riverside Mfg", "$31K", "12"],
        ["S10259", "Summit Conference", "$29K", "8"],
      ],
    },
    answer: "4 orders are overdue and above $20K — $134K at risk. Riverside Mfg is the most delayed at 12 days; Pinnacle AV ($42K) is the largest exposure. Recommend expediting those two first.",
  },
  {
    q: "Revenue last 3 months, by month",
    plan: "Aggregate sale.order amount_total grouped by month for the trailing quarter.",
    calls: [
      { tool: "aggregate", model: "sale.order", args: 'groupby: "date_order:month" · measure: sum(amount_total)', result: "3 groups · 24ms" },
    ],
    metrics: [
      { label: "March", value: "$0.74M", color: D.cyan },
      { label: "April", value: "$0.81M", color: D.accent },
      { label: "May", value: "$0.86M", color: D.green },
    ],
    answer: "Trailing-quarter revenue is $2.41M, trending up each month (+9% Mar→Apr, +6% Apr→May). May is the strongest at $0.86M. Momentum is positive heading into Q3.",
  },
  {
    q: "Which products are low on stock?",
    plan: "Find product.product with qty_available below the reorder threshold of 10.",
    calls: [
      { tool: "search_records", model: "product.product", args: 'domain: [["qty_available","<",10],["sale_ok","=",true]]', result: "5 records · 31ms" },
      { tool: "read", model: "stock.warehouse.orderpoint", args: "fields: [product_id, product_min_qty]", result: "5 records · 12ms" },
    ],
    table: {
      title: "product.product — below reorder point",
      cols: ["SKU", "Product", "On hand", "Reorder"],
      rows: [
        ["HD-ARM-T2", "Monitor Arm T2", "4", "25"],
        ["HD-PNL-P5", "Side Panel P5", "7", "20"],
        ["HD-HNG-H6", "Hinge Assy H6", "2", "30"],
        ["HD-BRKT-B3", "Wall Bracket B3", "0", "40"],
        ["HD-FOOT-F7", "Rubber Foot F7", "9", "100"],
      ],
    },
    answer: "5 sellable SKUs are below reorder point. Wall Bracket B3 is fully stocked out (0 on hand, needs 40) and Hinge Assy H6 is critical at 2/30 — both block open SOs. Suggest raising POs for those two today.",
  },
  {
    q: "Break down BOM cost for Monitor Arm T2",
    plan: "Explode the mrp.bom for HD-ARM-T2, roll up component costs, compare to standard price.",
    calls: [
      { tool: "read", model: "mrp.bom", args: "product: HD-ARM-T2 · explode: components", result: "1 BOM · 6 lines · 18ms" },
      { tool: "aggregate", model: "mrp.bom.line", args: "measure: sum(product_qty × cost)", result: "6 components · 9ms" },
    ],
    table: {
      title: "mrp.bom.line — Monitor Arm T2",
      cols: ["Component", "Qty", "Line cost"],
      rows: [
        ["Extruded arm", "×1", "$22.40"],
        ["Pivot joint", "×2", "$16.00"],
        ["Base clamp", "×1", "$12.50"],
        ["Cable channel", "×1", "$5.10"],
        ["Packaging set", "×1", "$4.80"],
        ["Fasteners", "×8", "$3.20"],
      ],
    },
    answer: "BOM rolls up to $64.00 in materials against an $88 standard price — a 27% material margin. The pivot-joint pair ($16) and extruded arm ($22.40) drive ~60% of cost; renegotiating those two would move margin the most.",
  },
  {
    q: "Average lead time by vendor, last 90 days",
    plan: "Aggregate purchase.order receipt-minus-order days grouped by vendor, with on-time rate.",
    calls: [
      { tool: "aggregate", model: "purchase.order", args: "groupby: partner_id · measure: avg(effective_date − date_order)", result: "5 vendors · 27ms" },
    ],
    table: {
      title: "purchase.order — avg lead time · 90d",
      cols: ["Vendor", "POs", "Avg lead", "On-time"],
      rows: [
        ["Metalworks Co", "18", "6d", "94%"],
        ["FineForm", "12", "8d", "90%"],
        ["Premier Mfg", "15", "11d", "82%"],
        ["Coastal Parts", "9", "14d", "78%"],
        ["AliMetal", "11", "24d", "61%"],
      ],
    },
    answer: "AliMetal is the clear outlier — 24-day average lead and 61% on-time, while everyone else is under 14 days. They also own both open finish/burr RMAs. Dual-sourcing their parts would de-risk the supply chain.",
  },
  {
    q: "Gross margin by product category this quarter",
    plan: "Aggregate sale.order.line margin grouped by product category for the trailing quarter.",
    calls: [
      { tool: "aggregate", model: "sale.order.line", args: "groupby: categ_id · measure: sum(margin), sum(price_subtotal)", result: "5 categories · 31ms" },
    ],
    metrics: [
      { label: "Custom", value: "58%", color: D.green },
      { label: "Lectern", value: "49%", color: D.cyan },
      { label: "Mobile Fleet", value: "41%", color: D.accent },
      { label: "Panel", value: "36%", color: D.amber },
      { label: "Stock", value: "28%", color: D.pink },
    ],
    answer: "Custom work leads at 58% margin on the highest revenue — it's the profit engine. Stock lags at 28%. Tilting the mix toward Custom and Lectern lifts blended margin; Stock pricing is worth a review.",
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ════════════════════════════════════════════════════════════════════════════════
export function MCPCoworkDemoCard() {
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, left: 0 }));
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <PreviewCard onOpen={() => setOpen(true)} />
      <AnimatePresence>
        {open && (
          <motion.div key="mcp-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex flex-col" style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}>
            <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 shrink-0" style={{ background: "#08080e", borderBottom: `1px solid ${D.border}` }}>
              <div className="min-w-0 flex items-center gap-3">
                <Bot className="w-4 h-4" style={{ color: D.accent }} />
                <span className="truncate" style={{ color: D.text, fontWeight: 600, fontSize: 14 }}>MCP Cowork Agent</span>
                <span className="hidden sm:inline" style={{ color: D.faint, fontSize: 11 }}>· Claude ↔ Odoo via MCP · Synthetic data</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: D.sub }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-hidden overscroll-contain" style={{ background: D.bg }}>
              <MCPCoworkApp />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
type Event =
  | { kind: "user"; text: string }
  | { kind: "plan"; text: string }
  | { kind: "call"; call: Call; done: boolean }
  | { kind: "table"; table: NonNullable<Scenario["table"]> }
  | { kind: "metrics"; metrics: NonNullable<Scenario["metrics"]> }
  | { kind: "answer"; text: string; full: string };

export function MCPCoworkApp() {
  const [events, setEvents] = useState<Event[]>([]);
  const [running, setRunning] = useState(false);
  const [activeNode, setActiveNode] = useState(-1);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const mounted = useRef(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" }); }, [events, reducedMotion]);

  const run = useCallback(async (s: Scenario, idx: number) => {
    if (running) return;
    setRunning(true);
    setUsed((u) => new Set(u).add(idx));
    if (reducedMotion) {
      const completedEvents: Event[] = [{ kind: "user", text: s.q }, { kind: "plan", text: s.plan }, ...s.calls.map((call): Event => ({ kind: "call", call, done: true }))];
      if (s.table) completedEvents.push({ kind: "table", table: s.table });
      if (s.metrics) completedEvents.push({ kind: "metrics", metrics: s.metrics });
      completedEvents.push({ kind: "answer", text: s.answer, full: s.answer });
      setEvents((previous) => [...previous, ...completedEvents]);
      setActiveNode(-1);
      setRunning(false);
      return;
    }
    setEvents((e) => [...e, { kind: "user", text: s.q }]);
    await sleep(450); if (!mounted.current) return;

    // Plan
    setActiveNode(0);
    setEvents((e) => [...e, { kind: "plan", text: s.plan }]);
    await sleep(900); if (!mounted.current) return;

    // Query — stream each call (running → done)
    setActiveNode(1);
    for (const call of s.calls) {
      setEvents((e) => [...e, { kind: "call", call, done: false }]);
      await sleep(750); if (!mounted.current) return;
      setEvents((e) => e.map((ev, i) => (i === e.length - 1 && ev.kind === "call" ? { ...ev, done: true } : ev)));
      await sleep(350); if (!mounted.current) return;
    }

    // Analyze — show data
    setActiveNode(2);
    if (s.table) setEvents((e) => [...e, { kind: "table", table: s.table! }]);
    if (s.metrics) setEvents((e) => [...e, { kind: "metrics", metrics: s.metrics! }]);
    await sleep(800); if (!mounted.current) return;

    // Respond — typewriter
    setActiveNode(3);
    setEvents((e) => [...e, { kind: "answer", text: "", full: s.answer }]);
    const words = s.answer.split(" ");
    for (let i = 0; i < words.length; i++) {
      await sleep(38); if (!mounted.current) return;
      const partial = words.slice(0, i + 1).join(" ");
      setEvents((e) => e.map((ev, j) => (j === e.length - 1 && ev.kind === "answer" ? { ...ev, text: partial } : ev)));
    }
    await sleep(300); if (!mounted.current) return;
    setActiveNode(-1);
    setRunning(false);
  }, [running, reducedMotion]);

  const reset = () => { if (running) return; setEvents([]); setUsed(new Set()); setActiveNode(-1); };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "'Inter',system-ui,sans-serif", color: D.text }}>
      {/* Pipeline nodes */}
      <div style={{ padding: isMobile ? "12px 14px" : "14px 20px", borderBottom: `1px solid ${D.border}`, display: "flex", alignItems: "center", gap: 0, background: "#0a0a11" }}>
        {NODES.map((n, i) => {
          const active = activeNode === i;
          const past = activeNode > i || (!running && events.length > 0);
          const on = active || past;
          const Icon = n.icon;
          return (
            <div key={n.key} style={{ display: "flex", alignItems: "center", flex: i < NODES.length - 1 ? 1 : "0 0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <motion.div
                  animate={{
                    background: on ? D.accent + "22" : D.panel,
                    borderColor: active ? D.accent : on ? D.accent + "55" : D.border,
                    scale: active ? 1.08 : 1,
                  }}
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: on ? D.accent : D.faint }} />
                  {active && (
                    <motion.div animate={{ opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ position: "absolute", inset: -3, borderRadius: 10, border: `1px solid ${D.accent}` }} />
                  )}
                </motion.div>
                {!isMobile && <span style={{ fontSize: 12, fontWeight: 600, color: on ? D.text : D.faint }}>{n.label}</span>}
              </div>
              {i < NODES.length - 1 && (
                <div style={{ flex: 1, height: 2, margin: isMobile ? "0 6px" : "0 12px", background: D.border, borderRadius: 2, overflow: "hidden" }}>
                  <motion.div animate={{ width: activeNode > i || (!running && events.length > 0) ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }} style={{ height: "100%", background: D.accent }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Transcript */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        {events.length === 0 && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center" }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: D.accent + "1a", border: `1px solid ${D.accent}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot className="w-6 h-6" style={{ color: D.accent }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Follow a question into Odoo</div>
            <div style={{ fontSize: 12.5, color: D.sub, maxWidth: 360, lineHeight: 1.5 }}>
              Choose a sample question to follow the plan, query, records and answer. This walkthrough uses scripted responses.
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760, margin: "0 auto" }}>
          {events.map((ev, i) => <EventRow key={i} ev={ev} />)}
        </div>
      </div>

      {/* Prompt chips */}
      <div style={{ borderTop: `1px solid ${D.border}`, padding: "12px 22px", background: "#0a0a11" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 10.5, color: D.faint, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {running ? "Agent running…" : "Try a prompt"}
            </span>
            {!running && events.length > 0 && (
              <button onClick={reset} style={{ fontSize: 10.5, color: D.sub, background: "transparent", border: `1px solid ${D.border}`, borderRadius: 999, padding: "2px 9px", cursor: "pointer" }}>
                Reset
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SCENARIOS.map((s, i) => {
              const isUsed = used.has(i);
              return (
                <button key={i} disabled={running} onClick={() => run(s, i)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 10, fontSize: 12.5, fontWeight: 500,
                    cursor: running ? "not-allowed" : "pointer", textAlign: "left",
                    background: isUsed ? D.panel : D.panel2, color: isUsed ? D.sub : D.text,
                    border: `1px solid ${isUsed ? D.border : D.border2}`, opacity: running ? 0.55 : 1, transition: "all .15s" }}>
                  <Send className="w-3 h-3" style={{ color: D.accent }} />
                  {s.q}
                </button>
              );
            })}
          </div>
          <p style={{ marginTop: 12, fontSize: 11, color: D.sub }}>Six prepared examples. No live account connection.</p>
        </div>
      </div>
    </div>
  );
}

// ── Event renderers ────────────────────────────────────────────────────────────────
function EventRow({ ev }: { ev: Event }) {
  if (ev.kind === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ background: D.accent, color: "#0b0b12", padding: "9px 14px", borderRadius: "12px 12px 2px 12px", fontSize: 13, fontWeight: 600, maxWidth: "80%" }}>
          {ev.text}
        </div>
      </motion.div>
    );
  }
  if (ev.kind === "plan") {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <NodeDot color={D.accent} icon={Cpu} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: D.faint, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Plan</div>
          <div style={{ fontSize: 13, color: D.sub, lineHeight: 1.5 }}>{ev.text}</div>
        </div>
      </motion.div>
    );
  }
  if (ev.kind === "call") {
    const { call, done } = ev;
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <NodeDot color={D.cyan} icon={Database} />
        <div style={{ flex: 1, background: "#0e0e18", border: `1px solid ${D.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: "monospace", fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: D.cyan, fontWeight: 600 }}>mcp.{call.tool}</span>
            <span style={{ color: D.amber }}>{call.model}</span>
            {!done ? (
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ color: D.faint, marginLeft: "auto", fontSize: 11 }}>running…</motion.span>
            ) : (
              <span style={{ color: D.green, marginLeft: "auto", fontSize: 11 }}>↳ {call.result}</span>
            )}
          </div>
          <div style={{ color: D.faint, marginTop: 5, fontSize: 11.5, wordBreak: "break-word" }}>{call.args}</div>
        </div>
      </motion.div>
    );
  }
  if (ev.kind === "table") {
    const { table } = ev;
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <NodeDot color={D.green} icon={Sparkles} />
        <div style={{ flex: 1, minWidth: 0, background: "#0e0e18", border: `1px solid ${D.border}`, borderRadius: 8, overflowX: "auto" }}>
          <div style={{ padding: "7px 12px", fontSize: 10.5, color: D.sub, fontFamily: "monospace", borderBottom: `1px solid ${D.border}`, background: "#11111c" }}>{table.title}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>{table.cols.map((c, i) => (
                <th key={c} style={{ textAlign: i === 0 ? "left" : i >= 2 ? "right" : "left", padding: "7px 12px", fontSize: 10, color: D.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${D.border}` }}>{c}</th>
              ))}</tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <motion.tr key={ri} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: ri * 0.06 }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "7px 12px", textAlign: ci === 0 ? "left" : ci >= 2 ? "right" : "left",
                      fontFamily: ci === 0 || ci >= 2 ? "monospace" : "inherit",
                      color: ci === 0 ? D.cyan : D.text, borderBottom: ri < table.rows.length - 1 ? `1px solid ${D.border}` : "none" }}>{cell}</td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }
  if (ev.kind === "metrics") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <NodeDot color={D.green} icon={Sparkles} />
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 8 }}>
          {ev.metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
              style={{ background: "#0e0e18", border: `1px solid ${D.border}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: D.sub, marginBottom: 5 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }
  // answer
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <NodeDot color={D.accent} icon={Bot} />
      <div style={{ flex: 1, background: D.accent + "12", border: `1px solid ${D.accent}33`, borderRadius: "2px 12px 12px 12px", padding: "12px 14px" }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: D.text }}>
          {ev.text}
          {ev.text.length < ev.full.length && (
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ display: "inline-block", width: 7, height: 14, background: D.accent, marginLeft: 2, verticalAlign: "middle", borderRadius: 1 }} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NodeDot({ color, icon: Icon }: { color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: 8, background: color + "18", border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
      <Icon className="w-3.5 h-3.5" style={{ color }} />
    </div>
  );
}

// ── Preview card (animated) ───────────────────────────────────────────────────────
function PreviewCard({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const lines = [
    { t: "$ mcp search_records sale.order", c: D.cyan },
    { t: '  domain: [["amount_total",">",20000]]', c: D.faint },
    { t: "  ↳ 4 records · 38ms", c: D.green },
    { t: "$ analyze → 4 overdue, $134K at risk", c: D.accent },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="relative rounded-2xl border cursor-pointer overflow-hidden flex flex-col"
      style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onOpen}>
      <motion.div className="absolute inset-0 pointer-events-none rounded-2xl" animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }} style={{ boxShadow: "inset 0 0 50px rgba(167,139,250,0.1)" }} />
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono font-bold"
        style={{ background: "#5ee6a0", color: "#0b0b12" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> LIVE DEMO
      </div>

      <div className="p-4 pb-2">
        {/* pipeline nodes mini */}
        <div className="flex items-center mb-3 rounded-lg p-3" style={{ background: "#0e0e18", border: `1px solid ${D.border}` }}>
          {NODES.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={n.key} className="flex items-center" style={{ flex: i < NODES.length - 1 ? 1 : "0 0 auto" }}>
                <motion.div animate={{ borderColor: hovered ? D.accent : D.border, background: hovered ? D.accent + "22" : "transparent" }}
                  transition={{ delay: i * 0.1 }}
                  style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon className="w-3 h-3" style={{ color: hovered ? D.accent : D.faint }} />
                </motion.div>
                {i < NODES.length - 1 && (
                  <div style={{ flex: 1, height: 2, margin: "0 6px", background: D.border, borderRadius: 2, overflow: "hidden" }}>
                    <motion.div animate={{ width: hovered ? "100%" : "0%" }} transition={{ duration: 0.4, delay: i * 0.1 }} style={{ height: "100%", background: D.accent }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* terminal lines */}
        <div className="rounded-lg p-3" style={{ background: "#0e0e18", border: `1px solid ${D.border}`, fontFamily: "monospace", fontSize: 10.5, minHeight: 92 }}>
          {lines.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: hovered ? 1 : 0.45, x: hovered ? 0 : -3 }}
              transition={{ duration: 0.3, delay: i * 0.12 }} style={{ color: l.c, lineHeight: 1.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {l.t}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 mt-auto">
        <div className="font-semibold text-sm text-foreground mb-0.5">MCP Cowork Agent</div>
        <div className="text-[11px] mb-2" style={{ color: "var(--text-secondary)" }}>Claude queries Odoo live · multi-step orchestration</div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {["Claude API", "MCP", "Agents", "Odoo"].map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-mono"
              style={{ background: "rgba(167,139,250,0.14)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>{t}</span>
          ))}
          <span className="ml-auto text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: "#a78bfa" }}>
            Launch demo
          </span>
        </div>
      </div>
    </motion.div>
  );
}
