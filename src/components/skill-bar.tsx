"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { Skill } from "@/data/skills";

export function SkillBar({ skill }: { skill: Skill }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });

  const levelColors = {
    Expert: "bg-accent",
    Proficient: "bg-purple-500",
    Familiar: "bg-orange-400",
  };

  return (
    <div ref={ref} className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm">{skill.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${
          skill.level === "Expert"
            ? "text-accent border-accent/30 bg-accent/10"
            : skill.level === "Proficient"
            ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
            : "text-orange-400 border-orange-500/30 bg-orange-500/10"
        }`}>
          {skill.level}
        </span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${skill.percentage}%` } : { width: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className={`h-full rounded-full ${levelColors[skill.level]}`}
        />
      </div>
    </div>
  );
}
