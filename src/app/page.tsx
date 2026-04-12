"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, MapPin, Briefcase, Plane, Trophy, TrendingUp, Lightbulb, BookOpen } from "lucide-react";
import { SectionReveal, StaggerContainer, StaggerItem } from "@/components/section-reveal";
import { InstagramIcon, LinkedinIcon, GithubIcon } from "@/components/social-icons";
import { TechLogos } from "@/components/tech-logos";
import { TextScramble } from "@/components/text-scramble";
import { AnimatedCounter } from "@/components/animated-counter";
import { ParallaxPhoto } from "@/components/parallax-photo";
import { VideoSection } from "@/components/video-section";
import { TextReveal, SlideIn, ScaleReveal, MagneticCard, GradientBlob, Float } from "@/components/scroll-animations";
import { projects } from "@/data/projects";

const HeroScene = dynamic(() => import("@/components/hero-scene").then(mod => ({ default: mod.HeroScene })), {
  ssr: false,
});

const featuredProjects = projects.filter((p) => p.featured);

const stats = [
  { value: "18+", label: "Systems Designed" },
  { value: "1", label: "ERP Owner" },
  { value: "3+", label: "Years in ERP" },
  { value: "8", label: "Depts Managed" },
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

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  return (
    <>
      {/* ═══ HERO BENTO GRID ═══ */}
      <Container>
        <section className="pt-8 pb-4">
          <div className="grid grid-cols-4 md:grid-cols-12 gap-3 auto-rows-[120px] md:auto-rows-[140px]">

            {/* Main hero — spans 8 cols, 3 rows */}
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="col-span-4 md:col-span-8 row-span-3 relative rounded-3xl overflow-hidden p-8 md:p-12 flex flex-col justify-end"
              style={{ background: "#0a0a0f", border: "1px solid #1d1d1f" }}
            >
              <HeroScene />
              <div className="glow-orb w-[400px] h-[400px] bg-accent/20 -top-20 -right-20" />
              <div className="glow-orb w-[300px] h-[300px] bg-purple-500/15 bottom-0 left-0" />
              <div className="relative z-10">
                <p className="text-accent text-xs font-mono tracking-[0.25em] uppercase mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent pulse-dot" />
                  <TextScramble words={["Systems Architect", "ERP Strategist", "Process Designer", "Manufacturing Tech"]} />
                </p>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] leading-[0.9] mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Tanmay</span> <span className="text-white">Raut</span>
                </h1>
                <p className="text-gray-400 text-base md:text-lg max-w-md leading-relaxed">
                  I design how manufacturing businesses run through their systems.
                </p>
              </div>
            </motion.div>

            {/* Photo card — 4 cols, 3 rows */}
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="bento-card col-span-2 md:col-span-4 row-span-3 relative overflow-hidden img-zoom"
            >
              <Image
                src="/tanmay-portfolio/images/headshot.jpeg"
                alt="Tanmay Raut"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
                priority
              />
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10">
                <div className="flex items-center gap-1.5 text-white/80 text-xs">
                  <MapPin className="w-3 h-3" />
                  Phoenix, AZ
                </div>
              </div>
            </motion.div>

            {/* Stats row — 4 cards with animated counters */}
            {stats.map((stat, i) => (
              <BentoCard key={stat.label} className="col-span-1 md:col-span-3 row-span-1 p-4 md:p-6 flex items-center justify-center" delay={0.2 + i * 0.05}>
                <AnimatedCounter target={stat.value} />
                <div className="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider mt-0.5 text-center">{stat.label}</div>
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
        src="/tanmay-portfolio/images/lifestyle/skydiving.jpg"
        alt="Tanmay skydiving"
        caption="I don&apos;t just optimize systems"
        subcaption="I jump into them"
        height="40vh"
        overlay="gradient"
      />

      {/* ═══ FEATURED PROJECTS BENTO ═══ */}
      <Container>
        <section className="py-4">
          <div className="grid grid-cols-4 md:grid-cols-12 gap-3 auto-rows-[140px]">

            {/* Section header */}
            <BentoCard className="col-span-4 md:col-span-12 row-span-2 p-8 md:p-12 flex flex-col justify-end grid-bg relative overflow-hidden" delay={0}>
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

            {/* Project cards */}
            {featuredProjects.map((project, i) => {
              const colors: Record<string, string> = {
                "AI & Automation": "from-cyan-500/15 to-blue-600/5",
                "Manufacturing": "from-orange-500/15 to-amber-600/5",
              };
              const gradient = colors[project.category] || "from-accent/10 to-transparent";

              return (
                <BentoCard
                  key={project.slug}
                  className={`col-span-4 md:col-span-4 row-span-3 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br ${gradient}`}
                  delay={0.1 + i * 0.1}
                >
                  <div>
                    <span className="inline-block px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase rounded-full border border-border bg-surface/50 backdrop-blur text-text-secondary mb-4">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{project.description}</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tech.slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-0.5 text-[10px] rounded-md border border-border text-text-secondary">{t}</span>
                      ))}
                    </div>
                    <Link href={`/projects/${project.slug}`} className="link-arrow text-sm text-accent hover:text-accent-hover transition-colors">
                      View project <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </BentoCard>
              );
            })}

            {/* View all link card */}
            <BentoCard className="col-span-4 md:col-span-12 row-span-1 p-6 flex items-center justify-center" delay={0.4}>
              <Link href="/projects" className="link-arrow text-sm text-accent hover:text-accent-hover transition-colors">
                View all 18 projects <ArrowRight className="w-4 h-4" />
              </Link>
            </BentoCard>

          </div>
        </section>
      </Container>

      {/* ═══ PARALLAX BREAK — TAHOE ═══ */}
      <ParallaxPhoto
        src="/tanmay-portfolio/images/lifestyle/tahoe.jpg"
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

      {/* ═══ EXPERIENCE + ABOUT BENTO ═══ */}
      <Container>
        <section className="py-4">
          <div className="grid grid-cols-4 md:grid-cols-12 gap-3 auto-rows-[140px]">

            {/* Experience card */}
            <BentoCard className="col-span-4 md:col-span-7 row-span-3 p-8 md:p-10 flex flex-col justify-between overflow-hidden" delay={0}>
              <GradientBlob className="w-[300px] h-[300px] -top-20 -right-20 opacity-10" color1="rgba(var(--accent-rgb), 0.3)" color2="rgba(168,85,247,0.15)" />
              <div className="relative z-10">
                <TextReveal>
                  <p className="text-accent text-xs font-mono tracking-[0.25em] uppercase mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent pulse-dot" />
                    Career
                  </p>
                </TextReveal>
                <TextReveal>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Experience</h2>
                </TextReveal>

                <div className="space-y-0 pl-2 timeline-line">
                  {[
                    { role: "ERP Systems Engineer II", company: "Heckler Design", period: "2024–Present", active: true },
                    { role: "ERP Systems Engineer", company: "Heckler Design", period: "2023–2024", active: false },
                    { role: "Manufacturing Engineer", company: "United Foods", period: "2023", active: false },
                    { role: "Production Supervisor", company: "Vats & Vessels", period: "2020–2022", active: false },
                  ].map((job, i) => (
                    <SlideIn key={i} direction="left" delay={0.1 + i * 0.12}>
                      <motion.div
                        className="flex items-start gap-4 py-3 pl-6 rounded-lg hover:bg-surface-hover/50 transition-colors cursor-default"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${job.active ? "bg-accent glow-pulse shadow-[0_0_12px_rgba(var(--accent-rgb),0.5)]" : "bg-border"}`} />
                        <div>
                          <div className="text-sm font-semibold">{job.role}</div>
                          <div className="text-xs text-text-secondary mt-0.5">{job.company} &middot; {job.period}</div>
                        </div>
                      </motion.div>
                    </SlideIn>
                  ))}
                </div>
              </div>
              <Link href="/experience" className="link-arrow text-sm text-accent hover:text-accent-hover transition-colors mt-6 relative z-10">
                Full timeline <ArrowRight className="w-4 h-4" />
              </Link>
            </BentoCard>

            {/* Education card */}
            <BentoCard className="col-span-2 md:col-span-5 row-span-2 p-6 md:p-8 mesh-gradient-2" delay={0.1}>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-4">Education</p>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold">MS Mechanical Engineering</div>
                  <div className="text-xs text-text-secondary">Arizona State University &middot; GPA 3.8</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">B.Tech Aeronautical Engineering</div>
                  <div className="text-xs text-text-secondary">Manipal Institute of Technology &middot; GPA 3.5</div>
                </div>
              </div>
            </BentoCard>

            {/* Connect card */}
            <BentoCard className="col-span-2 md:col-span-5 row-span-1 p-6 flex items-center justify-between" delay={0.15}>
              <div className="flex items-center gap-4">
                <a href="https://www.linkedin.com/in/rauttanmay/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center hover:border-accent/30 transition-colors">
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a href="https://github.com/tanmayrautheckler" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center hover:border-accent/30 transition-colors">
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/tanmay_9825/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-surface-hover border border-border flex items-center justify-center hover:border-accent/30 transition-colors">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              </div>
              <Link href="/contact" className="link-arrow text-sm text-accent hover:text-accent-hover">
                Contact <ArrowRight className="w-4 h-4" />
              </Link>
            </BentoCard>

          </div>
        </section>
      </Container>

      {/* ═══ VIDEO BREAK ═══ */}
      <VideoSection
        src="/tanmay-portfolio/videos/reel.mp4"
        caption="Building the future"
        subcaption="One system at a time"
        height="50vh"
        overlay="gradient"
      />

      {/* ═══ PARALLAX BREAK — CAMPING ═══ */}
      <ParallaxPhoto
        src="/tanmay-portfolio/images/lifestyle/camping.jpg"
        alt="Camping in the forest"
        caption="Unplugged. Recalibrated."
        height="40vh"
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
