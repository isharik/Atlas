/**
 * Prosper audio — click sound only. One AudioContext created lazily on the first user
 * gesture (autoplay-safe). The click plays the supplied WAV. No ambient bed.
 */

let ctx: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

async function loadClick(c: AudioContext) {
  if (clickBuffer) return;
  try {
    const res = await fetch('/sfx/click.wav');
    const arr = await res.arrayBuffer();
    clickBuffer = await c.decodeAudioData(arr);
  } catch {
    clickBuffer = null;
  }
}

/** Call once on the first user gesture. */
export async function initAudio() {
  const c = getCtx();
  if (!c) return;
  await loadClick(c);
}

export function playClick(volume = 0.6) {
  const c = getCtx();
  if (!c || !clickBuffer) return;
  const src = c.createBufferSource();
  src.buffer = clickBuffer;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume)) * 0.6;
  src.connect(g);
  g.connect(c.destination);
  src.start();
}
