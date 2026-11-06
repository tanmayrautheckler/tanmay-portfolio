# Journal roadster

The car uses **Generic convertible roadster**, an original, unbranded model by
Innerscene, released under **CC0 1.0 Universal** (public domain dedication).

- Primary source: https://www.innerscene.com/tools/library/3d-parts/generic-convertible-roadster-05aace60
- Download: https://www.innerscene.com/api/library/generic-convertible-roadster-05aace60/download
- Licence: https://creativecommons.org/publicdomain/zero/1.0/
- Retrieved: 2026-11-06. The source page explicitly permits commercial use,
  modification and redistribution. No account or paid credits were used.

This is a modern, retro-styled open roadster. It is not a branded vehicle and
is not presented as a model of a car owned by Tanmay.

## Local modifications

- Baked source transforms; centred the body; normalized its length to one unit,
  with the front along +X and tyre contact at Y=0.
- Removed subpixel tyre tread ribs, tread segments and individual wheel lugs.
- Applied offline Blender decimation while preserving the curved body silhouette,
  mirrors, windshield frame, open cabin, wheels and roll-protection hoops.
- Reduced the source's 106,474 triangles to **14,995 triangles**.
- Combined 388 loaded mesh primitives into **6 mesh/material batches**, including
  four independent wheel pivots for distance-matched wheel rotation.
- Repacked source base colors, metal/roughness and clearcoat into three embedded
  **256×192 pixel atlases**, retaining different paint, chrome, fabric and rubber
  responses in one opaque material. A second material handles transparent glass.
- Replaced glass transmission with ordinary transparency, avoiding an extra
  refraction pass for this small scene detail.
- The React component adds two small, originally authored seated silhouettes,
  merged into **one extra draw**. They are not part of the downloaded model.
- The component defaults to length **0.63 journal units**, preserving the existing
  scene footprint. Path coordinates are not scaled.

Optimization is for the unchanged journal framing, where subpixel finger,
face and tyre-tread detail does not improve the visible result. Close-up front
and rear renders were compared against the full-detail source; roll hoops were
restored after the first simplification pass. Wheel pivots were checked through
quarter-turn rotations. No external paid service or additional software download
was used; processing used the existing local Blender and Three.js installations.

The optimized GLB is served locally by the portfolio. No third-party model
server is contacted at runtime. The unmodified download remains in the local
review directory and is not included in the public build.

## Integrity

Original download: 4,218,384 bytes.

SHA-256:
`526f3dcba46b5755c92245ad6ea15f35a92230449c4f28dabcc3b5313c37f367`

Optimized `roadster.glb`: 667,540 bytes.

SHA-256:
`e34a212fdb94fc498caa2c727cb9395fe58cb8b625b604dfef12930e95a070d4`
