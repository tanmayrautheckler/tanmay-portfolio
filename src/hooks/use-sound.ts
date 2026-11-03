"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny Web Audio synthesizer — no external files needed.
 * Creates short musical/UI notes on the fly.
 */
function createAudioContext() {
  if (typeof window === "undefined") return null;
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

let sharedCtx: AudioContext | null = null;
function getCtx() {
  if (!sharedCtx) sharedCtx = createAudioContext();
  return sharedCtx;
}

type SoundType = "hover" | "click" | "switch" | "pop" | "whoosh";

const sounds: Record<SoundType, (ctx: AudioContext) => void> = {
  hover(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  },

  click(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  },

  switch(ctx) {
    // Rising arpeggio — 3 quick notes
    [0, 0.08, 0.16].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const freq = [523, 659, 784][i]; // C5, E5, G5
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.04, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  },

  pop(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  },

  whoosh(ctx) {
    // Filtered noise burst
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
    filter.Q.value = 2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + 0.15);
  },
};

const SOUND_EVENT = "portfolio:sound-change";

function readSoundPreference() {
  try { return localStorage.getItem("portfolio-sound") === "on"; }
  catch { return false; }
}

function subscribeSound(listener: () => void) {
  window.addEventListener(SOUND_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(SOUND_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useSound() {
  const enabled = useSyncExternalStore(subscribeSound, readSoundPreference, () => false);

  const play = useCallback((type: SoundType) => {
    if (!readSoundPreference()) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      void ctx.resume().then(() => { if (readSoundPreference()) sounds[type](ctx); }).catch(() => {});
    } else {
      try { sounds[type](ctx); } catch { /* Audio may be unavailable. */ }
    }
  }, []);

  const toggle = useCallback(() => {
    const next = !readSoundPreference();
    try { localStorage.setItem("portfolio-sound", next ? "on" : "off"); } catch { return false; }
    window.dispatchEvent(new Event(SOUND_EVENT));
    return next;
  }, []);

  return { play, toggle, enabled };
}
