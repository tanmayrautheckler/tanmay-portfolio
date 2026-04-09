"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionReveal, StaggerContainer, StaggerItem } from "@/components/section-reveal";
import { ArrowRight } from "lucide-react";
import { LinkedinIcon, GithubIcon, InstagramIcon } from "@/components/social-icons";

const CareerJourney = dynamic(() => import("@/components/career-journey").then(mod => ({ default: mod.CareerJourney })), {
  ssr: false,
  loading: () => <div className="bento-card h-[500px] flex items-center justify-center text-text-secondary text-sm">Loading 3D journey...</div>,
});

// Adham-style vertical bar chart skills
const barSkills = [
  { name: "Odoo ERP", value: 95, color: "bg-[#7ecfb3]" },
  { name: "Business Process Design", value: 90, color: "bg-[#f0b4b4]" },
  { name: "AI Tools", value: 88, color: "bg-[#f5d76e]" },
  { name: "Manufacturing Ops", value: 85, color: "bg-[#c8b8db]" },
  { name: "Cross-Platform Integrations", value: 80, color: "bg-[#ff8a80]" },
];

const photoStrip = [
  { src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&q=80", alt: "Travel" },
  { src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&q=80", alt: "Soccer" },
  { src: "/images/headshot.jpeg", alt: "Me" },
  { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80", alt: "Workspace" },
  { src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&q=80", alt: "Coding" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", alt: "Mountains" },
];

const randomFacts = [
  "I run the entire ERP at a manufacturing company — alone",
  "Our accountants escalate to me, not the other way around",
  "I managed 30+ welders before I ever touched an ERP",
  "I built an AI that queries live manufacturing data in English",
  "I've been to Monument Valley, Hawaii, and seen the Northern Lights",
  "I think in systems — everything is a workflow",
  "I use AI as my development team — I bring the domain judgment.",
  "I want to build systems so good that businesses run themselves",
];

const certifications = [
  "Lean Six Sigma Green Belt",
  "SAP S/4HANA Essentials",
  "Supply Chain Ops (Rutgers)",
  "Tableau Visualization",
  "Materials Selection (MIT)",
  "Root Cause Analysis",
];

function VerticalBar({ name, value, color, delay }: { name: string; value: number; color: string; delay: number }) {
  const maxHeight = 280;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center gap-2 group cursor-default"
    >
      <div className="relative w-full" style={{ height: maxHeight }}>
        {/* Background track */}
        <div className="absolute bottom-0 left-0 right-0 h-full rounded-2xl bg-white/5 border border-white/5" />
        {/* Animated bar */}
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: `${(value / 100) * maxHeight}px` }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className={`absolute bottom-0 left-0 right-0 ${color} rounded-2xl flex items-end justify-center pb-4 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] group-hover:scale-[1.03] group-hover:brightness-110`}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/10 to-white/0"
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
            />
          </div>
          {/* Value */}
          <motion.span
            className="relative text-3xl font-bold text-white drop-shadow-lg"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.5, delay: delay + 1.2 }}
          >
            {value}<span className="text-lg">%</span>
          </motion.span>
        </motion.div>
      </div>
      <motion.span
        className="text-xs text-text-secondary text-center font-medium mt-2 group-hover:text-foreground transition-colors"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, margin: "-80px" }}
        transition={{ delay: delay + 1 }}
      >
        {name}
      </motion.span>
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6">

      {/* ═══ HERO ═══ */}
      <section className="pt-16 md:pt-24 pb-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-12 items-start">
          {/* Text */}
          <SectionReveal>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-6">
              about.
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed mb-4">
              I&apos;m an ERP systems engineer based in sunny Phoenix, Arizona.
            </p>
            <p className="text-text-secondary leading-relaxed max-w-lg">
              Since 2020, I&apos;ve been designing how manufacturing businesses operate through their
              systems — from the factory floor to the financial statements. When I&apos;m not in Odoo,
              you&apos;ll find me playing soccer, travelling, or reading about philosophy and markets.
            </p>
          </SectionReveal>

          {/* Photo */}
          <SectionReveal delay={0.2}>
            <div className="w-64 md:w-80 aspect-[3/4] rounded-3xl overflow-hidden relative">
              <Image
                src="/images/headshot.jpeg"
                alt="Tanmay Raut"
                fill
                className="object-cover"
                sizes="320px"
                priority
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══ PHOTO STRIP ═══ */}
      <section className="py-8 border-t border-border">
        <StaggerContainer className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {photoStrip.map((photo, i) => (
            <StaggerItem key={photo.alt}>
              <div className="aspect-square rounded-2xl overflow-hidden relative img-zoom">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw"
                  unoptimized={photo.src.startsWith("http")}
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══ SPLIT IDENTITY ═══ */}
      <section className="py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-16 items-start">
          {/* Left — Systems side */}
          <SectionReveal>
            <h2 className="text-3xl font-bold mb-6">Part systems architect</h2>
            <ul className="space-y-2 text-text-secondary">
              <li>ERP architecture</li>
              <li>Business process design</li>
              <li>Manufacturing operations</li>
              <li>Cost accounting</li>
              <li>&ldquo;Making the data make sense&rdquo;</li>
            </ul>
          </SectionReveal>

          {/* Center — visual */}
          <SectionReveal delay={0.1}>
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                {/* Pie chart SVG */}
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-border" />
                  <motion.circle
                    cx="50" cy="50" r="45" fill="none" strokeWidth="10"
                    className="text-accent"
                    strokeDasharray={`${0.6 * 283} ${0.4 * 283}`}
                    initial={{ strokeDashoffset: 283 }}
                    whileInView={{ strokeDashoffset: 0 }}
                    viewport={{ once: false, margin: "-80px" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                  <motion.circle
                    cx="50" cy="50" r="45" fill="none" strokeWidth="10"
                    className="text-orange-400"
                    strokeDasharray={`${0.4 * 283} ${0.6 * 283}`}
                    strokeDashoffset={`${-0.6 * 283}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, margin: "-80px" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-medium text-accent">Systems</span>
                  <span className="text-[10px] text-text-secondary">&</span>
                  <span className="text-xs font-medium text-orange-400">Manufacturing</span>
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Right — Manufacturing side */}
          <SectionReveal delay={0.2}>
            <h2 className="text-3xl font-bold mb-6">Part manufacturing engineer</h2>
            <ul className="space-y-2 text-text-secondary">
              <li>AI-augmented automation</li>
              <li>BOM & routing design</li>
              <li>Quality control</li>
              <li>Lean manufacturing</li>
              <li>&ldquo;Going to the shell to get it&rdquo;</li>
            </ul>
          </SectionReveal>
        </div>
      </section>

      {/* ═══ RANDOM FACTS + IMAGE ═══ */}
      <section className="py-16 md:py-24 bg-surface rounded-3xl px-8 md:px-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <SectionReveal>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80"
                alt="Technology"
                fill
                className="object-cover"
                sizes="50vw"
                unoptimized
              />
            </div>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h2 className="text-3xl font-bold mb-8">Random facts</h2>
            <ul className="space-y-3">
              {randomFacts.map((fact, i) => (
                <li key={i} className="text-text-secondary leading-relaxed">{fact}</li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </section>

      {/* ═══ MY SKILLS — Vertical bars (Adham-style) ═══ */}
      <section className="py-16 md:py-24">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-right mb-12">My skills</h2>
        </SectionReveal>
        <div className="grid grid-cols-5 gap-4 md:gap-6">
          {barSkills.map((skill, i) => (
            <VerticalBar key={skill.name} {...skill} delay={i * 0.1} />
          ))}
        </div>
        {/* Scale labels */}
        <div className="flex justify-between mt-2 px-2">
          <span className="text-[10px] text-text-secondary">Newbie</span>
          <span className="text-[10px] text-text-secondary">Jedi</span>
        </div>
      </section>

      {/* ═══ 3D CAREER JOURNEY ═══ */}
      <section className="py-8">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">My journey</h2>
          <CareerJourney />
        </SectionReveal>
      </section>

      {/* ═══ EDUCATION + CERTS ═══ */}
      <section className="py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12">
          <SectionReveal>
            <h2 className="text-3xl font-bold mb-8">Education</h2>
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-surface border border-border">
                <div className="text-lg font-semibold">MS Mechanical Engineering</div>
                <div className="text-accent text-sm">Arizona State University &middot; GPA 3.8</div>
                <div className="text-xs text-text-secondary mt-1">SPC, Quality Control, Operations Management</div>
              </div>
              <div className="p-6 rounded-2xl bg-surface border border-border">
                <div className="text-lg font-semibold">B.Tech Aeronautical Engineering</div>
                <div className="text-accent text-sm">Manipal Institute of Technology &middot; GPA 3.5</div>
                <div className="text-xs text-text-secondary mt-1">Minor: Mechanical &middot; Supply Chain Management</div>
              </div>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h2 className="text-3xl font-bold mb-8">Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <span key={cert} className="px-4 py-2 text-sm rounded-full bg-surface border border-border text-text-secondary">
                  {cert}
                </span>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 pb-24">
        <SectionReveal>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Want to work together?</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              I&apos;m open to ERP consulting, systems architecture, and AI integration projects.
            </p>
            <Link href="/contact" className="group link-arrow px-8 py-4 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
              Get In Touch <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </SectionReveal>
      </section>

    </div>
  );
}
