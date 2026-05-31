"use client";

/**
 * QCRMADemo — animated kanban board mockup.
 * Simulates QC inspection + RMA workflow: a card moves Draft → RMA Sent → Approved.
 * Loops every ~9 seconds.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type Card = { id: string; sku: string; vendor: string; value: string; isNew?: boolean };

const COLS = [
  { key: "draft",    label: "Draft",     color: "#6b7280" },
  { key: "sent",     label: "RMA Sent",  color: "#d97706" },
  { key: "approved", label: "Approved",  color: "#16a34a" },
];

// Initial state
const INIT: Record<string, Card[]> = {
  draft:    [
    { id: "VMA-001", sku: "HD-BASE-S1", vendor: "Metalworks",  value: "$1,240" },
    { id: "VMA-002", sku: "HD-ARM-T2",  vendor: "Premier",     value: "$2,100" },
  ],
  sent:     [{ id: "VMA-003", sku: "HD-BRKT-B3", vendor: "AliMetal", value: "$890"  }],
  approved: [{ id: "VMA-005", sku: "HD-PNL-P5",  vendor: "FineForm", value: "$3,200" }],
};

export function QCRMADemo({ accent }: { accent: string }) {
  // phase:
  //  0 = initial board
  //  1 = VMA-001 highlighted in draft
  //  2 = VMA-001 removed from draft, entering sent
  //  3 = reset
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 1800);  // highlight
    const t2 = setTimeout(() => setPhase(2), 3400);  // move
    const t3 = setTimeout(() => {
      setPhase(0);
      setCycle((c) => c + 1);
    }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [cycle]);

  const draftCards: Card[] =
    phase >= 2
      ? [INIT.draft[1]]
      : INIT.draft.map((c, i) => ({ ...c, isNew: false }));

  const sentCards: Card[] =
    phase >= 2
      ? [{ ...INIT.draft[0], isNew: true }, ...INIT.sent]
      : INIT.sent;

  const approvedCards = INIT.approved;

  const colData: Record<string, Card[]> = {
    draft:    draftCards,
    sent:     sentCards,
    approved: approvedCards,
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${accent}22`,
        transform: "rotate(-0.8deg)",
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
        <span style={{ marginLeft: 8, fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>
          Heckler Design — QC &amp; RMA
        </span>
      </div>

      {/* App nav */}
      <div style={{ background: "#2F3234", padding: "0 10px", display: "flex", gap: 0 }}>
        {["Inspections", "RMA Board", "Dispositions", "Reports"].map((tab, i) => (
          <div
            key={tab}
            style={{
              padding: "7px 10px",
              fontSize: 9.5,
              fontFamily: "system-ui",
              color: i === 1 ? accent : "rgba(255,255,255,0.4)",
              borderBottom: i === 1 ? `2px solid ${accent}` : "2px solid transparent",
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div
        style={{
          background: "#f0f2f5",
          padding: "10px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          minHeight: 220,
        }}
      >
        {COLS.map((col) => {
          const cards = colData[col.key];
          return (
            <div key={col.key} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {/* Column header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 6,
                  padding: "0 2px",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: col.color,
                  }}
                />
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    color: "#374151",
                    fontFamily: "system-ui",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {col.label}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 8,
                    color: "#9ca3af",
                    fontFamily: "system-ui",
                    background: "#e5e7eb",
                    padding: "1px 5px",
                    borderRadius: 999,
                  }}
                >
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <AnimatePresence mode="popLayout">
                  {cards.map((card) => {
                    const isHighlighted = phase === 1 && col.key === "draft" && card.id === "VMA-001";
                    return (
                      <motion.div
                        key={card.id + col.key}
                        layout
                        initial={{ opacity: 0, scale: 0.92, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 6 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          background: isHighlighted ? "#fffbeb" : "#fff",
                          borderRadius: 6,
                          padding: "7px 8px",
                          border: isHighlighted
                            ? `1px solid ${accent}60`
                            : card.isNew
                            ? `1px solid ${accent}50`
                            : "1px solid #e5e7eb",
                          boxShadow: isHighlighted
                            ? `0 0 0 2px ${accent}25`
                            : "0 1px 3px rgba(0,0,0,0.08)",
                          transition: "border 0.3s ease, background 0.3s ease",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 8,
                            fontWeight: 700,
                            color: "#374151",
                            fontFamily: "system-ui",
                            marginBottom: 2,
                          }}
                        >
                          {card.id}
                        </div>
                        <div
                          style={{
                            fontSize: 7.5,
                            color: "#6b7280",
                            fontFamily: "monospace",
                            marginBottom: 4,
                          }}
                        >
                          {card.sku}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 7,
                              color: "#9ca3af",
                              fontFamily: "system-ui",
                            }}
                          >
                            {card.vendor}
                          </span>
                          <span
                            style={{
                              fontSize: 7.5,
                              fontFamily: "monospace",
                              fontWeight: 600,
                              color: "#1f2937",
                            }}
                          >
                            {card.value}
                          </span>
                        </div>
                        {card.isNew && (
                          <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            style={{
                              marginTop: 5,
                              height: 2,
                              borderRadius: 999,
                              background: accent,
                              transformOrigin: "left",
                            }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Empty state placeholder */}
                {cards.length === 0 && (
                  <div
                    style={{
                      height: 50,
                      borderRadius: 6,
                      border: "1px dashed #d1d5db",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 7.5, color: "#d1d5db", fontFamily: "system-ui" }}>
                      Drop here
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "7px 12px",
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 8, color: "#9ca3af", fontFamily: "system-ui" }}>
          4 open RMAs · 2 pending disposition
        </span>
        <div
          style={{
            fontSize: 7.5,
            fontFamily: "system-ui",
            padding: "2px 7px",
            borderRadius: 999,
            background: accent + "18",
            color: accent,
            fontWeight: 600,
          }}
        >
          + New RMA
        </div>
      </div>
    </div>
  );
}
