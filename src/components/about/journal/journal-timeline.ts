/** Shared choreography for the physical sheet and the world attached to it.
 * `phase` remains the existing absolute page position (0 = right, 1 = left),
 * so automatic turns and scrubbing by hand follow exactly the same envelope.
 */
export type JournalLayer = 'terrain' | 'actors' | 'atmosphere';
export const EMERGENCE_SECONDS = 1.7;
export const OUTDOOR_EMERGENCE_SECONDS = 5.2;

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

export function smoothRange(value: number, start: number, end: number): number {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

/** Direction-independent turn progress: 0 is the old spread, 1 the new. */
export function turnProgress(phase: number, from: number, to: number): number {
  return clamp01(to > from ? phase : 1 - phase);
}

/** The old world is flat before the physical sheet begins crossing the spine. */
export function sheetPhase(phase: number, from: number, to: number): number {
  const progress = turnProgress(phase, from, to);
  const sheet = smoothRange(progress, from === 0 ? .04 : .22, .88);
  return to > from ? sheet : 1 - sheet;
}

export function outgoingReveal(progress: number): number {
  return 1 - smoothRange(progress, 0, .22);
}

/** Only ink and the first terrain contour appear while the sheet settles.
 * The same mounted scene completes its emergence after the turn commits. */
export function incomingReveal(progress: number): number {
  return .18 * smoothRange(progress, .88, 1);
}

export function layerReveal(reveal: number, layer: JournalLayer, order = 0): number {
  const delay = Math.min(4, Math.max(0, order)) * .024;
  if (layer === 'terrain') return smoothRange(reveal, .12 + delay, .59 + delay);
  if (layer === 'actors') return smoothRange(reveal, .37 + delay, .86 + delay);
  return smoothRange(reveal, .63 + delay, 1);
}

/** Let the banks settle before water appears, and terrain before people. */
export function outdoorLayerReveal(reveal: number, layer: JournalLayer, order = 0): number {
  const delay = Math.min(4, Math.max(0, order)) * .018;
  if (layer === 'terrain') return smoothRange(reveal, .12 + delay, .53 + delay);
  if (layer === 'atmosphere') return smoothRange(reveal, .48 + delay, .8 + delay);
  return smoothRange(reveal, .62 + delay, .9 + delay);
}
