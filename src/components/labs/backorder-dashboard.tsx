"use client";

/**
 * Backorder Dashboard — interactive demo for /labs
 *
 * Heckler Design live artifact recreation with sanitized mock data.
 * Loads Chart.js v4 from unpkg CDN (already in CSP allowlist).
 * All data is synthetic — no real Heckler customers.
 *
 * Layout:
 *   Toolbar → Metric strip → Charts → Table
 */

import { useEffect, useRef, useState, useMemo } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const HK = {
  black: "#2F3234",
  white: "#FDFCF8",
  band: "#F4F1EA",
  cta: "#0EBBFF",
  success: "#73D277",
  warning: "#EFC761",
  error: "#F66F51",
  muted: "#9B9891",
  border: "#E5E1D8",
  text: "#2F3234",
  textSub: "#6B6762",
};

const CAT_COLORS: Record<string, string> = {
  "Lectern": HK.black,
  "Custom": HK.error,
  "Wall System": HK.success,
  "Stock": HK.muted,
  "AV Cart": HK.cta,
  "Mobile Fleet": "#D4537E",
  "Framework": "#6B8E23",
  "Credenza": HK.warning,
  "Panel": "#8B4557",
  "Modesty Panel": "#185FA5",
  "Other": "#C4C0B8",
};

const STATUS_COLORS = {
  ready: HK.success,
  waiting: HK.warning,
  waiting_op: HK.error,
  wts: HK.black,
};

const STATUS_LABELS = {
  ready: "Ready",
  waiting: "Waiting",
  waiting_op: "Waiting (op)",
  wts: "WTS",
};

const CHAN_LABELS: Record<number, string> = { 1: "DTC", 9: "Dealer", 8: "Distributor" };

// ── Types ─────────────────────────────────────────────────────────────────────
interface LineItem {
  p: string;   // product
  cat: string;
  qo: number;
  rv: number;  // revenue
  mg: number;  // margin $
  ms: number;  // margin %
  dn: string;  // delivery #
}

interface BO {
  o: string;    // SO#
  c: string;    // customer
  d: string;    // commit date ISO
  v: number;    // value
  m: number;    // margin (decimal)
  ov: boolean;  // overdue
  ps: "ready" | "waiting" | "waiting_op" | "wts";
  dn: string;   // delivery#
  n: number;    // line count
  l: LineItem[];
  age: number;
  dtc: number;  // days to commit (neg = overdue)
  sp: string;   // salesperson
  team: string;
  ch: number;   // channel
}

// ── Mock data ─────────────────────────────────────────────────────────────────
function mkLine(p: string, cat: string, qo: number, rv: number, ms: number, dn: string): LineItem {
  return { p, cat, qo, rv, mg: Math.round(rv * ms), ms: Math.round(ms * 100), dn };
}

// Today = 2026-05-29; commit date = today + dtc days
function cd(dtc: number) {
  const d = new Date("2026-05-29");
  d.setDate(d.getDate() + dtc);
  return d.toISOString().slice(0, 10);
}

