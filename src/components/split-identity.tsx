"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function SplitIdentity() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  // Animated nodes for the systems side
  const systemNodes = [
    { x: "12%", y: "20%", label: "Lead", delay: 0 },
    { x: "30%", y: "15%", label: "Quote", delay: 0.2 },
    { x: "20%", y: "40%", label: "SO", delay: 0.4 },
    { x: "35%", y: "35%", label: "MO", delay: 0.6 },
    { x: "15%", y: "60%", label: "Ship", delay: 0.8 },
    { x: "32%", y: "55%", label: "Invoice", delay: 1.0 },
    { x: "25%", y: "75%", label: "Payment", delay: 1.2 },
  ];

  // Animated gears for manufacturing side
  const gearPositions = [
    { x: "70%", y: "25%", size: 60, speed: 3 },
    { x: "82%", y: "35%", size: 40, speed: -4 },
    { x: "75%", y: "50%", size: 50, speed: 2.5 },
    { x: "88%", y: "18%", size: 30, speed: -5 },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[550px] md:h-[650px] rounded-3xl overflow-hidden cursor-col-resize select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* ═══ LEFT — Systems Architect ═══ */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <div className="w-full h-full bg-[#050520] relative overflow-hidden">
          {/* Animated grid */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" className="opacity-[0.07]">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0EBBFF" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Animated flow nodes */}
          {mounted && systemNodes.map((node, i) => (
            <motion.div
              key={node.label}
              className="absolute"
              style={{ left: node.x, top: node.y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ delay: node.delay, duration: 0.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
            >
              <div className="relative">
                <div className="w-14 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-[9px] text-cyan-300 font-mono">{node.label}</span>
                </div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-lg border border-cyan-400/20"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: node.delay }}
                />
              </div>
            </motion.div>
          ))}

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
            <motion.line x1="15%" y1="24%" x2="30%" y2="19%" stroke="#0EBBFF" strokeWidth="1" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.line x1="25%" y1="19%" x2="22%" y2="40%" stroke="#0EBBFF" strokeWidth="1" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.3, repeat: Infinity }} />
            <motion.line x1="22%" y1="44%" x2="35%" y2="39%" stroke="#0EBBFF" strokeWidth="1" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.6, repeat: Infinity }} />
            <motion.line x1="17%" y1="64%" x2="32%" y2="59%" stroke="#0EBBFF" strokeWidth="1" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.9, repeat: Infinity }} />
          </svg>

          {/* Terminal typing */}
          <motion.div
            className="absolute bottom-[30%] left-[8%] font-mono text-[10px] text-cyan-500/30 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TypingText texts={[
              "$ odoo-rpc search sale.order",
              "→ 3,292 records found",
              "$ compute manufacturing_cost",
              "→ $12.47 per unit",
              "$ reconcile bank_statement",
              "→ All matched ✓",
            ]} />
          </motion.div>

          {/* Glow */}
          <div className="absolute top-[30%] left-[25%] w-60 h-60 rounded-full bg-cyan-500/8 blur-[100px]" />
          <div className="absolute bottom-[10%] left-[5%] w-40 h-40 rounded-full bg-indigo-500/8 blur-[80px]" />

          {/* Content */}
          <div className="absolute bottom-8 left-6 md:left-10 z-10">
            <motion.div animate={{ opacity: sliderPos > 15 ? 1 : 0 }} transition={{ duration: 0.2 }}>
              <div className="text-cyan-400 text-[10px] font-mono tracking-[0.3em] uppercase mb-2">Systems</div>
              <h2 className="text-5xl md:text-6xl font-bold text-white/90 tracking-tight">architect</h2>
              <p className="text-gray-500 text-xs mt-2 max-w-[200px]">ERP architecture · Process design · Integrations · Cost accounting</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT — Manufacturing Engineer ═══ */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
        <div className="w-full h-full bg-[#150d02] relative overflow-hidden">
          {/* Animated diagonal lines (industrial) */}
          <div className="absolute inset-0 opacity-[0.04]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="diag" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="30" stroke="#f59e0b" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diag)" />
            </svg>
          </div>

          {/* Animated gears */}
          {mounted && gearPositions.map((gear, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: gear.x, top: gear.y }}
              animate={{ rotate: 360 }}
              transition={{ duration: Math.abs(gear.speed), repeat: Infinity, ease: "linear", direction: gear.speed > 0 ? "normal" : "reverse" }}
            >
              <svg width={gear.size} height={gear.size} viewBox="0 0 100 100" className="opacity-20">
                <path d="M50 10 L55 25 L65 15 L60 30 L75 25 L65 35 L80 40 L65 45 L75 55 L60 50 L65 65 L55 55 L50 70 L45 55 L35 65 L40 50 L25 55 L35 45 L20 40 L35 35 L25 25 L40 30 L35 15 L45 25 Z"
                  fill="none" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="50" cy="50" r="12" fill="none" stroke="#f59e0b" strokeWidth="2" />
              </svg>
            </motion.div>
          ))}

          {/* Quality check marks appearing */}
          <div className="absolute top-[15%] right-[8%] space-y-3">
            {["ASME VIII ✓", "ISO 9001 ✓", "Zero Incidents ✓", "98.2% Yield ✓"].map((check, i) => (
              <motion.div
                key={check}
                className="text-[10px] font-mono text-orange-500/25 text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.8, duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
              >
                {check}
              </motion.div>
            ))}
          </div>

          {/* Conveyor animation */}
          <motion.div
            className="absolute bottom-[35%] right-[5%] w-[40%] h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-[45%] right-[10%] w-[30%] h-px bg-gradient-to-r from-transparent via-orange-500/15 to-transparent"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Glow */}
          <div className="absolute top-[30%] right-[20%] w-60 h-60 rounded-full bg-orange-500/6 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[5%] w-40 h-40 rounded-full bg-amber-500/8 blur-[80px]" />

          {/* Content */}
          <div className="absolute bottom-8 right-6 md:right-10 z-10 text-right">
            <motion.div animate={{ opacity: sliderPos < 85 ? 1 : 0 }} transition={{ duration: 0.2 }}>
              <div className="text-orange-400 text-[10px] font-mono tracking-[0.3em] uppercase mb-2">Manufacturing</div>
              <h2 className="text-5xl md:text-6xl font-bold text-white/90 tracking-tight">engineer</h2>
              <p className="text-gray-500 text-xs mt-2 max-w-[200px] ml-auto">BOMs · Routings · Quality control · Lean · Production planning</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ CENTER — Your photo + divider ═══ */}
      <div
        className="absolute top-0 bottom-0 z-20 flex items-center"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
      >
        <div className="w-px h-full bg-white/20" />
        {/* Photo circle at center */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/40 shadow-2xl cursor-grab active:cursor-grabbing">
          <Image
            src="/tanmay-portfolio/images/headshot.jpeg"
            alt="Tanmay Raut"
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        {/* Drag arrows below photo */}
        <div className="absolute top-1/2 mt-16 md:mt-20 -translate-x-1/2 flex items-center gap-1 text-white/40">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="text-[9px] font-mono">drag</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
      </div>
    </div>
  );
}

// Typing animation component
function TypingText({ texts }: { texts: string[] }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [displayLines, setDisplayLines] = useState<string[]>([]);

  useEffect(() => {
    if (currentLine >= texts.length) {
      // Reset after all lines typed
      const timeout = setTimeout(() => {
        setCurrentLine(0);
        setCurrentChar(0);
        setDisplayLines([]);
      }, 3000);
      return () => clearTimeout(timeout);
    }

    if (currentChar < texts[currentLine].length) {
      const timeout = setTimeout(() => setCurrentChar(c => c + 1), 30 + Math.random() * 40);
      return () => clearTimeout(timeout);
    } else {
      // Line complete, move to next
      const timeout = setTimeout(() => {
        setDisplayLines(prev => [...prev, texts[currentLine]]);
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentLine, currentChar, texts]);

  return (
    <div className="space-y-1">
      {displayLines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {currentLine < texts.length && (
        <div>
          {texts[currentLine].substring(0, currentChar)}
          <span className="animate-pulse">▋</span>
        </div>
      )}
    </div>
  );
}
