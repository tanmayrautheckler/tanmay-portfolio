/**
 * All prose/copy for the Odoo 16→17 case study in one place.
 * Sourced from case-study-01-odoo-16-to-17-upgrade.md (repo root).
 */

export const META = {
  slug: "odoo-17",
  title: "Led a 65-Hour Zero-Loss Odoo 16 → 17 Cutover",
  subtitle:
    "Preserving Heckler's core ERP platform — and the $250K+ in annual savings it already produces — through a supported-version migration.",
  role: "ERP Systems Engineer II — business lead and single internal owner",
  date: "October 18–25, 2024",
  publishedSourceStory:
    "Odoo Customer Success Story — odoo.com, January 2026 (~14 months post-upgrade)",
  // TODO: replace with the actual Odoo success-story URL once Tanmay provides it
  publishedSourceUrl: null as string | null,
};

export const SITUATION = {
  title: "Situation",
  paragraphs: [
    "Heckler Design is a discrete manufacturer in Phoenix, AZ, producing technology mounting solutions and lecterns for enterprise clients including Logitech, Zoom, Microsoft Teams, and Neat. The company runs its entire operation — manufacturing, finance, purchasing, sales, inventory, quality, CRM, shipping — on a single Odoo instance.",
    "I was the sole internal owner of this platform, reporting directly to the CEO, with an external Odoo developer in India (Niraj) handling code pushes, migration scripts, and module-level upgrades.",
  ],
};

export const PROBLEM = {
  title: "Problem",
  lead:
    "Odoo 16 was approaching the end of its long-term support window. Remaining on 16 meant losing security patches, falling behind on connector compatibility, and being unable to adopt the 17 accounting improvements finance needed to eliminate Xero.",
  body: [
    "Every customer-facing revenue system depended on Odoo staying online: order intake (Shopify), shipping (ShipStation), tax calculation (Avalara), payment processing (Stripe), and customer invoicing all flowed through it.",
    "Three of the six critical integrations — Ramp, Shopify, and ShipStation — offered no sandbox environment. Live production was the only place those connectors could be validated. Some stabilization would necessarily happen post-cutover.",
    "Finance was mid-transition from Xero-integrated accounting to fully-native Odoo accounting. An upgrade failure would have set that program back months.",
    "The worst-case scenario was a multi-day shutdown of order intake, shipping, and invoicing — directly impacting revenue and customer commitments.",
  ],
};

export interface ApproachPillar {
  title: string;
  body: string;
}

export const APPROACH: ApproachPillar[] = [
  {
    title: "Split the work by expertise, not by task",
    body:
      "I owned business scope, testing, stakeholder management, and the go/no-go decision. Niraj owned the migration script and module-level code. Marshall owned integration rework. Dashboard Ninja (a paid 3rd-party module) was known incompatible with 17 — I scoped it to the ≤1-week tier rather than holding up cutover. This avoided the common pitfall of one person trying to own code, config, and business validation simultaneously.",
  },
  {
    title: "Tiered go-live criteria instead of \"everything must work Day 1\"",
    body:
      "Three buckets: Critical, ≤1 week, >1 week. Publishing the framework to stakeholders before cutover meant no one was surprised by what wasn't working Monday.",
  },
  {
    title: "Formal stakeholder sign-off by name, not by committee",
    body:
      "Explicit yes/no sign-off from each department head — Jess, Nick, Bijan, Regina, Catalina — on whether their workflows were ready. Shared accountability, not my call alone.",
  },
  {
    title: "Documented rollback plan before cutover",
    body:
      "Identified what would have to be reverted if we had to fall back to Odoo 16. Having the rollback written down — even knowing we wouldn't use it — changed the leadership conversation from \"we hope this works\" to \"we have a way out.\"",
  },
  {
    title: "Pre-built workarounds for known unavoidable gaps",
    body:
      "Because Ramp had no sandbox, I pre-designed the manual reconciliation workflow with Catalina before the freeze. When Ramp broke post-cutover exactly as predicted, finance never lost confidence.",
  },
];

export interface TierItem {
  label: string;
  owner?: string;
  shipped: boolean;
}

