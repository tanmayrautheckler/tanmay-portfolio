"use client";
import { useSyncExternalStore } from "react";
import { DEFAULT_PALETTE, validPalette } from "@/lib/appearance-palettes";
let sessionValue: string | null = null;
function read() {
  if (sessionValue) return sessionValue;
  try { return validPalette(localStorage.getItem("portfolio-theme")); } catch { return DEFAULT_PALETTE; }
}
function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === "portfolio-theme" || event.key === null) { sessionValue = null; listener(); } };
  window.addEventListener("portfolio:color-change", listener);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener("portfolio:color-change", listener); window.removeEventListener("storage", storage); };
}
export function useAppearancePalette() { return useSyncExternalStore(subscribe, read, () => DEFAULT_PALETTE); }
export function selectAppearancePalette(id: string) {
  sessionValue = validPalette(id);
  try { localStorage.setItem("portfolio-theme", sessionValue); } catch { /* Keep the theme usable when storage is blocked. */ }
  window.dispatchEvent(new Event("portfolio:color-change"));
}
