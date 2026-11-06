# About journal — cinematic local revision

Local follow-up to production `e8c879e`, 4 November 2026. Not deployed.

## Direction and reference lessons

Keep the existing physical journal, visual identity and personal story. The book reference established continuity, hinge, paper and lighting; the latest Avi Vashishta reel suggested printed ideas unfolding into dimensional objects. The user's forest-book example establishes a natural, photographic scene emerging across both pages. No reel footage or source code is embedded.

Ten topic spreads / twenty folios: person and roots, outdoor detours, playing sports and gym, football, Formula 1, stocks and personal research, geopolitical news, Valorant, movies, and philosophy. Each interest has its own two-page spread. No invented favourite drivers, teams beyond Barcelona, game rank, movies, investment returns or travel destinations.

## Local implementation

- Living mode starts with plain paper, rather than an illustrated texture being replaced by a late 3D overlay. Printed illustrations remain available through the Living pages toggle and the accessible reader.
- A selected spread prepares its paper, stage and scene texture assets together. Page turns queue until that bundle is ready. Single-URL texture cache keys match preparation and rendering. Outgoing and incoming scene roots persist through a turn. The old world folds flat before the curved sheet moves. Only ink begins during page landing; terrain, actors and atmosphere emerge in sequence after landing. Cancelled drags restore the original world.
- The cover and desk can render before later chapters load. Only the first spread is hinted at startup; all other bundles prepare on selection. No measured field-load-time promise.
- Outdoor spread uses authored terrain geometry, a granite cliff, instanced conifer forest, flowing-water shaders, a stone bridge, winding road and convertible. A rope-attached climber, trekker, photographer, birdwatcher and parachutist occupy the same depth and lighting as the book. These are crafted miniature scenes, not real travel footage. The old alpine billboard is no longer loaded.
- Football combines a licensed Messi celebration photo print and an authored stadium bowl with 800 instanced seats and pitch markings. The scene has no live score, fabricated match event or physically animated Messi. The licensed photograph stays intact.
- A realistic-shaped, unbranded authored airliner replaces the paper plane. Flight crosses left to right above the book.
- Scene clocks continue while the book is visible, rather than stopping after eighteen seconds. Hidden documents and offscreen canvas pause drawing and page-turn timelines. Replay restarts emergence. Pointer parallax remains restrained. Reduced motion and unsupported graphics retain all twenty pages through HTML reading mode.
- Chapter-specific synthesized ambience and page-turn foley use Web Audio. An explicit sound toggle starts muted, with no audio files, external audio requests or automatic sound. Sources disconnect on scene change/unmount; hidden documents mute playback.
- Raised personal photos remain available in the photo viewer and reader. Obsolete invisible photo hotspots are disabled in living mode.

- Mumbai and Phoenix now share a full-spread waterfront, gateway, desert and flight path. F1 uses an enlarged car and circuit. Markets use a research desk and illustrative chart, geopolitics a folded atlas, Valorant a tactical miniature, movies a screen and projector, and curiosity a listening desk.
- Living pages use plain paper on both sides, including the introduction. Short DOM captions remain readable without zooming into textures. All imagery and motion stay within About.

## Validation

- Production build passed after the main cinematic implementation. Final scoped lint, content/asset integrity, WebGL capability and page geometry tests are recorded in the task response.
- Clean IAB session navigated all nine spreads, with correct final-page bounds and no captured console errors. Sound enabled/muted controls changed as expected; this is not an acoustic-quality certification.
- Desktop and phone layout, reader folios, loading/turn state and final screenshot/video checks are recorded in the task response. Native Chrome with the user's school profile is not certified by these checks.
- A standalone `tsc --noEmit` run found an existing unrelated `.ts` import-extension error in `src/lib/penalty-game.test.ts`. No unrelated files were changed to suppress it. Next production build completed.

## Remaining production asset gap

Film-quality human performance requires appropriate rigged/animated assets or cleared footage. There is no actual Messi goal clip in this revision. The existing photographs are licensed and credited; a synthetic pose animation is not passed off as real match footage.

Final local browser verification: 1440×1000 desktop and 390×844 phone. Both living and reading views had no horizontal document overflow; journal buttons measured at least 44×44px. Topics use a horizontal scroll row on phones, freeing height for the book. Final folio is 18/18 with Next disabled. All nine topic jumps, sound enable/mute, reader/desk switching and cover/opening passed in IAB. Clean final session captured no console errors. Sixteen journal tests and scoped lint passed. Recorded a 17.3-second, silent, 1280-wide H.264 preview of the actual book opening, emergence and page turns; FFprobe metadata and a decoded frame were inspected. This preview is proof footage only and is not downloaded as part of the site.


## Current finishing pass

Local preview remains http://127.0.0.1:3000/about. No commit, push or deployment. Three agents handled physical choreography, outdoor geometry and other interest scenes; root integrated captions, plain introductory paper and responsive framing. No paid credits, new packages or external runtime assets.

Verification artifacts: work/journal-finish/verification.json, interactions.json, desktop and mobile screenshots. Production build passes. Sixteen content, capability, geometry and choreography tests pass; scoped ESLint passes. Desktop1440×1000 and emulated mobile390×844 checks cover all chapter jumps, keyboard turn navigation, replay, sound toggle, printed pages, reduced-motion reader and unavailable-WebGL fallback. Browser tests are not physical-phone frame-rate certification.

Browser gesture verification caught and fixed a cold-leaf bug: pointer-down used to auto-advance while its textures loaded. Adjacent leaves now prepare in the background. Short drag stayed at Spread02, committed drag reached Spread03. Measured draw-call counter stayed at24731 throughout an offscreen interval and resumed afterward. No JS errors captured. The 17.3second preview decoded without errors;1280×900,H.264,24fps,silent,1.18MB,reference-only and not embedded in production assets.

