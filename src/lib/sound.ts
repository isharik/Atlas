/**
 * Tiny Web Audio chime synth — an elegant, fantasy-flavoured "activation" sound built
 * from oscillators (no sampled/copyrighted audio). Short, soft, non-intrusive.
 * The AudioContext is created lazily on the first call (which happens inside a click,
 * satisfying autoplay policies). Callers gate on the store's `soundOn`.
 */

type Kind = 'primary' | 'select' | 'nav';

let ctx: AudioContext | null = null;

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

// gentle bell-ish partials (relative gains) for a soft chime
function tone(c: AudioContext, freq: number, start: number, dur: number, gain: number, type: OscillatorType = 'sine') {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const CHORDS: Record<Kind, { notes: number[]; dur: number; gain: number }> = {
  // a rising perfect fifth + octave shimmer
  primary: { notes: [523.25, 783.99, 1046.5], dur: 0.9, gain: 0.09 },
  // soft two-note reveal
  select: { notes: [659.25, 987.77], dur: 0.6, gain: 0.07 },
  // very small tick
  nav: { notes: [880], dur: 0.32, gain: 0.05 },
};

export function playChime(kind: Kind = 'select') {
  const c = getCtx();
  if (!c) return;
  const { notes, dur, gain } = CHORDS[kind];
  notes.forEach((f, i) => {
    tone(c, f, i * 0.06, dur - i * 0.05, gain, 'sine');
    // faint triangle harmonic for shimmer
    tone(c, f * 2.0, i * 0.06, (dur - i * 0.05) * 0.6, gain * 0.25, 'triangle');
  });
}
