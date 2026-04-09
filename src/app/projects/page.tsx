"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionReveal } from "@/components/section-reveal";
import { ProjectCard } from "@/components/project-card";
import { projects, categories, type ProjectCategory } from "@/data/projects";

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<ProjectCategory | "All">("All");

  const filtered = activeFilter === "All"
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <p className="text-accent text-sm font-mono tracking-wider uppercase mb-4">Projects</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">What I&apos;ve Built</h1>
          <p className="text-xl text-text-secondary max-w-3xl leading-relaxed mb-12">
            Real systems solving real business problems — from native Odoo modules to full-stack
            portals to AI-powered automation.
          </p>
        </SectionReveal>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-12">
          <button
            onClick={() => setActiveFilter("All")}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              activeFilter === "All"
                ? "bg-accent text-black border-accent"
                : "border-border text-text-secondary hover:border-accent/30 hover:text-foreground"
            }`}
          >
            All ({projects.length})
          </button>
          {categories.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  activeFilter === cat
                    ? "bg-accent text-black border-accent"
                    : "border-border text-text-secondary hover:border-accent/30 hover:text-foreground"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Project grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
