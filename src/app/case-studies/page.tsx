import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { META as ODOO17 } from "@/data/case-studies/odoo-17/content";

export const metadata: Metadata = {
  title: "Case Studies — Tanmay Raut",
  description: "Long-form deep dives on major ERP projects I've led.",
  robots: { index: false, follow: false, nocache: true },
};

interface Entry {
  number: string;
  slug: string | null; // null = coming soon
  title: string;
  subtitle: string;
  meta: string;
  bigNumber?: string;
  bigLabel?: string;
}

const ENTRIES: Entry[] = [
  {
    number: "01",
    slug: "odoo-17",
    title: ODOO17.title,
    subtitle: ODOO17.subtitle,
    meta: `${ODOO17.date} · Heckler Design`,
    bigNumber: "65h",
    bigLabel: "Zero-loss cutover",
  },
  {
    number: "02",
    slug: null,
    title: "AEI Vendor Management Portal",
    subtitle: "Replacing a spreadsheet with a full supplier-relationship portal, Odoo as sole data store.",
    meta: "2025 · Heckler Design",
  },
  {
    number: "03",
    slug: null,
    title: "MCP-to-Odoo AI Integration",
    subtitle: "Direct Claude → Odoo tool use via an MCP server. ERP as AI-native system of record.",
    meta: "2026 · Heckler Design",
  },
];

export default function CaseStudiesIndex() {
  return (
    <article className="px-6 md:px-12 lg:px-20 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-text-secondary mb-5">
          Case Studies
        </p>
        <h1 className="serif-display text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.05] text-foreground max-w-4xl">
          Long-form deep dives on ERP projects I&apos;ve led.
        </h1>
        <p className="mt-6 md:mt-8 text-base md:text-lg text-text-secondary serif-prose max-w-2xl leading-[1.7]">
          Each case study covers scope, tradeoffs, cutover execution, transparent
          disclosure of what broke, and lessons that transfer to the next engagement.
          Not marketing. Not a project card. Engineering record with CEO-attributed
          outcomes.
        </p>

        {/* List */}
        <ul className="mt-20 md:mt-28 border-t border-border/60">
          {ENTRIES.map((entry) => {
            const isLive = entry.slug !== null;
            const inner = (
              <div className="grid grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-baseline py-10 md:py-14 border-b border-border/60 group-hover:bg-surface-hover/30 transition-colors -mx-4 md:-mx-6 px-4 md:px-6 rounded-sm">
                <span className="font-mono text-xs text-text-secondary w-8">
                  {entry.number}
                </span>
                <div className="min-w-0">
                  <h2
                    className={`serif-display text-xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-[1.15] ${
                      isLive ? "text-foreground" : "text-foreground/40"
                    }`}
                  >
                    {entry.title}
                  </h2>
                  <p
                    className={`mt-2 md:mt-3 serif-prose text-sm md:text-base leading-relaxed ${
                      isLive ? "text-text-secondary" : "text-text-secondary/60"
                    }`}
                  >
                    {entry.subtitle}
                  </p>
                  <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary/70">
                    {entry.meta}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {isLive ? (
                    <>
                      {entry.bigNumber ? (
                        <div className="serif-display text-2xl md:text-4xl tracking-tight text-foreground leading-none">
                          {entry.bigNumber}
                        </div>
                      ) : null}
                      {entry.bigLabel ? (
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary mt-1">
                          {entry.bigLabel}
                        </div>
                      ) : null}
                      <div className="inline-flex items-center gap-1.5 mt-4 text-xs font-mono uppercase tracking-[0.2em] text-foreground group-hover:gap-2.5 transition-all">
                        Read
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-secondary/60 px-2.5 py-1 rounded-full border border-border">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>
            );

            return (
              <li key={entry.number}>
                {isLive ? (
                  <Link href={`/case-studies/${entry.slug}`} className="group block">
                    {inner}
                  </Link>
                ) : (
                  <div className="group cursor-default">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Privacy note */}
        <p className="mt-14 text-[10px] font-mono uppercase tracking-[0.25em] text-text-secondary/40">
          Preview · not indexed · attorney review pending
        </p>
      </div>
    </article>
  );
}
