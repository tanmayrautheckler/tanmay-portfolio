"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2 } from "lucide-react";
import { SectionReveal, StaggerContainer, StaggerItem } from "@/components/section-reveal";
import { projects, type CaseStudySection } from "@/data/projects";
import { mockups } from "@/components/project-mockups";

const MermaidDiagram = dynamic(() => import("@/components/mermaid-diagram"), { ssr: false });

/* ═══ PALETTE (same as project-card.tsx) ═══ */
const palette: Record<string, { c: string; r: string }> = {
  "AI & Automation":    { c: "#0EBBFF", r: "14,187,255" },
  Manufacturing:        { c: "#22c55e", r: "34,197,94" },
  Integrations:         { c: "#a855f7", r: "168,85,247" },
  Finance:              { c: "#f59e0b", r: "245,158,11" },
  "Data & Dashboards":  { c: "#ec4899", r: "236,72,153" },
  Operations:           { c: "#06b6d4", r: "6,182,212" },
  Academic:             { c: "#8b5cf6", r: "139,92,246" },
};

/* ═══ CASE STUDY SECTION RENDERER ═══ */
function CaseStudyBlock({ section, accent }: { section: CaseStudySection; accent: string }) {
  const Mockup = section.mockup ? mockups[section.mockup] : null;
  const MockupLeft = section.mockupLeft ? mockups[section.mockupLeft] : null;
  const MockupRight = section.mockupRight ? mockups[section.mockupRight] : null;

  switch (section.type) {
    case "narrative":
      return (
        <SectionReveal>
          <div className="max-w-3xl">
            {section.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{section.title}</h2>
            )}
            <p className="text-base md:text-lg text-white/45 leading-relaxed">{section.body}</p>
          </div>
        </SectionReveal>
      );

    case "mockup":
      return (
        <SectionReveal>
          <div className="max-w-5xl">
            {section.title && (
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{section.title}</h2>
            )}
            {Mockup && <Mockup />}
            {section.caption && (
              <p className="text-[13px] text-white/25 mt-4 max-w-2xl">{section.caption}</p>
            )}
          </div>
        </SectionReveal>
      );

    case "mockup-pair":
      return (
        <SectionReveal>
          <div className="max-w-6xl">
            {section.title && (
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{section.title}</h2>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {MockupLeft && <MockupLeft />}
                {section.captionLeft && (
                  <p className="text-[12px] text-white/25 mt-3">{section.captionLeft}</p>
                )}
              </div>
              <div>
                {MockupRight && <MockupRight />}
                {section.captionRight && (
                  <p className="text-[12px] text-white/25 mt-3">{section.captionRight}</p>
                )}
              </div>
            </div>
          </div>
        </SectionReveal>
      );

    case "flow":
      return (
        <SectionReveal>
          <div className="max-w-5xl">
            {section.title && (
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{section.title}</h2>
            )}
            {Mockup && <Mockup />}
            {section.caption && (
              <p className="text-[13px] text-white/25 mt-4 max-w-2xl">{section.caption}</p>
            )}
          </div>
        </SectionReveal>
      );

    case "metrics":
      return (
        <SectionReveal>
          <div className="max-w-5xl">
            {section.title && (
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{section.title}</h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {section.metrics?.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white/[0.03] rounded-xl border border-white/5 p-5 text-center hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: accent }}>{m.value}</div>
                  <div className="text-[13px] text-white/50 font-medium">{m.label}</div>
                  {m.sub && <div className="text-[11px] text-white/20 mt-1">{m.sub}</div>}
                </motion.div>
              ))}
            </div>
          </div>
        </SectionReveal>
      );

    case "quote":
      return (
        <SectionReveal>
          <div className="max-w-3xl">
            <blockquote className="border-l-2 pl-6 py-2" style={{ borderColor: accent }}>
              <p className="text-lg md:text-xl text-white/50 italic leading-relaxed">&ldquo;{section.body}&rdquo;</p>
            </blockquote>
          </div>
        </SectionReveal>
      );

    case "image":
      return (
        <SectionReveal>
          <div className="max-w-5xl">
            {section.title && (
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{section.title}</h2>
            )}
            {section.image && (
              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <Image src={section.image} alt={section.title || ""} width={1200} height={800} className="w-full h-auto" />
              </div>
            )}
            {section.caption && (
              <p className="text-[13px] text-white/25 mt-4 max-w-2xl">{section.caption}</p>
            )}
          </div>
        </SectionReveal>
      );

    case "image-pair":
      return (
        <SectionReveal>
          <div className="max-w-6xl">
            {section.title && (
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{section.title}</h2>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                {section.imageLeft && (
                  <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image src={section.imageLeft} alt={section.captionLeft || ""} width={800} height={600} className="w-full h-auto" />
                  </div>
                )}
                {section.captionLeft && <p className="text-[12px] text-white/25 mt-3">{section.captionLeft}</p>}
              </div>
              <div>
                {section.imageRight && (
                  <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image src={section.imageRight} alt={section.captionRight || ""} width={800} height={600} className="w-full h-auto" />
                  </div>
                )}
                {section.captionRight && <p className="text-[12px] text-white/25 mt-3">{section.captionRight}</p>}
              </div>
            </div>
          </div>
        </SectionReveal>
      );

    case "image-grid":
      return (
        <SectionReveal>
          <div className="max-w-6xl">
            {section.title && (
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{section.title}</h2>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {section.images?.map((img, i) => (
                <div key={i}>
                  <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image src={img.src} alt={img.caption || ""} width={800} height={600} className="w-full h-auto" />
                  </div>
                  {img.caption && <p className="text-[12px] text-white/25 mt-2">{img.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      );

    case "mermaid":
      return (
        <SectionReveal>
          <div className="max-w-5xl">
            {section.title && (
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{section.title}</h2>
            )}
            {section.mermaid && (
              <MermaidDiagram chart={section.mermaid} caption={section.caption} />
            )}
          </div>
        </SectionReveal>
      );

    case "code":
      return (
        <SectionReveal>
          <div className="max-w-4xl">
            {section.title && (
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{section.title}</h2>
            )}
            <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 text-[11px] text-white/25">
                <span className="font-mono">{section.language || "python"}</span>
              </div>
              <pre className="p-5 overflow-x-auto text-[12px] leading-relaxed font-mono text-white/50">
                <code>{section.code}</code>
              </pre>
            </div>
            {section.caption && <p className="text-[12px] text-white/20 mt-3">{section.caption}</p>}
          </div>
        </SectionReveal>
      );

    default:
      return null;
  }
}

/* ═══ CASE STUDY LAYOUT (featured projects) ═══ */
function CaseStudyLayout({ slug }: { slug: string }) {
  const projectIndex = projects.findIndex((p) => p.slug === slug);
  const project = projects[projectIndex];
  const { c } = palette[project.category] ?? { c: "#0EBBFF" };
  const prev = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const next = projectIndex < projects.length - 1 ? projects[projectIndex + 1] : null;

  return (
    <div className="featured-work-section min-h-screen">
      {/* Hero section */}
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to projects
            </Link>
          </motion.div>

          <SectionReveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.15em] rounded-full border" style={{ color: c, borderColor: `${c}33`, background: `${c}15` }}>
                {project.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/25">
                <Calendar className="w-3 h-3" /> {project.date}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 tracking-tight">{project.title}</h1>
            <p className="text-lg md:text-xl text-white/35 leading-relaxed max-w-3xl">{project.description}</p>
          </SectionReveal>

          <SectionReveal>
            <div className="flex flex-wrap gap-2 mt-8">
              {project.tech.map((t) => (
                <span key={t} className="px-3 py-1.5 text-[11px] font-mono bg-white/[0.03] border border-white/5 rounded-lg text-white/30">{t}</span>
              ))}
            </div>
          </SectionReveal>
        </div>
      </div>

      {/* Accent divider */}
      <div className="h-px mx-auto max-w-5xl" style={{ background: `linear-gradient(90deg, transparent, ${c}33, transparent)` }} />

      {/* Case study sections */}
      <div className="px-6">
        <div className="max-w-5xl mx-auto space-y-20 py-20">
          {project.caseStudy?.map((section, i) => (
            <CaseStudyBlock key={i} section={section} accent={c} />
          ))}
        </div>
      </div>

      {/* Impact section */}
      <div className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-white mb-6">Impact</h2>
              <StaggerContainer className="space-y-4">
                {project.impact.map((item, i) => (
                  <StaggerItem key={i}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: c }} />
                      <p className="text-white/45">{item}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </SectionReveal>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-24">
        <div className="max-w-5xl mx-auto pt-8 border-t border-white/5 flex items-center justify-between">
          {prev ? (
            <Link href={`/projects/${prev.slug}`} className="flex items-center gap-2 text-sm text-white/25 hover:text-white/50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <div><div className="text-[10px] text-white/15">Previous</div><div className="font-medium text-white/40">{prev.title}</div></div>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`/projects/${next.slug}`} className="flex items-center gap-2 text-sm text-white/25 hover:text-white/50 transition-colors text-right">
              <div><div className="text-[10px] text-white/15">Next</div><div className="font-medium text-white/40">{next.title}</div></div>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}

/* ═══ SIMPLE LAYOUT (non-featured projects) ═══ */
function SimpleLayout({ slug }: { slug: string }) {
  const projectIndex = projects.findIndex((p) => p.slug === slug);
  const project = projects[projectIndex];
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

/* ═══ MAIN EXPORT — routes to case study or simple layout ═══ */
export default function ProjectDetail({ slug }: { slug: string }) {
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Link href="/projects" className="text-accent mt-4 inline-block">Back to projects</Link>
      </div>
    );
  }

  if (project.caseStudy && project.caseStudy.length > 0) {
    return <CaseStudyLayout slug={slug} />;
  }

  return <SimpleLayout slug={slug} />;
}
