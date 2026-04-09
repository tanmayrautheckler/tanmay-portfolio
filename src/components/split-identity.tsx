"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function SplitIdentity() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden cursor-col-resize select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* ═══ LEFT SIDE — Systems Architect (dark/tech) ═══ */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <div className="w-full h-full bg-[#0a0a1a] relative overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "linear-gradient(rgba(14,187,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,187,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
          {/* Floating code snippets */}
          <div className="absolute top-[15%] left-[8%] text-cyan-500/20 font-mono text-xs leading-relaxed">
            <div>search_read(&quot;sale.order&quot;)</div>
            <div>fields=[&quot;name&quot;, &quot;amount&quot;]</div>
            <div>domain=[[&quot;state&quot;,&quot;=&quot;,&quot;sale&quot;]]</div>
          </div>
          <div className="absolute top-[35%] right-[15%] text-cyan-500/15 font-mono text-[10px] leading-relaxed">
            <div>SELECT product_id, SUM(qty)</div>
            <div>FROM stock_move</div>
            <div>GROUP BY product_id</div>
          </div>
          <div className="absolute bottom-[25%] left-[12%] text-purple-500/15 font-mono text-[10px]">
            <div>Manufacturing → Shipping → Invoice</div>
            <div>→ Bank Reconciliation → Done</div>
          </div>
          {/* Glow orbs */}
          <div className="absolute top-[20%] right-[20%] w-40 h-40 rounded-full bg-cyan-500/10 blur-[80px]" />
          <div className="absolute bottom-[20%] left-[10%] w-32 h-32 rounded-full bg-purple-500/10 blur-[60px]" />
          {/* Content */}
          <div className="absolute bottom-12 left-8 md:left-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: sliderPos > 20 ? 1 : 0, y: sliderPos > 20 ? 0 : 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-cyan-400 text-xs font-mono tracking-wider uppercase mb-2">Systems</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">architect</h2>
              <p className="text-gray-400 text-sm max-w-xs">
                ERP architecture, business process design,<br />integrations, and cost accounting.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT SIDE — Manufacturing Engineer (warm/industrial) ═══ */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
        <div className="w-full h-full bg-[#1a1008] relative overflow-hidden">
          {/* Industrial pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(245,158,11,0.3) 20px, rgba(245,158,11,0.3) 21px)",
          }} />
          {/* Floating manufacturing text */}
          <div className="absolute top-[15%] right-[8%] text-orange-500/20 font-mono text-xs leading-relaxed text-right">
            <div>BOM: 35+ components</div>
            <div>Routings: xEdge, C64, Kongsberg</div>
            <div>Yield tracking: 98.2%</div>
          </div>
          <div className="absolute top-[40%] left-[15%] text-orange-500/15 font-mono text-[10px]">
            <div>ASME Section VIII</div>
            <div>ISO 9001 Certified</div>
            <div>Zero safety incidents</div>
          </div>
          <div className="absolute bottom-[30%] right-[12%] text-amber-500/15 font-mono text-[10px]">
            <div>5S · Kaizen · VSM · SPC · FMEA</div>
          </div>
          {/* Glow orbs */}
          <div className="absolute top-[20%] left-[20%] w-40 h-40 rounded-full bg-orange-500/10 blur-[80px]" />
          <div className="absolute bottom-[20%] right-[10%] w-32 h-32 rounded-full bg-amber-500/10 blur-[60px]" />
          {/* Content */}
          <div className="absolute bottom-12 right-8 md:right-12 z-10 text-right">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: sliderPos < 80 ? 1 : 0, y: sliderPos < 80 ? 0 : 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-orange-400 text-xs font-mono tracking-wider uppercase mb-2">Manufacturing</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">engineer</h2>
              <p className="text-gray-400 text-sm max-w-xs ml-auto">
                BOMs, routings, quality control,<br />Lean manufacturing, and production planning.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ CENTER DIVIDER ═══ */}
      <div
        className="absolute top-0 bottom-0 z-20 flex items-center"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
      >
        {/* Line */}
        <div className="w-px h-full bg-white/30" />
        {/* Handle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 8L1 5M4 8L1 11M4 8H12M12 8L15 5M12 8L15 11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Instruction */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-[10px] text-white/40 bg-black/30 backdrop-blur px-3 py-1 rounded-full">
        ← Drag to explore →
      </div>
    </div>
  );
}
