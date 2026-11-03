"use client";

/**
 * Editorial hero — Surjith-style.
 *
 * Massive serif first name occupies full viewport width. Cutout
 * headshot PNG centers over the type, breaking the letters where they
 * overlap. Minimal chrome: brand mark top-left, role row top-center,
 * two-line tagline bottom-left, floating badge bottom-right.
 *
 * Replaces the bento-card hero on the homepage. Bento grid below stays.
 */

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef, useEffect } from "react";
import { ClubStadiumBackdrop } from "./club-atmosphere";
import { MapPin, ArrowDownRight } from "lucide-react";

export function EditorialHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Scroll-linked exit — viewport-based to dodge Next 16 hydration race
  // (passing target ref triggers "Target ref defined but not hydrated" in app router)
  const { scrollY } = useScroll();
  // Hero is ~92vh tall; map viewport scroll 0→1 over that window.
  const scrollYProgress = useTransform(scrollY, (v) => {
    if (typeof window === "undefined") return 0;
    const h = window.innerHeight * 0.92;
    return Math.max(0, Math.min(1, v / h));
  });
  const nameScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const nameY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.95], [1, 0]);
  const blurAmount = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const blurStr = useTransform(blurAmount, (v) => `blur(${v}px)`);

  // Mouse-tracked parallax on photo + name
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 60, damping: 18 });

  // Photo drifts opposite to name for parallax separation
  const photoOffsetX = useTransform(smoothMouseX, [-1, 1], [-12, 12]);
  const photoOffsetY = useTransform(smoothMouseY, [-1, 1], [-8, 8]);
  const nameOffsetX = useTransform(smoothMouseX, [-1, 1], [10, -10]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const r = heroRef.current.getBoundingClientRect();
      mouseX.set(((e.clientX - r.left) / r.width) * 2 - 1);
      mouseY.set(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity: reducedMotion ? 1 : heroOpacity, backgroundColor: "var(--background)" }}
      className="relative w-full overflow-hidden"
    >
      <div className="relative h-[92vh] min-h-[640px] w-full">
        <ClubStadiumBackdrop />
        {/* Atmospheric gradient bg — theme-aware via --accent-rgb */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(var(--accent-rgb), 0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(var(--accent-rgb), 0.06) 0%, transparent 50%)",
          }}
        />

        {/* Subtle grid texture (theme-aware) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            color: "var(--foreground)",
          }}
        />

        {/* ═══ MASSIVE NAME ═══ */}
        <motion.div
          style={{
            scale: reducedMotion ? 1 : nameScale,
            y: reducedMotion ? 0 : nameY,
            x: reducedMotion ? 0 : nameOffsetX,
            filter: reducedMotion ? "none" : blurStr,
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10"
        >
          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, scale: 1.15, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="serif-display font-normal tracking-[-0.04em] leading-[1.15] text-center whitespace-nowrap px-4 pb-[0.18em]"
            style={{
              fontSize: "clamp(5rem, 19vw, 18rem)",
              maxWidth: "100vw",
              background:
                "linear-gradient(180deg, var(--foreground) 0%, color-mix(in srgb, var(--foreground) 55%, transparent) 60%, color-mix(in srgb, var(--foreground) 20%, transparent) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Tanmay
          </motion.h1>
        </motion.div>

        {/* ═══ CUTOUT HEADSHOT ═══ */}
        <motion.div
          style={{
            y: reducedMotion ? 0 : photoY,
            scale: reducedMotion ? 1 : photoScale,
            x: reducedMotion ? 0 : photoOffsetX,
          }}
          className="absolute inset-0 flex items-end justify-center pointer-events-none z-20"
        >
          {/* Mouse-Y parallax wrapper — 2:3 aspect for full-body portrait */}
          <motion.div
            style={{ y: reducedMotion ? 0 : photoOffsetY, aspectRatio: "2 / 3" }}
            className="relative h-[92%] max-h-[880px]"
          >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full"
          >
            {/* Soft halo behind photo — theme accent */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-40"
              style={{
                background:
                  "radial-gradient(circle, rgba(var(--accent-rgb), 0.28), rgba(var(--accent-rgb), 0.10) 40%, transparent 70%)",
              }}
            />
            <Image
              src="/images/headshot-cutout.png"
              alt="Tanmay Raut"
              fill
              priority
              className="object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
              sizes="(max-width: 768px) 80vw, 60vw"
            />
          </motion.div>
          </motion.div>
        </motion.div>

        {/* ═══ BOTTOM-LEFT TAGLINE ═══ */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-8 left-6 md:bottom-12 md:left-10 z-30 max-w-md"
        >
          <p className="text-sm md:text-base text-text-secondary mb-2 font-mono">
            I design how
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[-0.02em] leading-[0.95]">
            <span className="gradient-text animated-gradient inline-block">
              businesses run.
            </span>
          </h2>
          <p className="mt-3 text-xs md:text-sm font-mono text-text-secondary flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            Phoenix, Arizona · Heckler Design
          </p>
        </motion.div>

        {/* ═══ BOTTOM-RIGHT BADGE ═══ */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-24 right-5 md:top-auto md:bottom-12 md:right-10 z-30"
        >
          <Link
            href="#my-journey"
            className="hero-journey-link group flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-surface-hover backdrop-blur-md hover:border-accent/50 transition-all"
          >
            <ArrowDownRight className="w-5 h-5 text-foreground" />
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">
                Start here
              </p>
              <p className="text-sm font-medium text-foreground">Follow the journey</p>
            </div>
          </Link>
        </motion.div>

        {/* ═══ SCROLL HINT ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={reducedMotion ? { opacity: 0.5 } : { opacity: 0.5, y: [0, 6, 0] }}
          transition={{
            opacity: { delay: 1.4, duration: 1 },
            y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary"
        >
          scroll
        </motion.div>
      </div>
    </motion.section>
  );
}
