import type { Metadata } from "next";
import { ReadingGuide } from "@/components/case-studies/reading-guide";
import { HeroCS } from "@/components/case-studies/hero-cs";
import { ScopeGrid } from "@/components/case-studies/scope-grid";
import { Situation } from "@/components/case-studies/situation";
import { RiskMap } from "@/components/case-studies/risk-map";
import { TieredApproach } from "@/components/case-studies/tiered-approach";
import { GoNoGoChecklist } from "@/components/case-studies/go-nogo-checklist";
import { CutoverTimeline } from "@/components/case-studies/cutover-timeline";
import { SmokeTestDashboard } from "@/components/case-studies/smoke-test-dashboard";
import { IssueRegister } from "@/components/case-studies/issue-register";
import { RampGap } from "@/components/case-studies/ramp-gap";
import { Outcome } from "@/components/case-studies/outcome";
import { LessonsCards } from "@/components/case-studies/lessons-cards";
import { CSFooter } from "@/components/case-studies/cs-footer";
import { META } from "@/data/case-studies/odoo-17/content";

export const metadata: Metadata = {
  title: `${META.title} — Tanmay Raut`,
  description: META.subtitle,
  robots: { index: false, follow: false, nocache: true },
};

export default function OdooSeventeenCaseStudy() {
  return (
    <article className="serif-prose-root">
      <ReadingGuide items={[{ id: "overview", label: "Overview" }, { id: "scope", label: "Scope" }, { id: "decisions", label: "Decisions" }, { id: "cutover", label: "Cutover" }, { id: "outcomes", label: "Outcomes" }, { id: "lessons", label: "Lessons" }]} />
      <HeroCS />
      <ScopeGrid />
      <Situation />
      <RiskMap />
      <TieredApproach />
      <GoNoGoChecklist />
      <CutoverTimeline />
      <SmokeTestDashboard />
      <IssueRegister />
      <RampGap />
      <Outcome />
      <LessonsCards />
      <CSFooter />
    </article>
  );
}
