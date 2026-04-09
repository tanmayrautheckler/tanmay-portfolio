"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2 } from "lucide-react";
import { SectionReveal, StaggerContainer, StaggerItem } from "@/components/section-reveal";
import { projects } from "@/data/projects";

export default function ProjectDetail({ slug }: { slug: string }) {
  const projectIndex = projects.findIndex((p) => p.slug === slug);
  const project = projects[projectIndex];

  if (!project) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Link href="/projects" className="text-accent mt-4 inline-block">Back to projects</Link>
      </div>
    );
  }

  const prev = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const next = projectIndex < projects.length - 1 ? projects[projectIndex + 1] : null;

  const categoryColors: Record<string, string> = {
    "Manufacturing": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "Finance": "bg-green-500/10 text-green-400 border-green-500/20",
    "Integrations": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "AI & Automation": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "Data & Dashboards": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Operations": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "Academic": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to projects
          </Link>
        </motion.div>

        <SectionReveal>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColors[project.category] || ""}`}>{project.category}</span>
            <span className="flex items-center gap-1 text-xs text-text-secondary"><Calendar className="w-3 h-3" /> {project.date}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
          <p className="text-xl text-text-secondary leading-relaxed">{project.description}</p>
        </SectionReveal>

        <SectionReveal>
          <div className="flex flex-wrap gap-2 mt-8 mb-16">
            {project.tech.map((t) => (
              <span key={t} className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg">{t}</span>
            ))}
          </div>
        </SectionReveal>

        <div className="space-y-12">
          <SectionReveal>
            <div className="bg-surface border border-border rounded-xl p-8">
              <h2 className="text-xl font-semibold mb-4">The Problem</h2>
              <p className="text-text-secondary leading-relaxed">{project.problem}</p>
            </div>
          </SectionReveal>
          <SectionReveal>
            <div className="bg-surface border border-border rounded-xl p-8">
              <h2 className="text-xl font-semibold mb-4">My Role</h2>
              <p className="text-text-secondary leading-relaxed">{project.role}</p>
            </div>
          </SectionReveal>
          <SectionReveal>
            <div className="bg-surface border border-border rounded-xl p-8">
              <h2 className="text-xl font-semibold mb-4">The Solution</h2>
              <p className="text-text-secondary leading-relaxed">{project.solution}</p>
            </div>
          </SectionReveal>
          <SectionReveal>
            <div className="bg-surface border border-border rounded-xl p-8">
              <h2 className="text-xl font-semibold mb-4">Impact</h2>
              <StaggerContainer className="space-y-3">
                {project.impact.map((item, i) => (
                  <StaggerItem key={i}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <p className="text-text-secondary">{item}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </SectionReveal>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
          {prev ? (
            <Link href={`/projects/${prev.slug}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <div><div className="text-xs text-text-secondary">Previous</div><div className="font-medium text-foreground">{prev.title}</div></div>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`/projects/${next.slug}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors text-right">
              <div><div className="text-xs text-text-secondary">Next</div><div className="font-medium text-foreground">{next.title}</div></div>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
