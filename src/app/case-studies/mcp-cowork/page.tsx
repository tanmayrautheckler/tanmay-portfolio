import type { Metadata } from "next";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ReadingGuide } from "@/components/case-studies/reading-guide";
import { CSFooter } from "@/components/case-studies/cs-footer";
import {
  META,
  HERO_NUMBER,
  SITUATION,
  PROBLEM,
  MCP_SERVERS,
  ARTIFACTS,
  DAY_IN_LIFE,
  OUTCOMES,
  FOLLOW_ON,
  LESSONS,
  TEAM,
  STATUS,
} from "@/data/case-studies/mcp-cowork/content";
import {
  MCPGraph,
  WorkflowBeforeAfter,
  DayInLife,
  ArtifactGallery,
  ToolkitMoat,
} from "@/components/case-studies/mcp-cowork-visuals";

export const metadata: Metadata = {
  title: `${META.title} — Tanmay Raut`,
  description: META.subtitle,
  robots: { index: false, follow: false, nocache: true },
};

export default function MCPCoworkCaseStudy() {
  return (
    <article className="serif-prose-root">
      <ReadingGuide items={[{ id: "overview", label: "Overview" }, { id: "workflow", label: "Workflow" }, { id: "toolkit", label: "Toolkit" }, { id: "artifacts", label: "Artifacts" }, { id: "outcomes", label: "Outcomes" }, { id: "lessons", label: "Lessons" }]} />
      {/* ═══ HERO ═══ */}
      <section id="overview" className="relative min-h-[92vh] flex flex-col justify-center px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto w-full">
          <p className="text-[11px] md:text-xs font-mono uppercase tracking-[0.25em] text-text-secondary mb-8 md:mb-12 flex items-center gap-3">
            <span className="w-8 h-px bg-text-secondary/40" />
            Case Study 03 · AI Co-work
            <span className="hidden md:inline w-8 h-px bg-text-secondary/40" />
            <span className="hidden md:inline opacity-60">{META.date}</span>
          </p>

          <h1 className="serif-display text-[2.5rem] leading-[1.05] md:text-[4.25rem] md:leading-[1.02] lg:text-[5.5rem] lg:leading-[1] font-normal tracking-tight text-foreground">
            {META.title}
          </h1>

          <p className="mt-6 md:mt-8 text-lg md:text-2xl text-text-secondary serif-prose max-w-3xl">
            {META.subtitle}
          </p>

          {/* Big number */}
          <div className="mt-16 md:mt-24 lg:mt-28 grid grid-cols-1 md:grid-cols-[auto_1fr] md:items-end gap-6 md:gap-10">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-3">
                Live tool surface
              </p>
              <p className="serif-display text-6xl md:text-8xl lg:text-[9rem] font-normal tracking-tight text-foreground leading-none">
                {HERO_NUMBER.big}
                <span className="text-3xl md:text-4xl lg:text-5xl text-text-secondary ml-2">
                  {HERO_NUMBER.unit}
                </span>
              </p>
            </div>
            <p className="text-sm md:text-base text-text-secondary serif-prose max-w-md md:pb-4">
              {HERO_NUMBER.caption}
            </p>
          </div>

          <div className="mt-16 md:mt-24 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-text-secondary/60">
            <ChevronDown className="w-3.5 h-3.5" />
            Scroll
          </div>
        </div>
      </section>

      {/* ═══ SITUATION ═══ */}
      <section id="situation" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
            01 · Situation
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground max-w-3xl">
            One ERP. Eight departments. One person on the platform line.
          </h2>
          <div className="mt-10 md:mt-14 space-y-6 serif-prose text-base md:text-lg text-text-secondary leading-[1.75] max-w-3xl">
            {SITUATION.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM + WORKFLOW BEFORE/AFTER ═══ */}
      <section id="workflow" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-border bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
            02 · Problem
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground max-w-3xl">
            {PROBLEM.lead}
          </h2>
          <ul className="mt-10 md:mt-14 space-y-4 serif-prose text-base md:text-lg text-text-secondary leading-[1.7] max-w-3xl">
            {PROBLEM.body.map((b, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-mono text-xs text-text-secondary/50 mt-1.5">·</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <WorkflowBeforeAfter />
        </div>
      </section>

      {/* ═══ MCP GRAPH + SERVERS ═══ */}
      <section id="toolkit" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
            03 · The toolkit
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground max-w-3xl">
            Ten servers wired into Claude. Each one is a colleague.
          </h2>
          <p className="mt-6 text-base text-text-secondary serif-prose max-w-3xl leading-[1.7]">
            MCP (Model Context Protocol) lets Claude call real systems — read live records, write
            updates, take screenshots, query memory. The graph below is live at Heckler. Hover any
            node to see what it does for the business.
          </p>

          <MCPGraph servers={MCP_SERVERS} />

          <ToolkitMoat />
        </div>
      </section>

      {/* ═══ ARTIFACTS ═══ */}
      <section id="artifacts" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-border bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
            04 · Real work, shipped
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground max-w-3xl">
            Modules. Portals. Tools. Migrations. Docs.
          </h2>
          <p className="mt-6 text-base text-text-secondary serif-prose max-w-3xl leading-[1.7]">
            Eight artifacts shipped or in active maintenance. Some had Claude drafting Python that
            an external developer reviewed; some were 100% solo with Claude as pair-coder. All of
            them lived through the same plan-mode → review → ship loop.
          </p>

          <ArtifactGallery artifacts={ARTIFACTS} />
        </div>
      </section>

      {/* ═══ DAY IN LIFE ═══ */}
      <section id="day" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
            05 · A day in the life
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground max-w-3xl">
            Most of the job is now learning, not typing.
          </h2>

          <DayInLife phases={DAY_IN_LIFE} />
        </div>
      </section>

      {/* ═══ OUTCOMES ═══ */}
      <section id="outcomes" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-border bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
            06 · Outcomes
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground max-w-3xl mb-12 md:mb-16">
            What scaled with one ERP owner.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {OUTCOMES.map((m, i) => (
              <div key={i} className="border-l-2 border-accent/40 pl-6 md:pl-8">
                <p className="serif-display text-3xl md:text-5xl font-normal text-foreground leading-tight">
                  {m.value}
                </p>
                <p className="text-xs uppercase tracking-wider text-accent mt-2">{m.label}</p>
                <p className="serif-prose text-sm text-text-secondary mt-3 leading-[1.7]">
                  {m.caption}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 md:mt-20 border-t border-border/60 pt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-secondary mb-6">
              Follow-on
            </p>
            <ul className="space-y-3 serif-prose text-base text-text-secondary leading-[1.7] max-w-3xl">
              {FOLLOW_ON.map((f, i) => (
                <li key={i} className="flex gap-3">
                  <ArrowRight className="w-4 h-4 mt-1.5 shrink-0 text-accent/70" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ LESSONS ═══ */}
      <section id="lessons" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
            07 · Lessons
          </p>
          <h2 className="serif-display text-3xl md:text-5xl font-normal tracking-tight leading-[1.1] text-foreground max-w-3xl mb-12 md:mb-16">
            What I&apos;d tell another ERP owner.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            {LESSONS.map((l, i) => (
              <div key={i}>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent mb-3">
                  Lesson {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="serif-display text-xl md:text-2xl font-normal tracking-tight text-foreground leading-[1.25] mb-3">
                  {l.title}
                </h3>
                <p className="serif-prose text-sm md:text-base text-text-secondary leading-[1.7]">
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM + STATUS ═══ */}
      <section id="team" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-border bg-surface/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
              Team
            </p>
            <ul className="space-y-4 serif-prose">
              {TEAM.map((t, i) => (
                <li key={i}>
                  <p className="text-base text-foreground font-medium">{t.name}</p>
                  <p className="text-sm text-text-secondary leading-[1.6]">{t.role}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
              {STATUS.label}
            </p>
            <p className="serif-prose text-base text-text-secondary leading-[1.7]">
              {STATUS.text}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER NAV ═══ */}
      <CSFooter current="mcp-cowork" />
    </article>
  );
}