## Four requested spread upgrades

Football now uses a larger, sharper licensed photo of Messi in Barça colours, preserved in a mounted print with a number10 dedication. The patterned ball moves within the miniature pitch. F1 now separates an enlarged sculpted inspection car from a smaller racer continuously following an irregular circuit. Markets now has a full-spread two-monitor research workstation, progressive illustrative candlesticks/volume, keyboard and working notes. Valorant now has an original two-level tactical site, passage, catwalk, stairs, braced crates, spike and animated cover route. No project performance claims or game rank have been added.

New modules isolate these changes from remaining book scenes: journal-formula.tsx, journal-trading.tsx and journal-valorant.tsx. Scene emergence follows wall-clock time more closely on slower renderers while keeping large background-tab deltas bounded. Validation outputs are in work/journal-polish/.

Four-spread validation: final production build and scoped ESLint pass; sixteen book tests pass. Root checked football, F1, trading and Valorant at1440×1000 and390×844 with no captured JavaScript errors or document overflow. Separate F1 frames verify the racer keeps moving. Fixed inside-corner triangle winding on the circuit and a shallow-box corner radius that obscured trading accessories. The research series is explicitly synthetic/illustrative. New Messi photo is197KB and served locally, with source and licence attribution on the football page. Nothing pushed or deployed.

## Material and scale pass — 6 November 2026

The camera now uses perspective rather than orthographic projection. A locally generated studio reflection environment gives metal, glass and paint more natural highlights; directional lighting and tighter contact shadows preserve grounding. This is a single prefiltered environment, with no remote HDR download or per-frame postprocessing.

The outdoor terrain, Mumbai gateway, desert rocks, stadium concrete, tactical site and recreation surfaces use 512px colour/normal/roughness maps derived from CC0 Poly Haven photographs. See public/images/about/materials/ASSETS.md for provenance. Nine maps total less than 800KB. The two new adult character helpers use original geometry, shaped clothing and articulated limbs. These are authored miniatures, not scanned humans or motion-capture characters.

The new In motion spread connects badminton/pickleball, soccer/cricket practice and gym equipment on one recreation ground. Racket equipment and net height alternate within the same scene. No frequency, ability level or athletic achievements are asserted. Twenty folios and the accessible reader include the same sports/gym content; page asset generation now accepts an optional staged content source and no longer assumes football occupies a fixed index.

Work remains local. No paid generation credits, new dependencies or deployment used. Current validation artifacts are in work/journal-realism/.

Final realism validation: production build and scoped ESLint pass. All sixteen book tests pass. Desktop1440×1000 and mobile390×844 covered all ten chapters, with no captured JavaScript exceptions or document overflow. Fresh screenshots for outdoors, sports and world map returned no failed HTTP requests. Reduced-motion and disabled-WebGL readers open the new sports content with zero canvases. Short drag cancelled at Spread02; committed drag reached Spread03. Draw counter held at42791 while offscreen, then resumed to48111.

The visual review caught and fixed a mobile desk-plane horizon seam, mismatched preload credentials and a deprecated shadow-map choice. Fresh image-request counts contained no duplicate URLs or preload-credential warnings. A reflective coffee surface and stadium lamp housings were also corrected. Accurate public-domain Natural Earth coastlines replace placeholder continents on the folded atlas. Browser checks emulate mobile size and do not establish physical-phone frame rates.

## Production release checks — 6 November 2026

The user authorized production publishing and asked for browser bugs to be fixed, confirming the affected browser was Chrome. The release adds the approved twenty-folio living journal and targeted browser reliability fixes. It does not publish local reference videos, prototype sites or review screenshots.

Reproduced fixes: delayed chapter requests no longer override newer navigation; slow loading offers reading without declaring a GPU failure; a failed neighbouring texture cannot dismantle the healthy current spread; returning to 3D initializes the correct camera; page gestures retain one pointer owner. The companion now remains below fixed navigation when dragged, fills its existing hitbox more clearly, restores its SVG after GPU loss, and preserves chat close controls on short screens. Chat requests time out after twenty seconds, reject malformed responses, avoid duplicate sends and abort on unmount. Native cursor remained visible in the Chrome audit.

Validation includes 52 unit checks, scoped ESLint and a successful production build. Chrome, Firefox151 and WebKit26.5 were tested in isolated browsers, including desktop and 390/320px layouts. Chrome covered all ten chapters and actual paper-touch gestures. Reduced motion and disabled WebGL retain all twenty HTML folios. Six fault-injection checks passed against a local production build: abandoned request cancellation,13.8s delayed cover recovery, blocked neighbouring texture, motion preference changes during turns, disabled graphics with reload retry, and13.5s background initial loading. Intentional blocked-image errors are recorded separately from unexpected runtime errors. Production-mode localhost analytics404 is Vercel's platform-only endpoint, not a broken application asset. Physical phones and the friend's exact device were not available.

The repository-wide legacy lint command still reports pre-existing issues outside these changed modules and scans local generated review bundles; changed application modules pass scoped lint. TypeScript unit tests run through tsx because one older suite uses extensionless imports.

Release target: traut1-odoo/tanmay-portfolio main, mirrored to tanmayrautheckler/tanmay-portfolio main. Previous known-good commit: e8c879e7f8d3377c8c44c7f04f4939c9f4f6003d. Previous immutable deployment: https://tanmay-portfolio-e96yik9gq-tanmay-s-projects10.vercel.app. Rollback can use a revert of the release commit, followed by verification and a normal fast-forward main push; no force push is needed. Final remote SHA, Vercel status and live asset hashes are recorded in local release evidence.
