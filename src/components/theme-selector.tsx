"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Check, Moon, Palette, Play, Pause, Sun, Volume2, VolumeX, X, ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useSound } from "@/hooks/use-sound";
import { clubPalettes, paletteClasses } from "@/lib/appearance-palettes";
import { useAppearancePalette, selectAppearancePalette } from "@/hooks/use-appearance";
import { useClubAtmosphere } from "./club-atmosphere";

export function ThemeSelector() {
  const [open, setOpen] = useState(false);
  const active = useAppearancePalette();
  const { resolvedTheme, setTheme } = useTheme();
  const { enabled, toggle, play } = useSound();
  const { stadium, setStadium, playing, toggleMusic, volume, setVolume, error } = useClubAtmosphere();
  const current = clubPalettes.find(club => club.id === active) ?? clubPalettes[0];
  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("portfolio:close-overlays", close);
    return () => document.removeEventListener("portfolio:close-overlays", close);
  }, []);
  useEffect(() => {
    const html = document.documentElement;
    paletteClasses.forEach(id => html.classList.remove(`theme-${id}`));
    html.classList.add(`theme-${active}`);
  }, [active]);

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Appearance and sound"><Palette size={17} /></Button></DialogTrigger>
    <DialogContent className="site-appearance-panel site-club-panel" onCloseAutoFocus={event => {
      const searchInput = document.querySelector<HTMLInputElement>('.site-command-panel[data-state="open"] input[cmdk-input]');
      if (searchInput) { event.preventDefault(); searchInput.focus({ preventScroll: true }); }
    }}>
      <div className="site-menu-heading"><div><p className="club-collection-eyebrow">THE MATCHDAY EDITIONS</p><DialogTitle>A little club character.</DialogTitle><DialogDescription>Five clubs, with stadium views and optional sound.</DialogDescription></div><DialogClose asChild><Button variant="ghost" size="icon" aria-label="Close appearance settings"><X /></Button></DialogClose></div>
      <div className="club-collection-controls"><span>Choose your colours</span><div role="group" aria-label="Lighting"><Button variant="ghost" aria-pressed={resolvedTheme === "light"} onClick={() => setTheme("light")}><Sun size={14} />Light</Button><Button variant="ghost" aria-pressed={resolvedTheme === "dark"} onClick={() => setTheme("dark")}><Moon size={14} />Dark</Button></div></div>
      <div className="club-collection-grid" role="group" aria-label="Five club-inspired themes">{clubPalettes.map((club, index) => <Button key={club.id} variant="outline" className="club-collection-card" data-featured={index === 0} aria-label={`Use ${club.name} theme`} aria-pressed={active === club.id} style={{ "--club-card-bg": club.dark.background, "--club-card-ink": club.dark.foreground, "--club-card-trim": club.light.highlight } as CSSProperties} onClick={() => { selectAppearancePalette(club.id); play("switch"); }}>
        <Image src={club.thumb} alt="" fill sizes={index === 0 ? "(max-width:600px) 90vw, 320px" : "(max-width:600px) 45vw, 240px"} quality={85} className="club-card-photo" />
        <span className="club-card-shade" aria-hidden="true" />
        <span className="club-card-top"><span>0{index + 1} / {club.edition}</span>{active === club.id && <Check size={15} />}</span>
        <span className="club-card-copy"><strong>{club.name}</strong><small>{club.stadium}</small><span className="club-card-stripes" aria-hidden="true">{club.stripes.map(colour => <i key={colour} style={{ background: colour }} />)}</span></span>
      </Button>)}</div>
      <div className="club-collection-note"><span>{current.description}</span><span>Club-inspired · Archival stadium views</span></div>
      <section className="club-atmosphere-settings" aria-label="Matchday atmosphere">
        <div className="club-setting-row"><div><p>Stadium view</p><small>{current.stadium} behind the home-page portrait.</small></div><Button variant="outline" aria-label="Toggle stadium backdrop" aria-pressed={stadium} onClick={() => setStadium(!stadium)}><ImageIcon size={14} />{stadium ? "On" : "Off"}</Button></div>
        <div className="club-setting-row"><div><p>Matchday soundtrack</p><small>Original ambient score. Plays only when you press play.</small></div><Button variant="outline" aria-label={playing ? "Pause matchday music" : "Play matchday music"} aria-pressed={playing} onClick={toggleMusic}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Pause" : "Play"}</Button></div>
        <label className="club-volume"><Volume2 size={13} /><span>Music volume</span><input type="range" min="0" max="100" step="1" value={Math.round(volume * 100)} onChange={event => setVolume(Number(event.target.value) / 100)} /><output>{Math.round(volume * 100)}%</output></label>
        {error && <p className="club-audio-error" role="status">{error}</p>}
      </section>
      <div className="site-sound-option"><div><p>Interface sounds</p><small>Clicks and page changes.</small></div><Button variant="outline" onClick={() => { if (toggle()) play("pop"); }} aria-pressed={enabled} aria-label={enabled ? "Mute interface sounds" : "Enable interface sounds"}>{enabled ? <Volume2 /> : <VolumeX />}{enabled ? "On" : "Off"}</Button></div>
      <details className="club-photo-credits"><summary>Stadium photo credits</summary>{clubPalettes.map(club => <p key={club.id}><a href={club.credit.source} target="_blank" rel="noreferrer">{club.stadium} — {club.credit.author}</a><a href={club.credit.licenseUrl} target="_blank" rel="noreferrer">{club.credit.license}</a><span>Resized and converted to WebP; displayed with an overlay.</span></p>)}</details>
    </DialogContent>
  </Dialog>;
}
