"use client";

import { useState, type RefObject } from "react";
import { motion } from "framer-motion";

const stickers = [
  { id: 1, label: "ERP Owner", emoji: "🏆", rotation: -5, x: 62, y: 8 },
  { id: 2, label: "18+ Systems", emoji: "🎖️", rotation: 4, x: 78, y: 42 },
  { id: 3, label: "Odoo Expert", emoji: "🔧", rotation: -7, x: 8, y: 48 },
  { id: 4, label: "AI/MCP", emoji: "🤖", rotation: 6, x: 35, y: 5 },
  { id: 5, label: "ASU Alumni", emoji: "🎓", rotation: -3, x: 82, y: 72 },
];

interface DraggableStickersProps {
  constraintsRef: RefObject<HTMLDivElement | null>;
}

export function DraggableStickers({ constraintsRef }: DraggableStickersProps) {
  const [zOrder, setZOrder] = useState<number[]>(stickers.map(s => s.id));

  const bringToFront = (id: number) => {
    setZOrder(prev => [...prev.filter(i => i !== id), id]);
  };

  return (
    <>
      {stickers.map((sticker) => (
        <motion.div
          key={sticker.id}
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={() => bringToFront(sticker.id)}
          initial={{ rotate: sticker.rotation, scale: 0, opacity: 0 }}
          animate={{ rotate: sticker.rotation, scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 + sticker.id * 0.15, type: "spring", stiffness: 300, damping: 20 }}
          whileDrag={{
            scale: 1.12,
            rotate: sticker.rotation + 3,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            cursor: "grabbing",
          }}
          whileHover={{ scale: 1.05, cursor: "grab" }}
          style={{
            position: "absolute",
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            zIndex: zOrder.indexOf(sticker.id) + 20,
            touchAction: "none",
          }}
          className="select-none"
        >
          <div className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-surface/90 backdrop-blur-sm border border-border shadow-lg text-xs md:text-sm font-medium whitespace-nowrap">
            <span className="text-base md:text-lg">{sticker.emoji}</span>
            <span className="text-foreground">{sticker.label}</span>
          </div>
        </motion.div>
      ))}
    </>
  );
}
