"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check, Moon, Palette, Sun, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useSound } from "@/hooks/use-sound";

const colors = [
  { id: "cyan", name: "Sky", color: "#0ebbff" },
  { id: "ember", name: "Clay", color: "#d4764e" },
  { id: "ocean", name: "Ocean", color: "#3b82f6" },
  { id: "luxe", name: "Gold", color: "#d4a44c" },
] as const;

function readColor() {
  try { const saved = localStorage.getItem("portfolio-theme"); return colors.some(color => color.id === saved) ? saved! : "cyan"; }
  catch { return "cyan"; }
}
function subscribeColor(listener: () => void) {
  window.addEventListener("portfolio:color-change", listener);
  window.addEventListener("storage", listener);
  return () => { window.removeEventListener("portfolio:color-change", listener); window.removeEventListener("storage", listener); };
}

export function ThemeSelector() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("portfolio:close-overlays", close);
    return () => document.removeEventListener("portfolio:close-overlays", close);
  }, []);
  const active = useSyncExternalStore(subscribeColor, readColor, () => "cyan");
  const { resolvedTheme, setTheme } = useTheme();
  const { enabled, toggle, play } = useSound();
  useEffect(() => {
    const html = document.documentElement;
    colors.forEach(color => html.classList.remove(`theme-${color.id}`));
    if (active !== "cyan") html.classList.add(`theme-${active}`);
  }, [active]);

  function selectColor(id: string) {
    try { localStorage.setItem("portfolio-theme", id); } catch { return; }
    window.dispatchEvent(new Event("portfolio:color-change"));
    play("switch");
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Appearance and sound"><Palette size={17} /></Button></DialogTrigger>
    <DialogContent className="site-appearance-panel" onCloseAutoFocus={(event) => {
      const searchInput = document.querySelector<HTMLInputElement>('.site-command-panel[data-state="open"] input[cmdk-input]');
      if (searchInput) {
        event.preventDefault();
        searchInput.focus({ preventScroll: true });
      }
    }}>
      <div className="site-menu-heading"><div><DialogTitle>Make yourself at home.</DialogTitle><DialogDescription>Choose the light and colour you prefer.</DialogDescription></div><DialogClose asChild><Button variant="ghost" size="icon" aria-label="Close appearance settings"><X /></Button></DialogClose></div>
      <div className="site-appearance-group"><p className="site-eyebrow">Lighting</p><div className="site-light-options">
        <Button variant="outline" aria-pressed={resolvedTheme === "light"} onClick={() => setTheme("light")}><Sun />Light</Button>
        <Button variant="outline" aria-pressed={resolvedTheme === "dark"} onClick={() => setTheme("dark")}><Moon />Dark</Button>
      </div></div>
      <div className="site-appearance-group"><p className="site-eyebrow">Accent</p><div className="site-color-options">{colors.map(color => <Button key={color.id} variant="outline" aria-pressed={active === color.id} onClick={() => selectColor(color.id)}><i style={{ background: color.color }} />{color.name}{active === color.id && <Check size={12} />}</Button>)}</div></div>
      <div className="site-sound-option"><div><p>Interface sounds</p><small>Soft feedback for clicks and page changes.</small></div><Button variant="outline" onClick={() => { if (toggle()) play("pop"); }} aria-pressed={enabled} aria-label={enabled ? "Mute interface sounds" : "Enable interface sounds"}>{enabled ? <Volume2 /> : <VolumeX />}{enabled ? "On" : "Off"}</Button></div>
    </DialogContent>
  </Dialog>;
}
