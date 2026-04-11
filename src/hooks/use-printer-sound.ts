"use client";

import { useCallback } from "react";

/**
 * Thermal printer sound — bandpass-filtered white noise + low motor hum.
 * Reuses the shared AudioContext pattern from use-sound.ts.
 */
let sharedCtx: AudioContext | null = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    sharedCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return sharedCtx;
}

export function usePrinterSound() {
  const play = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const duration = 1.6;
    const now = ctx.currentTime;

    // White noise through bandpass → sounds like paper feeding
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(3000, now);
    bandpass.frequency.linearRampToValueAtTime(1200, now + duration);
    bandpass.Q.value = 1.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.035, now + 0.1);
    noiseGain.gain.setValueAtTime(0.035, now + duration - 0.3);
    noiseGain.gain.linearRampToValueAtTime(0, now + duration);

    noise.connect(bandpass).connect(noiseGain).connect(ctx.destination);

    // Low motor hum
    const motor = ctx.createOscillator();
    motor.type = "sawtooth";
    motor.frequency.setValueAtTime(80, now);

    const motorGain = ctx.createGain();
    motorGain.gain.setValueAtTime(0, now);
    motorGain.gain.linearRampToValueAtTime(0.015, now + 0.1);
    motorGain.gain.setValueAtTime(0.015, now + duration - 0.3);
    motorGain.gain.linearRampToValueAtTime(0, now + duration);

    const motorFilter = ctx.createBiquadFilter();
    motorFilter.type = "lowpass";
    motorFilter.frequency.value = 200;

    motor.connect(motorFilter).connect(motorGain).connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
    motor.start(now);
    motor.stop(now + duration);
  }, []);

  return { play };
}
