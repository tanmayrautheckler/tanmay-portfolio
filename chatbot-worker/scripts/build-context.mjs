/**
 * Build-time context generator.
 *
 * Reads from an explicit ALLOWLIST of TS data files in the portfolio repo,
 * transforms each into prose, concatenates with section headers, writes
 * chatbot-worker/src/context.generated.md.
 *
 * Run via: npm run build:context
 *
 * Privacy invariant: this script reads ONLY from the paths in ALLOWLIST.
 * It does not glob, walk directories, or touch ~/.claude/* directly.
 * The memory-allowlist.ts file is the privacy firewall for personal context.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const OUTPUT_PATH = resolve(__dirname, "../src/context.generated.md");

// ════════════════════════════════════════════════════════════════════
// IMPORT ALLOWLIST — every data source must be listed here
// ════════════════════════════════════════════════════════════════════

const { projects } = await import(resolve(REPO_ROOT, "src/data/projects.ts"));
const { skillCategories } = await import(resolve(REPO_ROOT, "src/data/skills.ts"));
const { experiences } = await import(resolve(REPO_ROOT, "src/data/experience.ts"));
const {
  META,
  SITUATION,
  PROBLEM,
  APPROACH,
  TIERS,
  SIGN_OFF,
  RAMP_GAP,
  OUTCOME_METRICS,
  OUTCOME_FOLLOWON,
  PLATFORM_CONTEXT,
  TEAM,
} = await import(resolve(REPO_ROOT, "src/data/case-studies/odoo-17/content.ts"));
const { SCOPE, SECONDARY_SCOPE } = await import(
  resolve(REPO_ROOT, "src/data/case-studies/odoo-17/scope.ts")
);
const { LESSONS } = await import(resolve(REPO_ROOT, "src/data/case-studies/odoo-17/lessons.ts"));
const { INTEGRATIONS: integrationNodes } = await import(
  resolve(REPO_ROOT, "src/data/case-studies/odoo-17/integrations.ts")
);
const {
  ABOUT_HERO,
  IDENTITY_CARDS,
  EDUCATION,
  CERTIFICATIONS,
  CONTACT,
} = await import(resolve(__dirname, "about-extract.ts"));
const { PHILOSOPHIES } = await import(resolve(__dirname, "memory-allowlist.ts"));

// ════════════════════════════════════════════════════════════════════
// SECTION BUILDERS
// ════════════════════════════════════════════════════════════════════

function header(text) {
  return `\n\n## ${text}\n\n`;
}

function subheader(text) {
  return `\n### ${text}\n\n`;
}

function buildIdentity() {
  let md = header("Identity");
  md += `${ABOUT_HERO}\n\n`;
  md += subheader("Things about Tanmay");
  for (const card of IDENTITY_CARDS) {
    md += `- **${card.title}** — ${card.body}\n`;
  }
  md += subheader("Education");
  for (const e of EDUCATION) {
    md += `- ${e.degree}, ${e.school} (${e.location}; GPA ${e.gpa})\n`;
  }
  md += subheader("Certifications");
  md += CERTIFICATIONS.map((c) => `- ${c}`).join("\n") + "\n";
  md += subheader("Contact");
  md += `- Email: ${CONTACT.email}\n`;
  md += `- LinkedIn: ${CONTACT.linkedin}\n`;
  md += `- GitHub: ${CONTACT.github}\n`;
  md += `- Location: ${CONTACT.location}\n`;
  return md;
}

function buildPhilosophies() {
  let md = header("How Tanmay Works (Philosophy & Standards)");
  md += "These principles guide Tanmay's approach to building systems and collaborating with humans and AI.\n\n";
  for (const p of PHILOSOPHIES) {
    md += `- **${p.title}** — ${p.body}\n`;
  }
  return md;
}

function buildExperience() {
  let md = header("Experience");
  for (const exp of experiences) {
    md += `### ${exp.title} — ${exp.company} (${exp.period})\n`;
    md += `**Location:** ${exp.location}\n\n`;
    md += `${exp.description}\n\n`;
    md += `**Highlights:**\n`;
    for (const h of exp.highlights) md += `- ${h}\n`;
    md += "\n";
  }
  return md;
}

function buildSkills() {
  let md = header("Skills");
  for (const cat of skillCategories) {
    md += `### ${cat.name}\n`;
    for (const skill of cat.skills) {
      md += `- ${skill.name} — ${skill.level} (${skill.percentage}%)\n`;
    }
    md += "\n";
  }
  return md;
}

function buildProjects() {
  let md = header("Projects");
  md += `Tanmay's portfolio includes ${projects.length} projects across manufacturing operations, ERP, integrations, AI, data dashboards, personal prototypes and academic work. Featured projects have full case studies; the rest are summarized below.\n\n`;

  // Featured first
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  if (featured.length) {
    md += subheader("Featured projects");
    for (const p of featured) {
      md += projectBlock(p, /* detailed */ true);
    }
  }

  if (others.length) {
    md += subheader("Additional projects");
    for (const p of others) {
      md += projectBlock(p, /* detailed */ false);
    }
  }

  return md;
}

