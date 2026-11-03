"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const CustomCursor = dynamic(() => import("./cursor-effects").then(m => ({ default: m.CustomCursor })), { ssr: false });
const ScrollProgress = dynamic(() => import("./scroll-progress").then(m => ({ default: m.ScrollProgress })), { ssr: false });
const AIChatbot = dynamic(() => import("./ai-chatbot").then(m => ({ default: m.AIChatbot })), { ssr: false });
const CommandPalette = dynamic(() => import("./cmd-palette").then(m => ({ default: m.CommandPalette })), { ssr: false });

export function InteractiveEffects() {
  const immersiveAbout = usePathname() === "/about";
  return (
    <>
      {!immersiveAbout && <ScrollProgress />}
      <CustomCursor />
      <CommandPalette />
      {!immersiveAbout && <AIChatbot />}
    </>
  );
}
