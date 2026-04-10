"use client";

import Image from "next/image";
import { BrowserFrame, OdooFrame, TerminalFrame, ChatFrame } from "./browser-frame";

/* ═══════════════════════════════════════════════════════════
   CSS-GENERATED UI MOCKUPS FOR PROJECT CASE STUDIES
   Real data from actual repos — no filler
   ═══════════════════════════════════════════════════════════ */

/* ─── VENDOR MANAGEMENT PORTAL (heckler-vendor-returns) ─── */

export function AEIDashboard() {
  return (
    <BrowserFrame url="vendor.hecklerdesign.com/dashboard">
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Active Products", value: "398", delta: "+12", color: "text-cyan-400" },
            { label: "Open POs", value: "47", delta: "+3", color: "text-amber-400" },
            { label: "In Transit", value: "23", delta: "", color: "text-purple-400" },
            { label: "Pending Returns", value: "8", delta: "-2", color: "text-rose-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-lg p-3 border border-white/5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</div>
              <div className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</div>
              {s.delta && <div className="text-[10px] text-emerald-400 mt-0.5">{s.delta} this week</div>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 bg-white/5 rounded-lg p-4 border border-white/5">
            <div className="text-[11px] text-white/40 mb-3">PO Volume — Last 6 Months</div>
            <div className="flex items-end gap-1.5 h-20">
              {[40, 55, 38, 65, 72, 58, 80, 45, 68, 75, 90, 62].map((h, i) => (
                <div key={i} className="flex-1 bg-cyan-400/20 rounded-sm" style={{ height: `${h}%` }}>
                  <div className="w-full bg-cyan-400/60 rounded-sm" style={{ height: `${Math.min(100, h + 10)}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
            <div className="text-[11px] text-white/40 mb-3">Delivery Status</div>
            <div className="space-y-2">
              {[
                { label: "On Time", pct: 78, color: "bg-emerald-400" },
                { label: "Delayed", pct: 15, color: "bg-amber-400" },
                { label: "Critical", pct: 7, color: "bg-rose-400" },
              ].map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between text-[10px] text-white/30 mb-1">
                    <span>{d.label}</span><span>{d.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <div className="text-[11px] text-white/40 mb-3">Recent Activity</div>
          <div className="space-y-2">
            {[
              { action: "PO #3291 confirmed", time: "2m ago", dot: "bg-emerald-400" },
              { action: "Return RET-0047 approved", time: "15m ago", dot: "bg-cyan-400" },
              { action: "Price update: HD-STD-BLK", time: "1h ago", dot: "bg-amber-400" },
              { action: "Delivery DEL-892 received", time: "3h ago", dot: "bg-purple-400" },
            ].map((a) => (
              <div key={a.action} className="flex items-center gap-2 text-[11px]">
                <div className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
                <span className="text-white/50 flex-1">{a.action}</span>
                <span className="text-white/20">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function AEIProductsTable() {
  return (
    <BrowserFrame url="vendor.hecklerdesign.com/products">
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-white/5 rounded-md px-3 py-1.5 text-[11px] text-white/20 border border-white/5">
            Search 398 products...
          </div>
          <div className="flex gap-2">
            {["All", "Active", "On Hold"].map((f, i) => (
              <div key={f} className={`px-2.5 py-1 text-[10px] rounded-md border ${i === 0 ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/20" : "text-white/30 border-white/5"}`}>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="border border-white/5 rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-white/3 text-[10px] text-white/30 uppercase tracking-wider border-b border-white/5">
            <span>SKU</span><span>Product</span><span>Heckler SKU</span><span>Price</span><span>Kanban Qty</span><span>Status</span>
          </div>
          {[
            { sku: "AEI-MNT-001", name: "WindFall Stand — Black", hsku: "HD-WF-BLK", price: "$42.50", qty: "150", status: "Active" },
            { sku: "AEI-MNT-002", name: "WindFall Stand — White", hsku: "HD-WF-WHT", price: "$42.50", qty: "120", status: "Active" },
            { sku: "AEI-KSK-010", name: "Kiosk Floor Stand 10.2\"", hsku: "HD-KSK-10", price: "$185.00", qty: "45", status: "Active" },
            { sku: "AEI-PWR-003", name: "PoE Splitter USB-C", hsku: "HD-POE-C", price: "$28.00", qty: "200", status: "Active" },
            { sku: "AEI-CSE-015", name: "Checkout Stand — iPad Pro", hsku: "HD-CO-PRO", price: "$295.00", qty: "30", status: "On Hold" },
            { sku: "AEI-ACC-022", name: "Cable Pivot — Lightning", hsku: "HD-CPV-LT", price: "$18.50", qty: "0", status: "Low Stock" },
          ].map((row) => (
            <div key={row.sku} className="grid grid-cols-6 gap-2 px-3 py-2.5 border-b border-white/3 text-[11px] hover:bg-white/3 transition-colors">
              <span className="text-cyan-400 font-mono text-[10px]">{row.sku}</span>
              <span className="text-white/60 truncate">{row.name}</span>
              <span className="text-white/30 font-mono text-[10px]">{row.hsku}</span>
              <span className="text-white/50">{row.price}</span>
              <span className="text-white/50">{row.qty}</span>
              <span className={`text-[10px] ${row.status === "Active" ? "text-emerald-400" : row.status === "On Hold" ? "text-amber-400" : "text-rose-400"}`}>{row.status}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 text-[10px] text-white/20">
          <span>Showing 6 of 398</span>
          <div className="flex gap-1">
            {[1, 2, 3, "...", 67].map((p, i) => (
              <div key={i} className={`w-6 h-6 flex items-center justify-center rounded ${p === 1 ? "bg-cyan-400/10 text-cyan-400" : "text-white/30"}`}>{p}</div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function AEIReturnWizard() {
  return (
    <BrowserFrame url="vendor.hecklerdesign.com/returns/new">
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-6">
          {["Select PO", "Choose Items", "Reason & Qty", "Review"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 2 ? "bg-cyan-400 text-black" : i === 2 ? "border border-cyan-400 text-cyan-400" : "border border-white/10 text-white/20"}`}>
                {i < 2 ? "✓" : i + 1}
              </div>
              <span className={`text-[11px] ${i <= 2 ? "text-white/60" : "text-white/20"}`}>{step}</span>
              {i < 3 && <div className={`w-8 h-px ${i < 2 ? "bg-cyan-400/30" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>
        <div className="bg-white/3 rounded-lg border border-white/5 p-4 space-y-4">
          <div className="text-[13px] text-white/70 font-medium">Step 3: Reason & Quantities</div>
          <div className="space-y-3">
            {[
              { item: "WindFall Stand — Black (x5)", reason: "Structural / Welding" },
              { item: "Kiosk Floor Stand 10.2\" (x2)", reason: "Powder Coat Issue" },
            ].map((item) => (
              <div key={item.item} className="bg-white/3 rounded-md p-3 border border-white/5">
                <div className="text-[11px] text-white/50">{item.item}</div>
                <div className="flex gap-3 mt-2">
                  <div className="flex-1">
                    <div className="text-[9px] text-white/20 uppercase mb-1">Defect Type</div>
                    <div className="bg-white/5 rounded px-2 py-1 text-[11px] text-amber-400 border border-white/5">{item.reason}</div>
                  </div>
                  <div className="w-20">
                    <div className="text-[9px] text-white/20 uppercase mb-1">Qty</div>
                    <div className="bg-white/5 rounded px-2 py-1 text-[11px] text-white/50 border border-white/5 text-center">
                      {item.item.includes("x5") ? "5" : "2"}
                    </div>
                  </div>
                  <div className="w-20">
                    <div className="text-[9px] text-white/20 uppercase mb-1">Severity</div>
                    <div className="bg-rose-500/10 rounded px-2 py-1 text-[10px] text-rose-400 border border-rose-500/20 text-center">
                      Critical
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <div className="px-3 py-1.5 text-[11px] text-white/30 border border-white/8 rounded-md">← Back</div>
          <div className="px-4 py-1.5 text-[11px] text-black font-medium bg-cyan-400 rounded-md">Review Return →</div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function AEIVendorPortal() {
  return (
    <BrowserFrame url="vendor.hecklerdesign.com/portal">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-[10px] font-bold text-white">AE</div>
            <div>
              <div className="text-[12px] text-white/60 font-medium">AEI Corporation</div>
              <div className="text-[10px] text-white/20">Vendor Portal — Read Only</div>
            </div>
          </div>
          <div className="px-2 py-0.5 text-[9px] text-amber-400 bg-amber-400/10 rounded border border-amber-400/20">RESTRICTED</div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Your Products", value: "398" },
            { label: "Open POs", value: "12" },
            { label: "Pending Actions", value: "3" },
          ].map((s) => (
            <div key={s.label} className="bg-white/3 rounded-lg p-3 border border-white/5 text-center">
              <div className="text-lg font-bold text-white/60">{s.value}</div>
              <div className="text-[10px] text-white/25">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white/3 rounded-lg border border-white/5 p-3">
          <div className="text-[11px] text-white/40 mb-2">Recent Orders</div>
          {[
            { po: "PO-3291", date: "Mar 28", items: "24 items", status: "Confirmed" },
            { po: "PO-3288", date: "Mar 25", items: "18 items", status: "Shipped" },
            { po: "PO-3285", date: "Mar 22", items: "36 items", status: "Delivered" },
          ].map((o) => (
            <div key={o.po} className="flex items-center gap-3 py-2 border-b border-white/3 last:border-0 text-[11px]">
              <span className="text-cyan-400 font-mono text-[10px]">{o.po}</span>
              <span className="text-white/25">{o.date}</span>
              <span className="text-white/40 flex-1">{o.items}</span>
              <span className={`text-[10px] ${o.status === "Delivered" ? "text-emerald-400" : o.status === "Shipped" ? "text-purple-400" : "text-cyan-400"}`}>{o.status}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ─── QC + VENDOR RMA MODULE (heckler-qc-vendor) ─── */
/* Using REAL field names and defect types from the actual Odoo module */

export function RMAFormView() {
  return (
    <OdooFrame>
      <div className="p-4 md:p-6 bg-[#0f1117]">
        <div className="flex items-center gap-2 mb-4 text-[11px]">
          <span className="text-white/30">Purchase</span>
          <span className="text-white/15">/</span>
          <span className="text-white/30">Vendor RMA</span>
          <span className="text-white/15">/</span>
          <span className="text-white/50">VRMA/0047</span>
          <div className="ml-auto flex gap-2">
            <div className="px-2 py-0.5 text-[10px] bg-amber-400/15 text-amber-400 rounded">Sent to Vendor</div>
          </div>
        </div>
        {/* Smart buttons */}
        <div className="flex gap-2 mb-4">
          {[
            { label: "Purchase Order", value: "PO-3247", icon: "📋" },
            { label: "Returns", value: "1", icon: "↩" },
            { label: "Credit Notes", value: "1", icon: "$" },
          ].map((btn) => (
            <div key={btn.label} className="bg-white/3 rounded-md px-3 py-2 border border-white/5 text-center min-w-[100px]">
              <div className="text-[14px] mb-0.5">{btn.icon}</div>
              <div className="text-[12px] text-cyan-400 font-medium">{btn.value}</div>
              <div className="text-[9px] text-white/25">{btn.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white/3 rounded-lg border border-white/5 p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] text-white/20 uppercase mb-1">Vendor (partner_id)</div>
              <div className="text-[12px] text-white/60">AEI Corporation</div>
            </div>
            <div>
              <div className="text-[9px] text-white/20 uppercase mb-1">Source PO (purchase_order_id)</div>
              <div className="text-[12px] text-cyan-400 font-mono">PO-3247</div>
            </div>
            <div>
              <div className="text-[9px] text-white/20 uppercase mb-1">Source Receipt (picking_id)</div>
              <div className="text-[12px] text-white/60">HD/IN/08273</div>
            </div>
            <div>
              <div className="text-[9px] text-white/20 uppercase mb-1">Responsible (user_id)</div>
              <div className="text-[12px] text-white/60">Tanmay Raut</div>
            </div>
          </div>
        </div>
        {/* Defect lines with real defect types */}
        <div className="bg-white/3 rounded-lg border border-white/5 overflow-hidden mb-4">
          <div className="px-4 py-2 border-b border-white/5 text-[11px] text-white/40">Defective Items (vendor.rma.line)</div>
          <div className="divide-y divide-white/3">
            {[
              { product: "WindFall Stand — Black", lot: "LOT-2024-847", defect: "structural", desc: "Weld crack on base plate", severity: "critical", disposition: "credit_scrap_replace", fault: "vendor", credit: "$212.50" },
              { product: "Kiosk Floor Stand 10.2\"", lot: "LOT-2024-851", defect: "powder_coat", desc: "Bubbling on arm surface", severity: "major", disposition: "—", fault: "—", credit: "—" },
            ].map((line) => (
              <div key={line.lot} className="px-4 py-3 grid grid-cols-6 gap-2 items-center text-[11px]">
                <div className="text-white/50">{line.product}</div>
                <div className={`text-[10px] px-1.5 py-0.5 rounded ${line.defect === "structural" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>{line.defect === "structural" ? "Structural / Welding" : "Powder Coat Issue"}</div>
                <div className={`text-[10px] ${line.severity === "critical" ? "text-rose-400 font-medium" : "text-amber-400"}`}>{line.severity}</div>
                <div className={`text-[10px] ${line.disposition === "—" ? "text-white/15" : "text-emerald-400"}`}>{line.disposition === "—" ? "Pending" : "Credit, Scrap & Replace"}</div>
                <div className="text-[10px] text-white/25">{line.fault === "—" ? "—" : "100% Vendor"}</div>
                <div className={`text-[10px] font-mono ${line.credit === "—" ? "text-white/15" : "text-cyan-400"}`}>{line.credit}</div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-white/5 flex justify-end gap-6">
            <span className="text-[11px] text-white/30">Total: <span className="text-white/50 font-medium">$582.50</span></span>
            <span className="text-[11px] text-white/30">Credit: <span className="text-cyan-400 font-medium">$212.50</span></span>
          </div>
        </div>
        {/* Chatter */}
        <div className="bg-white/3 rounded-lg border border-white/5 p-3">
          <div className="text-[11px] text-white/40 mb-2">Chatter (mail.thread)</div>
          <div className="space-y-2 text-[10px]">
            <div className="flex gap-2"><span className="text-white/15">Mar 15</span><span className="text-white/30">VRMA/0047 created by Tanmay Raut</span></div>
            <div className="flex gap-2"><span className="text-white/15">Mar 15</span><span className="text-white/30">Email sent to AEI Corporation — &quot;Action Required&quot;</span></div>
            <div className="flex gap-2"><span className="text-white/15">Mar 16</span><span className="text-cyan-400/50">AEI set disposition: Credit, Scrap & Replace (line 1)</span></div>
            <div className="flex gap-2"><span className="text-white/15">Mar 16</span><span className="text-white/30">📎 2 photos attached by AEI via portal</span></div>
          </div>
        </div>
      </div>
    </OdooFrame>
  );
}

export function RMAFlowDiagram() {
  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/5 p-6 md:p-8">
      <div className="text-[11px] text-white/30 uppercase tracking-wider mb-6 text-center">vendor.rma State Machine</div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2">
        {[
          { label: "Draft", sub: "Create RMA", color: "border-white/20 text-white/40" },
          { label: "Sent", sub: "Email + portal", color: "border-cyan-400/30 text-cyan-400" },
          { label: "Vendor Responded", sub: "Dispositions set", color: "border-amber-400/30 text-amber-400" },
          { label: "Confirmed", sub: "Auto-generate docs", color: "border-purple-400/30 text-purple-400" },
          { label: "Done", sub: "Closed", color: "border-emerald-400/30 text-emerald-400" },
        ].map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className={`border rounded-lg px-3 py-2.5 text-center min-w-[110px] ${step.color}`}>
              <div className="text-[11px] font-medium">{step.label}</div>
              <div className="text-[9px] opacity-50 mt-0.5">{step.sub}</div>
            </div>
            {i < 4 && <div className="text-white/10 text-sm hidden md:block">→</div>}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <div className="inline-block border border-amber-400/20 rounded-lg px-3 py-2 text-center">
          <div className="text-[11px] text-amber-400">Awaiting Parts</div>
          <div className="text-[9px] text-white/20">replacement/rework in transit</div>
        </div>
        <div className="text-[9px] text-white/15 mt-1">↑ branches from Confirmed when disposition requires replacement</div>
      </div>
      <div className="mt-6 flex justify-center gap-6 text-[10px] text-white/20">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400/40" /> Draft Credit Note</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400/40" /> Return Picking</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-400/40" /> Scrap Record</div>
      </div>
    </div>
  );
}

export function RMADispositionGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {[
        { name: "Credit & Scrap", desc: "Credit note + scrap record", icon: "✕$", color: "text-emerald-400 border-emerald-400/20" },
        { name: "Credit, Scrap & Replace", desc: "Credit + scrap + replacement receipt", icon: "↻$", color: "text-cyan-400 border-cyan-400/20" },
        { name: "Return, Credit & Rework", desc: "Ship back + credit + reworked part", icon: "↩$", color: "text-purple-400 border-purple-400/20" },
        { name: "Replace (No Credit)", desc: "Vendor sends replacement only", icon: "↻", color: "text-amber-400 border-amber-400/20" },
        { name: "Heckler Touch-Up", desc: "In-house repair, no vendor action", icon: "⚙", color: "text-white/40 border-white/10" },
        { name: "Scrap (Heckler Fault)", desc: "Scrap, no credit — our mistake", icon: "✕", color: "text-rose-400 border-rose-400/20" },
      ].map((d) => (
        <div key={d.name} className={`border rounded-lg p-3 bg-white/[0.02] ${d.color}`}>
          <div className="text-lg mb-1 opacity-60">{d.icon}</div>
          <div className="text-[12px] font-medium">{d.name}</div>
          <div className="text-[10px] opacity-40 mt-0.5">{d.desc}</div>
        </div>
      ))}
    </div>
  );
}

export function RMADefectTypes() {
  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/5 p-6">
      <div className="text-[11px] text-white/30 uppercase tracking-wider mb-4">15 Defect Types (from actual module)</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[
          "Scratched / Cosmetic", "Structural / Welding", "Loose PEM / Post",
          "Missing PEM / Post", "Missing Components", "Missing Threaded Post",
          "Powder Coat Issue", "Laser / Cutting Issue", "Dimensional / Out of Spec",
          "Fit / Assembly Problem", "Bent", "PEM Press Issue",
          "Damaged in Shipping", "Wrong Metal / Material", "Other",
        ].map((defect) => (
          <div key={defect} className="text-[11px] text-white/30 bg-white/3 rounded px-2.5 py-1.5 border border-white/5">
            {defect}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-[10px] text-white/20">
        <span>Severity: <span className="text-rose-400">Critical</span> / <span className="text-amber-400">Major</span> / <span className="text-white/30">Minor</span></span>
        <span>Fault: <span className="text-rose-400">Vendor 100%</span> / <span className="text-amber-400">Shared 50/50</span> / <span className="text-white/30">Heckler 0%</span></span>
      </div>
    </div>
  );
}

export function RMAVendorPortal() {
  return (
    <BrowserFrame url="hecklerdesign.com/my/vendor-rma/47">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] text-white/60 font-medium">VRMA/0047 — Awaiting Your Response</div>
          <div className="px-2 py-0.5 text-[10px] bg-rose-400/15 text-rose-400 rounded">ACTION NEEDED</div>
        </div>
        {/* Photo gallery */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="aspect-square bg-white/5 rounded-lg border border-white/5 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white/10 text-2xl mb-1">📸</div>
                <div className="text-[9px] text-white/15">Defect Photo {n}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Portal-writable fields */}
        <div className="bg-white/3 rounded-lg border border-white/5 p-4">
          <div className="text-[11px] text-white/40 mb-3">Set Disposition for: WindFall Stand — Black</div>
          <div className="text-[9px] text-white/15 mb-2">Portal can only write: disposition, disposition_note, date_scheduled_return</div>
          <div className="grid grid-cols-2 gap-2">
            {["Credit & Scrap", "Credit, Scrap & Replace", "Return, Credit & Rework", "Replace (No Credit)"].map((opt, i) => (
              <div key={opt} className={`text-[11px] rounded-md px-3 py-2 text-center border transition-colors ${i === 1 ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/20" : "text-white/30 border-white/5"}`}>
                {opt}
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-[9px] text-white/20 uppercase mb-1">Disposition Note</div>
            <div className="bg-white/5 rounded px-2 py-2 text-[11px] text-white/30 border border-white/5 h-10">
              Will ship replacement in next batch...
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <div className="px-4 py-1.5 text-[11px] text-black font-medium bg-cyan-400 rounded-md">Submit Disposition</div>
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ─── AI-TO-ERP CONNECTOR (MCP) ─── */

export function MCPChat() {
  return (
    <ChatFrame>
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="bg-white/5 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
            <p className="text-[12px] text-white/60">What&apos;s our current inventory value for finished goods? And which products have the highest BOM cost?</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <div className="bg-white/3 rounded-2xl rounded-bl-md px-4 py-3 border border-white/5">
              <p className="text-[12px] text-white/50 mb-3">Let me query your Odoo inventory for that data.</p>
              <div className="bg-white/3 rounded-lg p-2.5 border border-white/5 mb-3">
                <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-mono">search_records</span>
                </div>
                <div className="font-mono text-[10px] text-white/25 pl-3.5">
                  model: &quot;product.product&quot;<br />
                  domain: [[&quot;type&quot;, &quot;=&quot;, &quot;product&quot;]]<br />
                  fields: [&quot;name&quot;, &quot;standard_price&quot;, &quot;qty_available&quot;]
                </div>
              </div>
              <p className="text-[12px] text-white/50">Here&apos;s a breakdown of your finished goods inventory:</p>
              <div className="mt-2 border border-white/5 rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 gap-2 px-3 py-1.5 bg-white/3 text-[9px] text-white/25 uppercase">
                  <span>Product</span><span className="text-right">Unit Cost</span><span className="text-right">Value</span>
                </div>
                {[
                  { name: "Kiosk Floor Stand", cost: "$185.00", value: "$8,325.00" },
                  { name: "WindFall Stand", cost: "$42.50", value: "$6,375.00" },
                  { name: "Checkout Stand Pro", cost: "$295.00", value: "$5,900.00" },
                ].map((r) => (
                  <div key={r.name} className="grid grid-cols-3 gap-2 px-3 py-1.5 border-t border-white/3 text-[10px]">
                    <span className="text-white/40">{r.name}</span>
                    <span className="text-white/25 text-right font-mono">{r.cost}</span>
                    <span className="text-emerald-400/60 text-right font-mono">{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-white/50 mt-3"><strong className="text-white/70">Total inventory value: $127,450</strong> across 398 SKUs.</p>
            </div>
          </div>
        </div>
      </div>
    </ChatFrame>
  );
}

export function MCPTerminal() {
  return (
    <TerminalFrame>
      <div className="text-green-400/60">
        <div className="text-white/20 mb-3">$ python -m mcp_odoo_server</div>
        <div className="space-y-1">
          <div><span className="text-cyan-400/50">[INFO]</span> <span className="text-white/30">MCP Odoo Server v1.2.0 starting...</span></div>
          <div><span className="text-cyan-400/50">[INFO]</span> <span className="text-white/30">Connected to Odoo 19 via XML-RPC</span></div>
          <div><span className="text-cyan-400/50">[INFO]</span> <span className="text-white/30">Database: heckler_production</span></div>
          <div><span className="text-cyan-400/50">[INFO]</span> <span className="text-white/30">Cloudflare Tunnel: active ✓</span></div>
          <div><span className="text-emerald-400/50">[READY]</span> <span className="text-white/30">Listening for MCP requests...</span></div>
          <div className="text-white/10 mt-2">───────────────────────────────────</div>
          <div className="mt-2"><span className="text-purple-400/50">[REQ]</span> <span className="text-white/25">search_records → product.product (398 results)</span></div>
          <div><span className="text-purple-400/50">[REQ]</span> <span className="text-white/25">aggregate_records → stock.valuation.layer</span></div>
          <div><span className="text-purple-400/50">[REQ]</span> <span className="text-white/25">describe_model → mrp.bom</span></div>
          <div><span className="text-emerald-400/50">[OK]</span> <span className="text-white/25">3 requests served in 1.2s</span></div>
        </div>
      </div>
    </TerminalFrame>
  );
}

export function MCPArchitecture() {
  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/5 p-6 md:p-8">
      <div className="text-[11px] text-white/30 uppercase tracking-wider mb-6 text-center">System Architecture</div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
        <div className="border border-purple-400/20 rounded-xl px-5 py-4 text-center bg-purple-400/[0.03] min-w-[130px]">
          <div className="text-2xl mb-1">🤖</div>
          <div className="text-[12px] text-purple-400 font-medium">Claude AI</div>
          <div className="text-[9px] text-white/20 mt-1">Natural language</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-white/10 text-sm hidden md:block">⟷</div>
          <div className="text-[9px] text-white/15">MCP Protocol</div>
        </div>
        <div className="border border-cyan-400/20 rounded-xl px-5 py-4 text-center bg-cyan-400/[0.03] min-w-[130px]">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-[12px] text-cyan-400 font-medium">MCP Server</div>
          <div className="text-[9px] text-white/20 mt-1">Python + XML-RPC</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-white/10 text-sm hidden md:block">⟷</div>
          <div className="text-[9px] text-white/15">Cloudflare Tunnel</div>
        </div>
        <div className="border border-emerald-400/20 rounded-xl px-5 py-4 text-center bg-emerald-400/[0.03] min-w-[130px]">
          <div className="text-2xl mb-1">🏭</div>
          <div className="text-[12px] text-emerald-400 font-medium">Odoo 19 ERP</div>
          <div className="text-[9px] text-white/20 mt-1">All business data</div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["search", "read", "create", "update", "aggregate", "introspect"].map((cap) => (
          <div key={cap} className="px-2.5 py-1 text-[10px] text-cyan-400/50 bg-cyan-400/5 rounded-md border border-cyan-400/10 font-mono">
            {cap}()
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PRINTER CAPACITY PLANNER ─── */

export function PrinterOccupancyDashboard() {
  return (
    <BrowserFrame url="heckler.odoo.com/web#action=printer_capacity_planner.occupancy_dashboard">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[13px] text-white/60 font-medium">3D Printer Capacity — Next 14 Days</div>
          <div className="flex gap-2 text-[10px]">
            <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 rounded">Feasible</span>
            <span className="px-2 py-0.5 bg-amber-400/10 text-amber-400 rounded">At Risk</span>
            <span className="px-2 py-0.5 bg-rose-400/10 text-rose-400 rounded">Over Capacity</span>
          </div>
        </div>
        {/* Today's status */}
        <div className="bg-amber-400/5 border border-amber-400/15 rounded-lg p-4 flex items-center gap-4">
          <div className="text-3xl font-bold text-amber-400">87%</div>
          <div>
            <div className="text-[12px] text-amber-400 font-medium">Today — At Risk</div>
            <div className="text-[10px] text-white/25">146.2 / 168.0 hrs booked (30 printers × 8 hrs × 70% eff)</div>
          </div>
        </div>
        {/* Timeline bars */}
        <div className="space-y-1">
          {[
            { day: "Mon 7", pct: 87, status: "at_risk" },
            { day: "Tue 8", pct: 72, status: "feasible" },
            { day: "Wed 9", pct: 95, status: "over" },
            { day: "Thu 10", pct: 68, status: "feasible" },
            { day: "Fri 11", pct: 81, status: "feasible" },
            { day: "Mon 14", pct: 45, status: "feasible" },
            { day: "Tue 15", pct: 92, status: "over" },
          ].map((d) => (
            <div key={d.day} className="flex items-center gap-3">
              <span className="text-[10px] text-white/25 w-12 text-right font-mono">{d.day}</span>
              <div className="flex-1 h-5 bg-white/3 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all ${d.status === "over" ? "bg-rose-400/40" : d.status === "at_risk" ? "bg-amber-400/40" : "bg-emerald-400/30"}`}
                  style={{ width: `${Math.min(100, d.pct)}%` }}
                />
              </div>
              <span className={`text-[10px] w-10 text-right font-mono ${d.status === "over" ? "text-rose-400" : d.status === "at_risk" ? "text-amber-400" : "text-emerald-400"}`}>{d.pct}%</span>
            </div>
          ))}
        </div>
        {/* Config */}
        <div className="grid grid-cols-4 gap-3 text-center">
          {[
            { label: "Printers", value: "30" },
            { label: "Hrs/Printer/Day", value: "8.0" },
            { label: "Efficiency", value: "70%" },
            { label: "Daily Capacity", value: "168 hrs" },
          ].map((c) => (
            <div key={c.label} className="bg-white/3 rounded-lg p-2 border border-white/5">
              <div className="text-[14px] font-bold text-white/50">{c.value}</div>
              <div className="text-[9px] text-white/20">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function PrinterCapacityCheck() {
  return (
    <OdooFrame>
      <div className="p-4 md:p-6 bg-[#0f1117]">
        <div className="text-[11px] text-white/30 mb-3">Manufacturing Order: MO/00482 — Kiosk Floor Stand (×50)</div>
        <div className="bg-amber-400/5 border border-amber-400/15 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-[14px]">⚠️</div>
            <div>
              <div className="text-[12px] text-amber-400 font-medium">At Risk — April 15</div>
              <div className="text-[10px] text-white/25">Current: 86.4% → Projected: 93.9% with this MO (+12.5 hrs)</div>
            </div>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-amber-400/50 rounded-full" style={{ width: "94%" }} />
          </div>
          <div className="flex justify-between text-[9px] text-white/20">
            <span>0%</span><span className="text-amber-400">85% risk threshold</span><span>100%</span>
          </div>
        </div>
        <div className="bg-white/3 rounded-lg border border-white/5 p-4">
          <div className="text-[11px] text-white/40 mb-3">Suggested Alternatives</div>
          <div className="space-y-2">
            {[
              { date: "April 17 (Thu)", pct: "65%", status: "Feasible" },
              { date: "April 18 (Fri)", pct: "72%", status: "Feasible" },
              { date: "April 21 (Mon)", pct: "45%", status: "Feasible" },
            ].map((alt) => (
              <div key={alt.date} className="flex items-center gap-3 text-[11px]">
                <span className="text-white/40 flex-1">{alt.date}</span>
                <span className="text-emerald-400 font-mono text-[10px]">{alt.pct}</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-400/10 text-emerald-400 rounded">{alt.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OdooFrame>
  );
}

/* ─── ATTENDANCE GATE ─── */

export function AttendanceGateMockup() {
  return (
    <BrowserFrame url="heckler.odoo.com/web#action=mrp.mrp_workcenter_kanban_action">
      <div className="relative h-[280px] overflow-hidden">
        {/* Blurred background content */}
        <div className="absolute inset-0 p-4 filter blur-sm opacity-30">
          <div className="grid grid-cols-3 gap-3">
            {["WO-124 Assembly", "WO-125 Print Job", "WO-126 QC Check"].map((wo) => (
              <div key={wo} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-[11px] text-white/30">{wo}</div>
                <div className="h-2 bg-white/5 rounded mt-2 w-2/3" />
              </div>
            ))}
          </div>
        </div>
        {/* Gate overlay */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-4">
            <div className="text-3xl">🕐</div>
          </div>
          <div className="text-[16px] text-white/70 font-medium mb-1">Clock In Required</div>
          <div className="text-[11px] text-white/25 mb-6">You must clock in before accessing work orders</div>
          <div className="px-8 py-2.5 bg-emerald-500 text-white text-[13px] font-medium rounded-lg">
            Clock In
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function AttendanceWorkingPanel() {
  return (
    <BrowserFrame url="heckler.odoo.com/web#action=mrp.mrp_workcenter_kanban_action">
      <div className="relative h-[280px] overflow-hidden">
        {/* Visible content */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { wo: "WO-124", task: "Assembly — Kiosk Stand", status: "In Progress" },
              { wo: "WO-125", task: "3D Print — Bracket v2", status: "Ready" },
              { wo: "WO-126", task: "QC Check — WindFall Batch", status: "Ready" },
            ].map((item) => (
              <div key={item.wo} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-[10px] text-cyan-400 font-mono">{item.wo}</div>
                <div className="text-[11px] text-white/50 mt-1">{item.task}</div>
                <div className={`text-[9px] mt-2 px-1.5 py-0.5 rounded inline-block ${item.status === "In Progress" ? "bg-cyan-400/10 text-cyan-400" : "bg-white/5 text-white/25"}`}>{item.status}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom control panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a2e] border-t border-white/10 px-4 py-3 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex-1">
            <div className="text-[11px] text-white/50">Manufacturing / Assembly</div>
            <div className="text-[10px] text-white/20">Clocked in at 8:02 AM</div>
          </div>
          <div className="font-mono text-[16px] text-white/60 tracking-wider">02:34:17</div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 text-[10px] bg-amber-500/20 text-amber-400 rounded border border-amber-500/20">Break</div>
            <div className="px-3 py-1.5 text-[10px] bg-rose-500/20 text-rose-400 rounded border border-rose-500/20">Clock Out</div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ─── TRIP COMMAND ─── */

export function TripCommandDashboard() {
  return (
    <BrowserFrame url="app.tripcommand.io/admin">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[14px] text-white/60 font-medium">DMC Operations Hub</div>
          <div className="flex gap-2 text-[10px]">
            <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 rounded">3 Active Trips</span>
            <span className="px-2 py-0.5 bg-amber-400/10 text-amber-400 rounded">1 Delayed</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Active Trips", value: "3", color: "text-cyan-400" },
            { label: "Pending Bookings", value: "7", color: "text-amber-400" },
            { label: "Fleet Available", value: "12/18", color: "text-emerald-400" },
            { label: "Delayed Flights", value: "1", color: "text-rose-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-lg p-3 border border-white/5">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-white/25 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Cascade alert */}
        <div className="bg-rose-400/5 border border-rose-400/15 rounded-lg p-3">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-rose-400 font-medium">⚠ Flight Delay Cascade</span>
            <span className="text-white/25">TK1847 Istanbul → delayed 2.5hrs</span>
          </div>
          <div className="text-[10px] text-white/20 mt-1">
            → 2 bookings auto-adjusted → 1 driver re-notified via WhatsApp → Agency SMS sent
          </div>
        </div>
        {/* Bookings table */}
        <div className="border border-white/5 rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-white/3 text-[10px] text-white/25 uppercase border-b border-white/5">
            <span>Booking</span><span>Guest</span><span>Driver</span><span>Pickup</span><span>Status</span>
          </div>
          {[
            { id: "BK-001", guest: "Martinez Family", driver: "Ahmed K.", time: "14:30", status: "Confirmed" },
            { id: "BK-002", guest: "Johnson Corp", driver: "Mehmet A.", time: "16:00", status: "Delayed" },
            { id: "BK-003", guest: "Chen Group", driver: "Unassigned", time: "18:00", status: "Pending" },
          ].map((b) => (
            <div key={b.id} className="grid grid-cols-5 gap-2 px-3 py-2 border-b border-white/3 text-[11px]">
              <span className="text-cyan-400 font-mono text-[10px]">{b.id}</span>
              <span className="text-white/40">{b.guest}</span>
              <span className={b.driver === "Unassigned" ? "text-white/15 italic" : "text-white/40"}>{b.driver}</span>
              <span className="text-white/30">{b.time}</span>
              <span className={`text-[10px] ${b.status === "Confirmed" ? "text-emerald-400" : b.status === "Delayed" ? "text-rose-400" : "text-amber-400"}`}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function TripCommandDriverApp() {
  return (
    <div className="max-w-[280px] mx-auto">
      <div className="rounded-[2rem] border-4 border-white/10 overflow-hidden shadow-2xl">
        {/* Phone status bar */}
        <div className="bg-[#0a0e1a] px-6 py-2 flex justify-between text-[10px] text-white/40">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <span>📶</span><span>🔋</span>
          </div>
        </div>
        {/* App content */}
        <div className="bg-[#0a0e1a] px-4 pb-4 space-y-3 min-h-[350px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[13px] text-white/60 font-medium">Ahmed K.</div>
              <div className="text-[10px] text-emerald-400">● Online</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[12px] font-bold text-white">AK</div>
          </div>
          {/* Current trip card */}
          <div className="bg-white/5 rounded-xl p-3 border border-cyan-400/20">
            <div className="text-[9px] text-cyan-400 uppercase tracking-wider mb-1">Current Trip</div>
            <div className="text-[12px] text-white/60 font-medium">Martinez Family — Airport Transfer</div>
            <div className="flex justify-between mt-2 text-[10px]">
              <span className="text-white/25">IST Airport → Hotel Sultanahmet</span>
            </div>
            <div className="mt-2 flex gap-2">
              <div className="flex-1 h-1 bg-cyan-400/30 rounded-full">
                <div className="h-full bg-cyan-400 rounded-full w-2/3" />
              </div>
            </div>
            <div className="text-[10px] text-white/25 mt-1">ETA: 22 min</div>
          </div>
          {/* Alert */}
          <div className="bg-amber-400/5 rounded-lg p-2.5 border border-amber-400/15">
            <div className="text-[10px] text-amber-400 font-medium">Next: BK-002 pickup at 16:00</div>
            <div className="text-[9px] text-white/20">Johnson Corp — delayed flight, new pickup 18:30</div>
          </div>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Today", value: "3 trips" },
              { label: "Earnings", value: "$240" },
              { label: "Rating", value: "4.9★" },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 rounded-lg p-2 text-center border border-white/5">
                <div className="text-[12px] text-white/50 font-medium">{s.value}</div>
                <div className="text-[9px] text-white/20">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SCREENSHOT WRAPPER ─── */

export function ScreenshotFrame({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="w-full h-auto"
          priority={false}
        />
      </div>
      {caption && <p className="text-[12px] text-white/25 mt-3">{caption}</p>}
    </div>
  );
}

/* ─── MOCKUP REGISTRY ─── */
export const mockups: Record<string, React.FC> = {
  "aei-dashboard": AEIDashboard,
  "aei-products": AEIProductsTable,
  "aei-return-wizard": AEIReturnWizard,
  "aei-vendor-portal": AEIVendorPortal,
  "rma-form": RMAFormView,
  "rma-flow": RMAFlowDiagram,
  "rma-dispositions": RMADispositionGrid,
  "rma-defect-types": RMADefectTypes,
  "rma-vendor-portal": RMAVendorPortal,
  "mcp-chat": MCPChat,
  "mcp-terminal": MCPTerminal,
  "mcp-architecture": MCPArchitecture,
  "printer-dashboard": PrinterOccupancyDashboard,
  "printer-capacity-check": PrinterCapacityCheck,
  "attendance-gate": AttendanceGateMockup,
  "attendance-working": AttendanceWorkingPanel,
  "trip-dashboard": TripCommandDashboard,
  "trip-driver": TripCommandDriverApp,
};
