# Journal character provenance

`src/components/about/journal/journal-character.tsx` contains original procedural
geometry and articulated animation authored for this portfolio. No external human
models, motion-capture clips, stock photos, or commercial asset files are bundled.
The fabric bump texture is generated locally from a deterministic weave pattern.

## Character API

`JournalCharacter({ time, height, pose, shirt, pants, skin, backpack, helmet,
phase, position, rotation })` uses the journal's shared `time.current.t` clock.

- Feet are at local y=0; the character faces +Z.
- `height` defaults to 1 world unit. Authored anatomy is approximately 7.4 heads
  tall, normalized from a 1.8-unit figure.
- Poses: `idle`, `walk`, `climb`, `photography`, `birdwatching`, `parachute`,
  `tactical`.
- A parent controls terrain/path placement and creates any camera, binocular,
  parachute, rope, or gameplay prop. These are illustrative personal-interest
  scenes, not records of actual trips or gameplay results.
- Wrap the character in a **static** journal reveal-layer group. The character's
  nested joint groups own their animated transforms.
- No separate animation loop, audio, network request, model decoder, or runtime
  third-party dependency is introduced.

This is an articulated procedural miniature, not a photorealistic scanned human or
an imported motion-capture rig. Feet/hand contacts use authored poses rather than
inverse kinematics. Use a dedicated licensed rigged character and IK pipeline if
closer camera views require physical precision.

## External candidates inspected but not bundled

- [Cesium Man, official Khronos asset metadata](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/CesiumMan/README.md):
  credited to Cesium, CC BY 4.0 plus Cesium logo terms. The astronaut-style suit
  did not fit this outdoors scene, so it was not included or modified.
- [Three.js skeletal animation example](https://threejs.org/examples/webgl_animation_skinning_blending.html):
  identifies the Soldier example as a Mixamo model. The example's code license
  alone was not treated as proof of the model's standalone redistribution rights;
  no Soldier file was included.
