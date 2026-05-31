"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Briefcase, Plane, Trophy, TrendingUp, Lightbulb, BookOpen, Layers, Crown, Calendar, Building2, FlaskConical } from "lucide-react";
import { InstagramIcon } from "@/components/social-icons";
import { TechLogos } from "@/components/tech-logos";
import { AnimatedCounter } from "@/components/animated-counter";
import { ParallaxPhoto } from "@/components/parallax-photo";
import { VideoSection } from "@/components/video-section";
import { TextReveal, SlideIn, ScaleReveal, MagneticCard, GradientBlob } from "@/components/scroll-animations";
import { EditorialHero } from "@/components/editorial-hero";
import { HeroProjectCard } from "@/components/projects/hero-project-card";
import { projects } from "@/data/projects";

const MountainJourney = dynamic(
  () => import("@/components/mountain-journey").then(mod => ({ default: mod.MountainJourney })),
  {
    ssr: false,
    loading: () => (
      <div className="relative" style={{ height: "500vh" }}>
        <div className="sticky top-0 h-screen bg-slate-900 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="skeleton w-64 h-8 mb-4 mx-auto" />
            <div className="skeleton w-48 h-4 mx-auto opacity-60" />
          </div>
        </div>
      </div>
    ),
  }
);

const featuredProjects = projects.filter((p) => p.featured);

const stats = [
  { value: "20+", label: "Systems Designed", icon: Layers, context: "Modules · portals · dashboards" },
  { value: "1", label: "ERP Owner", icon: Crown, context: "Sole platform accountability" },
  { value: "3+", label: "Years in ERP", icon: Calendar, context: "Daily Odoo since 2023" },
  { value: "8", label: "Departments", icon: Building2, context: "Mfg → finance → ops → sales" },
];

const interests = [
  { icon: Plane, label: "Travel" },
  { icon: Trophy, label: "Soccer" },
  { icon: TrendingUp, label: "Markets" },
  { icon: Lightbulb, label: "Tech" },
  { icon: BookOpen, label: "Philosophy" },
];

