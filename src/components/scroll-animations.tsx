"use client";

import { useRef, useEffect, ReactNode } from "react";
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion";

/** Text reveals line by line with a clip mask */
export function TextReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={isInView ? { y: "0%", opacity: 1 } : { y: "100%", opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Horizontal slide-in from left or right */
export function SlideIn({ children, className = "", direction = "left", delay = 0 }: { children: ReactNode; className?: string; direction?: "left" | "right"; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const x = direction === "left" ? -80 : 80;

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ x, opacity: 0, filter: "blur(8px)" }}
        animate={isInView ? { x: 0, opacity: 1, filter: "blur(0px)" } : { x, opacity: 0, filter: "blur(8px)" }}
        transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Scale up from small with blur */
export function ScaleReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0, filter: "blur(10px)" }}
        animate={isInView ? { scale: 1, opacity: 1, filter: "blur(0px)" } : { scale: 0.85, opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Parallax wrapper — children move at different speed than scroll */
export function ParallaxLayer({ children, className = "", speed = 0.5 }: { children: ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Floating animation — continuously bobs up and down */
export function Float({ children, className = "", amplitude = 15, duration = 4 }: { children: ReactNode; className?: string; amplitude?: number; duration?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Magnetic hover — card pulls toward cursor */
export function MagneticCard({ children, className = "", strength = 0.3 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

/** Animated gradient blob */
export function GradientBlob({ className = "", color1 = "var(--accent)", color2 = "rgba(168,85,247,0.5)" }: { className?: string; color1?: string; color2?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(circle, ${color1} 0%, ${color2} 40%, transparent 70%)`,
        filter: "blur(80px)",
      }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 15, -10, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
