"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(() => import("./cursor-effects").then(m => ({ default: m.CustomCursor })), { ssr: false });
const ClickParticles = dynamic(() => import("./cursor-effects").then(m => ({ default: m.ClickParticles })), { ssr: false });
const KonamiEasterEgg = dynamic(() => import("./easter-eggs").then(m => ({ default: m.KonamiEasterEgg })), { ssr: false });
const ScrollProgress = dynamic(() => import("./scroll-progress").then(m => ({ default: m.ScrollProgress })), { ssr: false });
const ThemeSelector = dynamic(() => import("./theme-selector").then(m => ({ default: m.ThemeSelector })), { ssr: false });
const AIChatbot = dynamic(() => import("./ai-chatbot").then(m => ({ default: m.AIChatbot })), { ssr: false });

export function InteractiveEffects() {
  return (
    <>
      <ScrollProgress />
      <CustomCursor />
      <ClickParticles />
      <KonamiEasterEgg />
      <ThemeSelector />
      <AIChatbot />
    </>
  );
}
