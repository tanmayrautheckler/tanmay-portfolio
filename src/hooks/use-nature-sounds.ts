"use client";

import { useEffect, useRef, useCallback, useState } from "react";

let audioCtx: AudioContext | null = null;
function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function useNatureSounds() {
  const [playing, setPlaying] = useState(false);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  const start = useCallback(() => {
    if (nodesRef.current) return;
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2);
    master.connect(ctx.destination);

    // --- River / water white noise with bandpass ---
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const waterNoise = ctx.createBufferSource();
    waterNoise.buffer = noiseBuffer;
    waterNoise.loop = true;

    const waterFilter = ctx.createBiquadFilter();
    waterFilter.type = "bandpass";
    waterFilter.frequency.value = 800;
    waterFilter.Q.value = 0.5;

    const waterGain = ctx.createGain();
    waterGain.gain.value = 0.6;

    waterNoise.connect(waterFilter).connect(waterGain).connect(master);
    waterNoise.start();

    // --- Wind low rumble ---
    const windNoise = ctx.createBufferSource();
    windNoise.buffer = noiseBuffer;
    windNoise.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 200;
    windFilter.Q.value = 0.3;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.3;

    // Slow wind modulation
    const windLFO = ctx.createOscillator();
    const windLFOGain = ctx.createGain();
    windLFO.frequency.value = 0.15;
    windLFOGain.gain.value = 0.15;
    windLFO.connect(windLFOGain).connect(windGain.gain);
    windLFO.start();

    windNoise.connect(windFilter).connect(windGain).connect(master);
    windNoise.start();

    // --- Bird chirps (periodic) ---
    let birdInterval: ReturnType<typeof setInterval>;

    function chirp() {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const chirpGain = ctx.createGain();

      // Random pitch for variety
      const baseFreq = 2000 + Math.random() * 2000;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * (1.2 + Math.random() * 0.5), now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.18);

      chirpGain.gain.setValueAtTime(0, now);
      chirpGain.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.04, now + 0.02);
      chirpGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
      chirpGain.gain.linearRampToValueAtTime(0, now + 0.25);

      osc.connect(chirpGain).connect(master);
      osc.start(now);
      osc.stop(now + 0.3);

      // Sometimes double chirp
      if (Math.random() > 0.5) {
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        const f2 = baseFreq * (0.9 + Math.random() * 0.3);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(f2, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(f2 * 1.4, now + 0.2);
        osc2.frequency.exponentialRampToValueAtTime(f2 * 0.9, now + 0.3);

        g2.gain.setValueAtTime(0, now + 0.15);
        g2.gain.linearRampToValueAtTime(0.06, now + 0.17);
        g2.gain.linearRampToValueAtTime(0, now + 0.35);

        osc2.connect(g2).connect(master);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.4);
      }
    }

    // Chirp at random intervals
    function scheduleBird() {
      chirp();
      birdInterval = setTimeout(scheduleBird, 1500 + Math.random() * 4000);
    }
    birdInterval = setTimeout(scheduleBird, 500);

    setPlaying(true);

    nodesRef.current = {
      stop: () => {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
        setTimeout(() => {
          waterNoise.stop();
          windNoise.stop();
          windLFO.stop();
          clearTimeout(birdInterval);
          master.disconnect();
        }, 1200);
        nodesRef.current = null;
        setPlaying(false);
      },
    };
  }, []);

  const stop = useCallback(() => {
    nodesRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    if (nodesRef.current) stop();
    else start();
  }, [start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { nodesRef.current?.stop(); };
  }, []);

  return { playing, toggle };
}