function projectBlock(p, detailed) {
  let md = `\n#### ${p.title} (${p.date})\n`;
  md += `**Category:** ${p.category}\n`;
  md += `**Description:** ${p.description}\n`;
  md += `**Tech:** ${p.tech.join(", ")}\n`;
  md += `**Problem:** ${p.problem}\n`;
  md += `**Role:** ${p.role}\n`;
  md += `**Solution:** ${p.solution}\n`;
  md += `**Impact:** ${p.impact.join("; ")}\n`;

  // Include case study narrative for featured projects to give the bot richer context
  if (detailed && Array.isArray(p.caseStudy) && p.caseStudy.length) {
    md += `\n**Case study narrative:**\n`;
    for (const section of p.caseStudy) {
      if (section.type === "narrative" && section.body) {
        if (section.title) md += `\n*${section.title}* — `;
        md += section.body + "\n";
      } else if (section.type === "quote" && section.body) {
        md += `> ${section.body}\n`;
      } else if (section.type === "metrics" && section.metrics) {
        md += `\nMetrics: `;
        md += section.metrics.map((m) => `${m.label}: ${m.value}`).join("; ") + "\n";
      }
      // skip mockup/image/mermaid/code sections — too noisy for prompt context
    }
  }

  md += "\n";
  return md;
}

