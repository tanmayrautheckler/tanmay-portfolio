# About journal — implementation and verification

Prepared 4 November 2026. Production release approved by the user on 4 November 2026 after local review. Previous production baseline: `6e03968`. This document records implementation and pre-release checks; deployment identity and live verification are recorded in the release conversation.

## Scope

Only `/about` uses this journal. Previous About implementation is recoverable from the baseline commit; supporting components remain. Home, Projects, Labs, shared navigation, club themes, cursor and Pikachu are unchanged.

Following the user's review, the book now has three spreads / six pages:

1. **The person:** existing portrait and introduction; Mumbai to Phoenix, with a road-trip print. Academic and employment timeline removed from About; Experience remains linked.
2. **The detours:** skydiving and Los Angeles on one page; northern lights and camping on the facing page. Each photo has one place in the book. No invented travel dates, locations or route order.
3. **Off the clock:** original illustrated Barça/Messi number 10 shirt; listening to philosophy, curiosity, and the existing personal trading project. No claims of reading books or invented results.

The cloth hardcover, wood desk, curved front/back page geometry, drag commit/cancel behavior, keyboard navigation, mug, pen, ribbon and paper edges remain. Printed photos are now clickable in 3D: click opens a larger view; drag still turns the page. HTML prints lift on hover and open the same accessible photo viewer. Viewer supports arrows, Escape and existing shadcn Dialog focus handling. No audio is added.

The new Marina Budarina reference reel was inspected for large typography and object-led scenes. Its objects, images, code and branding were not copied. Reels remain visual references only.

## Implementation and performance

Installed React Three Fiber, Three.js and GSAP; existing shadcn Button and Dialog. No new dependencies. All site assets are local. Content and real photo captions live in `src/components/about/journal/content.json`; the same source feeds printed textures and HTML pages. Rebuild textures with `node scripts/build-journal-assets.mjs`.

The 3D book is available at all viewport widths when reduced motion is not requested. Read text explicitly opens HTML pages; reduced-motion preferences still select reading mode automatically. Small screens use a tighter camera framing and keep the Read text control visible. Canvas renders on demand, pixel ratio capped at 1.6. Cover/pages/desk/cloth total under 800 KiB; larger photo sources load when their viewer is opened. Originals remain unchanged. Asset provenance: `public/images/about/journal/ASSETS.md`.

## Verification

- Production build, scoped ESLint and TypeScript pass. TypeScript uses `--allowImportingTsExtensions` for an existing unrelated test import.
- Four page-geometry tests pass: flat endpoints, bound spine, finite curved vertices, invalid-progress clamp.
- 1440×1000: opens directly to new third spread, advances through all spreads, disables final next control, reverses by keyboard and pointer drag.
- Clicking a printed photo opens the correct larger image. Dragging from that same photo turns the page instead. Photo viewer arrows and Escape work.
- 320×780: all six pages reachable, no horizontal overflow, all toolbar controls at least 44px, all page images load.
- 390×844: travel composition, readable captions, compact controls and photo viewer inspected visually. Fixed overlapping captions and excessive empty space around landscape photos.
- Previous prototype checks: 768px tablet reader, short-drag cancellation, resize during a turn, reader/desk toggle. Touch hardware not physically tested.
- Reduced-motion path reviewed in source; browser preference emulation unavailable.
- No runtime errors observed. Installed R3F still emits a Three.Clock deprecation warning.

## Remaining useful assets

More user-owned personal photos or short recordings, especially football/match-day moments and actual travel video, could deepen future pages. No substitutes or fictional personal details were added. Further expansion should preserve this book interaction and the user's personal voice.

## Loading and mode regression follow-up

The user confirmed that Open showed a flat reading page rather than the 3D preview. Two routes caused that mismatch: a quick click during renderer startup silently enabled reading mode, and the original 900px breakpoint forced narrow preview panes into HTML.

- Opening or choosing a chapter before 3D is ready now queues that exact spread, keeps scene mode selected and animates the hardcover when loading completes. It does not silently change modes.
- The 3D book is now available in narrow preview panes and on phones. Responsive camera framing fits the book. Read text remains an explicit, visible option; reduced-motion preferences still use HTML automatically.
- A 12-second visible-tab watchdog handles unresolved startup. Background tabs pause this watchdog, since browsers may suspend their rendering. Failure offers Retry 3D and an explicit Read without 3D choice.
- Retry reloads the page, clearing failed dynamic-import state as well as renderer state.
- Regression test: temporarily delayed the renderer import by five seconds, clicked Open immediately, verified pending scene mode with zero HTML reading pages, then verified the actual 3D opening completed to Spread 01 / 03. Restored normal loader afterward.
- 390px preview: actual 3D cover and animated opening verified. Read text remains reachable. Desktop opening and page controls verified separately.
- Chrome native inspection was interrupted while the user switched windows. Chrome extension automation returned connection errors. The reported quick-click path was reproduced and verified under controlled loading in IAB; no claim of a completed Chrome-specific certification is made.

## Chrome graphics diagnosis

The actual Chrome failure was subsequently captured in `.next/dev/logs/next-development.log`: `GL_VENDOR = Disabled`, `GL_RENDERER = Disabled`, `BindToCurrentSequence failed`, followed by `THREE.WebGLRenderer: Error creating WebGL context` and `unhandledRejection: Error: Error creating WebGL context`. The development badge reflects repeated graphics startup failures, not four independently established content bugs.

A WebGL 2 capability probe now runs once before mounting R3F. A blocked/null/throwing context is handled as unavailable graphics rather than repeatedly invoking the renderer's asynchronous failure path. The probe releases its temporary context. The page explains that browser 3D graphics are unavailable; it does not claim that reading mode is the 3D experience.

Four capability tests pass: disabled context, thrown context creation, successful probe with resource release, and support without the optional release extension. Chrome's graphics acceleration setting and relaunch remain user-controlled; no browser preference or GPU security flag was changed by this task.

### Startup appearance consistency

- Removed the flat cover stand-in from normal 3D startup. It used a different size, angle, lighting and background from the real renderer, causing an obvious visual swap.
- Server rendering now treats motion preference as unknown rather than briefly choosing the non-3D cover for everyone. The 3D layout reserves its space before hydration.
- Hide the canvas until textured book geometry has drawn its first frame, then fade in opacity only. Keep invitation position, loading-note space and mobile toolbar height stable.
- Keep static cover for reduced motion / unavailable graphics. Existing queued opening, reading mode and failure recovery remain available.
- Browser checks: loading and ready invitation coordinates and stage heights matched at 1440px, 524px and 390px widths. No fallback cover in normal 3D startup; no phone horizontal overflow. Desktop opening reached spread 01 with no captured console errors. These checks used the in-app browser; this startup change has not yet been rechecked in the user's Chrome profile.