function BentoCard({ children, className = "", delay = 0, style, tilt = false }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties; tilt?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    if (!tilt) return;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };
  const handleMouseLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg)");
    setGlowPos({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      className={`bento-card relative ${className}`}
      style={{ ...style, transform: tilt ? transform : undefined, transition: "transform 0.2s ease-out" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cursor glow follow */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 hover-glow transition-opacity duration-300"
        style={{
          background: `radial-gradient(400px circle at ${glowPos.x}% ${glowPos.y}%, rgba(var(--accent-rgb), 0.08), transparent 60%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/** Reusable container wrapper */
function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`max-w-7xl mx-auto px-4 md:px-6 ${className}`}>{children}</div>;
}

// CharRevealCinematic removed — no longer used after editorial hero swap.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _CharRevealCinematic({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={`inline-block ${className || ""}`}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.9,
            delay: delay + i * 0.05,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}


export default function Home() {
  return (
    <>
      {/* ═══ EDITORIAL HERO — full-bleed Surjith-style ═══ */}
      <div className="-mt-16">
        <EditorialHero />
      </div>

      {/* ═══ SECONDARY BENTO GRID (stats + CTA + skills + interests) ═══ */}
      <Container>
        <section className="pt-8 pb-4">
          <div className="grid grid-cols-4 md:grid-cols-12 gap-3 auto-rows-[120px] md:auto-rows-[140px]">

            {/* Stats row — 4 cards: icon + counter + label + context */}
            {stats.map((stat, i) => (
              <BentoCard key={stat.label} className="col-span-1 md:col-span-3 row-span-1 p-3 md:p-5 flex flex-col items-center justify-center gap-1" delay={0.2 + i * 0.05}>
                <stat.icon className="w-3.5 h-3.5 text-accent/70" />
                <AnimatedCounter target={stat.value} />
                <div className="text-[10px] md:text-[11px] text-foreground uppercase tracking-wider text-center font-semibold leading-tight">{stat.label}</div>
                <div className="text-[9px] md:text-[10px] text-text-secondary/70 text-center leading-tight px-1">{stat.context}</div>
              </BentoCard>
            ))}

            {/* CTA card */}
            <BentoCard className="col-span-2 md:col-span-6 row-span-2 p-8 md:p-10 flex flex-col justify-between mesh-gradient-2" delay={0.3} tilt>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                  What I Do
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                  I own the ERP strategy, design, and rollout across 8 departments — scoping requirements, configuring workflows, directing developers, and training teams. I architect the system; my dev team codes what I design.
                </p>
              </div>
              <Link href="/projects" className="link-arrow text-sm text-accent hover:text-accent-hover transition-colors mt-4">
                View all projects <ArrowRight className="w-4 h-4" />
              </Link>
            </BentoCard>

            {/* Skills mini card */}
            <BentoCard className="col-span-2 md:col-span-3 row-span-2 p-6 flex flex-col justify-between" delay={0.35} tilt>
              <div>
                <div className="text-xs text-text-secondary uppercase tracking-wider mb-4">Core Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Odoo ERP", "AI/MCP", "Manufacturing", "Accounting", "Python"].map((s) => (
                    <span key={s} className="px-2.5 py-1 text-[11px] rounded-full border border-border bg-surface-hover text-text-secondary">{s}</span>
                  ))}
                </div>
              </div>
              <Link href="/skills" className="link-arrow text-xs text-accent hover:text-accent-hover transition-colors mt-4">
                All skills <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </BentoCard>

            {/* Interests card */}
            <BentoCard className="col-span-2 md:col-span-3 row-span-2 p-6 flex flex-col justify-between mesh-gradient-3" delay={0.4} tilt>
              <div>
                <div className="text-xs text-text-secondary uppercase tracking-wider mb-4">Beyond Work</div>
                <div className="flex gap-3">
                  {interests.map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 rounded-xl bg-surface-hover border border-border flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-text-secondary" />
                      </div>
                      <span className="text-[9px] text-text-secondary">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a href="https://www.instagram.com/tanmay_9825/" target="_blank" rel="noopener noreferrer" className="link-arrow text-xs text-accent hover:text-accent-hover transition-colors mt-4">
                <InstagramIcon className="w-3.5 h-3.5" /> @tanmay_9825 <ArrowUpRight className="w-3 h-3" />
              </a>
            </BentoCard>

          </div>
        </section>

        <div className="light-bar my-4" />
      </Container>

      {/* ═══ PARALLAX BREAK — SKYDIVING ═══ */}
      <ParallaxPhoto
        src="/images/lifestyle/skydiving.jpg"
        alt="Tanmay skydiving"
        caption="I don&apos;t just optimize systems"
        subcaption="I jump into them"
        height="40vh"
        overlay="gradient"
      />

      {/* ═══ FEATURED PROJECTS ═══ */}
      <Container>
        <section className="pt-4 pb-2">
          {/* Section header — standalone bento, not height-constrained by auto-rows grid */}
          <BentoCard className="p-8 md:p-12 flex flex-col justify-end grid-bg relative overflow-hidden mb-10" delay={0}>
            <GradientBlob className="w-[500px] h-[300px] -top-20 right-0 opacity-20" />
            <div className="relative z-10">
              <TextReveal>
                <p className="text-accent text-xs font-mono tracking-[0.25em] uppercase mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent pulse-dot" />
                  Selected Work
                </p>
              </TextReveal>
              <TextReveal>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
                  Featured Projects.
                </h2>
              </TextReveal>
              <SlideIn direction="left" delay={0.2}>
                <p className="text-text-secondary max-w-lg">
                  Real systems solving real business problems — from native Odoo modules to full-stack portals to AI connectors.
                </p>
              </SlideIn>
            </div>
          </BentoCard>

          {/* Sticky stacking cards — flex column, overflow visible so cards layer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "52px", overflow: "visible", paddingBottom: "80px" }}>
            {featuredProjects.map((project, i) => (
              <HeroProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>

          {/* View all */}
          <BentoCard className="p-6 flex items-center justify-center" delay={0.4}>
            <Link href="/projects" className="link-arrow text-sm text-accent hover:text-accent-hover transition-colors">
              View all {projects.length} projects <ArrowRight className="w-4 h-4" />
            </Link>
          </BentoCard>
        </section>
      </Container>

      {/* ═══ CASE STUDIES TEASER ═══ */}
      <Container>
        <section className="py-10 md:py-14">
          <Link
            href="/case-studies"
            className="group block border-y border-border hover:border-foreground/30 transition-colors"
          >
            <div className="grid grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-baseline py-8 md:py-12">
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] text-accent">
                Case Studies
              </span>
              <div>
                <h3 className="text-xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  Long-form deep dives on ERP projects I&apos;ve led.
                </h3>
                <p className="mt-2 text-sm md:text-base text-text-secondary">
                  Odoo 16→17 · 65-hour zero-loss cutover · Two more coming.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-mono uppercase tracking-[0.2em] text-foreground group-hover:gap-2.5 transition-all">
                Read
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </section>
      </Container>

      {/* ═══ LABS TEASER ═══ */}
      <Container>
        <section className="py-0 md:py-0">
          <Link
            href="/labs"
            className="group block border-b border-border hover:border-foreground/30 transition-colors"
          >
            <div className="grid grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-baseline py-8 md:py-12">
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] text-accent flex items-center gap-1.5">
                <FlaskConical className="w-3 h-3" />
                Labs
              </span>
              <div>
                <h3 className="text-xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  Live interactive demos — running in browser.
                </h3>
                <p className="mt-2 text-sm md:text-base text-text-secondary">
                  Real tools built from production data · Sanitized · Fully explorable.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-mono uppercase tracking-[0.2em] text-foreground group-hover:gap-2.5 transition-all">
                Explore
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </section>
      </Container>

      {/* ═══ PARALLAX BREAK — TAHOE ═══ */}
      <ParallaxPhoto
        src="/images/lifestyle/tahoe.jpg"
        alt="Tanmay at Lake Tahoe"
        caption="30 places and counting"
        subcaption="Always exploring"
        height="40vh"
        overlay="dark"
      />

      {/* ═══ TECH LOGOS BANNER ═══ */}
      <section className="py-4 border-y border-border">
        <Container className="mb-4">
          <p className="font-mono text-[10px] text-text-secondary uppercase tracking-[0.3em]">
            Technologies &amp; Integrations
          </p>
        </Container>
        <TechLogos />
      </section>

      {/* ═══ MOUNTAIN JOURNEY ═══ */}
      <MountainJourney />


      {/* ═══ VIDEO BREAK ═══ */}
      <VideoSection
        src="/videos/reel.mp4"
        caption="Building the future"
        subcaption="One system at a time"
        height="50vh"
        overlay="gradient"
      />

      {/* ═══ CTA ═══ */}
      <Container>
        <section className="py-12 md:py-16 relative overflow-hidden">
          <GradientBlob className="w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <TextReveal className="mb-2">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95]">
                Let&apos;s build
              </h2>
            </TextReveal>
            <TextReveal>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-6">
                <span className="gradient-text">something great.</span>
              </h2>
            </TextReveal>
            <SlideIn delay={0.3}>
              <p className="text-text-secondary text-lg mb-10 max-w-md mx-auto">
                Whether you need an ERP architect or someone who understands both the factory floor and the financial statements.
              </p>
            </SlideIn>
            <ScaleReveal delay={0.5}>
              <MagneticCard className="inline-block" strength={0.15}>
                <Link href="/contact" className="group link-arrow px-8 py-4 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity inline-flex">
                  Get In Touch <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticCard>
            </ScaleReveal>
          </div>
        </section>
      </Container>
    </>
  );
}