function buildOdoo17() {
  let md = header("Featured Case Study — Odoo 16 → 17 Cutover at Heckler Design");
  md += `**Title:** ${META.title}\n`;
  md += `**Subtitle:** ${META.subtitle}\n`;
  md += `**Role:** ${META.role}\n`;
  md += `**Date:** ${META.date}\n`;
  md += `**Published source:** ${META.publishedSourceStory}\n\n`;

  md += subheader("Situation");
  for (const para of SITUATION.paragraphs) md += `${para}\n\n`;

  md += subheader("Scope at cutover");
  for (const stat of SCOPE) {
    const display = stat.formatted || `${stat.value}${stat.suffix || ""}`;
    md += `- **${display}** ${stat.label} — ${stat.tooltip}\n`;
  }
  md += `\nSecondary scope: ${SECONDARY_SCOPE.productTemplates.toLocaleString()} product templates, ${SECONDARY_SCOPE.routedOperations.toLocaleString()} routed operations across ${SECONDARY_SCOPE.departments} departments, ~${(SECONDARY_SCOPE.salesOrders / 1000).toFixed(0)}K sales orders, ~${(SECONDARY_SCOPE.manufacturingOrders / 1000).toFixed(0)}K manufacturing orders, ~${(SECONDARY_SCOPE.purchaseOrders / 1000).toFixed(0)}K purchase orders.\n`;

  md += subheader("Problem");
  md += `${PROBLEM.lead}\n\n`;
  for (const para of PROBLEM.body) md += `${para}\n\n`;

  md += subheader("Critical integrations and what would break");
  for (const node of integrationNodes) {
    md += `- **${node.name}** ${node.noSandbox ? "(no sandbox — live-only validation)" : ""} — If broken: ${node.ifBroke}\n`;
  }

  md += subheader("Approach");
  for (const pillar of APPROACH) {
    md += `- **${pillar.title}** — ${pillar.body}\n`;
  }

  md += subheader("Tiered go-live framework");
  md += `\n**${TIERS.critical.label}** — ${TIERS.critical.blurb}\n`;
  for (const item of TIERS.critical.items) {
    md += `  - ${item.label}${item.owner ? ` (owner: ${item.owner})` : ""}\n`;
  }
  md += `\n**${TIERS.oneWeek.label}** — ${TIERS.oneWeek.blurb}\n`;
  for (const item of TIERS.oneWeek.items) {
    md += `  - ${item.label}${item.owner ? ` (owner: ${item.owner})` : ""}\n`;
  }
  md += `\n**${TIERS.moreThanWeek.label}** — ${TIERS.moreThanWeek.blurb}\n`;
  for (const item of TIERS.moreThanWeek.items) {
    md += `  - ${item.label}${item.owner ? ` (owner: ${item.owner})` : ""}\n`;
  }

  md += subheader("Stakeholder sign-off");
  for (const s of SIGN_OFF) {
    md += `- ${s.name} (${s.role}) ${s.signed ? "✓ signed off" : "did not sign"}\n`;
  }

  md += subheader("The Ramp gap");
  md += `${RAMP_GAP.body}\n\n${RAMP_GAP.reassurance}\n`;

  md += subheader("Outcome — upgrade-specific");
  for (const m of OUTCOME_METRICS) {
    md += `- **${m.value}** ${m.label} — ${m.caption}\n`;
  }
  md += `\n**Follow-on outcomes:**\n`;
  for (const f of OUTCOME_FOLLOWON) md += `- ${f}\n`;

  md += subheader("Platform context (pre-dates the 16→17 upgrade)");
  md += `These figures are published by Odoo and reflect the cumulative platform outcome since the earlier 14→16 Xero-elimination migration. They are context for the value preserved by the 16→17 upgrade, not caused by it.\n\n`;
  for (const m of PLATFORM_CONTEXT) {
    md += `- **${m.value}** ${m.label} — ${m.caption}\n`;
  }

  md += subheader("Team");
  for (const t of TEAM) md += `- **${t.name}** — ${t.role} ${t.internal ? "(internal)" : "(external)"}\n`;

  md += subheader("Lessons");
  for (const l of LESSONS) {
    md += `**${l.number}. ${l.title}**${l.emphasis ? " *(thesis)*" : ""}\n${l.body}\n\n`;
  }

  return md;
}

// ════════════════════════════════════════════════════════════════════
// COMPOSE + WRITE
// ════════════════════════════════════════════════════════════════════

const sections = [
  `# Tanmay Raut — Portfolio Context\n\nGenerated by chatbot-worker/scripts/build-context.mjs. Do not edit by hand — re-run the build script after updating source files.`,
  buildIdentity(),
  buildPhilosophies(),
  buildExperience(),
  buildSkills(),
  buildProjects(),
  buildOdoo17(),
];

const output = sections.join("\n");
writeFileSync(OUTPUT_PATH, output, "utf8");

const charCount = output.length;
const approxTokens = Math.round(charCount / 4);
console.log(`✓ Wrote ${OUTPUT_PATH}`);
console.log(`  ${charCount.toLocaleString()} chars  ≈ ${approxTokens.toLocaleString()} tokens`);
console.log(`  Privacy: ${PHILOSOPHIES.length} curated philosophies + ${IDENTITY_CARDS.length} identity cards + ${projects.length} projects`);

if (approxTokens < 4096) {
  console.warn(`\n⚠ Context is ${approxTokens} tokens — below Haiku 4.5's 4096-token cache minimum. Prompt caching will silently fail.`);
}
