"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
}

const categoryGradients: Record<string, string> = {
  "Manufacturing": "from-orange-500/10 via-amber-600/5 to-transparent",
  "Finance": "from-emerald-500/10 via-green-600/5 to-transparent",
  "Integrations": "from-violet-500/10 via-purple-600/5 to-transparent",
  "AI & Automation": "from-cyan-500/10 via-blue-600/5 to-transparent",
  "Data & Dashboards": "from-blue-500/10 via-indigo-600/5 to-transparent",
  "Operations": "from-amber-500/10 via-yellow-600/5 to-transparent",
  "Academic": "from-rose-500/10 via-pink-600/5 to-transparent",
};

const categoryAccents: Record<string, string> = {
  "Manufacturing": "text-orange-400 border-orange-500/20",
  "Finance": "text-emerald-400 border-emerald-500/20",
  "Integrations": "text-violet-400 border-violet-500/20",
  "AI & Automation": "text-cyan-400 border-cyan-500/20",
  "Data & Dashboards": "text-blue-400 border-blue-500/20",
  "Operations": "text-amber-400 border-amber-500/20",
  "Academic": "text-rose-400 border-rose-500/20",
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const gradient = categoryGradients[project.category] || "from-accent/10 to-transparent";
  const accent = categoryAccents[project.category] || "text-accent border-accent/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/projects/${project.slug}`}>
        <div className={`group bento-card h-full bg-gradient-to-br ${gradient} p-6`}>
          {/* Category */}
          <span className={`inline-block px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase rounded-full border ${accent} mb-4`}>
            {project.category}
          </span>

          {/* Title */}
          <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors flex items-center gap-2">
            {project.title}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>

          {/* Description */}
          <p className="text-sm text-text-secondary mb-5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Tech */}
          <div className="flex flex-wrap gap-1.5">
            {project.tech.slice(0, 3).map((t) => (
              <span key={t} className="px-2 py-0.5 text-[10px] rounded-md border border-border text-text-secondary">
                {t}
              </span>
            ))}
            {project.tech.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] text-text-secondary">+{project.tech.length - 3}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
