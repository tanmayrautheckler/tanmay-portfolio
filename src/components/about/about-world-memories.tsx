"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { CanvasTexture, LinearFilter, SRGBColorSpace, Texture } from "three";

type Memory = {
  id: string;
  title: string;
  note: string;
  position: [number, number, number];
  rotation: number;
  size: [number, number];
};

const memories: Memory[] = [
  { id: "camping", title: "CAMPING", note: "A little distance from the desk.", position: [11, 1.4, -45], rotation: .15, size: [5, 3.5] },
  { id: "skydiving", title: "SKYDIVING", note: "Outside the comfort zone.", position: [13, 1.8, -50], rotation: -.2, size: [5, 3.5] },
  { id: "bmw", title: "ROAD TRIPS", note: "Getting there is part of the fun.", position: [7, 1, -55], rotation: .08, size: [5, 3.5] },
  { id: "northern-lights", title: "NORTHERN LIGHTS", note: "Worth looking up.", position: [-1, 1, -72], rotation: -.15, size: [7, 6] },
  { id: "la-skyline", title: "LOS ANGELES", note: "Another perspective.", position: [-1, .7, -106], rotation: .06, size: [8, 5] },
];

function cropTexture(original: Texture, width: number, height: number) {
  const texture = original.clone();
  const image = original.image as { width: number; height: number };
  const imageAspect = image.width / image.height;
  const planeAspect = width / height;
  if (imageAspect > planeAspect) {
    texture.repeat.set(planeAspect / imageAspect, 1);
    texture.offset.set((1 - texture.repeat.x) / 2, 0);
  } else {
    texture.repeat.set(1, imageAspect / planeAspect);
    texture.offset.set(0, (1 - texture.repeat.y) / 2);
  }
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// Local canvas typography avoids remote font requests inside the 3D scene.
function captionTexture(memory: Memory, index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 180;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#d3b982";
    context.font = "400 32px monospace";
    context.fillText(`0${index + 1}`, 4, 48);
    context.fillStyle = "#eee7d5";
    context.font = "500 40px sans-serif";
    context.fillText(memory.title, 100, 49);
    context.fillStyle = "#c2c8bb";
    context.font = "400 31px sans-serif";
    context.fillText(memory.note, 100, 108);
    context.strokeStyle = "rgba(204, 194, 158, .32)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, 151);
    context.lineTo(1536, 151);
    context.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
}

function MemoryPlane({ memory, index, original }: { memory: Memory; index: number; original: Texture | null }) {
  const [width, height] = memory.size;
  const texture = useMemo(() => original ? cropTexture(original, width, height) : null, [original, width, height]);
  const caption = useMemo(() => captionTexture(memory, index), [memory, index]);
  useEffect(() => () => { texture?.dispose(); caption.dispose(); }, [texture, caption]);
  const deckY = -2.6;
  const floor = deckY - memory.position[1];
  const frameBottom = -height / 2;
  const postHeight = frameBottom - floor;
  const captionWidth = Math.min(width, 4.2);
  const captionHeight = captionWidth * 180 / 1536;
  const captionY = frameBottom - .29;
  return <group position={memory.position} rotation={[0, memory.rotation, 0]} name={`${memory.title}: ${memory.note}`}>
    {[-1, 1].map(side => <group key={side} position={[side * width * .34, 0, -.08]}>
      <mesh position={[0, floor + postHeight / 2, 0]}>
        <boxGeometry args={[.065, postHeight, .085]} />
        <meshStandardMaterial color="#756b53" metalness={.7} roughness={.48} />
      </mesh>
      <mesh position={[0, floor + .035, 0]}>
        <boxGeometry args={[.48, .07, .36]} />
        <meshStandardMaterial color="#675f4d" metalness={.7} roughness={.55} />
      </mesh>
    </group>)}
    <mesh position={[0, 0, -.055]}>
      <boxGeometry args={[width + .1, height + .1, .08]} />
      <meshStandardMaterial color="#8e805e" roughness={.48} metalness={.65} />
    </mesh>
    <mesh position={[0, 0, -.009]}>
      <planeGeometry args={[width + .025, height + .025]} />
      <meshBasicMaterial color="#192c29" toneMapped={false} />
    </mesh>
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} color={texture ? "#ffffff" : "#263b37"} toneMapped={false} />
    </mesh>
    <mesh position={[0, captionY, -.07]}>
      <boxGeometry args={[width * .7, .055, .065]} />
      <meshStandardMaterial color="#756b53" metalness={.7} roughness={.48} />
    </mesh>
    <mesh position={[0, captionY, -.02]}>
      <boxGeometry args={[captionWidth + .1, captionHeight + .08, .05]} />
      <meshStandardMaterial color="#1d2e2b" metalness={.25} roughness={.85} />
    </mesh>
    <mesh position={[0, captionY, .008]}>
      <planeGeometry args={[captionWidth, captionHeight]} />
      <meshBasicMaterial map={caption} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  </group>;
}

/** Five real memories inhabit the same world as the camera journey. */
function MemorySource({ memory, index }: { memory: Memory; index: number }) {
  const texture = useTexture(`/images/about/gallery/${memory.id}.webp`);
  return <MemoryPlane memory={memory} index={index} original={texture} />;
}

export function WorldMemories({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return <group name="Tanmay's camera roll" userData={{ reducedMotion }}>
    {memories.map((memory, index) => <Suspense key={memory.id} fallback={<MemoryPlane memory={memory} index={index} original={null} />}><MemorySource memory={memory} index={index} /></Suspense>)}
  </group>;
}
