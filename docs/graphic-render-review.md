# Graphic refinement — local review

## Changes

- Stadium cards: 720px WebP crops, less desaturation and clearer photographs under a controlled text scrim. Featured card uses a responsive size appropriate to its wider mobile layout.
- Barcelona: replace the hazy aerial view with Johannes Falke's archival Camp Nou interior panorama, CC BY-SA 3.0. Source and credit appear in the appearance panel and stadium asset metadata.
- Journey: retain the original watercolor art. Remove the final path segment that left the painted trail; anchor the hiker's scale and direction at its feet using native SVG transforms. Scale the figure down with distance and mirror it on switchbacks.
- Journey delivery: four paintings and the lossless sprite now use WebP, reducing their combined transferred asset size from 2,301,471 to 1,191,314 bytes (48%). Original source images remain intact.
- Product: add a local studio reflection environment, metal/clearcoat materials, lens and button details, mounting pads and fastener recesses. Replace hard projected shadows with blurred contact shadows that follow the base's assembly height. Preserve existing part selection, example costs, finishes and rotation controls.
- The stand remains an illustrative model, not a claim to reproduce a specific manufacturer's CAD geometry.

## Verification

- Browser review at 1440×1000, 1280×720 and 390×844.
- Mobile: appearance panel has no horizontal overflow (364px client width and scroll width); all five stadium photos decode at 720px.
- Journey: manual mobile milestone selection and final desktop scroll stop checked; hiker feet remain on the trail.
- Product: assemble/explode, graphite/silver and rotation to rear checked; no browser console errors.
- Scoped ESLint, production build, and 11 palette contrast/migration tests pass.
- Typecheck passes with `--allowImportingTsExtensions`. Unmodified standalone `tsc --noEmit` encounters the existing `.ts` import in `src/lib/penalty-game.test.ts` (TS5097); that file is unchanged from HEAD.
- Reduced-motion branches retained and reviewed in source. No new continuous animation; 3D remains demand-rendered. Studio environment uses one 128px cube capture and contact shadows use a 256px target. Reduced-motion emulation was not available through the browser controls.

## Further material improvement

A public approved CAD export would improve physical accuracy beyond the current illustrative stand. No external model was substituted or represented as the user's work.

Production release approved on 2026-11-03. These notes describe the pre-release verification; deployment identity and live checks are recorded in the release conversation.
