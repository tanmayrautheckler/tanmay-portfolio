# Personal journal assets

Page layouts, typography, cover artwork, illustrated football shirt and cloth bump texture were authored for this portfolio. Rebuild with `node scripts/build-journal-assets.mjs`.

Content source: `src/components/about/journal/content.json`.

Existing portfolio photographs, originals unchanged and each used once within the printed book:

- `public/images/about/tahoe/tanmay.webp` — personal portrait cutout, page 01.
- `public/images/about/gallery/bmw.webp` — road-trip photograph, page 02.
- `public/images/about/gallery/skydiving.webp` — tandem skydive, page 03.
- `public/images/about/gallery/la-skyline.webp` — Los Angeles, page 03.
- `public/images/about/gallery/northern-lights.webp` — northern lights, page 04; no unverified location claimed.
- `public/images/about/gallery/camping.webp` — camping, page 04; no unverified location claimed.

The larger photo viewer uses these existing gallery sources on demand.

Desk diffuse/normal maps are optimized derivatives of existing Poly Haven Wood Floor CC0 maps. Source and license: https://polyhaven.com/a/wood_floor and https://polyhaven.com/license. See `public/images/about/materials/ASSETS.md`.

No images, models, branding or code from Instagram references are embedded. Cover, book, pages, cup and pen are authored geometry/artwork. The football illustration is original artwork, not an official jersey render or match clip.

Living-page prototype: `*-stage.webp` are author-owned paper layouts from the same content source. `shirt.png` is a transparent export of the original blue/garnet number-10 illustration. Gateway, cactus, folded mountains, trees, tent, stadium seating, paper plane, thought cards and aurora shader are authored locally. The miniature stadium is an illustrative paper scene, not a model of Camp Nou. Existing personal photographs appear on raised prints in place of the flat prints while living mode is active.

## Cinematic local revision — 4 November 2026

`alpine-world.webp` is an original AI-generated photographic landscape plate, optimized from the generated PNG. It is an illustrative outdoor world, not a photograph of Tanmay's travels or a specific destination. The aircraft, parachutist, cyclist, walker, stadium bowl, water shader, mist and atmospheric particles are authored scene geometry/effects. The scene combines a photographic plate with independently moving 3D objects; it is not a fully reconstructed terrain model or filmed travel footage.

Football sources, displayed with attribution links beneath the football spread:

- `messi-celebration.webp`: **Carlos RM**, *Messi - Levante UD vs FC Barcelona - Carlos RM.jpg*, [source](https://commons.wikimedia.org/wiki/File:Messi_-_Levante_UD_vs_FC_Barcelona_-_Carlos_RM.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Converted to WebP; photograph otherwise intact. No endorsement or match-attendance claim. The image-generation service declined a background-removal edit; no generated substitute was used.
- `camp-nou-photo.webp`: **Johannes Falke**, *Camp Nou Panoramic Interior View.jpg* (2012), [source](https://commons.wikimedia.org/wiki/File:Camp_Nou_Panoramic_Interior_View.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Resized and converted to WebP; mapped to a curved surface in an illustrative stadium, not an architectural reconstruction. The derivative image remains available under CC BY-SA 3.0.

Additional market, geopolitical, Formula 1, tactical, cinema and philosophy artwork is authored SVG/Three.js geometry. Market charts are illustrative, with no live quotes or claimed returns. No official Valorant map, F1 team livery, film footage, club anthem or third-party sound recording is included. All journal sounds are locally synthesized foley/ambience, off until the visitor enables them.

## Four-spread finishing pass

`messi-barca-2014.webp`: **Lluís / L. F. Salas**, *Leo Messi v Granada 2014.jpg*, [source](https://commons.wikimedia.org/wiki/File:Leo_Messi_v_Granada_2014.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Source photograph resized from 1600×1200 to 1280×960 and converted to WebP. A texture viewport crops the print around Messi, without changing the photographed action or his appearance. This replaces the older green-kit photograph in the living scene. Credit appears beneath the football spread. No endorsement or match attendance claim.

F1's inspection car, looping circuit, garage, tyre details and livery are authored unbranded geometry. The tactical site, agents and spike are original Valorant-inspired miniatures, not extracted game models or gameplay. Trading terminal UI and all OHLC/volume data are authored illustrative examples, not actual quotes or backtest results. All remain locally rendered Three.js scenes with no new runtime downloads.

## Current living scenes — 6 November 2026

The outdoor living scene now uses authored terrain and independent 3D actors, not the older alpine photographic plate. The retired plate and earlier football photos remain source/reference assets and are not requested by the current scene. All twenty printed/living folios and reader artwork rebuild from content.json. The new sports and fitness artwork and character geometry are original. Photographed material maps used on terrain, architecture and recreation surfaces are documented in ../materials/ASSETS.md under the Poly Haven CC0 licence.

`world-atlas.webp` is an authored map print based on Natural Earth's 1:110m land polygons. [Data source](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson), [public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/). Rebuild with `node scripts/build-journal-atlas.mjs path/to/ne_110m_land.geojson`. Coastlines and graticule only; no political boundaries, current events or actual transport flows are claimed. Connection arcs remain illustrative geometry.
