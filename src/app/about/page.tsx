"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionReveal, StaggerContainer, StaggerItem } from "@/components/section-reveal";
import { SplitIdentity } from "@/components/split-identity";
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
  { src: "/tanmay-portfolio/images/headshot.jpeg", alt: "Me" },
  { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80", alt: "Workspace" },
  { src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&q=80", alt: "Coding" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", alt: "Mountains" },
];

// Random facts removed — replaced by interactive story cards

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
      transition={{ duration: 0.4, delay }}
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
          transition={{ duration: 0.8, delay: delay + 0.1, ease: [0.25, 0.1, 0.25, 1] }}
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
            transition={{ duration: 0.3, delay: delay + 0.6 }}
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
        transition={{ delay: delay + 0.5 }}
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
                src="/tanmay-portfolio/images/headshot.jpeg"
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

      {/* ═══ SPLIT IDENTITY — Draggable slider ═══ */}
      <section className="py-16 md:py-24">
        <SectionReveal>
          <SplitIdentity />
        </SectionReveal>
      </section>

      {/* ═══ THINGS ABOUT ME — Interactive story cards ═══ */}
      <section className="py-16 md:py-24">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Things about me</h2>
        </SectionReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { emoji: "🏭", title: "Factory Floor Origins", text: "Managed 30+ welders & machinists before I ever touched an ERP", color: "from-orange-500/20 via-orange-600/5 to-transparent", span: "col-span-2" },
            { emoji: "🧠", title: "Systems Thinker", text: "Everything is a workflow. I think in processes, not tasks.", color: "from-cyan-500/20 via-cyan-600/5 to-transparent", span: "col-span-1" },
            { emoji: "⚽", title: "Soccer", text: "Weekend warrior on the pitch", color: "from-green-500/20 via-green-600/5 to-transparent", span: "col-span-1" },
            { emoji: "🤖", title: "AI × Domain Knowledge", text: "AI is my dev team — I bring the manufacturing judgment no model has", color: "from-violet-500/20 via-violet-600/5 to-transparent", span: "col-span-1" },
            { emoji: "📊", title: "The Books Stop Here", text: "Our accountants escalate to me when things don't balance", color: "from-emerald-500/20 via-emerald-600/5 to-transparent", span: "col-span-1" },
            { emoji: "🌍", title: "29 Places & Counting", text: "Monument Valley, Hawaii, Northern Lights, France, Singapore, Turkey...", color: "from-blue-500/20 via-blue-600/5 to-transparent", span: "col-span-2" },
            { emoji: "📈", title: "Market Watcher", text: "Following patterns, building financial literacy, studying the game", color: "from-amber-500/20 via-amber-600/5 to-transparent", span: "col-span-1" },
            { emoji: "📖", title: "Philosophy & Mental Models", text: "How to think about thinking — systems within systems", color: "from-rose-500/20 via-rose-600/5 to-transparent", span: "col-span-1" },
            { emoji: "🎯", title: "The Vision", text: "Build systems so good that businesses run themselves", color: "from-cyan-500/20 via-purple-600/5 to-transparent", span: "col-span-2" },
            { emoji: "🇮🇳", title: "Mumbai → Phoenix", text: "Crossed continents for a Master's. Stayed for the opportunity.", color: "from-orange-500/10 via-white/0 to-green-500/10", span: "col-span-2" },
          ].map((card, i) => (
            <SectionReveal key={card.title} delay={i * 0.05}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`${card.span} bento-card bg-gradient-to-br ${card.color} p-6 cursor-default group`}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{card.emoji}</div>
                <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{card.text}</p>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* ═══ MY SKILLS — Vertical bars (Adham-style) ═══ */}
      <section className="py-16 md:py-24">
        <SectionReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-right mb-12">My skills</h2>
        </SectionReveal>
        <div className="grid grid-cols-5 gap-4 md:gap-6">
          {barSkills.map((skill, i) => (
            <VerticalBar key={skill.name} {...skill} delay={i * 0.05} />
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
