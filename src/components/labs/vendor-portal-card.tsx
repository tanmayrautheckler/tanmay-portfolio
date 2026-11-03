"use client";

/**
 * Vendor Portal demo — supplier RMA + credit-note flow.
 *
 * Preview card (animated) → full-screen modal with the live interactive app.
 * Pure React/framer (no chart lib). Sanitized synthetic data.
 *
 * Usable flow: filter/search/sort RMAs → select → pick disposition →
 * approve → issue credit note (animated) → status advances + toast.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Search, Check, FileText, ChevronRight, Camera } from "lucide-react";
import { useIsMobile } from "./use-is-mobile";

// ── Heckler tokens ──────────────────────────────────────────────────────────────
const HK = {
  black: "#2F3234", white: "#FDFCF8", band: "#F4F1EA", cta: "#0EBBFF",
  success: "#73D277", warning: "#EFC761", error: "#F66F51", muted: "#9B9891",
  border: "#E5E1D8", text: "#2F3234", textSub: "#6B6762",
};

type Status = "reported" | "approved" | "credited";
type Disp = "return" | "scrap" | "rework" | "credit" | null;

interface RMA {
  id: string; vendor: string; sku: string; part: string;
  defect: string; qty: number; unit: number; photos: number;
  disp: Disp; status: Status; date: string; reason: string;
}

const SEED: RMA[] = [
  { id: "RMA-2041", vendor: "Metalworks Co",  sku: "HD-BASE-S1", part: "Mounting Base S1", defect: "Bent flange",     qty: 24, unit: 52,  photos: 3, disp: "credit", status: "approved", date: "May 22", reason: "Press tooling drift — flange out of spec 2.1mm" },
  { id: "RMA-2042", vendor: "Premier Mfg",    sku: "HD-ARM-T2",  part: "Monitor Arm T2",   defect: "Loose pivot",     qty: 12, unit: 88,  photos: 2, disp: null,     status: "reported", date: "May 24", reason: "Pivot tension below threshold on 12 units" },
  { id: "RMA-2043", vendor: "AliMetal",       sku: "HD-BRKT-B3", part: "Wall Bracket B3",  defect: "Wrong finish",    qty: 40, unit: 19,  photos: 4, disp: "return", status: "reported", date: "May 25", reason: "Matte shipped instead of powder-coat black" },
  { id: "RMA-2044", vendor: "FineForm",       sku: "HD-CLIP-C4", part: "Cable Clip C4",    defect: "Cracked tab",     qty: 200,unit: 3.2, photos: 1, disp: "scrap",  status: "approved", date: "May 20", reason: "Resin batch brittle — tabs snap on install" },
  { id: "RMA-2045", vendor: "Premier Mfg",    sku: "HD-PNL-P5",  part: "Side Panel P5",    defect: "Scratches",       qty: 7,  unit: 64,  photos: 5, disp: "rework", status: "approved", date: "May 18", reason: "Handling damage in transit, cosmetic" },
  { id: "RMA-2046", vendor: "Metalworks Co",  sku: "HD-HNG-H6", part: "Hinge Assy H6",    defect: "Missing pin",     qty: 30, unit: 11,  photos: 2, disp: "credit", status: "credited", date: "May 12", reason: "Pin omitted on sub-assembly line" },
  { id: "RMA-2047", vendor: "Coastal Parts",  sku: "HD-FOOT-F7", part: "Rubber Foot F7",   defect: "Wrong durometer", qty: 500,unit: 0.8, photos: 1, disp: "credit", status: "credited", date: "May 09", reason: "Softer compound than spec — slips" },
  { id: "RMA-2048", vendor: "AliMetal",       sku: "HD-PLT-P8",  part: "Base Plate P8",    defect: "Burr edges",      qty: 60, unit: 14,  photos: 3, disp: null,     status: "reported", date: "May 27", reason: "Deburr step skipped, sharp edges" },
];

const DISP_META: Record<NonNullable<Disp>, { label: string; color: string }> = {
  return: { label: "Return", color: HK.cta },
  scrap:  { label: "Scrap",  color: HK.error },
  rework: { label: "Rework", color: HK.warning },
  credit: { label: "Credit", color: HK.success },
};

const STATUS_META: Record<Status, { label: string; color: string; bg: string }> = {
  reported: { label: "Reported", color: "#92400e", bg: "#fef3c7" },
  approved: { label: "Approved", color: "#1e40af", bg: "#dbeafe" },
  credited: { label: "Credited", color: "#15803d", bg: "#dcfce7" },
};

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString();

// ════════════════════════════════════════════════════════════════════════════════
// Public card (preview + modal)
// ════════════════════════════════════════════════════════════════════════════════
export function VendorPortalDemoCard() {
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
          <motion.div
            key="vp-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)" }}
          >
            <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 shrink-0"
              style={{ background: HK.black, borderBottom: "1px solid #444" }}>
              <div className="min-w-0 flex items-center gap-3">
                <Package className="w-4 h-4" style={{ color: HK.cta }} />
                <span className="truncate" style={{ color: HK.white, fontWeight: 600, fontSize: 14 }}>Vendor Portal — RMA & Credits</span>
                <span className="hidden sm:inline" style={{ color: HK.muted, fontSize: 11 }}>· Interactive demo · Sanitized data</span>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: HK.muted }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-auto overscroll-contain" style={{ background: HK.white }}>
              <VendorPortalApp />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Interactive app
// ════════════════════════════════════════════════════════════════════════════════
export function VendorPortalApp() {
  const [rmas, setRmas] = useState<RMA[]>(SEED);
  const [selId, setSelId] = useState<string>(SEED[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [sortKey, setSortKey] = useState<"date" | "value">("date");
  const [toast, setToast] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const showToast = (msg: string) => {
    setToast(msg);
    // auto-hide handled by key remount + CSS; simple timeout
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rmas
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => !q || r.id.toLowerCase().includes(q) || r.vendor.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q) || r.part.toLowerCase().includes(q))
      .sort((a, b) => sortKey === "value" ? (b.qty * b.unit) - (a.qty * a.unit) : b.date.localeCompare(a.date));
  }, [rmas, search, statusFilter, sortKey]);

  const sel = rmas.find((r) => r.id === selId) ?? null;

  const metrics = useMemo(() => {
    const open = rmas.filter((r) => r.status !== "credited").length;
    const pendingCredit = rmas.filter((r) => r.status === "approved" && r.disp === "credit").length;
    const creditValue = rmas.filter((r) => r.status === "credited").reduce((s, r) => s + r.qty * r.unit, 0);
    return { open, pendingCredit, creditValue, total: rmas.length };
  }, [rmas]);

  const setDisp = (id: string, disp: Disp) =>
    setRmas((prev) => prev.map((r) => (r.id === id ? { ...r, disp } : r)));

  const approve = (id: string) => {
    setRmas((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
    showToast(`${id} approved`);
  };

  const issueCredit = (id: string) => {
    setRmas((prev) => prev.map((r) => (r.id === id ? { ...r, status: "credited" } : r)));
    showToast(`Credit note drafted for ${id}`);
  };

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", color: HK.text, fontSize: 13, minHeight: "100%" }}>
      {/* Toolbar */}
      <div style={{ background: HK.band, borderBottom: `1px solid ${HK.border}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: HK.success }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: HK.black }}>Supplier RMA Queue</span>
          <span style={{ color: HK.muted, fontSize: 11 }}>· {filtered.length} of {rmas.length}</span>
        </div>
        <div style={{ position: "relative" }}>
          <Search className="w-3.5 h-3.5" style={{ position: "absolute", left: 8, top: 7, color: HK.muted }} />
          <input aria-label="Search supplier returns" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search RMA / vendor / SKU…"
            style={{ padding: "5px 10px 5px 28px", border: `1px solid ${HK.border}`, borderRadius: 6, fontSize: 12, background: HK.white, color: HK.text, width: 210, outline: "none" }} />
        </div>
        <select aria-label="Sort supplier returns" value={sortKey} onChange={(e) => setSortKey(e.target.value as "date" | "value")}
          style={{ padding: "5px 8px", border: `1px solid ${HK.border}`, borderRadius: 6, fontSize: 12, background: HK.white, color: HK.text }}>
          <option value="date">Newest</option>
          <option value="value">Highest value</option>
        </select>
      </div>

      {/* Status filter chips */}
      <div style={{ padding: "10px 16px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {([["all", "All"], ["reported", "Reported"], ["approved", "Approved"], ["credited", "Credited"]] as [("all" | Status), string][]).map(([k, label]) => {
          const active = statusFilter === k;
          return (
            <button key={k} aria-pressed={active} onClick={() => setStatusFilter(k)}
              style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer",
                background: active ? HK.black : HK.white, color: active ? HK.white : HK.textSub,
                border: `1px solid ${active ? HK.black : HK.border}`, transition: "all .15s" }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Metric strip */}
      <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 8 }}>
        {[
          { label: "Open RMAs", value: metrics.open, color: HK.black, sub: "awaiting resolution" },
          { label: "Pending Credit", value: metrics.pendingCredit, color: HK.warning, sub: "approved · not issued" },
          { label: "Credit Issued", value: fmt$(metrics.creditValue), color: HK.success, sub: "this period" },
          { label: "Total RMAs", value: metrics.total, color: HK.cta, sub: "in queue" },
        ].map((m) => (
          <div key={m.label} style={{ background: HK.band, border: `1px solid ${HK.border}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: HK.textSub, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: m.color, lineHeight: 1 }}>{String(m.value)}</div>
            <div style={{ fontSize: 10, color: HK.muted, marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Split: list + detail (stacks on mobile) */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) minmax(0,420px)", gap: 12, padding: "4px 16px 20px", alignItems: "start" }}>
        {/* List */}
        <div style={{ border: `1px solid ${HK.border}`, borderRadius: 8, overflow: "hidden", background: HK.white }}>
          <div style={{ display: "grid", gridTemplateColumns: "84px 1fr 84px 86px", background: HK.band, borderBottom: `1px solid ${HK.border}`, padding: "7px 12px" }}>
            {["RMA", "Vendor / Part", "Value", "Status"].map((h) => (
              <div key={h} style={{ fontSize: 9.5, fontWeight: 600, color: HK.textSub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          <AnimatePresence initial={false}>
            {filtered.map((r, i) => {
              const active = r.id === selId;
              const st = STATUS_META[r.status];
              return (
                <motion.button key={r.id} type="button" aria-pressed={active} layout
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => setSelId(r.id)}
                  style={{ display: "grid", width: "100%", textAlign: "left", gridTemplateColumns: "84px 1fr 84px 86px", padding: "9px 12px", cursor: "pointer",
                    borderBottom: `1px solid ${HK.band}`, alignItems: "center",
                    background: active ? "#eff6ff" : "transparent",
                    boxShadow: active ? `inset 3px 0 0 ${HK.cta}` : "none" }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: HK.text }}>{r.id}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: HK.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.part}</div>
                    <div style={{ fontSize: 10, color: HK.muted }}>{r.vendor} · {r.defect}</div>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: HK.text }}>{fmt$(r.qty * r.unit)}</div>
                  <div>
                    <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div style={{ padding: 28, textAlign: "center", fontSize: 12, color: HK.muted }}>No RMAs match.</div>
          )}
        </div>

        {/* Detail panel */}
        <div style={{ position: "sticky", top: 8 }}>
          <AnimatePresence mode="wait">
            {sel && (
              <motion.div key={sel.id}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{ border: `1px solid ${HK.border}`, borderRadius: 10, overflow: "hidden", background: HK.white }}>
                <DetailPanel rma={sel} onSetDisp={setDisp} onApprove={approve} onIssueCredit={issueCredit} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 210,
              background: HK.black, color: HK.white, padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
            <Check className="w-4 h-4" style={{ color: HK.success }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Detail panel ─────────────────────────────────────────────────────────────────
function DetailPanel({ rma, onSetDisp, onApprove, onIssueCredit }: {
  rma: RMA; onSetDisp: (id: string, d: Disp) => void; onApprove: (id: string) => void; onIssueCredit: (id: string) => void;
}) {
  const steps: { key: Status; label: string }[] = [
    { key: "reported", label: "Reported" },
    { key: "approved", label: "Approved" },
    { key: "credited", label: "Credit Issued" },
  ];
  const stepIdx = steps.findIndex((s) => s.key === rma.status);
  const canApprove = rma.status === "reported";
  const canCredit = rma.status === "approved" && rma.disp === "credit";

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "12px 14px", background: HK.band, borderBottom: `1px solid ${HK.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: HK.black }}>{rma.id}</span>
          <span style={{ fontSize: 11, color: HK.muted }}>{rma.date}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{rma.part}</div>
        <div style={{ fontSize: 11, color: HK.textSub }}>{rma.vendor} · {rma.sku}</div>
      </div>

      {/* Body */}
      <div style={{ padding: 14 }}>
        {/* Quick facts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { l: "Qty", v: String(rma.qty) },
            { l: "Unit", v: fmt$(rma.unit) },
            { l: "Value", v: fmt$(rma.qty * rma.unit) },
          ].map((x) => (
            <div key={x.l} style={{ background: HK.band, borderRadius: 6, padding: "7px 9px" }}>
              <div style={{ fontSize: 9.5, color: HK.muted }}>{x.l}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{x.v}</div>
            </div>
          ))}
        </div>

        {/* Defect + photos */}
        <div style={{ fontSize: 10, color: HK.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Defect</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: HK.error, marginBottom: 4 }}>{rma.defect}</div>
        <div style={{ fontSize: 11.5, color: HK.textSub, lineHeight: 1.5, marginBottom: 10 }}>{rma.reason}</div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {Array.from({ length: rma.photos }).map((_, i) => (
            <div key={i} style={{ width: 46, height: 46, borderRadius: 6, background: `linear-gradient(135deg, ${HK.band}, #e7e2d8)`,
              border: `1px solid ${HK.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera className="w-4 h-4" style={{ color: HK.muted }} />
            </div>
          ))}
          <span style={{ alignSelf: "center", fontSize: 10, color: HK.muted, marginLeft: 2 }}>{rma.photos} photos</span>
        </div>

        {/* Disposition picker */}
        <div style={{ fontSize: 10, color: HK.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Disposition</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
          {(Object.keys(DISP_META) as NonNullable<Disp>[]).map((d) => {
            const active = rma.disp === d;
            const meta = DISP_META[d];
            const locked = rma.status === "credited";
            return (
              <button key={d} aria-pressed={active} disabled={locked} onClick={() => onSetDisp(rma.id, active ? null : d)}
                style={{ padding: "8px 4px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: locked ? "default" : "pointer",
                  background: active ? meta.color : HK.white, color: active ? HK.white : HK.textSub,
                  border: `1px solid ${active ? meta.color : HK.border}`, opacity: locked && !active ? 0.45 : 1, transition: "all .15s" }}>
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <div style={{ fontSize: 10, color: HK.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Status</div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
          {steps.map((s, i) => {
            const done = i <= stepIdx;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "0 0 auto" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <motion.div animate={{ background: done ? HK.success : HK.band, scale: i === stepIdx ? 1.12 : 1 }}
                    style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid ${done ? HK.success : HK.border}` }}>
                    {done ? <Check className="w-3 h-3" style={{ color: HK.white }} /> : <span style={{ fontSize: 9, color: HK.muted }}>{i + 1}</span>}
                  </motion.div>
                  <span style={{ fontSize: 9, color: done ? HK.text : HK.muted, fontWeight: done ? 600 : 400, whiteSpace: "nowrap" }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, margin: "0 4px", marginBottom: 14, background: HK.band, borderRadius: 2, overflow: "hidden" }}>
                    <motion.div animate={{ width: i < stepIdx ? "100%" : "0%" }} transition={{ duration: 0.4 }}
                      style={{ height: "100%", background: HK.success }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {rma.status === "credited" ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ border: `1px solid ${HK.success}`, background: "#f0fdf4", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <FileText className="w-4 h-4" style={{ color: HK.success }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#15803d" }}>Credit Note · Draft</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: HK.textSub }}>{rma.vendor}</span>
              <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt$(rma.qty * rma.unit)}</span>
            </div>
            <div style={{ fontSize: 10.5, color: HK.muted, marginTop: 4 }}>Sample credit draft. No accounting entry is posted.</div>
          </motion.div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            {canApprove && (
              <button onClick={() => onApprove(rma.id)}
                style={{ flex: 1, padding: "10px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  background: HK.cta, color: HK.white, border: "none" }}>
                Approve RMA
              </button>
            )}
            <button onClick={() => canCredit && onIssueCredit(rma.id)} disabled={!canCredit}
              style={{ flex: 1, padding: "10px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                cursor: canCredit ? "pointer" : "not-allowed",
                background: canCredit ? HK.success : HK.band, color: canCredit ? HK.white : HK.muted, border: "none",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <FileText className="w-3.5 h-3.5" /> Issue Credit Note
            </button>
          </div>
        )}
        {rma.status === "approved" && rma.disp !== "credit" && (
          <div style={{ fontSize: 10.5, color: HK.muted, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <ChevronRight className="w-3 h-3" /> Set disposition to <b style={{ color: HK.success }}>&nbsp;Credit</b>&nbsp; to issue a credit note.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Preview card (animated) ───────────────────────────────────────────────────────
function PreviewCard({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const rows = [
    { id: "RMA-2041", part: "Mounting Base", st: "Approved", c: "#dbeafe", tc: "#1e40af" },
    { id: "RMA-2042", part: "Monitor Arm",   st: "Reported", c: "#fef3c7", tc: "#92400e" },
    { id: "RMA-2046", part: "Hinge Assy",    st: "Credited", c: "#dcfce7", tc: "#15803d" },
  ];
  const bars = [{ pct: 50, c: HK.warning, l: "Reported 50%" }, { pct: 25, c: HK.cta, l: "Approved 25%" }, { pct: 25, c: HK.success, l: "Credited 25%" }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="relative rounded-2xl border cursor-pointer overflow-hidden flex flex-col"
      style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onOpen}
    >
      <motion.div className="absolute inset-0 pointer-events-none rounded-2xl" animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }} style={{ boxShadow: "inset 0 0 50px rgba(14,187,255,0.07)" }} />
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono font-bold"
        style={{ background: HK.success, color: "#1a1a1a" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> LIVE DEMO
      </div>

      <div className="p-4 pb-2">
        {/* metric chips */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[{ l: "Open", v: "6" }, { l: "Pending", v: "3" }, { l: "Credit", v: "$3.2K" }, { l: "RMAs", v: "8" }].map((s) => (
            <div key={s.l} className="rounded-lg p-2.5" style={{ background: HK.band, border: `1px solid ${HK.border}` }}>
              <div style={{ fontSize: 9, color: HK.muted, marginBottom: 2, fontFamily: "monospace" }}>{s.l}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: HK.black, lineHeight: 1 }}>{s.v}</div>
            </div>
          ))}
        </div>
        {/* status bar */}
        <div className="rounded-lg p-3 mb-2.5" style={{ background: HK.band, border: `1px solid ${HK.border}` }}>
          <div style={{ fontSize: 9, color: HK.muted, fontFamily: "monospace", marginBottom: 8 }}>RMA STATUS MIX</div>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-2.5">
            {bars.map((b, i) => (
              <motion.div key={b.l} style={{ background: b.c, height: "100%" }} initial={{ width: 0 }}
                animate={{ width: hovered ? `${b.pct}%` : "0%" }} transition={{ duration: 0.55, delay: i * 0.07, ease: [0.25, 1, 0.5, 1] }} />
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            {bars.map((b) => (
              <div key={b.l} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: b.c }} />
                <span style={{ fontSize: 9, color: HK.textSub }}>{b.l}</span>
              </div>
            ))}
          </div>
        </div>
        {/* mini rows */}
        <div className="rounded-lg p-2" style={{ background: HK.band, border: `1px solid ${HK.border}` }}>
          {rows.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: hovered ? 1 : 0.5, x: hovered ? 0 : -4 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 4px" }}>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: HK.text }}>{r.id}</span>
              <span style={{ fontSize: 10, color: HK.textSub, flex: 1, marginLeft: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.part}</span>
              <span style={{ fontSize: 8.5, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: r.c, color: r.tc }}>{r.st}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 mt-auto">
        <div className="font-semibold text-sm text-foreground mb-0.5">Vendor Portal</div>
        <div className="text-[11px] mb-2" style={{ color: "var(--text-secondary)" }}>Supplier RMA + credit-note flow · Odoo 19</div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {["Odoo 19", "Portal", "RMA", "Credit Notes"].map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-mono"
              style={{ background: `${HK.cta}18`, color: HK.cta, border: `1px solid ${HK.cta}30` }}>{t}</span>
          ))}
          <span className="ml-auto text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: HK.cta }}>
            Launch demo <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
