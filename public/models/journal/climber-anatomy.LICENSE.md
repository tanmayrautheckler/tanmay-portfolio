# Climber exposed anatomy

Asset: `climber-anatomy.glb`

Original: **Male Base Mesh — 3D Person, Rigged A-Pose**, published by Innerscene,
adapted from MakeHuman CC0 assets. The publisher explicitly releases this model
under **CC0 1.0 Universal / public domain**, including modification and redistribution
for commercial use. Verified 2026-11-06.

Primary source and license statement:
https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89

Publisher original download:
https://www.innerscene.com/api/library/male-base-mesh-3d-person-rigged-a-pose-380e6d89/download

MakeHuman's core-asset and export license explanation:
https://www.makehumancommunity.org/about/license.html

CC0 full legal text:
https://creativecommons.org/publicdomain/zero/1.0/legalcode

Local adaptation: retained the rigged head, hands, nails and facial parts; removed
all covered body geometry and unneeded parts; assigned local skin/eye materials;
simplified for the original miniature scale with meshoptimizer while retaining skinning;
repacked to binary glTF. No textures or network dependencies. 233,916 bytes and
3,719 triangles (original trimmed anatomy: 2,669,900 bytes / 62,198 triangles).
Clothing and equipment geometry is generated locally by the component.

Jacket, trousers, climbing harness, helmet, boots, rope, deterministic contact motion
and two-bone inverse kinematics are original geometry/code authored for this site
in `src/components/about/journal/journal-climber.tsx`. This is a real skinned anatomy
asset with an authored procedural clothing/IK rig, not a scanned photorealistic
full-body climbing actor or motion-capture animation.
