"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  target: string;
  className?: string;
}

export function AnimatedCounter({ target, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-60px" });
  const [progress, setProgress] = useState(0);
  const [displayNum, setDisplayNum] = useState(0);
  const prevInView = useRef(false);

  const match = target.match(/^(\d+)(.*)$/);
  const numericTarget = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";

  // Map to a percentage for the ring (out of a sensible max)
  const maxMap: Record<number, number> = { 18: 20, 1: 1, 3: 5, 8: 10 };
  const max = maxMap[numericTarget] || numericTarget;
  const targetProgress = numericTarget / max;

  useEffect(() => {
    if (isInView && !prevInView.current) {
      setProgress(0);
      setDisplayNum(0);

      const duration = 1400;
      const steps = 50;
      const stepDuration = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const t = step / steps;
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(eased * targetProgress);
        setDisplayNum(Math.round(eased * numericTarget));

        if (step >= steps) {
          setProgress(targetProgress);
          setDisplayNum(numericTarget);
          clearInterval(timer);
        }
      }, stepDuration);

      prevInView.current = true;
      return () => clearInterval(timer);
    }
    if (!isInView) {
      prevInView.current = false;
    }
  }, [isInView, numericTarget, targetProgress]);

  const size = 72;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div ref={ref} className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-border opacity-30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="rgba(168,85,247,0.8)" />
            </linearGradient>
          </defs>
        </svg>
        {/* Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-xl font-bold text-text tabular-nums"
            key={isInView ? "in" : "out"}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
          >
            {displayNum}{suffix}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
