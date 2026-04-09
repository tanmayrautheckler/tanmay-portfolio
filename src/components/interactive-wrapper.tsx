"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(() => import("./cursor-effects").then(m => ({ default: m.CustomCursor })), { ssr: false });
const ClickParticles = dynamic(() => import("./cursor-effects").then(m => ({ default: m.ClickParticles })), { ssr: false });
const KonamiEasterEgg = dynamic(() => import("./easter-eggs").then(m => ({ default: m.KonamiEasterEgg })), { ssr: false });

export function InteractiveEffects() {
  return (
    <>
      <CustomCursor />
      <ClickParticles />
      <KonamiEasterEgg />
    </>
  );
}
