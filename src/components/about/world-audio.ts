/** Small, disposable sound engine. Starts only after the visitor opts in. */
export class WorldAudio {
  private context: AudioContext | null = null;
  private noise: AudioBuffer | null = null;

  enable() {
    if (!this.context) {
      this.context = new AudioContext();
      this.noise = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
      const samples = this.noise.getChannelData(0);
      for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
    }
    void this.context.resume().catch(() => {});
  }

  play(kind: "step" | "door" | "found", room = false) {
    const context = this.context;
    if (!context || context.state !== "running" || !this.noise) return;
    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = this.noise;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = kind === "step" ? (room ? 650 : 950) : 1800;
    const gain = context.createGain();
    const duration = kind === "door" ? .45 : .14;
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(kind === "step" ? .12 : .07, now + .009);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(now, Math.random() * .5, duration);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    if (kind === "found") {
      const oscillator = context.createOscillator();
      const tone = context.createGain();
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.exponentialRampToValueAtTime(660, now + .35);
      tone.gain.setValueAtTime(.025, now);
      tone.gain.exponentialRampToValueAtTime(.0001, now + .65);
      oscillator.connect(tone).connect(context.destination);
      oscillator.start(); oscillator.stop(now + .7);
      oscillator.onended = () => { oscillator.disconnect(); tone.disconnect(); };
    }
  }

  dispose() { void this.context?.close().catch(() => {}); this.context = null; this.noise = null; }
}
