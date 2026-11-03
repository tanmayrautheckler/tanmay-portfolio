"use client";
import Image from "next/image";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { clubPalettes } from "@/lib/appearance-palettes";
import { useAppearancePalette } from "@/hooks/use-appearance";
import { Button } from "@/components/ui/button";

type Atmosphere = { stadium: boolean; setStadium: (value: boolean) => void; playing: boolean; toggleMusic: () => void; volume: number; setVolume: (value: number) => void; error: string };
const AtmosphereContext = createContext<Atmosphere | null>(null);
export function useClubAtmosphere() { const value = useContext(AtmosphereContext); if (!value) throw new Error("Club atmosphere provider missing"); return value; }

export function ClubAtmosphereProvider({ children }: { children: ReactNode }) {
  const palette = useAppearancePalette();
  const [stadium, setStadium] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(.18);
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume]);
  useEffect(() => {
    const element = audio.current;
    if (playing) { void element?.play().catch(() => { setPlaying(false); setError("Sound unavailable. Try again."); }); }
    else element?.pause();
  }, [playing, palette]);
  useEffect(() => {
    const pause = () => { if (document.hidden) { audio.current?.pause(); setPlaying(false); } };
    document.addEventListener("visibilitychange", pause);
    return () => { document.removeEventListener("visibilitychange", pause); };
  }, []);
  const toggleMusic = () => {
    setError("");
    const element = audio.current;
    if (!element) return;
    if (playing) { element.pause(); setPlaying(false); return; }
    // Start within the click gesture so mobile browsers can grant playback.
    element.volume = volume;
    void element.play().then(() => {
      if (document.hidden) { element.pause(); return; }
      setPlaying(true);
    }).catch(() => { setPlaying(false); setError("Sound unavailable. Try again."); });
  };
  return <AtmosphereContext.Provider value={{ stadium, setStadium, playing, toggleMusic, volume, setVolume, error }}>
    {children}
    <audio ref={audio} src={`/audio/matchday/${palette}.mp3`} preload="none" loop aria-hidden="true" onError={() => { setPlaying(false); setError("Sound unavailable. Try again."); }} />
  </AtmosphereContext.Provider>;
}

export function ClubStadiumBackdrop() {
  const active = useAppearancePalette();
  const club = clubPalettes.find(item => item.id === active) ?? clubPalettes[0];
  const { stadium, playing, toggleMusic } = useClubAtmosphere();
  return <>
    {stadium && <div className="club-stadium-backdrop" aria-hidden="true" key={club.id}><Image src={club.image} alt="" fill sizes="100vw" loading="lazy" fetchPriority="low" /><div /></div>}
    <div className="club-hero-label"><span className="club-hero-colours" aria-hidden="true">{club.stripes.map(colour => <i key={colour} style={{ background: colour }} />)}</span><div><strong>{club.name}</strong><span>{stadium ? club.stadium : club.edition}</span></div><Button variant="ghost" size="icon" aria-label={playing ? "Pause matchday music" : "Play matchday music"} aria-pressed={playing} onClick={toggleMusic}>{playing ? <Volume2 size={15} /> : <VolumeX size={15} />}</Button></div>
  </>;
}
