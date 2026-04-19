# Case Study 01 — Odoo 16 → 17 Upgrade

Standalone long-form case study at **`/case-studies/odoo-17`**. Separate from
`/projects/*` so it can be art-directed independently of the project list.

**Status**: preview build on branch `case-study-odoo-17`. Not linked from nav.
Marked `robots: { index: false, follow: false }` at both the segment layout and
the page level. Do not merge to `main` without Catherine Jiang's approval.

---

## File structure

```
src/app/case-studies/
├── layout.tsx                     # Noindex wrapper for the whole segment
└── odoo-17/
    ├── page.tsx                   # Section composition only
    └── README.md                  # This file

src/data/case-studies/odoo-17/
├── content.ts                     # META, situation, problem, approach, sign-off, ramp-gap, outcome
├── scope.ts                       # 6 scope-grid stats + SECONDARY_SCOPE
├── integrations.ts                # 6 risk-map integrations (Shopify, ShipStation, Avalara, Ramp, Stripe, NACHA)
├── timeline.ts                    # 7 cutover milestones w/ Slack quotes + screenshotSlug hooks
└── lessons.ts                     # 5 lesson cards

src/components/case-studies/
├── hero-cs.tsx                    # Title + $250K big number + scroll hint
├── scope-grid.tsx                 # Animated count-up with tooltips
├── situation.tsx                  # Narrow-column serif prose + team split + problem
├── risk-map.tsx                   # Desktop SVG radial; mobile vertical list
├── tiered-approach.tsx            # Collapsible pillars + 3-column tier grid + sign-off chips
├── cutover-timeline.tsx           # Centerpiece; scroll-driven progress line + quote cards
├── ramp-gap.tsx                   # 12-day gap bar + 198-transaction backfill spike
├── outcome.tsx                    # Inverted dark section; 4 metrics + follow-on facts
├── lessons-cards.tsx              # 5 cards; lesson #1 emphasized as "thesis"
└── cs-footer.tsx                  # Case-studies-02/03 placeholders + social + back-to-portfolio

case-study-01-odoo-16-to-17-upgrade.md   # Source markdown in repo root (single source of truth)
```

Serif typography uses **Source Serif 4** loaded in `src/app/layout.tsx` via
`next/font/google`. Scoped to case-study pages only via the `.serif-display`
and `.serif-prose` classes in `src/app/globals.css`.

---

## How to update

### Change a scope number
Edit `src/data/case-studies/odoo-17/scope.ts`. Each entry has a `value`,
optional `formatted`, `label`, and a `tooltip`. The tooltips are the place to
surface the "why this number matters" context; they show on hover/focus.

### Refresh live scope counts from Odoo
```bash
# MCP domain queries used on last fetch (2026-04-17):
product.product        domain: [["active","=",true],["sale_ok","=",true]]
product.template       domain: [["active","=",true]]
mrp.bom                domain: [["active","=",true]]
mrp.workcenter         domain: [["active","=",true]]
res.users              domain: [["active","=",true],["share","=",false]]
hr.department          domain: []
account.move           domain: []
sale.order             domain: []
mrp.production         domain: []
purchase.order         domain: []
```

If a live number has drifted >10% from the cutover-time value, update both the
`value` and the tooltip note.

### Update a timeline milestone
Edit `src/data/case-studies/odoo-17/timeline.ts`. Each milestone accepts a
`quote` object and a `screenshotSlug`. The slug maps to
`/public/images/case-studies/odoo-17/slack/<slug>.png` — add the file and the
timeline will pick it up. (Rendering the screenshot in the card itself is a
small follow-up; the slug hook is already wired.)

### Update a lesson
Edit `src/data/case-studies/odoo-17/lessons.ts`. Set `emphasis: true` on any
lesson to give it the "thesis" double-wide treatment. Only one lesson should
carry emphasis at a time.

### Add a new integration to the risk map
Edit `src/data/case-studies/odoo-17/integrations.ts`. Nodes re-layout
automatically around the circle based on array length.

---

## Assets Tanmay still needs to provide

These are referenced in the build but not yet present on disk. The page
renders cleanly without them; adding them elevates authenticity.

### Slack screenshots
Save as PNG at roughly 1200×800 (2× for retina). Drop into
`public/images/case-studies/odoo-17/slack/`.

| Filename slug                      | What to capture                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `fri-freeze-post.png`              | Your #general post Fri Oct 18 @ 3:50 PM MST announcing the freeze                                       |
| `sun-nogo-decision.png`            | The #odoo-17-upgrade thread Sunday afternoon with "Me and Marshall feel its ready"                      |
| `mon-dean-congrats.png`            | Dean's Oct 21 @ 9:57 AM post in #general ("Great work Tanmay, Marshall, and Niraj on a smooth Odoo 17 upgrade…") |
| `stabilize-issue-register.png`     | Any spotlight moment from the stabilization week issue register                                         |

