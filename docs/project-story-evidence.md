# Portfolio project additions — evidence and review

Draft prepared on 2026-11-03. The user authorized production release on 2026-11-04.

## AI tax exemptions

Heckler Headless `origin/main` was refreshed read-only. Merged contributions by `tanmayrautheckler` reviewed:

- PR 6157 / `7f0857dc0`, 2026-11-03: certificate-first quick scan, state/reason prefill, cancellation, manual fallback and bounded requests. The reported synthetic timing probe is not presented as a customer performance result.
- PR 6129 / `1e45066ee`, 2026-11-03: status-first tax exemption page and state review.
- PR 4247 / `6f497b149`: structured per-state certificate findings and proposed Odoo lines.
- PR 4304 / `6fd4f5075`: Finance evidence display and suggested approval/information-request fields.
- PR 4305 / `24c8ecab4` and PR 4308 / `ff8497e90`: configurable automatic information requests and clean-certificate approvals. The approval implementation explicitly separates the automation switch, dry run and Odoo synchronization rollout controls. Merged code does not prove universal activation.
- PR 4384 / `f8ae3d3e1`, PR 4408 / `fbf89cf6d`, PR 4444 / `da2fd7b26`: historical certificate review and separation from ERP changes, Finance decisions and customer email.

The portfolio simulation contains only fictional state examples and makes no model call, upload or tax decision.

## Contact and company data foundations

User identified this as their company/contact cleanup work. Reviewed shared platform audit/review code, without querying a production database or reading customer exports:

- Dealer company cleanup audit / PR 115 / `65d822f3d`: read-only source classification, domain grouping, normalized addresses and migration review.
- Current `app/(site)/devtools/dealer-company-cleanup` screens: existing legitimate affiliations, ambiguous affiliations, operator-selected contacts/addresses and pending/approved/applied/skipped states.
- `docs/identity/contact-preload.md`: import provenance, explicit review, no silent invitation or source writes in that importer.
- `docs/plans/preload-contacts-corporate-entities.md`: contextual design notes only, not evidence that every planned import was completed.
- Related Odoo `heckler_contact_structure/README.rst`: flat locations, shared people, company affiliations and native address links. Migration-test and website integration scope remain distinct.

No customer names, domains, addresses, private exports, record counts or measured savings are reproduced. Case-study role acknowledges shared infrastructure and team contribution. Quantitative before/after claims need a reconciled report.

## Other Headless contributions

Expanded the existing shared-platform story with contributions visible under the user's Git identity: station-capacity and stock-aware lead times, shared working-time rules, product/channel reporting, margin drill-downs, price/volume/cost explanations and watchlists. This does not claim sole authorship of the whole platform.

## Saanvilo Health

- Vercel project `saanvilo-health-demo` has a ready production demo at https://saanvilo-health-demo.vercel.app. Its aliases also include the earlier Stillwell demo name.
- Reviewed the overview and visit-summary dialog on 2026-11-03. UI explicitly identifies synthetic records, an India-first preview and reset-on-reload behavior.
- Observed: health timeline, medicine entries, reports/documents, vitals/symptoms, care-team navigation, printable summary, voice/text entry surfaces, English/Hindi/Marathi choices and Lite mode.
- UI explicitly says live clinical AI, automatic photo reading, secure sharing and care-team monitoring are not active in the public preview.
- No GitHub source was inferred: this Vercel deployment has no Git source metadata, and the queried GitHub account lists did not identify this app. Next.js/React is supported by the deployed framework assets.
- `public/images/projects/saanvilo-overview.webp` is a resized, WebP-encoded browser capture of the actual sample-data demo. Its illustrated guidance is labeled AI-generated in the app and the portfolio caption.

No claim of Medicare insurance functionality, clinical effectiveness, active patients or medical deployment is made.

## Delivery

Added three project stories, expanded the existing Headless story, promoted it into selected work and retained previous projects. New stories appear in the searchable archive, related links and static routes. Interactive examples reuse shadcn buttons, support keyboard operation and honor reduced-motion preferences.

Validation: production build passes with 45 routes; scoped ESLint and `git diff --check` pass. Browser review covered desktop and 390px mobile widths, all certificate paths, conflicting and unassigned contact paths, keyboard activation, the Health & Care archive filter and the external demo URL. Tax and contact pages reported no horizontal overflow at mobile width. Reduced-motion rules were reviewed in source; no browser emulation was used.

Chatbot context regenerated locally through its allowlisted generator (28 projects). Portfolio release was authorized after this review. The separate chatbot Worker context refresh requires renewed Cloudflare authentication; the generated context is included in the repository. Source Headless/Odoo repositories were inspected only; no application code, database, customer record or company workflow was changed there.
