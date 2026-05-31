"use client";

/**
 * VendorPortalDemo — animated product table mockup.
 * Simulates Heckler's vendor portal: rows load in, one row's status badge
 * cycles Overdue → In Review every ~8 seconds.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const ROWS = [
  { sku: "HD-BASE-S1", product: "Mounting Base S1",  vendor: "Metalworks",     qty: "48",  status: "ready"   },
  { sku: "HD-ARM-T2",  product: "Monitor Arm T2",    vendor: "Premier",        qty: "12",  status: "pending" },
  { sku: "HD-BRKT-B3", product: "Wall Bracket B3",   vendor: "AliMetal",       qty: "0",   status: "overdue" },
  { sku: "HD-CLIP-C4", product: "Cable Clip C4",     vendor: "FineForm",       qty: "200", status: "ready"   },
  { sku: "HD-PNL-P5",  product: "Side Panel P5",     vendor: "Premier",        qty: "7",   status: "pending" },
];

const BADGE: Record<string, { label: string; bg: string; color: string }> = {
  ready:   { label: "Ready",     bg: "#dcfce7", color: "#15803d" },
  pending: { label: "Pending",   bg: "#fef3c7", color: "#92400e" },
  overdue: { label: "Overdue",   bg: "#fee2e2", color: "#b91c1c" },
  review:  { label: "In Review", bg: "#dbeafe", color: "#1e40af" },
};

export function VendorPortalDemo({ accent }: { accent: string }) {
  const [cycle, setCycle] = useState(0);
  const [reviewActive, setReviewActive] = useState(false);

  useEffect(() => {
    setReviewActive(false);
    const t1 = setTimeout(() => setReviewActive(true),  3000);
    const t2 = setTimeout(() => {
      setReviewActive(false);
      setCycle((c) => c + 1);
    }, 7200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [cycle]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${accent}22`,
        transform: "rotate(-1deg)",
      }}
    >
      {/* macOS window chrome */}
      <div
        style={{
          background: "#1e2432",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
        ))}
        <span
          style={{
            marginLeft: 8,
            fontSize: 10,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Heckler Design — Vendor Portal
        </span>
      </div>

      {/* App nav */}
      <div
        style={{
          background: "#2F3234",
          padding: "0 10px",
          display: "flex",
          gap: 0,
        }}
      >
        {["Products", "Vendors", "RMA", "Deliveries"].map((tab, i) => (
          <div
            key={tab}
            style={{
              padding: "7px 10px",
              fontSize: 9.5,
              fontFamily: "system-ui, sans-serif",
              color: i === 0 ? accent : "rgba(255,255,255,0.4)",
              borderBottom: i === 0 ? `2px solid ${accent}` : "2px solid transparent",
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Search row */}
      <div
        style={{
          background: "#f9fafb",
          padding: "6px 10px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 20,
            borderRadius: 4,
            border: "1px solid #d1d5db",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "0 6px",
          }}
        >
          <span style={{ fontSize: 8.5, color: "#9ca3af", fontFamily: "system-ui" }}>
            Search products...
          </span>
        </div>
        {["All", "Active"].map((f, i) => (
          <div
            key={f}
            style={{
              padding: "2px 7px",
              borderRadius: 999,
              fontSize: 8,
              fontFamily: "system-ui",
              background: i === 0 ? accent : "transparent",
              color: i === 0 ? "#fff" : "#6b7280",
              border: i === 0 ? "none" : "1px solid #d1d5db",
            }}
          >
            {f}
          </div>
        ))}
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "76px 1fr 70px 38px 66px",
          background: "#f3f4f6",
          borderBottom: "1px solid #e5e7eb",
          padding: "5px 10px",
        }}
      >
        {["SKU", "Product", "Vendor", "Qty", "Status"].map((h) => (
          <div
            key={h}
            style={{
              fontSize: 8,
              fontWeight: 600,
              color: "#6b7280",
              fontFamily: "system-ui",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {ROWS.map((row, i) => {
        const isLive = reviewActive && i === 2;
        const statusKey = isLive ? "review" : row.status;
        const badge = BADGE[statusKey];

        return (
          <motion.div
            key={`${cycle}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.25, ease: "easeOut" }}
            style={{
              display: "grid",
              gridTemplateColumns: "76px 1fr 70px 38px 66px",
              padding: "6px 10px",
              borderBottom: "1px solid #f3f4f6",
              background: isLive ? "#eff6ff" : i % 2 === 0 ? "#fff" : "#fafafa",
              transition: "background 0.3s ease",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 8.5, fontFamily: "monospace", color: "#9ca3af" }}>
              {row.sku}
            </div>
            <div
              style={{
                fontSize: 8.5,
                fontFamily: "system-ui",
                color: "#1f2937",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.product}
            </div>
            <div style={{ fontSize: 8.5, fontFamily: "system-ui", color: "#6b7280" }}>
              {row.vendor}
            </div>
            <div
              style={{
                fontSize: 8.5,
                fontFamily: "monospace",
                color: "#374151",
                textAlign: "right",
              }}
            >
              {row.qty}
            </div>
            <motion.div
              animate={{ backgroundColor: badge.bg, color: badge.color }}
              transition={{ duration: 0.35 }}
              style={{
                fontSize: 7.5,
                fontFamily: "system-ui",
                fontWeight: 700,
                padding: "2px 5px",
                borderRadius: 999,
                textAlign: "center",
                whiteSpace: "nowrap",
                backgroundColor: badge.bg,
                color: badge.color,
              }}
            >
              {badge.label}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Footer */}
      <div
        style={{
          padding: "7px 10px",
          background: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 8, color: "#9ca3af", fontFamily: "system-ui" }}>
          5 of 398 products
        </span>
        <div style={{ display: "flex", gap: 3 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                width: 18,
                height: 16,
                borderRadius: 3,
                background: n === 1 ? accent : "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 7.5,
                color: n === 1 ? "#fff" : "#9ca3af",
                fontFamily: "system-ui",
                fontWeight: 600,
              }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
