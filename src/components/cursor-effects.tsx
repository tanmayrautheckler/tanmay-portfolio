"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useAppearancePalette } from "@/hooks/use-appearance";
import { clubPalettes } from "@/lib/appearance-palettes";

// The browser draws the theme-colored pointer with a standard cursor fallback.
export function CustomCursor() {
  const paletteId = useAppearancePalette();
  const { resolvedTheme } = useTheme();
  const palette = clubPalettes.find(item => item.id === paletteId) ?? clubPalettes[0];
  const colors = palette[resolvedTheme === "light" ? "light" : "dark"];
  const pointerSvg = (interactive: boolean) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="36" viewBox="0 0 32 36"><path d="M4 3L11 27L15 17L25 13Z" fill="${interactive ? colors.accent : colors.foreground}" stroke="${colors.background}" stroke-width="2.2" stroke-linejoin="round"/><path d="M7 7L12 22L14 15L21 13Z" fill="${interactive ? colors.background : colors.accent}"/></svg>`;
  const pointer = `url("data:image/svg+xml,${encodeURIComponent(pointerSvg(false))}") 4 3, auto`;
  const actionPointer = `url("data:image/svg+xml,${encodeURIComponent(pointerSvg(true))}") 4 3, pointer`;

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const root = document.documentElement;
    const update = () => root.toggleAttribute("data-club-cursor", fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => {
      root.removeAttribute("data-club-cursor");
      fine.removeEventListener("change", update);
    };
  }, []);

  return <style>{`@media (hover:hover) and (pointer:fine) and (forced-colors:none) {
      html[data-club-cursor],html[data-club-cursor] body {cursor:${pointer}}
      :where(html[data-club-cursor]) :where(a[href],button:not(:disabled),[role="button"],[role="tab"],summary) {cursor:${actionPointer}}
      :where(html[data-club-cursor]) :where(input,textarea,[contenteditable="true"]) {cursor:auto}
    }`}</style>;
}

// ═══ MAGNETIC TILT CARD ═══
export function MagneticCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)");
  };

  return (
    <div
      ref={ref}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

// ═══ CLICK PARTICLE EXPLOSION ═══
export function ClickParticles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only on buttons and links
      if (target.closest("a, button")) {
        const id = Date.now();
        setParticles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 1000);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      {particles.map(p => (
        <div key={p.id} className="fixed pointer-events-none z-[9997]" style={{ left: p.x, top: p.y }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            return (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}