const DATA: BO[] = [
  {
    o:"S10241", c:"ACME Corp", d:cd(4), v:8400, m:0.52, ov:false, ps:"ready",
    dn:"DO-8241", n:2, age:12, dtc:4, sp:"Sarah K.", team:"Direct", ch:1,
    l:[
      mkLine("Lectern Pro L1","Lectern",2,5600,0.54,"DO-8241"),
      mkLine("Lectern Stand L2","Lectern",2,2800,0.48,"DO-8241"),
    ],
  },
  {
    o:"S10242", c:"GlobalTech Solutions", d:cd(6), v:3200, m:0.44, ov:false, ps:"waiting",
    dn:"DO-8242", n:1, age:5, dtc:6, sp:"Mike T.", team:"Corporate", ch:9,
    l:[mkLine("AV Cart Compact AC1","AV Cart",1,3200,0.44,"DO-8242")],
  },
  {
    o:"S10243", c:"Pacific Northwest Media", d:cd(3), v:15600, m:0.58, ov:false, ps:"ready",
    dn:"DO-8243", n:3, age:8, dtc:3, sp:"Sarah K.", team:"Direct", ch:1,
    l:[
      mkLine("Wallscape 48x96 WS1","Wall System",1,7800,0.60,"DO-8243"),
      mkLine("WS Extension WS2","Wall System",2,4200,0.56,"DO-8243"),
      mkLine("WS Corner Panel WS3","Wall System",1,3600,0.55,"DO-8243"),
    ],
  },
  {
    o:"S10244", c:"Lakeside University", d:cd(-3), v:32000, m:0.55, ov:true, ps:"waiting",
    dn:"DO-8244", n:3, age:22, dtc:-3, sp:"Jenny L.", team:"Education", ch:1,
    l:[
      mkLine("Custom Lectern CL1","Custom",1,14000,0.58,"DO-8244"),
      mkLine("Custom Panel Array CP1","Custom",2,11000,0.52,"DO-8244"),
      mkLine("Custom Reception Desk CR1","Custom",1,7000,0.51,"DO-8244"),
    ],
  },
  {
    o:"S10245", c:"Mountain West Hotels", d:cd(8), v:7800, m:0.41, ov:false, ps:"wts",
    dn:"DO-8245", n:2, age:18, dtc:8, sp:"Jenny L.", team:"Hospitality", ch:9,
    l:[
      mkLine("Credenza C300",  "Credenza",1,4600,0.42,"DO-8245"),
      mkLine("Credenza Wide CW1","Credenza",1,3200,0.40,"DO-8245"),
    ],
  },
  {
    o:"S10246", c:"Summit Conference Centers", d:cd(-7), v:4200, m:0.32, ov:true, ps:"waiting_op",
    dn:"DO-8246", n:1, age:35, dtc:-7, sp:"Mike T.", team:"Corporate", ch:8,
    l:[mkLine("Lectern Classic LC1","Lectern",1,4200,0.32,"DO-8246")],
  },
  {
    o:"S10247", c:"Coastal Tech Park", d:cd(5), v:9100, m:0.46, ov:false, ps:"ready",
    dn:"DO-8247", n:2, age:3, dtc:5, sp:"David R.", team:"Corporate", ch:9,
    l:[
      mkLine("Modular Framework FK1","Framework",1,5600,0.48,"DO-8247"),
      mkLine("Framework Extension FE1","Framework",2,3500,0.43,"DO-8247"),
    ],
  },
  {
    o:"S10248", c:"Valley Regional Hospital", d:cd(2), v:21000, m:0.61, ov:false, ps:"waiting",
    dn:"DO-8248", n:3, age:14, dtc:2, sp:"Sarah K.", team:"Healthcare", ch:1,
    l:[
      mkLine("Mobile Fleet Pro MF1","Mobile Fleet",2,9800,0.63,"DO-8248"),
      mkLine("Mobile Whiteboard MW1","Mobile Fleet",3,7200,0.60,"DO-8248"),
      mkLine("Fleet Cart FC1","Mobile Fleet",2,4000,0.58,"DO-8248"),
    ],
  },
  {
    o:"S10249", c:"Metro Events Co", d:cd(7), v:2800, m:0.54, ov:false, ps:"ready",
    dn:"DO-8249", n:1, age:6, dtc:7, sp:"Jenny L.", team:"Direct", ch:1,
    l:[mkLine("AV Cart Mini AM1","AV Cart",1,2800,0.54,"DO-8249")],
  },
  {
    o:"S10250", c:"Pinnacle AV Solutions", d:cd(-5), v:42000, m:0.38, ov:true, ps:"waiting_op",
    dn:"DO-8250", n:3, age:28, dtc:-5, sp:"Mike T.", team:"Corporate", ch:8,
    l:[
      mkLine("Custom AV Plinth CA1","Custom",2,18000,0.39,"DO-8250"),
      mkLine("Custom Display Unit CD1","Custom",1,14000,0.37,"DO-8250"),
      mkLine("Custom AV Cabinet CC1","Custom",2,10000,0.38,"DO-8250"),
    ],
  },
  {
    o:"S10251", c:"Harbor District Schools", d:cd(14), v:18500, m:0.56, ov:false, ps:"wts",
    dn:"DO-8251", n:2, age:9, dtc:14, sp:"David R.", team:"Education", ch:1,
    l:[
      mkLine("Wallscape 36x72 WS4","Wall System",2,11200,0.57,"DO-8251"),
      mkLine("WS Hanging Panel WS5","Wall System",3,7300,0.54,"DO-8251"),
    ],
  },
  {
    o:"S10252", c:"Western States Finance", d:cd(4), v:5600, m:0.43, ov:false, ps:"waiting",
    dn:"DO-8252", n:2, age:11, dtc:4, sp:"David R.", team:"Corporate", ch:9,
    l:[
      mkLine("Office Panel 60H P1","Panel",4,3200,0.44,"DO-8252"),
      mkLine("Acoustic Panel AP1","Panel",4,2400,0.42,"DO-8252"),
    ],
  },
  {
    o:"S10253", c:"Canyon Creek Community", d:cd(9), v:1800, m:0.45, ov:false, ps:"ready",
    dn:"DO-8253", n:1, age:4, dtc:9, sp:"Ana P.", team:"Direct", ch:9,
    l:[mkLine("Desk Modesty Panel DMP1","Modesty Panel",3,1800,0.45,"DO-8253")],
  },
  {
    o:"S10254", c:"Riverside Manufacturing", d:cd(-12), v:11200, m:0.35, ov:true, ps:"waiting_op",
    dn:"DO-8254", n:2, age:45, dtc:-12, sp:"David R.", team:"Direct", ch:8,
    l:[
      mkLine("Modular Framework MF2","Framework",1,6800,0.36,"DO-8254"),
      mkLine("Framework Stand FS1","Framework",2,4400,0.34,"DO-8254"),
    ],
  },
  {
    o:"S10255", c:"Northgate Consulting", d:cd(11), v:6400, m:0.52, ov:false, ps:"wts",
    dn:"DO-8255", n:2, age:16, dtc:11, sp:"Ana P.", team:"Corporate", ch:1,
    l:[
      mkLine("Steel Lectern SL1","Lectern",1,4200,0.53,"DO-8255"),
      mkLine("Lectern Riser LR1","Lectern",2,2200,0.50,"DO-8255"),
    ],
  },
  {
    o:"S10256", c:"ACME Corp", d:cd(1), v:14700, m:0.60, ov:false, ps:"waiting",
    dn:"DO-8256", n:2, age:7, dtc:1, sp:"Sarah K.", team:"Direct", ch:1,
    l:[
      mkLine("Mobile Fleet Pro MFP1","Mobile Fleet",3,9200,0.61,"DO-8256"),
      mkLine("Fleet Whiteboard FW1","Mobile Fleet",2,5500,0.58,"DO-8256"),
    ],
  },
  {
    o:"S10257", c:"GlobalTech Solutions", d:cd(10), v:9300, m:0.47, ov:false, ps:"ready",
    dn:"DO-8257", n:2, age:2, dtc:10, sp:"Mike T.", team:"Corporate", ch:9,
    l:[
      mkLine("Storage Credenza SC1","Credenza",1,5600,0.48,"DO-8257"),
      mkLine("Credenza Extension CE1","Credenza",1,3700,0.46,"DO-8257"),
    ],
  },
  {
    o:"S10258", c:"Pacific Northwest Media", d:cd(-2), v:3800, m:0.53, ov:true, ps:"waiting",
    dn:"DO-8258", n:1, age:19, dtc:-2, sp:"Sarah K.", team:"Direct", ch:1,
    l:[mkLine("AV Cart Pro ACP1","AV Cart",1,3800,0.53,"DO-8258")],
  },
  {
    o:"S10259", c:"Summit Conference Centers", d:cd(-8), v:28500, m:0.36, ov:true, ps:"waiting_op",
    dn:"DO-8259", n:3, age:31, dtc:-8, sp:"Mike T.", team:"Corporate", ch:8,
    l:[
      mkLine("Custom Stage Platform CS1","Custom",1,12000,0.38,"DO-8259"),
      mkLine("Custom Podium CP2","Custom",2,9500,0.35,"DO-8259"),
      mkLine("Custom Display Wall CD2","Custom",1,7000,0.34,"DO-8259"),
    ],
  },
  {
    o:"S10260", c:"Valley Regional Hospital", d:cd(3), v:22000, m:0.62, ov:false, ps:"ready",
    dn:"DO-8260", n:3, age:5, dtc:3, sp:"Sarah K.", team:"Healthcare", ch:1,
    l:[
      mkLine("Wallscape 60x96 WS6","Wall System",1,11500,0.64,"DO-8260"),
      mkLine("WS Curved Section WC1","Wall System",2,6500,0.61,"DO-8260"),
      mkLine("WS Extension Set WE2","Wall System",2,4000,0.60,"DO-8260"),
    ],
  },
  {
    o:"S10261", c:"Metro Events Co", d:cd(5), v:4100, m:0.50, ov:false, ps:"waiting",
    dn:"DO-8261", n:2, age:8, dtc:5, sp:"Jenny L.", team:"Direct", ch:1,
    l:[
      mkLine("Standard Shelf Unit SS1","Stock",2,2400,0.51,"DO-8261"),
      mkLine("Filing Unit FU1","Stock",2,1700,0.49,"DO-8261"),
    ],
  },
  {
    o:"S10262", c:"Harbor District Schools", d:cd(6), v:7200, m:0.48, ov:false, ps:"ready",
    dn:"DO-8262", n:2, age:3, dtc:6, sp:"David R.", team:"Education", ch:9,
    l:[
      mkLine("Adjustable Lectern AL1","Lectern",2,4500,0.49,"DO-8262"),
      mkLine("Lectern Base LB1","Lectern",2,2700,0.47,"DO-8262"),
    ],
  },
  {
    o:"S10263", c:"Western States Finance", d:cd(16), v:16800, m:0.42, ov:false, ps:"wts",
    dn:"DO-8263", n:2, age:24, dtc:16, sp:"David R.", team:"Corporate", ch:9,
    l:[
      mkLine("Modular Framework Kit MFK1","Framework",2,9800,0.43,"DO-8263"),
      mkLine("Framework Extension Set FES1","Framework",2,7000,0.41,"DO-8263"),
    ],
  },
  {
    o:"S10264", c:"Canyon Creek Community", d:cd(2), v:5100, m:0.51, ov:false, ps:"waiting",
    dn:"DO-8264", n:2, age:13, dtc:2, sp:"Ana P.", team:"Direct", ch:1,
    l:[
      mkLine("Office Panel 60H OP1","Panel",3,3000,0.52,"DO-8264"),
      mkLine("Panel Connector Set PC1","Panel",4,2100,0.50,"DO-8264"),
    ],
  },
  {
    o:"S10265", c:"Lakeside University", d:cd(-9), v:19600, m:0.57, ov:true, ps:"waiting_op",
    dn:"DO-8265", n:3, age:38, dtc:-9, sp:"Jenny L.", team:"Education", ch:1,
    l:[
      mkLine("Mobile Fleet Kit MFK2","Mobile Fleet",3,9800,0.59,"DO-8265"),
      mkLine("Mobile Stand MS1","Mobile Fleet",3,5800,0.56,"DO-8265"),
      mkLine("Fleet Accessory Kit FA1","Mobile Fleet",4,4000,0.54,"DO-8265"),
    ],
  },
];