export const TIERS = {
  critical: {
    label: "Critical",
    blurb: "Must work at go-live — order intake, manufacturing, invoicing, payments, tax.",
    items: [
      { label: "Shopify orders → Odoo", owner: "Marshall", shipped: true },
      { label: "Sales orders create + confirm", shipped: true },
      { label: "Invoice + payment links (Stripe)", shipped: true },
      { label: "Payment portal", shipped: true },
      { label: "Proforma invoices", shipped: true },
      { label: "Manufacturing orders complete", owner: "Nick", shipped: true },
      { label: "Freight + ShipStation shipments", owner: "Regina", shipped: true },
      { label: "Purchase orders create + receive", owner: "Bijan", shipped: true },
      { label: "Tax calculation (Avalara)", shipped: true },
      { label: "Tax exempt manual flag", owner: "Jess", shipped: true },
      { label: "Product forecast accuracy", shipped: true },
      { label: "Customer-facing docs (SO/Invoice)", shipped: true },
    ],
  },
  oneWeek: {
    label: "≤ 1 Week",
    blurb: "Non-blocking — real but fixable inside one week of stabilization.",
    items: [
      { label: "LinkedIn Leads → Odoo", shipped: true },
      { label: "Email templates", shipped: true },
      { label: "Invoice email send", shipped: true },
      { label: "NACHA vendor payments", owner: "Catalina", shipped: true },
      { label: "Pricelist + master sheet", shipped: true },
      { label: "Email CC field", shipped: true },
      { label: "Dashboard Ninja (3rd-party module)", shipped: true },
    ],
  },
  moreThanWeek: {
    label: "> 1 Week",
    blurb: "Disclosed before cutover. Workarounds pre-designed.",
    items: [{ label: "Ramp sync (no sandbox, live rebuild)", owner: "Niraj", shipped: true }],
  },
} as const;

export const SIGN_OFF = [
  { name: "Jess Hinxman", role: "Sales Ops", signed: true },
  { name: "Nick Neuman", role: "Production", signed: true },
  { name: "Bijan", role: "Procurement", signed: true },
  { name: "Regina Badilla", role: "Operations", signed: true },
  { name: "Catalina", role: "Accounting", signed: true },
];

export const RAMP_GAP = {
  label: "The Ramp gap — openly disclosed",
  headline: "How we kept users confident during a known outage window",
  startDate: "2024-10-18",
  endDate: "2024-10-30",
  days: 12,
  backfillTransactions: 198,
  body:
    "Ramp provided no sandbox environment for the 17-compatible connector. Sync was broken from Oct 18 (pre-cutover freeze) through Oct 30, when Niraj completed the connector rebuild and the first backfill landed 198 transactions in a single batch.",
  reassurance:
    "Ramp was the only item publicly flagged as \">1 week\" pre-cutover. It met that expectation rather than missing it. Catalina reconciled from Ramp's own dashboard during the gap — no data lost, no GL postings missed once backfill completed.",
};

export interface OutcomeMetric {
  value: string;
  label: string;
  caption: string;
}

export const OUTCOME_METRICS: OutcomeMetric[] = [
  {
    value: "65h",
    label: "Production frozen",
    caption: "Fri 4:00 PM → Mon 9:57 AM. No order intake, no shipping, no invoicing.",
  },
  {
    value: "0",
    label: "Transactions lost",
    caption: "Zero data loss, zero missed GL postings. Ramp backfill landed 198 txns clean on Oct 30.",
  },
  {
    value: "0",
    label: "Stakeholder rework",
    caption: "Every Critical-tier path verified before users returned Monday. No revert, no rollback executed.",
  },
  {
    value: "5 / 5",
    label: "Sign-offs",
    caption: "Every department head gave explicit yes at the Sunday go/no-go meeting.",
  },
];

export const OUTCOME_FOLLOWON = [
  "Kept Heckler on a supported Odoo LTS — preserving the $250K+ annual savings platform that the prior 14→16 Xero-elimination produced.",
  "Unlocked 5 custom Odoo modules shipped across 2025.",
  "Unlocked direct MCP-to-Odoo AI integration shipped in 2026.",
];

// Platform-context figures (pre-dates this upgrade, published by Odoo). Shown as context, not causation.
export const PLATFORM_CONTEXT: OutcomeMetric[] = [
  {
    value: "$250K+",
    label: "Annual savings",
    caption: "Published by Odoo. Cumulative platform outcome since the earlier 14→16 accounting migration.",
  },
  {
    value: "$80K/yr",
    label: "Software cost cut",
    caption: "Xero eliminated during the prior 14→16 transition.",
  },
  {
    value: "$100K/yr",
    label: "Manual work cut",
    caption: "Native Odoo accounting workflows, established pre-17.",
  },
  {
    value: "50%",
    label: "Accounting headcount",
    caption: "Achieved under native Odoo accounting pre-17.",
  },
];

export const TEAM = [
  { name: "Tanmay Raut", role: "Internal owner — business lead & go/no-go decision", internal: true },
  { name: "Niraj", role: "External Odoo developer (India) — migration script & module code", internal: false },
  { name: "Marshall Hardwick", role: "Integrations engineer — Shopify / ShipStation / shipping logic", internal: true },
];
