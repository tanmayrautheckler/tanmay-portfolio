"use client";

import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/** Local CC0 PBR maps from Poly Haven. No runtime CDN dependency. */
export function Surface({ kind, repeat, color = "#ffffff" }: { kind: "concrete_floor_02" | "wood_floor"; repeat: [number, number]; color?: string }) {
  const [diffuse, normal, roughness] = useTexture(["Diffuse", "nor_gl", "Rough"].map(map => `/images/about/materials/${kind}_${map}.jpg`));
  const [x, y] = repeat;
  const maps = useMemo(() => [diffuse, normal, roughness].map((source, index) => {
    const texture = source.clone();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(x, y);
    texture.colorSpace = index === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }), [diffuse, normal, roughness, x, y]);
  useEffect(() => () => maps.forEach(map => map.dispose()), [maps]);
  return <meshStandardMaterial map={maps[0]} normalMap={maps[1]} roughnessMap={maps[2]} normalScale={new THREE.Vector2(.35, .35)} roughness={.85} color={color}/>;
}
