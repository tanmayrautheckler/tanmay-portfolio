"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

/* ═══ ACCENT PER CATEGORY ═══ */
const palette: Record<string, { c: string; r: string }> = {
  "AI & Automation":    { c: "#0EBBFF", r: "14,187,255" },
  Manufacturing:        { c: "#22c55e", r: "34,197,94" },
  Integrations:         { c: "#a855f7", r: "168,85,247" },
  Finance:              { c: "#f59e0b", r: "245,158,11" },
  "Data & Dashboards":  { c: "#ec4899", r: "236,72,153" },
  Operations:           { c: "#06b6d4", r: "6,182,212" },
  Academic:             { c: "#8b5cf6", r: "139,92,246" },
};
const fb = { c: "#0EBBFF", r: "14,187,255" };

/* ═══ HOLOGRAPHIC PROJECT CARD ═══ */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState(false);
  const { c, r } = palette[project.category] ?? fb;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sp = { damping: 30, stiffness: 200 };
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), sp);
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), sp);
  const lx = useSpring(useTransform(mx, [-0.5, 0.5], [0, 100]), sp);
  const ly = useSpring(useTransform(my, [-0.5, 0.5], [0, 100]), sp);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const b = ref.current.getBoundingClientRect();
      mx.set((e.clientX - b.left) / b.width - 0.5);
      my.set((e.clientY - b.top) / b.height - 0.5);
    },
    [mx, my]
  );
  const onLeave = useCallback(() => { setHov(false); mx.set(0); my.set(0); }, [mx, my]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ perspective: 900 }}
    >
      <Link href={`/projects/${project.slug}`} className="block h-full">
        <motion.div
          ref={ref}
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          onMouseMove={onMove}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={onLeave}
          className="relative group cursor-pointer h-full"
        >
          {/*
            The card uses CSS variables for theme-awareness:
            --holo-bg, --holo-bg-hov, --holo-border, --holo-border-hov,
            --holo-text, --holo-text-dim, --holo-text-muted, --holo-shadow
            These are defined in globals.css under .holo-card / .dark .holo-card
          */}
          <div
            className="holo-card relative overflow-hidden rounded-2xl border h-full transition-all duration-500"
            style={{
              borderColor: hov ? `rgba(${r},0.25)` : undefined,
              boxShadow: hov
                ? `0 12px 48px rgba(${r},0.1), 0 0 80px rgba(${r},0.04), inset 0 1px 0 var(--holo-highlight)`
                : undefined,
            }}
          >
            {/* Cursor light sweep */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: useTransform(
                  [lx, ly],
                  ([x, y]) => `radial-gradient(350px circle at ${x}% ${y}%, rgba(${r},0.1), transparent 70%)`
                ),
              }}
            />

            {/* White shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: useTransform(
                  [lx, ly],
                  ([x, y]) => `radial-gradient(250px circle at ${x}% ${y}%, var(--holo-shimmer), transparent 60%)`
                ),
              }}
            />

            <div className="relative z-10 p-6 md:p-7 flex flex-col h-full">
              {/* Header: category + arrow */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border transition-colors duration-300"
                  style={{
                    color: hov ? c : "var(--holo-text-muted)",
                    borderColor: hov ? `rgba(${r},0.3)` : "var(--holo-border)",
                    background: hov ? `rgba(${r},0.08)` : "transparent",
                  }}
                >
                  {project.category}
                </span>

                <div
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-400"
                  style={{
                    borderColor: hov ? `rgba(${r},0.3)` : "var(--holo-border)",
                    background: hov ? `rgba(${r},0.08)` : "transparent",
                    transform: hov ? "translate(2px,-2px)" : "none",
                  }}
                >
                  <ArrowUpRight
                    className="w-3.5 h-3.5 transition-colors duration-300"
                    style={{ color: hov ? c : "var(--holo-text-muted)" }}
                  />
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-lg md:text-xl font-bold tracking-tight mb-2.5 transition-colors duration-300 leading-snug"
                style={{ color: hov ? c : "var(--holo-text)" }}
              >
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-[13px] leading-relaxed mb-5 line-clamp-2 flex-1" style={{ color: "var(--holo-text-dim)" }}>
                {project.description}
              </p>

              {/* Tech pills */}
              <div className="flex flex-wrap gap-1.5">
                {project.tech.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[10px] font-mono rounded-md transition-all duration-300"
                    style={{
                      color: hov ? `rgba(${r},0.85)` : "var(--holo-text-muted)",
                      background: hov ? `rgba(${r},0.06)` : "var(--holo-pill-bg)",
                      border: `1px solid ${hov ? `rgba(${r},0.15)` : "var(--holo-border)"}`,
                    }}
                  >
                    {t}
                  </span>
                ))}
                {project.tech.length > 4 && (
                  <span className="px-2 py-0.5 text-[10px] font-mono" style={{ color: "var(--holo-text-muted)" }}>
                    +{project.tech.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom accent sweep */}
            <div
              className="absolute bottom-0 left-0 h-[1px] transition-all duration-700 ease-out"
              style={{
                width: hov ? "100%" : "0%",
                background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
                opacity: 0.5,
              }}
            />

            {/* Corner glow */}
            <div
              className="absolute -bottom-10 -right-10 w-28 h-28 rounded-full transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(circle, rgba(${r},0.08) 0%, transparent 70%)`,
                opacity: hov ? 1 : 0,
              }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