### Odoo UI screenshots (optional — for extra credibility)

- The Notion go/no-go checklist table from "Odoo 17 Timeline"
- Dashboard Ninja pre vs. post Ksolves fix (if you still have the captures)
- One real post-upgrade 17 screen showing the working Stripe / Avalara / ShipStation path

Save to `public/images/case-studies/odoo-17/`.

### Source URL

`src/data/case-studies/odoo-17/content.ts` → `META.publishedSourceUrl`.
Currently `null`. Once Odoo publishes the Heckler customer success story
(January 2026), paste the exact URL here — the outcome section will
auto-render the "read the story" link.

---

## Publishing workflow

1. **Build + review locally**
   ```bash
   npm run dev
   # open http://localhost:3003/tanmay-portfolio/case-studies/odoo-17
   ```

2. **Static verification**
   ```bash
   npm run build
   # out/case-studies/odoo-17/index.html must exist after export
   ```

3. **Attorney approval** (Catherine Jiang). Confirm in writing before any
   action below.

4. **Flip to indexable** — only when publish is approved:
   - Remove `robots` from `src/app/case-studies/layout.tsx` and from
     `src/app/case-studies/odoo-17/page.tsx`
   - Re-enable LinkedIn link in `cs-footer.tsx` (currently a disabled span)
   - Add an OG image at `public/images/case-studies/odoo-17/og.png` (1200×630)
     and wire it via `metadata.openGraph.images` in `page.tsx`
   - Add JSON-LD `Article` structured data if desired

5. **Merge to `main`** only after step 4 is reviewed. GitHub Actions will
   auto-deploy to GitHub Pages.

6. **Add to portfolio navigation** (optional — keep it off the main nav even
   after publish if you prefer to link only from `/projects`).

---

## Design decisions worth revisiting

These are choices I made that a future edit pass might want to flip. None are
load-bearing.

1. **Serif for body and display, Inter for UI chrome.** Feels Stripe/Linear.
   If it reads as too traditional, swap the display to Inter-bold-tracked and
   keep serif for body only.

2. **Lesson #1 is visually 2× the others** (double-wide, larger type,
   explicit "Thesis" tag). This is on purpose — the whole case study's
   argument is "upgrade = trust event." If you want flatter hierarchy, remove
   `emphasis: true` in `lessons.ts`.

3. **Outcome section is inverted (dark on dark background).** Creates a hard
   visual break before the lessons. If it fights the rest of the page, remove
   the `bg-foreground text-background` on the `<section>` in `outcome.tsx`.

4. **Ramp gap uses yellow accents.** Chose yellow (not red) because the gap
   was expected and disclosed, not a failure. If you want to soften further,
   drop the yellow striping on the bar and lean on muted grey.

5. **No cinematic letterbox bars during the cutover timeline.** I considered
   it (à la sebastien-lempens.com) but it fights Stripe/Linear restraint and
   makes mobile weird. Skipped.

6. **No Mermaid / architecture diagram.** The markdown's content is already
   dense. Adding a Mermaid diagram for "data migration flow" would be
   redundant with the cutover timeline. Available in the codebase if you
   disagree: `src/components/mermaid-diagram.tsx`.

7. **No stock photography, no team photos.** Per prompt instructions. If you
   want to add a single authentic photo (e.g. you at the factory at 6:30 AM
   Monday before go-live), drop it as `public/images/case-studies/odoo-17/pre-live.jpg`
   and we can add a single `<Image>` block before the outcome section.

8. **Scope grid is 6 cells** (SKUs, BOMs, work centers, users, integrations,
   journals). Markdown has 4 more secondary numbers (templates, routed ops,
   sales/MO/PO counts) that live in tooltips and the situation prose. Keeps
   the grid visually calm.

9. **Sign-off chips use text only**, no avatars. Avatars would make the page
   busier and require image pulls from Slack. Text chips are fine.

10. **Tiered framework uses real checkmarked items from the Notion
    "Odoo 17 Timeline" page** — not a sanitized list. If an item reads oddly
    out of context, edit `content.ts` → `TIERS`.

---

## Source traceability

Every claim on the page traces to one of:

- `case-study-01-odoo-16-to-17-upgrade.md` (repo root) — primary prose
- Notion: "Odoo 17 Timeline", "upgrade 17 - checklist", "MOST IMP THINGS TO
  LOOK INTO POST UPGRADE"
- Slack: #general (Oct 18 freeze, Oct 21 Dean congrats), #odoo-17-upgrade
  (Oct 18–25 stabilization)
- Odoo MCP counts (Apr 17, 2026) for scope number currency checks
- Odoo Customer Success Story (odoo.com, Jan 2026) for outcome figures

If you need to audit a specific number or quote, the data files are
deliberately verbose and annotated.
