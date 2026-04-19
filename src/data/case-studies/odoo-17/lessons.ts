/**
 * 5 lessons / transferable insights. Lesson #1 is emphasized in the layout
 * (wider card, larger type) because it's the thesis of the whole case study.
 */

export interface Lesson {
  number: number;
  title: string;
  body: string;
  emphasis?: boolean;
}

export const LESSONS: Lesson[] = [
  {
    number: 1,
    emphasis: true,
    title: "The upgrade isn't a technical event. It's a trust event.",
    body:
      "Users don't grade you on whether everything works. They grade you on whether they stay confident in you when something doesn't. The single most valuable prep work for this cutover wasn't the migration script — it was pre-designing the finance workaround for the Ramp outage I knew was coming.",
  },
  {
    number: 2,
    title: "Tiered go-live criteria changes the stakeholder conversation.",
    body:
      "\"Critical / ≤1 week / >1 week\" forced every department head to look at their real needs and rank them. It also gave me a pre-approved framework to push back on scope creep during stabilization week: if an issue wasn't Critical, it got queued and prioritized, not rushed.",
  },
  {
    number: 3,
    title:
      "Live-only integration testing is normal, not a failure mode — but it requires different planning.",
    body:
      "Ramp, Shopify, and ShipStation each had no sandbox option for their 17-compatible connectors. The correct response isn't to complain about the vendors — it's to assume some stabilization will happen in production and design user-facing continuity around that fact.",
  },
  {
    number: 4,
    title:
      "The right team split for ERP upgrades is almost never fully solo or fully outsourced.",
    body:
      "Niraj owned what only a specialist developer should own: migration scripts, code, module compatibility. I owned what only an internal business lead can own: scope, testing against real workflows, stakeholder sign-off, cutover decision, issue triage. Marshall owned integrations where deep platform knowledge mattered more than Odoo knowledge.",
  },
  {
    number: 5,
    title: "Rollback plans you never use still change outcomes.",
    body:
      "Writing down the rollback plan — even knowing we almost certainly wouldn't need it — shifted the leadership conversation from \"we hope this works\" to \"we have a way out.\" The document was never executed. It was still one of the most valuable deliverables of the project.",
  },
];
