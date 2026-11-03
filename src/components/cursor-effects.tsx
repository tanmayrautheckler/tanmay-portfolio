"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

// ═══ CUSTOM CURSOR WITH GLOW TRAIL ═══
export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 300, damping: 20 });
  const springY = useSpring(cursorY, { stiffness: 300, damping: 20 });
  const reduced = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);
  const seen = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType !== "mouse") return;
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      if (!seen.current) {
        springX.jump(event.clientX);
        springY.jump(event.clientY);
        seen.current = true;
        setVisible(true);
      }
      const target = event.target;
      setHovering(target instanceof Element && Boolean(target.closest("a,button,input,textarea,select,summary,[role='button'],.cursor-hover")));
    };
    const hide = () => { seen.current = false; setVisible(false); setClicking(false); };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Tab") hide(); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("blur", hide);
    window.addEventListener("keydown", keyboard);
    document.documentElement.addEventListener("pointerleave", hide);
    fine.addEventListener("change", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", hide);
      window.removeEventListener("keydown", keyboard);
      document.documentElement.removeEventListener("pointerleave", hide);
      fine.removeEventListener("change", hide);
    };
  }, [cursorX, cursorY, springX, springY]);

  // This decorates the system pointer. Never hide the native cursor.
  return <motion.div aria-hidden="true" className="fixed top-0 left-0 pointer-events-none z-[9998]"
    style={{ x: reduced ? cursorX : springX, y: reduced ? cursorY : springY, translateX: "-50%", translateY: "-50%", opacity: visible ? 1 : 0 }}>
    <motion.div className="size-9 rounded-full border border-cyan-400/50"
      animate={{ transform: `scale(${clicking ? .6 : hovering ? 1.5 : 1})`, opacity: hovering ? .7 : .4 }}
      transition={{ duration: reduced ? 0 : .16 }}
      style={{ boxShadow: "0 0 15px rgba(14,187,255,.2)" }}/>
  </motion.div>;
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
