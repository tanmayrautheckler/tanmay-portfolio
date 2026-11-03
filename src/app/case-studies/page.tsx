import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { META as ODOO17 } from "@/data/case-studies/odoo-17/content";
import { META as VENDOR } from "@/data/case-studies/vendor-portal/content";
import { META as MCP } from "@/data/case-studies/mcp-cowork/content";
import styles from "./case-studies.module.css";

export const metadata: Metadata = {
  title: "Case notes | Tanmay Raut",
  description: "Detailed project notes on ERP migration, vendor operations and AI integration.",
  robots: { index: false, follow: false, nocache: true },
};
const entries = [
  { slug: "odoo-17", meta: ODOO17, topic: "ERP migration", steps: ["Prepare", "Cut over", "Stabilize"] },
  { slug: "vendor-portal", meta: VENDOR, topic: "Vendor operations", steps: ["Map the work", "Connect records", "Define access"] },
  { slug: "mcp-cowork", meta: MCP, topic: "AI integration", steps: ["Connect tools", "Set boundaries", "Support the work"] },
];
export default function CaseStudiesIndex() {
  return <article className={styles.index}>
    <header className={styles.indexHeader}><div><p className={styles.eyebrow}>Case notes / Preview collection</p><h1>How the decisions<br /><em>were made.</em></h1></div><p>A closer look at the scope, tradeoffs, implementation and follow-up behind three projects. These working accounts include the difficult parts as well as the outcome.</p></header>
    <div className={styles.caseList}>{entries.map((entry, index) => <Link key={entry.slug} href={`/case-studies/${entry.slug}`} className={styles.caseEntry}>
      <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span><div><p className={styles.eyebrow}>{entry.topic} / {entry.meta.date}</p><h2>{entry.meta.title}</h2><p>{entry.meta.subtitle}</p><span className={styles.readLink}>Read the preview <ArrowUpRight size={16} /></span></div><div className={styles.caseDiagram} aria-hidden="true">{entry.steps.map((step) => <span key={step}>{step}</span>)}</div>
    </Link>)}</div>
    <p className={styles.indexNote}>This collection remains under publication review. The public project index contains the shorter project stories.</p>
  </article>;
}
