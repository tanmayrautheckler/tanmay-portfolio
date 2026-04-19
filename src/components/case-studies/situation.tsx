"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { SITUATION, PROBLEM, TEAM } from "@/data/case-studies/odoo-17/content";

export function Situation() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <section ref={ref} className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
      <div className="max-w-[640px] mx-auto">
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-6"
        >
          {SITUATION.title}
        </motion.p>
        {SITUATION.paragraphs.map((para, i) => (
          <motion.p
            key={i}
            initial={reduced ? undefined : { opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="serif-prose text-lg md:text-xl leading-[1.65] text-foreground/85 mb-6 last:mb-0"
          >
            {para}
          </motion.p>
        ))}

        {/* Team split */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 pt-10 border-t border-border/60"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-5">
            Team
          </p>
          <ul className="space-y-3">
            {TEAM.map((member) => (
              <li key={member.name} className="flex items-baseline gap-4 text-sm md:text-base">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 shrink-0 mt-2" />
                <div>
                  <span className="font-medium text-foreground">{member.name}</span>
                  <span className="text-text-secondary ml-2 serif-prose">— {member.role}</span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Problem */}
      <div className="max-w-[640px] mx-auto mt-32 md:mt-40">
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 12 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-6"
        >
          {PROBLEM.title}
        </motion.p>

        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 14 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="serif-display text-2xl md:text-3xl leading-[1.35] text-foreground mb-10 tracking-tight"
        >
          {PROBLEM.lead}
        </motion.p>

        <ul className="space-y-6">
          {PROBLEM.body.map((para, i) => (
            <motion.li
              key={i}
              initial={reduced ? undefined : { opacity: 0, y: 12 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
              className="serif-prose text-base md:text-lg leading-[1.7] text-foreground/85 pl-5 border-l-2 border-border"
            >
              {para}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
