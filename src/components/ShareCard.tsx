import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface ShareStat { label: string; value: string; color?: string }
export interface ShareSpec {
  eyebrow: string;
  title: string;
  accentWord?: string;   // trailing word of the title rendered in gold
  stats: ShareStat[];    // 2–4
  detail?: string;
  footnote?: string;
}

const PAL = {
  bg1: '#0e1613', bg2: '#080c0a',
  gold: '#ecd28a', goldDeep: '#c9a24b',
  emerald: '#35cf9b', emeraldGlow: '#48e8ac',
  text: '#f5f2e8', mist: '#c3cfc7', dim: '#8fa39a',
};
const W = 1200, H = 630;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function fitFont(ctx: CanvasRenderingContext2D, text: string, family: string, weight: string, start: number, maxW: number) {
  let size = start;
  do { ctx.font = `${weight} ${size}px ${family}`; if (ctx.measureText(text).width <= maxW) break; size -= 2; } while (size > 14);
  return size;
}

/** Draws the share card into a 1200×630 canvas (2× backing store for crispness). */
export function drawCard(canvas: HTMLCanvasElement, spec: ShareSpec) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = 2;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // background
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, PAL.bg1); g.addColorStop(1, PAL.bg2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // grid
  ctx.strokeStyle = 'rgba(56,224,160,0.05)'; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // emerald glow
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.52, 40, W * 0.5, H * 0.52, 520);
  glow.addColorStop(0, 'rgba(53,207,155,0.14)'); glow.addColorStop(1, 'rgba(53,207,155,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // gold frame
  ctx.strokeStyle = 'rgba(236,210,138,0.45)'; ctx.lineWidth = 1.5;
  roundRect(ctx, 24, 24, W - 48, H - 48, 22); ctx.stroke();

  const M = 72;

  // header
  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 30px "Cinzel", serif'; ctx.fillStyle = PAL.gold;
  ctx.fillText('PROSPER', M, 84);
  const pW = ctx.measureText('PROSPER').width;
  ctx.font = '600 13px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.dim;
  ctx.fillText('ATLAS', M + pW + 12, 84);
  // eyebrow (right)
  ctx.font = '600 14px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.emeraldGlow;
  ctx.textAlign = 'right';
  ctx.fillText(spec.eyebrow.toUpperCase(), W - M, 82);
  ctx.textAlign = 'left';

  // title
  const titleSize = fitFont(ctx, spec.title, '"Rajdhani", sans-serif', '600', 62, W - M * 2 - (spec.accentWord ? 0 : 0));
  ctx.font = `600 ${titleSize}px "Rajdhani", sans-serif`;
  ctx.fillStyle = PAL.text;
  const titleY = 190;
  ctx.fillText(spec.title, M, titleY);
  if (spec.accentWord) {
    const tw = ctx.measureText(spec.title).width;
    ctx.fillStyle = PAL.gold;
    ctx.fillText(' ' + spec.accentWord, M + tw, titleY);
  }

  // stats row
  const stats = spec.stats.slice(0, 4);
  const cols = stats.length;
  const contentW = W - M * 2;
  const colW = contentW / cols;
  const valueSize = cols <= 2 ? 66 : cols === 3 ? 50 : 42;
  const rowY = 300;
  stats.forEach((s, i) => {
    const cx = M + colW * i;
    // divider
    if (i > 0) { ctx.strokeStyle = 'rgba(234,230,218,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, rowY - 6); ctx.lineTo(cx, rowY + 96); ctx.stroke(); }
    const px = cx + (i > 0 ? 28 : 0);
    ctx.font = '600 15px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.mist;
    ctx.fillText(s.label.toUpperCase(), px, rowY + 22);
    const vs = fitFont(ctx, s.value, '"Rajdhani", sans-serif', '700', valueSize, colW - 40 - (i > 0 ? 28 : 0));
    ctx.font = `700 ${vs}px "Rajdhani", sans-serif`;
    ctx.fillStyle = s.color ?? PAL.text;
    ctx.fillText(s.value, px, rowY + 22 + vs + 8);
  });

  // detail
  if (spec.detail) {
    ctx.font = '400 22px "Archivo", sans-serif'; ctx.fillStyle = PAL.mist;
    const words = spec.detail.split(' ');
    let line = '', y = 468;
    for (const w of words) {
      if (ctx.measureText(line + w + ' ').width > contentW) { ctx.fillText(line.trim(), M, y); line = w + ' '; y += 30; if (y > 520) break; }
      else line += w + ' ';
    }
    if (line.trim()) ctx.fillText(line.trim(), M, y);
  }

  // footer
  ctx.font = '600 15px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.dim;
  ctx.fillText('pros-per.xyz · via @ProsperTicker', M, H - 52);
  ctx.textAlign = 'right';
  ctx.font = '600 13px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.dim;
  ctx.fillText(spec.footnote ?? 'Community-built · educational model · not official', W - M, H - 52);
  ctx.textAlign = 'left';
}

async function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'));
}

export function ShareModal({ open, onClose, spec, caption, url }: {
  open: boolean; onClose: () => void; spec: ShareSpec; caption: string; url: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const render = () => { if (!cancelled && canvasRef.current) drawCard(canvasRef.current, spec); };
    // draw once fonts are ready so Cinzel/Rajdhani render correctly on the canvas
    (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(render);
    render();
    return () => { cancelled = true; };
  }, [open, spec]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const download = async () => {
    const c = canvasRef.current; if (!c) return;
    const blob = await toBlob(c); if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'prosper-atlas-card.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const copyImage = async () => {
    const c = canvasRef.current; if (!c) return;
    try {
      const blob = await toBlob(c); if (!blob) throw new Error('no blob');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied('ok');
    } catch { setCopied('fail'); }
    setTimeout(() => setCopied('idle'), 2200);
  };
  const postToX = () => {
    const text = `${caption}\n\n${url}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  return (
    <motion.div
      role="dialog" aria-modal="true" aria-label="Share card"
      onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(4,7,5,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.8 }}
        style={{ width: 'min(560px, 94vw)', borderRadius: 20, border: '1px solid var(--border-strong)', background: 'linear-gradient(180deg, rgba(16,24,20,0.98), rgba(10,15,12,0.98))', boxShadow: '0 40px 100px -30px rgba(0,0,0,0.9)', padding: 20 }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <span className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--primary)' }}>Share card</span>
          <button onClick={onClose} aria-label="Close" className="pressable" style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'rgba(7,12,9,0.6)', border: '1px solid var(--border)', color: 'var(--mist)', cursor: 'pointer' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div className="flex items-center gap-2.5" style={{ marginTop: 16, flexWrap: 'wrap' }}>
          <button onClick={postToX} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 160px' }}>Post to X</button>
          <button onClick={download} className="pressable share-btn">Download</button>
          <button onClick={copyImage} className="pressable share-btn">
            {copied === 'ok' ? 'Copied ✓' : copied === 'fail' ? 'Use download' : 'Copy image'}
          </button>
        </div>
        <p className="font-mono" style={{ marginTop: 12, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.55)', lineHeight: 1.5 }}>
          Post to X opens a prefilled tweet — attach the copied or downloaded image to it.
        </p>
      </motion.div>
    </motion.div>
  );
}
