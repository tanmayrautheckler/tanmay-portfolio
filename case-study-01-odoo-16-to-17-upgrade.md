# Led 65-Hour ERP Cutover Enabling $250K+ in Annual Savings
## Odoo 16 → 17 Upgrade at Heckler Design

**Role:** ERP Systems Engineer II — business lead and single internal owner
**Date:** October 18–25, 2024 (cutover weekend plus one stabilization week)
**Team:** 1 internal owner (me), 1 external Odoo developer (Niraj, India), 1 integrations engineer (Marshall Hardwick), 1 external specialist (Ksolves, Dashboard Ninja)
**Client-facing outcome:** Published Odoo customer success story crediting the platform for $250K+ annual savings, $80K software cost reduction, $100K manual work reduction, and 50% accounting headcount reduction

---

## Situation

Heckler Design is a discrete manufacturer in Phoenix, AZ, producing technology mounting solutions and lecterns for enterprise clients including Logitech, Zoom, Microsoft Teams, and Neat. The company runs its entire operation — manufacturing, finance, purchasing, sales, inventory, quality, CRM, shipping — on a single Odoo instance.

At the time of the upgrade, the scope of the Odoo environment was:

- **4,762** sellable product variants across 3,311 product templates
- **1,221** Bills of Materials with **1,742** routed operations across **47** work centers
- **34** internal users across 8 departments
- **6** production-critical integrations (Shopify, ShipStation, Avalara, Ramp, Stripe, NACHA banking)
- **~300K** lifetime accounting journal entries, **~35K** sales orders, **~53K** manufacturing orders, **~8K** purchase orders

I was the sole internal owner of this platform, reporting directly to the CEO, with an external Odoo developer in India (Niraj) handling code pushes, migration scripts, and module-level upgrades.

---

## Problem

Odoo 16 was approaching the end of its long-term support window. Remaining on 16 would have meant losing access to security patches, falling behind on connector compatibility (Shopify, Stripe, and Avalara were all actively deprecating 16-era APIs), and being unable to adopt the Odoo 17 accounting improvements that Heckler's finance team needed to fully eliminate Xero.

The broader business context made the upgrade higher-stakes than a typical version bump:

- Every customer-facing revenue system depended on Odoo staying online: order intake (Shopify), shipping (ShipStation), tax calculation (Avalara), payment processing (Stripe), and customer invoicing all flowed through it.
- Three of the six critical integrations — **Ramp, Shopify, and ShipStation — offered no sandbox environment.** Live production was the only place those connectors could be validated. This is a common constraint in enterprise SaaS integrations and meant some stabilization would necessarily happen post-cutover.
- Finance was mid-transition from Xero-integrated accounting to fully-native Odoo accounting. An upgrade failure would have set that program back months.

The worst-case scenario was a multi-day shutdown of order intake, shipping, and invoicing — directly impacting revenue and customer commitments.

---

## Approach

Rather than treating this as a single technical event, I structured the upgrade as a scoped engagement with explicit go/no-go criteria, documented stakeholder sign-off, and a tiered stabilization framework. The strategic decisions that shaped the project:

- **Split the work by expertise, not by task.** I owned business scope, testing, stakeholder management, and the go/no-go decision. Niraj owned the migration script and module-level code changes. Marshall owned integration rework (Shopify, ShipStation, shipping logic). Ksolves was engaged separately for Dashboard Ninja, where we had a known Odoo 17 incompatibility. This avoided the common pitfall of one person trying to own code, config, and business validation simultaneously.

- **Tiered go-live criteria instead of "everything must work Day 1."** We grouped issues into three buckets: *Critical* (must work at go-live — order intake, manufacturing orders, invoicing, payment links, tax calculation), *Can be fixed within one week* (LinkedIn lead flow, email templates, NACHA vendor payments), and *Will take more than one week* (Ramp sync). Publishing this framework to stakeholders before cutover meant no one was surprised by what wasn't working on Monday morning.

- **Formal stakeholder sign-off by name, not by committee.** I drove explicit "yes/no" sign-off from each department head — Jess (sales ops), Nick (production), Bijan (production/procurement), Regina (operations), Catalina (accounting) — on whether their workflows were ready. This created shared accountability for the cutover decision rather than leaving it as my call alone.

- **Documented rollback plan before cutover.** We explicitly identified what would have to be reverted if we had to fall back to Odoo 16 — the connector failures that couldn't be tested until live were the primary rollback triggers. Having the rollback path written down, even though we never used it, changed the risk conversation with leadership from "we hope this works" to "we have a way out."

- **Pre-built workarounds for known unavoidable gaps.** Because Ramp had no sandbox, I knew the Ramp sync would need to be re-validated and likely debugged post-cutover. Rather than leave finance exposed, I pre-designed the workaround with Catalina: she would reconcile credit card activity manually from Ramp's own dashboard until the Odoo connector was restored. The workaround was documented and finance-approved before the freeze, not scrambled together after it broke.

