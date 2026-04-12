"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  target: string; // e.g. "18+", "3+", "8", "1"
  className?: string;
}

export function AnimatedCounter({ target, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState("0");

  // Parse the numeric part and suffix
  const match = target.match(/^(\d+)(.*)$/);
  const numericTarget = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (!isInView) return;

    const duration = 1500; // ms
    const steps = 40;
    const stepDuration = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease-out: fast start, slow end
      const progress = 1 - Math.pow(1 - step / steps, 3);
      const current = Math.round(numericTarget * progress);
      setDisplay(String(current));

      if (step >= steps) {
        setDisplay(String(numericTarget));
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, numericTarget]);

  return (
    <span ref={ref} className={className}>
      {display}{suffix}
    </span>
  );
}
