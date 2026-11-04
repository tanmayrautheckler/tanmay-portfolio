# Project typography and visual hierarchy review

Reviewed locally on 4 November 2026. The user subsequently authorized production release.

## Scope and direction

Refine the Projects index, archive and case studies without replacing their content,
demonstrations or club themes. Direction: engineering editorial—characterful type,
stable reading rails, strong text contrast and restrained accent color.

Three agents covered portfolio research, typography/layout critique, and color/state
hierarchy. The typography reviewer independently checked the finished desktop views.

## Primary references

- [Eemon Roy](https://www.eemonroy.com/): expressive serif typography with playful
  artwork concentrated around the introduction.
- [Dennis Snellenberg](https://www.dennissnellenberg.com/work): clear project indexing,
  consistent alignment and a neutral canvas.
- [Rauno](https://rauno.me/craft): demonstrations supply the interest; framing stays quiet.
- [Adrien Laurent](https://adrienlaurent.fr/): warm contrast and selective accent color.

These informed principles, not copied compositions, assets or project claims.

## Changes

- Newsreader display type with real normal/italic faces; Instrument Sans for reading
  and controls. Fonts are self-hosted by Next.js and scoped to Projects routes.
- Shared navigation/project/footer outer gutter; deliberate inner case-study reading
  rail. Project copy keeps one side and appears before its visual in DOM order.
- Larger explanatory text and metadata, controlled line lengths and consistent spacing.
- Removed hardcoded copper accent; all five club themes now control project accents.
- Workflow paper and decision surfaces have distinct hierarchy. Review uses explicit
  wording and a dashed accent rail; clear results use the existing success token.
- Scenario/action controls have 44px minimum height. Notes remain at least 11px.
- Projects uses a compact right-corner Pikachu launcher so labels do not cover titles.
  Chat, dragging and keyboard movement remain available. Other routes retain their launcher.

## Verification

- Production build passed; changed TypeScript/TSX files passed ESLint.
- Existing palette tests: 11 passed, covering normal-text contrast for five themes
  in light and dark, plus saved theme migration.
- Browser checks at 1440×1000, 768×1024, 390×844 and 320×780.
- No horizontal overflow at phone widths; no clipped content in tablet workflows.
- Scenario buttons measured 12px/44px; action buttons 13px/44px at tablet size.
- Tax review state and contact conflict path checked; contact interaction also activated
  with Enter. Compact chat opened/closed with keyboard and moved with arrow keys.
- Barça light/dark reviewed visually; Bayern selection verified theme accent inheritance.
- Reduced-motion rules preserved and reviewed in source; no new page animation added.

Preview captures: `/tmp/portfolio-design-refinement/`.

## Club cursor refinement

The browser renders a small two-tone pennant pointer through an SVG cursor URL,
with a standard cursor fallback. Theme selection updates its colors. Text fields
and specialized drag/resize cursors remain native; coarse pointers and forced colors
keep standard browser behavior. No `cursor: none`.

The decorative stadium follower was removed at the user's request. Its motion
state, event listeners and stylesheet were also removed. Browser verification
confirmed zero follower elements and the themed cursor still active. Cursor ESLint
and diff whitespace checks passed.

## Final release checks

User authorized publishing all pending portfolio changes on 4 November 2026.
The final state removes the Pikachu label/bubble and cursor follower while retaining
the themed native pointer and clickable, draggable companion. Production build,
scoped ESLint, all 11 palette tests and diff whitespace checks passed. Both remote
main branches matched the previous deployed baseline before release. Vercel's
connected production branch is `traut1-odoo/tanmay-portfolio:main`.
