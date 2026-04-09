"use client";

import { motion } from "framer-motion";
import { Briefcase, Factory } from "lucide-react";
import type { Experience } from "@/data/experience";

interface TimelineProps {
  experiences: Experience[];
}

export function Timeline({ experiences }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

      {experiences.map((exp, index) => {
        const isLeft = index % 2 === 0;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className={`relative flex items-start gap-6 mb-12 ${
              isLeft ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Dot */}
            <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-accent border-2 border-background -translate-x-1.5 mt-6 z-10 md:-translate-x-1.5" />

            {/* Spacer for mobile */}
            <div className="w-12 shrink-0 md:hidden" />

            {/* Content */}
            <div className={`flex-1 max-w-full md:max-w-[calc(50%-2rem)] ${isLeft ? "md:text-right md:pr-12" : "md:pl-12"}`}>
              <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent/30 transition-colors">
                <div className={`flex items-center gap-2 mb-2 ${isLeft ? "md:justify-end" : ""}`}>
                  {exp.type === "manufacturing" ? (
                    <Factory className="w-4 h-4 text-orange-400" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-accent" />
                  )}
                  <span className="text-xs text-text-secondary uppercase tracking-wider">
                    {exp.period}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-1">{exp.title}</h3>
                <p className="text-sm text-accent mb-3">{exp.company} &middot; {exp.location}</p>
                <p className="text-sm text-text-secondary mb-4">{exp.description}</p>

                <ul className={`space-y-2 ${isLeft ? "md:text-right" : ""}`}>
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className={`w-1 h-1 rounded-full bg-accent mt-2 shrink-0 ${isLeft ? "md:order-last" : ""}`} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hidden spacer for desktop */}
            <div className="hidden md:block flex-1 max-w-[calc(50%-2rem)]" />
          </motion.div>
        );
      })}
    </div>
  );
}