// Inflow GP vs Shipped GP (last 8 weeks, in $K)
const FLOW_LABELS  = ["-7w","-6w","-5w","-4w","-3w","-2w","-1w","This wk"];
const INFLOW_GP    = [44,52,38,61,46,65,51,38];
const SHIPPED_GP   = [42,50,55,41,49,44,62,25];
// Running balance
const BALANCE      = INFLOW_GP.reduce<number[]>((acc, v, i) => {
  acc.push((acc[i - 1] ?? 165) + v - SHIPPED_GP[i]);
  return acc;
}, []);

// ── Helper formatters ─────────────────────────────────────────────────────────
const fmt$ = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `$${n.toLocaleString()}`;

const fmtDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m) - 1];
  return `${mon} ${parseInt(d)}`;
};

// ── Component ─────────────────────────────────────────────────────────────────
export function BackorderDashboard() {
  const [cjsReady, setCjsReady] = useState(false);
  const [sortKey, setSortKey] = useState<keyof BO>("age");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterChan, setFilterChan] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Canvas refs
  const flowRef  = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const catRef   = useRef<HTMLCanvasElement>(null);
  const custRef  = useRef<HTMLCanvasElement>(null);
  const shipRef  = useRef<HTMLCanvasElement>(null);

  // Chart instances (for cleanup)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charts = useRef<any[]>([]);

  // ── Load Chart.js from CDN ──────────────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Chart) { setCjsReady(true); return; }
    const existing = document.getElementById("cjs-cdn");
    if (existing) {
      existing.addEventListener("load", () => setCjsReady(true));
      return;
    }
    const s = document.createElement("script");
    s.id = "cjs-cdn";
    s.src = "https://unpkg.com/chart.js@4.4.4/dist/chart.umd.min.js";
    s.onload = () => setCjsReady(true);
    document.head.appendChild(s);
  }, []);

  // ── Build charts ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cjsReady) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CJ = (window as any).Chart;

    charts.current.forEach((c) => c.destroy());
    charts.current = [];

    const defaults = CJ.defaults;
    defaults.font.family = "'Inter', system-ui, sans-serif";
    defaults.color = HK.textSub;

    const gridColor = HK.border;
    const tickOpts = { color: HK.textSub, font: { size: 11 } };

    // 1. Flow chart — combo bar + line
    if (flowRef.current) {
      charts.current.push(
        new CJ(flowRef.current, {
          type: "bar",
          data: {
            labels: FLOW_LABELS,
            datasets: [
              { label: "Inflow GP", data: INFLOW_GP, backgroundColor: HK.cta + "CC", order: 2 },
              { label: "Shipped GP", data: SHIPPED_GP, backgroundColor: HK.success + "CC", order: 2 },
              {
                label: "GP Balance", data: BALANCE,
                type: "line", borderColor: HK.error, borderWidth: 2,
                pointRadius: 3, pointBackgroundColor: HK.error,
                fill: false, tension: 0.3, yAxisID: "y2", order: 1,
              },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { font: { size: 11 }, boxWidth: 12 } } },
            scales: {
              x: { grid: { color: gridColor }, ticks: tickOpts, stacked: true },
              y: { grid: { color: gridColor }, ticks: { ...tickOpts, callback: (v: number) => `$${v}K` }, stacked: true, title: { display: true, text: "GP $K", font: { size: 10 } } },
              y2: { position: "right", grid: { display: false }, ticks: { ...tickOpts, callback: (v: number) => `$${v}K` }, title: { display: true, text: "Balance $K", font: { size: 10 } } },
            },
          },
        })
      );
    }

    // 2. Status doughnut
    const statusGroups = { ready: 0, waiting: 0, waiting_op: 0, wts: 0 } as Record<string, number>;
    DATA.forEach((r) => { statusGroups[r.ps] += r.v; });
    if (donutRef.current) {
      charts.current.push(
        new CJ(donutRef.current, {
          type: "doughnut",
          data: {
            labels: ["Ready", "Waiting", "Waiting (op)", "WTS"],
            datasets: [{
              data: [statusGroups.ready, statusGroups.waiting, statusGroups.waiting_op, statusGroups.wts],
              backgroundColor: [HK.success, HK.warning, HK.error, HK.black],
              borderWidth: 2, borderColor: HK.white,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            cutout: "62%",
            plugins: {
              legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 8 } },
              tooltip: { callbacks: { label: (c: any) => ` ${fmt$(c.raw)}` } },
            },
          },
        })
      );
    }

    // 3. Category value — horizontal bar
    const catTotals: Record<string, number> = {};
    DATA.forEach((r) => r.l.forEach((ln) => { catTotals[ln.cat] = (catTotals[ln.cat] ?? 0) + ln.rv; }));
    const catSorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    if (catRef.current) {
      charts.current.push(
        new CJ(catRef.current, {
          type: "bar",
          data: {
            labels: catSorted.map(([k]) => k),
            datasets: [{
              data: catSorted.map(([, v]) => Math.round(v / 1000)),
              backgroundColor: catSorted.map(([k]) => CAT_COLORS[k] ?? HK.muted),
              borderRadius: 3,
            }],
          },
          options: {
            indexAxis: "y", responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: gridColor }, ticks: { ...tickOpts, callback: (v: number) => `$${v}K` } },
              y: { grid: { display: false }, ticks: tickOpts },
            },
          },
        })
      );
    }

    // 4. Top customers — horizontal bar
    const custTotals: Record<string, number> = {};
    DATA.forEach((r) => { custTotals[r.c] = (custTotals[r.c] ?? 0) + r.v; });
    const custSorted = Object.entries(custTotals).sort((a, b) => b[1] - a[1]).slice(0, 7);
    if (custRef.current) {
      charts.current.push(
        new CJ(custRef.current, {
          type: "bar",
          data: {
            labels: custSorted.map(([k]) => k.split(" ").slice(0, 2).join(" ")),
            datasets: [{
              data: custSorted.map(([, v]) => Math.round(v / 1000)),
              backgroundColor: HK.cta + "BB",
              borderRadius: 3,
            }],
          },
          options: {
            indexAxis: "y", responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: gridColor }, ticks: { ...tickOpts, callback: (v: number) => `$${v}K` } },
              y: { grid: { display: false }, ticks: { ...tickOpts, font: { size: 10 } } },
            },
          },
        })
      );
    }

    // 5. Ship-week GP buckets
    const buckets = { overdue: 0, this_wk: 0, next_wk: 0, "2_4wk": 0, "4plus": 0 };
    DATA.forEach((r) => {
      const gp = r.v * r.m;
      if (r.dtc < 0) buckets.overdue += gp;
      else if (r.dtc <= 2) buckets.this_wk += gp;
      else if (r.dtc <= 7) buckets.next_wk += gp;
      else if (r.dtc <= 28) buckets["2_4wk"] += gp;
      else buckets["4plus"] += gp;
    });
    if (shipRef.current) {
      charts.current.push(
        new CJ(shipRef.current, {
          type: "bar",
          data: {
            labels: ["Overdue", "This week", "Next week", "2–4 weeks", "4+ weeks"],
            datasets: [{
              data: [
                Math.round(buckets.overdue / 1000),
                Math.round(buckets.this_wk / 1000),
                Math.round(buckets.next_wk / 1000),
                Math.round(buckets["2_4wk"] / 1000),
                Math.round(buckets["4plus"] / 1000),
              ],
              backgroundColor: [HK.error, HK.warning, HK.success, HK.cta, HK.muted],
              borderRadius: 3,
            }],
          },
          options: {
            indexAxis: "y", responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: gridColor }, ticks: { ...tickOpts, callback: (v: number) => `$${v}K` } },
              y: { grid: { display: false }, ticks: tickOpts },
            },
          },
        })
      );
    }

    return () => { charts.current.forEach((c) => c.destroy()); charts.current = []; };
  }, [cjsReady]);

  // ── Computed metrics ────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalVal = DATA.reduce((s, r) => s + r.v, 0);
    const marginAtRisk = DATA.filter((r) => r.ov).reduce((s, r) => s + r.v * r.m, 0);
    const ready = DATA.filter((r) => r.ps === "ready").length;
    const waiting = DATA.filter((r) => r.ps === "waiting" || r.ps === "waiting_op").length;
    const overdue = DATA.filter((r) => r.ov).length;
    const avgAge = Math.round(DATA.reduce((s, r) => s + r.age, 0) / DATA.length);
    const atRisk = DATA.filter((r) => r.dtc >= 0 && r.dtc <= 3).length;
    return { totalVal, marginAtRisk, ready, waiting, overdue, avgAge, atRisk };
  }, []);

  // ── Filtered + sorted table data ────────────────────────────────────────────
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return DATA
      .filter((r) => {
        if (filterStatus !== "all" && r.ps !== filterStatus) return false;
        if (filterChan !== "all" && r.ch !== parseInt(filterChan)) return false;
        if (filterCat !== "all" && !r.l.some((ln) => ln.cat === filterCat)) return false;
        if (q && !r.o.toLowerCase().includes(q) && !r.c.toLowerCase().includes(q) && !r.dn.toLowerCase().includes(q) && !r.sp.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const av = a[sortKey as keyof BO];
        const bv = b[sortKey as keyof BO];
        const cmp = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [search, filterStatus, filterChan, filterCat, sortKey, sortDir]);

  const toggleSort = (k: keyof BO) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };

  const toggleRow = (o: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(o) ? next.delete(o) : next.add(o);
      return next;
    });

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const hdr = ["SO#","Customer","Commit","Status","Age","Value","Margin%","Channel","Rep"];
    const body = rows.map((r) => [
      r.o, r.c, r.d, STATUS_LABELS[r.ps], r.age,
      r.v, Math.round(r.m * 100), CHAN_LABELS[r.ch], r.sp,
    ].join(","));
    const blob = new Blob([hdr.join(",") + "\n" + body.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "backorders.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: HK.white, color: HK.text, fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, minHeight: "100%", overflowY: "auto" }}>

      {/* ── Toolbar ── */}
      <div style={{ background: HK.band, borderBottom: `1px solid ${HK.border}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: HK.success }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: HK.black }}>Backorder Dashboard</span>
          <span style={{ color: HK.muted, fontSize: 11 }}>· May 29, 2026</span>
        </div>

        <input
          placeholder="Search SO / customer / rep…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "5px 10px", border: `1px solid ${HK.border}`, borderRadius: 6, fontSize: 12, background: HK.white, color: HK.text, width: 200, outline: "none" }}
        />

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "5px 8px", border: `1px solid ${HK.border}`, borderRadius: 6, fontSize: 12, background: HK.white, color: HK.text }}>
          <option value="all">All Status</option>
          <option value="ready">Ready</option>
          <option value="waiting">Waiting</option>
          <option value="waiting_op">Waiting (op)</option>
          <option value="wts">WTS</option>
        </select>

        <select value={filterChan} onChange={(e) => setFilterChan(e.target.value)}
          style={{ padding: "5px 8px", border: `1px solid ${HK.border}`, borderRadius: 6, fontSize: 12, background: HK.white, color: HK.text }}>
          <option value="all">All Channels</option>
          <option value="1">DTC</option>
          <option value="9">Dealer</option>
          <option value="8">Distributor</option>
        </select>

        <button onClick={exportCSV}
          style={{ padding: "5px 12px", background: HK.black, color: HK.white, border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
          Export CSV
        </button>
      </div>

      {/* ── Metric strip ── */}
      <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
        {[
          { label: "Total Value", value: fmt$(metrics.totalVal), sub: `${DATA.length} orders`, color: HK.black },
          { label: "Margin at Risk", value: fmt$(Math.round(metrics.marginAtRisk)), sub: `${metrics.overdue} overdue SOs`, color: HK.error },
          { label: "Ready to Ship", value: metrics.ready, sub: "pick complete", color: HK.success },
          { label: "Waiting", value: metrics.waiting, sub: "parts / approval", color: HK.warning },
          { label: "Overdue", value: metrics.overdue, sub: "past commit date", color: HK.error },
          { label: "Avg Age", value: `${metrics.avgAge}d`, sub: "days in backlog", color: HK.black },
          { label: "At Risk", value: metrics.atRisk, sub: "≤3 days to commit", color: "#D4537E" },
        ].map((m) => (
          <div key={m.label} style={{ background: HK.band, border: `1px solid ${HK.border}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: HK.textSub, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: m.color, lineHeight: 1 }}>{String(m.value)}</div>
            <div style={{ fontSize: 10, color: HK.muted, marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Charts grid ── */}
      <div style={{ padding: "0 16px 12px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        {/* Flow chart */}
        <ChartCard title="GP Flow — Inflow vs Shipped (8 weeks)" height={200}>
          <canvas ref={flowRef} />
        </ChartCard>
        {/* Status donut */}
        <ChartCard title="Status Breakdown by Value" height={200}>
          <canvas ref={donutRef} />
        </ChartCard>
      </div>

      <div style={{ padding: "0 16px 12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <ChartCard title="Value by Category" height={180}>
          <canvas ref={catRef} />
        </ChartCard>
        <ChartCard title="Top Customers by Value" height={180}>
          <canvas ref={custRef} />
        </ChartCard>
        <ChartCard title="GP by Ship-Week Bucket" height={180}>
          <canvas ref={shipRef} />
        </ChartCard>
      </div>

      {/* ── Table ── */}
      <div style={{ padding: "0 16px 24px" }}>
        <div style={{ background: HK.white, border: `1px solid ${HK.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: HK.band, borderBottom: `1px solid ${HK.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Open Orders</span>
            <span style={{ fontSize: 11, color: HK.muted }}>{rows.length} of {DATA.length} shown</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: HK.band, borderBottom: `1px solid ${HK.border}` }}>
                  {(["o","c","d","ps","age","v","m","ch","sp"] as (keyof BO)[]).map((k) => {
                    const labels: Record<string, string> = { o:"SO#", c:"Customer", d:"Commit", ps:"Status", age:"Age", v:"Value", m:"Margin", ch:"Channel", sp:"Rep" };
                    return (
                      <th key={k} onClick={() => toggleSort(k)}
                        style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", userSelect: "none", color: sortKey === k ? HK.cta : HK.textSub }}>
                        {labels[k]}{sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                      </th>
                    );
                  })}
                  <th style={{ padding: "8px 12px", width: 32 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <>
                    <tr key={r.o}
                      onClick={() => toggleRow(r.o)}
                      style={{ borderBottom: `1px solid ${HK.border}`, cursor: "pointer", background: expanded.has(r.o) ? HK.band : "transparent" }}
                      onMouseEnter={(e) => { if (!expanded.has(r.o)) (e.currentTarget as HTMLElement).style.background = HK.band; }}
                      onMouseLeave={(e) => { if (!expanded.has(r.o)) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <td style={{ padding: "9px 12px", fontWeight: 600, color: HK.cta }}>{r.o}</td>
                      <td style={{ padding: "9px 12px", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.c}</td>
                      <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                        <span style={{ color: r.ov ? HK.error : HK.text }}>{fmtDate(r.d)}</span>
                        {r.ov && <span style={{ marginLeft: 4, fontSize: 10, color: HK.error }}>+{Math.abs(r.dtc)}d late</span>}
                        {!r.ov && r.dtc <= 3 && <span style={{ marginLeft: 4, fontSize: 10, color: "#D4537E" }}>⚠ {r.dtc}d left</span>}
                      </td>
                      <td style={{ padding: "9px 12px" }}>
                        <StatusBadge ps={r.ps} />
                      </td>
                      <td style={{ padding: "9px 12px" }}>
                        <AgeBadge age={r.age} />
                      </td>
                      <td style={{ padding: "9px 12px", fontWeight: 600 }}>{fmt$(r.v)}</td>
                      <td style={{ padding: "9px 12px" }}>{Math.round(r.m * 100)}%</td>
                      <td style={{ padding: "9px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: HK.band, border: `1px solid ${HK.border}` }}>
                          {CHAN_LABELS[r.ch]}
                        </span>
                      </td>
                      <td style={{ padding: "9px 12px", color: HK.textSub }}>{r.sp}</td>
                      <td style={{ padding: "9px 12px", textAlign: "center", color: HK.muted, fontSize: 16 }}>
                        {expanded.has(r.o) ? "▲" : "▼"}
                      </td>
                    </tr>
                    {expanded.has(r.o) && (
                      <tr key={r.o + "-lines"} style={{ borderBottom: `1px solid ${HK.border}`, background: "#F8F5EE" }}>
                        <td colSpan={10} style={{ padding: "8px 12px 12px 28px" }}>
                          <div style={{ fontSize: 11, color: HK.textSub, marginBottom: 6, fontWeight: 600 }}>Line Items — {r.dn}</div>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                            <thead>
                              <tr style={{ borderBottom: `1px solid ${HK.border}` }}>
                                {["Product","Category","Qty","Revenue","Margin $","Margin %"].map((h) => (
                                  <th key={h} style={{ padding: "4px 8px", textAlign: "left", color: HK.textSub, fontWeight: 600 }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {r.l.map((ln, i) => (
                                <tr key={i} style={{ borderBottom: i < r.l.length - 1 ? `1px solid ${HK.border}` : "none" }}>
                                  <td style={{ padding: "5px 8px", fontWeight: 500 }}>{ln.p}</td>
                                  <td style={{ padding: "5px 8px" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[ln.cat] ?? HK.muted, flexShrink: 0 }} />
                                      {ln.cat}
                                    </span>
                                  </td>
                                  <td style={{ padding: "5px 8px" }}>{ln.qo}</td>
                                  <td style={{ padding: "5px 8px" }}>{fmt$(ln.rv)}</td>
                                  <td style={{ padding: "5px 8px" }}>{fmt$(ln.mg)}</td>
                                  <td style={{ padding: "5px 8px" }}>{ln.ms}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ChartCard({ title, height, children }: { title: string; height: number; children: React.ReactNode }) {
  return (
    <div style={{ background: HK.white, border: `1px solid ${HK.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", background: HK.band, borderBottom: `1px solid ${HK.border}`, fontSize: 11, fontWeight: 600, color: HK.textSub }}>
        {title}
      </div>
      <div style={{ padding: 12, height, position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ ps }: { ps: keyof typeof STATUS_COLORS }) {
  const color = STATUS_COLORS[ps];
  const label = STATUS_LABELS[ps];
  const isOp = ps === "waiting_op";
  return (
    <span style={{
      fontSize: 11, padding: "2px 7px", borderRadius: 4,
      background: isOp ? "transparent" : color + "22",
      color: isOp ? color : color,
      border: `1px solid ${color}${isOp ? "" : "44"}`,
      fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

function AgeBadge({ age }: { age: number }) {
  const color = age >= 30 ? HK.error : age >= 14 ? HK.warning : HK.success;
  return (
    <span style={{ fontSize: 11, color, fontWeight: 600 }}>
      {age}d
    </span>
  );
}
