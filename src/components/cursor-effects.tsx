"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ═══ CUSTOM CURSOR WITH GLOW TRAIL ═══
export function CustomCursor() {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { stiffness: 300, damping: 20 });
  const springY = useSpring(cursorY, { stiffness: 300, damping: 20 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);
    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    // Track hoverable elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll("a, button, [role='button'], .cursor-hover").forEach(el => {
        el.addEventListener("mouseenter", handleHoverStart);
        el.addEventListener("mouseleave", handleHoverEnd);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial scan
    document.querySelectorAll("a, button, [role='button'], .cursor-hover").forEach(el => {
      el.addEventListener("mouseenter", handleHoverStart);
      el.addEventListener("mouseleave", handleHoverEnd);
    });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      observer.disconnect();
    };
  }, [cursorX, cursorY, visible]);

  // Hide on mobile
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      {/* Outer glow ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-screen hidden md:block"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      >
        <motion.div
          animate={{
            width: isHovering ? 60 : isClicking ? 20 : 36,
            height: isHovering ? 60 : isClicking ? 20 : 36,
            opacity: isClicking ? 0.8 : 0.4,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="rounded-full border border-cyan-400/50"
          style={{ boxShadow: "0 0 15px rgba(14, 187, 255, 0.2)" }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? 1 : 0,
        }}
      >
        <motion.div
          animate={{
            width: isClicking ? 10 : 6,
            height: isClicking ? 10 : 6,
            backgroundColor: isHovering ? "#0EBBFF" : "#ffffff",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="rounded-full"
        />
      </motion.div>
    </>
  );
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