---

## Implementation

**Friday, October 18, 2024 — 4:00 PM AZT:** I posted the company-wide Odoo freeze notice in Slack. All integrations (Shopify, bank sync, ShipStation) were disconnected. Database backups started. Niraj began the migration script overnight.

**Saturday–Sunday, October 19–20:** Marshall and I ran the full functional test suite on Odoo 17: sales orders, manufacturing orders, purchase orders, invoice generation, payment portal, shipping workflows, tax calculation. ShipStation auto-validation was broken; I fixed it Sunday afternoon. Dashboard Ninja was broken in a way that required Ksolves — we flagged it as "Can be fixed within one week" and proceeded.

**Sunday, October 20, 2:00 PM:** Held the go/no-go stakeholder meeting. All five department heads signed off on their workflows.

**Monday, October 21, 9:57 AM:** Production went fully live on Odoo 17. The CEO posted in #general: *"Great work... on a smooth Odoo 17 upgrade. Very impressive work."*

**Week of October 21–25 — stabilization:** I maintained a running, numbered issue register in Slack. Issues came in from users hour-by-hour; each was triaged against the tiered criteria, assigned an owner (me, Marshall, or Niraj), and tracked to resolution. Typical issues included email template defaults changing, DHL shipping rate differences (carrier API weight-vs-dimensional behavior changed between versions), emails landing in customer spam folders, and tax calculation edge cases on Canadian orders.

**Total production-frozen window: 65 hours** (Friday 4 PM → Monday 9 AM).

---

## Outcome

**Published, CEO-attributed outcomes** (from the Odoo customer success story, January 2026, approximately 14 months post-upgrade):

- **$250,000+ annually saved** in system investments and man-hours
- **$80,000/year** reduction in software costs (Xero eliminated)
- **$100,000/year** reduction in manual accounting work
- **50% reduction** in accounting department headcount, enabled by native Odoo accounting on version 17
- Xero fully eliminated in 2024 — previously described by leadership as "duct-taped together" with one-way unreliable sync
- Foundation established for subsequent custom module development (5 modules shipped in 2025) and a direct MCP-to-Odoo AI integration (2026)

**Transparent disclosure — the Ramp sync gap:**

Because Ramp provided no sandbox environment for the 17-compatible connector, sync was broken from October 18 (pre-cutover freeze) through October 30, when Niraj completed the connector rebuild and the first backfill pass landed 198 transactions in a single batch. During the ~12-day window, finance operated under the pre-designed manual workaround from Ramp's own dashboard; no transaction data was lost, no GL postings were missed once the backfill completed. Of the three tiers, Ramp was the only issue we had publicly flagged as "Will take more than one week" before cutover — so it met expectations rather than missed them.

---

## Lessons / Transferable Insights

**1. The upgrade isn't a technical event. It's a trust event.**
Users don't grade you on whether everything works. They grade you on whether they stay confident in you when something doesn't. The single most valuable prep work for this cutover wasn't the migration script — it was pre-designing the finance workaround for the Ramp outage I knew was coming. When Ramp broke post-cutover exactly as predicted, Catalina already had her workflow and finance never lost confidence. Pure technical mastery without domain depth can't produce that outcome.

**2. Tiered go-live criteria changes the stakeholder conversation.**
"Critical / ≤1 week / >1 week" forced every department head to look at their real needs and rank them. It also gave me a pre-approved framework to push back on scope creep during stabilization week: if an issue wasn't Critical, it got queued and prioritized, not rushed. This is directly reusable as a template for any ERP implementation.

**3. Live-only integration testing is normal, not a failure mode — but it requires different planning.**
Ramp, Shopify, and ShipStation each had no sandbox option for their 17-compatible connectors. The correct response to this isn't to complain about the vendors — it's to assume some stabilization will happen in production and design user-facing continuity around that fact. Every enterprise integration project I'll touch will have some version of this constraint. Pre-built workarounds are the right answer.

**4. The right team split for ERP upgrades is almost never fully solo or fully outsourced.**
Niraj owned what only a specialist developer should own: migration scripts, code, module compatibility. I owned what only an internal business lead can own: scope, testing against real workflows, stakeholder sign-off, cutover decision, issue triage. Marshall owned integrations where deep platform knowledge mattered more than Odoo knowledge. This is the split I would replicate on every future engagement — not DIY, not fully outsourced, but a deliberate division of expertise with one accountable internal owner.

**5. Rollback plans you never use still change outcomes.**
Writing down the rollback plan — even knowing we almost certainly wouldn't need it — shifted the leadership conversation from "we hope this works" to "we have a way out." That psychological shift is what let the CEO confidently support the upgrade. The document was never executed. It was still one of the most valuable deliverables of the entire project.

---

*This case study describes work I led as ERP Systems Engineer II at Heckler Design. The $250K, $80K, $100K, and 50% headcount figures are published by Odoo and attributed to Heckler leadership in the company's official customer success story (odoo.com, January 2026).*
