"use client";

import { motion } from "framer-motion";
import { SectionReveal } from "@/components/section-reveal";
import { Briefcase, Factory, ChevronDown } from "lucide-react";
import { experiences } from "@/data/experience";
import { useState } from "react";

function ExperienceCard({ exp, index }: { exp: typeof experiences[0]; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const isErp = exp.type === "erp";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline dot */}
      <div className="absolute left-0 md:left-8 top-8 w-3 h-3 rounded-full bg-accent z-10 ring-4 ring-background" />
      {/* Timeline line */}
      {index < experiences.length - 1 && (
        <div className="absolute left-[5px] md:left-[37px] top-11 bottom-0 w-px bg-border" />
      )}

      <div className="ml-8 md:ml-20">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left luxury-card shimmer-on-hover bg-surface border border-border rounded-2xl p-8 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isErp ? "bg-accent/10" : "bg-orange-500/10"}`}>
                  {isErp ? <Briefcase className="w-4 h-4 text-accent" /> : <Factory className="w-4 h-4 text-orange-400" />}
                </div>
                <span className="text-xs font-mono text-text-secondary tracking-wider uppercase">{exp.period}</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{exp.title}</h3>
              <p className="text-accent text-sm mb-2">{exp.company} &middot; {exp.location}</p>
              <p className="text-text-secondary text-sm leading-relaxed">{exp.description}</p>
            </div>
            <ChevronDown className={`w-5 h-5 text-text-secondary shrink-0 mt-1 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </div>

          <motion.div
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t border-border">
              <ul className="space-y-3">
                {exp.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </button>
      </div>
    </motion.div>
  );
}

export default function ExperiencePage() {
  return (
    <div className="py-32 md:py-40">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <SectionReveal>
          <div className="grid md:grid-cols-[140px_1fr] gap-8 md:gap-16 mb-24">
            <div className="section-number">E</div>
            <div>
              <p className="text-accent text-xs font-mono tracking-[0.2em] uppercase mb-4">
                <span className="inline-block w-2 h-2 rounded-full bg-accent pulse-dot mr-2 align-middle" />
                Experience
              </p>
              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold tracking-[-0.03em] leading-[0.95] mb-6">
                Career Journey.
              </h1>
              <p className="text-text-secondary text-lg max-w-xl leading-relaxed">
                From managing pressure vessel fabrication on the factory floor to owning the entire ERP
                stack at a manufacturing company — every role shaped how I think about systems.
              </p>
            </div>
          </div>
        </SectionReveal>

        {/* Timeline */}
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <ExperienceCard key={index} exp={exp} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
