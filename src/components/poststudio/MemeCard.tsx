import { useEffect, useRef, useState, useCallback } from 'react';
import { useAudio } from '@/audio/AudioProvider';

// Canvas formats. Width is fixed; height changes with the chosen ratio.
export type FormatKey = 'x' | 'square' | 'portrait';
const FORMATS: Record<FormatKey, { w: number; h: number; label: string; note: string }> = {
  x: { w: 1920, h: 1080, label: 'X Card', note: '16:9' },
  square: { w: 1920, h: 1920, label: 'Square', note: '1:1' },
  portrait: { w: 1920, h: 2400, label: 'Portrait', note: '4:5' },
};
const FOOTER = 96;                 // solid bottom strip — the credit lives here
const RENDER_SCALE = 1.5;          // super-sampled backing → export well past 1080p
const PAL = { gold: '#ecd28a', dim: '#8fa39a' };

type Dims = { W: number; H: number; SH: number };
const dimsOf = (f: FormatKey): Dims => ({ W: FORMATS[f].w, H: FORMATS[f].h, SH: FORMATS[f].h - FOOTER });

export type FontKey = 'head' | 'display' | 'mono' | 'serif';
const FONTS: Record<FontKey, { label: string; stack: string }> = {
  head: { label: 'Headline', stack: '"Rajdhani", system-ui, sans-serif' },
  display: { label: 'Body', stack: '"Archivo", system-ui, sans-serif' },
  mono: { label: 'Mono', stack: '"JetBrains Mono", ui-monospace, monospace' },
  serif: { label: 'Serif', stack: '"Cinzel", Georgia, serif' },
};

export interface TextEl {
  kind: 'text'; id: string; text: string; x: number; y: number; size: number; color: string; opacity: number;
  align: CanvasTextAlign; font: FontKey; weight: number; tracking: number; lineH: number; rotate: number;
  upper: boolean; pill: boolean; pillColor: string; outline: boolean; outlineColor: string;
}
export interface ImageEl { kind: 'image'; id: string; img: HTMLImageElement; zoom: number; x: number; y: number }
export type El = TextEl | ImageEl;
type Box = { x: number; y: number; w: number; h: number };
export interface Comp { els: El[]; bg: string; overlay: number; format: FormatKey; showLogo: boolean; logoCorner: string }

let uid = 0;
const nid = () => `e${++uid}`;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mkText = (over: Partial<TextEl> = {}): TextEl => ({
  kind: 'text', id: nid(), text: 'Your hook goes here', x: 0.5, y: 0.44, size: 92, color: '#f5f2e8', opacity: 1,
  align: 'center', font: 'head', weight: 700, tracking: 0, lineH: 1.16, rotate: 0, upper: false, pill: false,
  pillColor: '#0e1613', outline: false, outlineColor: '#0e1613', ...over,
});

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(' '); let line = '';
    for (const w of words) {
      if (ctx.measureText(line + w + ' ').width > maxW && line) { out.push(line.trim()); line = w + ' '; }
      else line += w + ' ';
    }
    out.push(line.trim());
  }
  return out.length ? out : [''];
}
function drawImageEl(ctx: CanvasRenderingContext2D, el: ImageEl, rx: number, rw: number, SH: number) {
  const ir = el.img.width / el.img.height, r = rw / SH;
  let dw: number, dh: number;
  if (ir > r) { dh = SH; dw = SH * ir; } else { dw = rw; dh = rw / ir; }
  dw *= el.zoom; dh *= el.zoom;
  const dx = rx + (rw - dw) / 2 + (el.x - 0.5) * rw;
  const dy = (SH - dh) / 2 + (el.y - 0.5) * SH;
  ctx.save();
  ctx.beginPath(); ctx.rect(rx, 0, rw, SH); ctx.clip();
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(el.img, dx, dy, dw, dh);
  ctx.restore();
}
function drawTextEl(ctx: CanvasRenderingContext2D, el: TextEl, D: Dims): Box {
  const f = FONTS[el.font];
  const text = el.upper ? (el.text || ' ').toUpperCase() : (el.text || ' ');
  ctx.font = `${el.weight} ${el.size}px ${f.stack}`;
  const ls = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ('letterSpacing' in ls) ls.letterSpacing = `${el.tracking}em`;
  ctx.textBaseline = 'top'; ctx.textAlign = el.align;
  const maxW = D.W * 0.9;
  const lines = wrap(ctx, text, maxW);
  const lh = el.size * el.lineH;
  const totalH = lines.length * lh;
  let widest = 1;
  for (const l of lines) widest = Math.max(widest, ctx.measureText(l).width);
  const cx = el.x * D.W, cy = el.y * D.SH;
  const anchorX = el.align === 'left' ? -widest / 2 : el.align === 'right' ? widest / 2 : 0;
  ctx.save();
  ctx.translate(cx, cy);
  if (el.rotate) ctx.rotate(el.rotate * Math.PI / 180);
  const top = -totalH / 2;
  ctx.globalAlpha = clamp(el.opacity, 0, 1);
  if (el.pill) {
    const padX = el.size * 0.3, padY = el.size * 0.16;
    ctx.fillStyle = el.pillColor;
    roundRect(ctx, -widest / 2 - padX, top - padY, widest + padX * 2, totalH + padY * 2, Math.min(30, el.size * 0.34));
    ctx.fill();
  }
  if (el.outline) { ctx.lineWidth = Math.max(2, el.size * 0.055); ctx.strokeStyle = el.outlineColor; ctx.lineJoin = 'round'; lines.forEach((l, i) => ctx.strokeText(l, anchorX, top + i * lh)); }
  ctx.fillStyle = el.color;
  lines.forEach((l, i) => ctx.fillText(l, anchorX, top + i * lh));
  ctx.restore();
  if ('letterSpacing' in ls) ls.letterSpacing = '0px';
  return { x: cx - widest / 2, y: cy - totalH / 2, w: widest, h: totalH };
}
function drawCompass(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const p = (a: number) => (a / 40) * s;
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(p(20), p(20), p(18), 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(236,210,138,0.55)'; ctx.lineWidth = Math.max(1.2, p(1)); ctx.stroke();
  const pts = [[20, 3], [23, 17], [37, 20], [23, 23], [20, 37], [17, 23], [3, 20], [17, 17]];
  ctx.beginPath(); pts.forEach((pt, i) => { const X = p(pt[0]), Y = p(pt[1]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath();
  ctx.fillStyle = PAL.gold; ctx.fill();
  ctx.restore();
}
function drawLogo(ctx: CanvasRenderingContext2D, D: Dims, corner: string) {
  const s = 52, gap = 16, m = 60;
  ctx.save();
  ctx.font = '700 40px "Cinzel", serif';
  const word = 'PROSPER';
  const ww = ctx.measureText(word).width;
  const totalW = s + gap + ww;
  const top = corner[0] === 't' ? m : D.SH - m - s;
  const left = corner[1] === 'l' ? m : D.W - m - totalW;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 2;
  drawCompass(ctx, left, top, s);
  ctx.shadowBlur = 12;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = PAL.gold;
  ctx.fillText(word, left + s + gap, top + s * 0.5);
  ctx.font = '600 15px "JetBrains Mono", monospace'; ctx.fillStyle = '#c3cfc7';
  ctx.fillText('ATLAS', left + s + gap + ww + 12, top + s * 0.5 + 1);
  ctx.restore();
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
}

export function render(canvas: HTMLCanvasElement, c: Comp, selId: string | null, boxes: Record<string, Box>, guides = false) {
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const D = dimsOf(c.format); const { W, H, SH } = D;
  canvas.width = Math.round(W * RENDER_SCALE); canvas.height = Math.round(H * RENDER_SCALE);
  ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

  const images = c.els.filter((e): e is ImageEl => e.kind === 'image');
  const texts = c.els.filter((e): e is TextEl => e.kind === 'text');

  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, SH); ctx.clip();

  if (images.length === 1) drawImageEl(ctx, images[0], 0, W, SH);
  else if (images.length >= 2) {
    drawImageEl(ctx, images[0], 0, W / 2, SH);
    drawImageEl(ctx, images[1], W / 2, W / 2, SH);
    ctx.strokeStyle = 'rgba(236,210,138,0.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W / 2, 34); ctx.lineTo(W / 2, SH - 34); ctx.stroke();
  }

  if (images.length && c.overlay > 0) {
    const g = ctx.createLinearGradient(0, 0, 0, SH); const b = clamp(c.overlay, 0, 1);
    g.addColorStop(0, `rgba(6,10,8,${(b * 0.4).toFixed(3)})`); g.addColorStop(1, `rgba(6,10,8,${(b * 0.85).toFixed(3)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, SH);
  } else if (!images.length) {
    const glow = ctx.createRadialGradient(W / 2, SH * 0.44, 40, W / 2, SH * 0.44, Math.max(W, SH) * 0.6);
    glow.addColorStop(0, 'rgba(53,207,155,0.10)'); glow.addColorStop(1, 'rgba(53,207,155,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, SH);
  }

  // brand logo, top-left by default
  if (c.showLogo) drawLogo(ctx, D, c.logoCorner);

  // editor guides (never exported)
  if (guides) {
    ctx.strokeStyle = 'rgba(236,210,138,0.25)'; ctx.lineWidth = 1; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, SH); ctx.moveTo(0, SH / 2); ctx.lineTo(W, SH / 2); ctx.stroke();
    ctx.setLineDash([]);
  }

  for (const t of texts) boxes[t.id] = drawTextEl(ctx, t, D);

  const box = selId ? boxes[selId] : null;
  if (box) {
    ctx.save();
    ctx.strokeStyle = 'rgba(236,210,138,0.9)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
    roundRect(ctx, box.x - 16, box.y - 12, box.w + 32, box.h + 24, 10); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // footer — short gold underline + centered credit
  const midY = SH + 22;
  ctx.strokeStyle = 'rgba(236,210,138,0.55)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2 - 90, midY); ctx.lineTo(W / 2 + 90, midY); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '600 23px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.gold;
  const lctx = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ('letterSpacing' in lctx) lctx.letterSpacing = '0.18em';
  ctx.fillText('MADE VIA ATLAS FOR PROSPER', W / 2 + 4, midY + 30);
  if ('letterSpacing' in lctx) lctx.letterSpacing = '0px';
  ctx.textAlign = 'left';

  ctx.strokeStyle = 'rgba(236,210,138,0.45)'; ctx.lineWidth = 2;
  roundRect(ctx, 24, 24, W - 48, H - 48, 26); ctx.stroke();
}

const PRESETS: { label: string; make: () => TextEl[] }[] = [
  { label: 'Statement', make: () => [mkText({ text: 'Tokenization made the assets.\nProsper makes the market.', y: 0.42, size: 96 }), mkText({ text: 'The Performance Market for Liquid Alpha.', y: 0.66, size: 40, font: 'display', color: '#48e8ac' })] },
  { label: 'GM', make: () => [mkText({ text: 'GM', y: 0.44, size: 220 }), mkText({ text: 'the markets are about to open.', y: 0.68, size: 44, font: 'display', color: '#48e8ac' })] },
  { label: 'This vs That', make: () => [mkText({ text: 'trust me bro', x: 0.27, y: 0.48, size: 60, color: '#c3cfc7' }), mkText({ text: 'check it on-chain', x: 0.73, y: 0.48, size: 60, color: '#ecd28a' })] },
  { label: 'Number drop', make: () => [mkText({ text: '$50K', y: 0.4, size: 200, color: '#ecd28a' }), mkText({ text: 'FOUNDING CURATOR SEED', y: 0.6, size: 40, font: 'mono' }), mkText({ text: 'Bring your edge on-chain.', y: 0.72, size: 40, font: 'display' })] },
  { label: 'Octo says', make: () => [mkText({ text: '“read the tape, not the hype.”', y: 0.46, size: 84 }), mkText({ text: '— Professor Octo', y: 0.66, size: 38, font: 'mono', color: '#ecd28a' })] },
];
const BG_SWATCHES = ['#0e1613', '#080c0a', '#12100a', '#0a1016', '#160a12', '#1a1206', '#0b0b0d'];
const SWATCHES = ['#f5f2e8', '#ecd28a', '#48e8ac', '#69e7e0', '#8b82c4', '#ff8f6b', '#c3cfc7', '#0e1613'];
const CORNERS: { k: string; label: string }[] = [{ k: 'tl', label: '↖' }, { k: 'tr', label: '↗' }, { k: 'bl', label: '↙' }, { k: 'br', label: '↘' }];
const siteUrl = () => (typeof window !== 'undefined' ? window.location.origin : 'https://pros-per.xyz');

/** Labeled slider with a live value readout. */
function Slider({ label, value, min, max, step, fmt, onDown, onChange }: { label: string; value: number; min: number; max: number; step: number; fmt?: (v: number) => string; onDown: () => void; onChange: (v: number) => void }) {
  return (
    <label className="art-ctl">
      <span className="art-ctl__row"><span className="art-ctl__name font-mono">{label}</span><span className="art-ctl__val font-mono">{fmt ? fmt(value) : Math.round(value)}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onPointerDown={onDown} onChange={(e) => onChange(+e.target.value)} className="meme-range" />
    </label>
  );
}

export function MemeStudio() {
  const { click } = useAudio();
  const ref = useRef<HTMLCanvasElement>(null);
  const boxes = useRef<Record<string, Box>>({});
  const drag = useRef<{ id: string; fx: number; fy: number } | null>(null);
  const [comp, setComp] = useState<Comp>(() => ({ els: PRESETS[0].make(), bg: '#0e1613', overlay: 0, format: 'x', showLogo: true, logoCorner: 'tl' }));
  const [sel, setSel] = useState<string | null>(() => comp.els[0]?.id ?? null);
  const [guides, setGuides] = useState(false);
  const [copied, setCopied] = useState(false);

  const compRef = useRef(comp); useEffect(() => { compRef.current = comp; });
  const hist = useRef<{ past: Comp[]; future: Comp[] }>({ past: [], future: [] });
  const [, force] = useState(0);
  const snapshot = useCallback(() => { hist.current.past.push(compRef.current); if (hist.current.past.length > 80) hist.current.past.shift(); hist.current.future = []; }, []);
  const undo = useCallback(() => { const h = hist.current; if (!h.past.length) return; click(); h.future.push(compRef.current); setComp(h.past.pop()!); force((n) => n + 1); }, [click]);
  const redo = useCallback(() => { const h = hist.current; if (!h.future.length) return; click(); h.past.push(compRef.current); setComp(h.future.pop()!); force((n) => n + 1); }, [click]);

  const selEl = comp.els.find((e) => e.id === sel) ?? null;
  const imgCount = comp.els.filter((e) => e.kind === 'image').length;
  const D = dimsOf(comp.format);

  const paint = useCallback(() => { const c = ref.current; if (c) render(c, comp, sel, boxes.current, guides); }, [comp, sel, guides]);
  useEffect(() => { paint(); (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(paint); }, [paint]);

  const setEl = (id: string, patch: Partial<TextEl> & Partial<ImageEl>) =>
    setComp((c) => ({ ...c, els: c.els.map((e) => e.id === id ? { ...e, ...patch } as El : e) }));
  const commit = (fn: (c: Comp) => Comp) => { snapshot(); setComp(fn); };
  const remove = (id: string) => { click(); commit((c) => ({ ...c, els: c.els.filter((e) => e.id !== id) })); setSel((s) => s === id ? null : s); };
  const duplicate = (id: string) => {
    click(); const e = compRef.current.els.find((x) => x.id === id); if (!e) return;
    const copy = e.kind === 'text' ? { ...e, id: nid(), x: clamp(e.x + 0.04, 0, 1), y: clamp(e.y + 0.04, 0, 1) } : { ...e, id: nid() };
    commit((c) => ({ ...c, els: [...c.els, copy] })); setSel(copy.id);
  };
  const moveLayer = (id: string, dir: -1 | 1) => {
    click();
    commit((c) => { const i = c.els.findIndex((e) => e.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= c.els.length) return c; const els = [...c.els]; [els[i], els[j]] = [els[j], els[i]]; return { ...c, els }; });
  };
  const addText = () => { click(); const t = mkText({ text: 'New text' }); commit((c) => ({ ...c, els: [...c.els, t] })); setSel(t.id); };
  const usePreset = (p: typeof PRESETS[number]) => { click(); const els = p.make(); commit((c) => ({ ...c, els: [...c.els.filter((e) => e.kind === 'image'), ...els] })); setSel(els[0].id); };
  const reset = () => { click(); commit(() => ({ els: PRESETS[0].make(), bg: '#0e1613', overlay: 0, format: 'x', showLogo: true, logoCorner: 'tl' })); setSel(null); };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f); const im = new Image();
    im.onload = () => { const el: ImageEl = { kind: 'image', id: nid(), img: im, zoom: 1, x: 0.5, y: 0.5 }; commit((c) => ({ ...c, els: [...c.els, el] })); setSel(el.id); URL.revokeObjectURL(url); };
    im.src = url; e.target.value = '';
  };

  const toFrac = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height }; };
  const hitTest = (fx: number, fy: number): string | null => {
    const px = fx * D.W, py = fy * D.H;
    const texts = comp.els.filter((e): e is TextEl => e.kind === 'text');
    for (let i = texts.length - 1; i >= 0; i--) { const b = boxes.current[texts[i].id]; if (!b) continue; if (px >= b.x - 20 && px <= b.x + b.w + 20 && py >= b.y - 16 && py <= b.y + b.h + 16) return texts[i].id; }
    if (py < D.SH) { const imgs = comp.els.filter((e): e is ImageEl => e.kind === 'image'); if (imgs.length === 1) return imgs[0].id; if (imgs.length >= 2) return fx < 0.5 ? imgs[0].id : imgs[1].id; }
    return null;
  };
  const onDown = (e: React.PointerEvent) => {
    const { fx, fy } = toFrac(e); const id = hitTest(fx, fy); setSel(id);
    if (id) { snapshot(); drag.current = { id, fx, fy }; ref.current!.setPointerCapture(e.pointerId); }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { fx, fy } = toFrac(e); const dx = fx - drag.current.fx, dy = fy - drag.current.fy; drag.current.fx = fx; drag.current.fy = fy;
    const el = comp.els.find((x) => x.id === drag.current!.id); if (!el) return;
    if (el.kind === 'text') setEl(el.id, { x: clamp(el.x + dx, 0, 1), y: clamp(el.y + dy, 0, 1) });
    else setEl(el.id, { x: clamp(el.x + dx, -0.5, 1.5), y: clamp(el.y + dy, -0.5, 1.5) });
  };
  const onUp = (e: React.PointerEvent) => { drag.current = null; try { ref.current!.releasePointerCapture(e.pointerId); } catch { /* noop */ } };

  // keyboard: undo/redo, delete, arrow-nudge
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if (typing || !sel) return;
      const el = compRef.current.els.find((x) => x.id === sel); if (!el) return;
      if (e.key === 'Delete') { e.preventDefault(); remove(sel); return; }
      if (e.key.startsWith('Arrow')) {
        e.preventDefault(); if (!e.repeat) snapshot();
        const step = e.shiftKey ? 0.04 : 0.008;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        setEl(el.id, { x: clamp(el.x + dx, -0.5, 1.5), y: clamp(el.y + dy, -0.5, 1.5) });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, undo, redo]);

  const blob = () => new Promise<Blob | null>((res) => {
    const c = ref.current; if (!c) return res(null);
    render(c, comp, null, boxes.current, false); c.toBlob((b) => { render(c, comp, sel, boxes.current, guides); res(b); }, 'image/png');
  });
  const download = async () => { click(); const b = await blob(); if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `prosper-atlas-${comp.format}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  const copyImg = async () => { click(); try { const b = await blob(); if (!b) throw new Error(); await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); setCopied(true); } catch { download(); } setTimeout(() => setCopied(false), 2000); };
  const postX = () => { click(); const cap = comp.els.filter((e): e is TextEl => e.kind === 'text').map((t) => t.text).join(' — ') || 'Made with Prosper Atlas'; window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`${cap}\n\n${siteUrl()}`)}`, '_blank', 'noopener'); };

  const exportW = Math.round(D.W * RENDER_SCALE), exportH = Math.round(D.H * RENDER_SCALE);

  return (
    <div className="art-studio">
      {/* LEFT RAIL — content & layers */}
      <aside className="art-rail">
        <section className="meme-section">
          <span className="font-mono meme-field__label">Canvas format</span>
          <div className="meme-seg">
            {(Object.keys(FORMATS) as FormatKey[]).map((k) => (
              <button key={k} onClick={() => { click(); commit((c) => ({ ...c, format: k })); }} className="pressable meme-chip" data-on={comp.format === k ? 'true' : 'false'}>{FORMATS[k].label} · {FORMATS[k].note}</button>
            ))}
          </div>
        </section>

        <section className="meme-section">
          <span className="font-mono meme-field__label">Quick start layouts</span>
          <div className="meme-templates">
            {PRESETS.map((p) => <button key={p.label} onClick={() => usePreset(p)} className="pressable meme-tpl">{p.label}</button>)}
          </div>
        </section>

        <section className="meme-section">
          <div className="meme-row">
            <span className="font-mono meme-field__label">Layers</span>
            <div className="meme-addrow">
              <button onClick={addText} className="pressable meme-mini">+ Text</button>
              <label className="pressable meme-mini" data-dim={imgCount >= 2 ? 'true' : 'false'}>+ Image<input type="file" accept="image/*" onChange={addImage} hidden disabled={imgCount >= 2} /></label>
            </div>
          </div>
          <div className="meme-layers">
            {comp.els.map((e, i) => (
              <div key={e.id} className="meme-layer" data-on={e.id === sel ? 'true' : 'false'} onClick={() => setSel(e.id)}>
                <span className="meme-layer__name font-mono">{e.kind === 'text' ? (e.text.split('\n')[0].slice(0, 18) || 'Text') : `Image ${comp.els.filter((x, k) => x.kind === 'image' && k <= i).length}`}</span>
                <span className="meme-layer__tools">
                  <button onClick={(ev) => { ev.stopPropagation(); moveLayer(e.id, -1); }} className="meme-layer__b" title="Move up" aria-label="Move up">↑</button>
                  <button onClick={(ev) => { ev.stopPropagation(); moveLayer(e.id, 1); }} className="meme-layer__b" title="Move down" aria-label="Move down">↓</button>
                  <button onClick={(ev) => { ev.stopPropagation(); duplicate(e.id); }} className="meme-layer__b" title="Duplicate" aria-label="Duplicate">⧉</button>
                  <button onClick={(ev) => { ev.stopPropagation(); remove(e.id); }} className="meme-layer__b meme-layer__b--x" title="Delete" aria-label="Delete">×</button>
                </span>
              </div>
            ))}
            {!comp.els.length && <p className="meme-hint">Add a text or image layer to start.</p>}
          </div>
        </section>

        <section className="meme-section">
          <span className="font-mono meme-field__label">History</span>
          <div className="meme-seg">
            <button onClick={undo} className="pressable meme-chip" data-dim={!hist.current.past.length ? 'true' : 'false'}>↶ Undo</button>
            <button onClick={redo} className="pressable meme-chip" data-dim={!hist.current.future.length ? 'true' : 'false'}>↷ Redo</button>
            <button onClick={reset} className="pressable meme-chip">Reset</button>
          </div>
        </section>
      </aside>

      {/* CENTER — art pane */}
      <div className="art-stage">
        <div className="meme-canvas">
          <canvas ref={ref} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{ display: 'block', maxWidth: '100%', maxHeight: '62vh', width: 'auto', height: 'auto', touchAction: 'none', cursor: drag.current ? 'grabbing' : 'grab' }} aria-label="Post preview" />
        </div>
        <div className="art-meta font-mono">{FORMATS[comp.format].label} · {exportW}×{exportH}px · drag items to place · arrows to nudge</div>
        <div className="meme-actions">
          <button onClick={postX} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 auto' }}>Post on X</button>
          <button onClick={download} className="pressable share-btn">Download HD</button>
          <button onClick={copyImg} className="pressable share-btn">{copied ? 'Copied ✓' : 'Copy'}</button>
        </div>
      </div>

      {/* RIGHT RAIL — styling & canvas */}
      <aside className="art-rail">
        {selEl?.kind === 'text' && (
          <section className="meme-section">
            <span className="font-mono meme-field__label">Text content</span>
            <textarea rows={2} value={selEl.text} onFocus={snapshot} onChange={(e) => setEl(selEl.id, { text: e.target.value })} className="meme-input font-display" placeholder="Type your words…" />
            <span className="font-mono meme-sub">Typeface</span>
            <div className="meme-seg">
              {(Object.keys(FONTS) as FontKey[]).map((k) => <button key={k} onClick={() => { snapshot(); setEl(selEl.id, { font: k }); }} className="pressable meme-chip" data-on={selEl.font === k ? 'true' : 'false'}>{FONTS[k].label}</button>)}
            </div>
            <span className="font-mono meme-sub">Alignment</span>
            <div className="meme-seg">
              {(['left', 'center', 'right'] as CanvasTextAlign[]).map((a) => <button key={a} onClick={() => { snapshot(); setEl(selEl.id, { align: a }); }} className="pressable meme-chip" data-on={selEl.align === a ? 'true' : 'false'}>{a[0].toUpperCase() + a.slice(1)}</button>)}
            </div>
            <span className="font-mono meme-sub">Style</span>
            <div className="meme-seg">
              <button onClick={() => { snapshot(); setEl(selEl.id, { weight: selEl.weight >= 700 ? 400 : 700 }); }} className="pressable meme-chip" data-on={selEl.weight >= 700 ? 'true' : 'false'} style={{ fontWeight: 700 }}>Bold</button>
              <button onClick={() => { snapshot(); setEl(selEl.id, { upper: !selEl.upper }); }} className="pressable meme-chip" data-on={selEl.upper ? 'true' : 'false'}>UPPER</button>
              <button onClick={() => { snapshot(); setEl(selEl.id, { pill: !selEl.pill }); }} className="pressable meme-chip" data-on={selEl.pill ? 'true' : 'false'}>Highlight</button>
              <button onClick={() => { snapshot(); setEl(selEl.id, { outline: !selEl.outline }); }} className="pressable meme-chip" data-on={selEl.outline ? 'true' : 'false'}>Outline</button>
            </div>
            <div className="meme-adjgrid">
              <Slider label="Size" value={selEl.size} min={24} max={280} step={1} onDown={snapshot} onChange={(v) => setEl(selEl.id, { size: v })} />
              <Slider label="Opacity" value={selEl.opacity} min={0.1} max={1} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} onDown={snapshot} onChange={(v) => setEl(selEl.id, { opacity: v })} />
              <Slider label="Spacing" value={selEl.tracking} min={-0.05} max={0.4} step={0.005} fmt={(v) => v.toFixed(2)} onDown={snapshot} onChange={(v) => setEl(selEl.id, { tracking: v })} />
              <Slider label="Line height" value={selEl.lineH} min={0.85} max={1.8} step={0.01} fmt={(v) => v.toFixed(2)} onDown={snapshot} onChange={(v) => setEl(selEl.id, { lineH: v })} />
              <Slider label="Rotation" value={selEl.rotate} min={-45} max={45} step={1} fmt={(v) => `${v}°`} onDown={snapshot} onChange={(v) => setEl(selEl.id, { rotate: v })} />
            </div>
            <span className="font-mono meme-sub">{selEl.pill ? 'Highlight colour' : selEl.outline ? 'Text · outline colours' : 'Text colour'}</span>
            <div className="meme-swatches">
              {SWATCHES.map((cl) => <button key={cl} onClick={() => { snapshot(); setEl(selEl.id, selEl.pill ? { pillColor: cl } : { color: cl }); }} className="pressable meme-swatch" data-on={cl === (selEl.pill ? selEl.pillColor : selEl.color) ? 'true' : 'false'} style={{ background: cl }} aria-label={cl} />)}
              <label className="meme-swatch meme-swatch--pick"><input type="color" value={selEl.pill ? selEl.pillColor : selEl.color} onFocus={snapshot} onChange={(e) => setEl(selEl.id, selEl.pill ? { pillColor: e.target.value } : { color: e.target.value })} /><span>+</span></label>
              {selEl.outline && <label className="meme-swatch meme-swatch--pick" title="Outline colour"><input type="color" value={selEl.outlineColor} onFocus={snapshot} onChange={(e) => setEl(selEl.id, { outlineColor: e.target.value })} /><span>◎</span></label>}
            </div>
            <span className="font-mono meme-sub">Snap to centre</span>
            <div className="meme-seg">
              <button onClick={() => { snapshot(); setEl(selEl.id, { x: 0.5 }); }} className="pressable meme-chip">Horizontal</button>
              <button onClick={() => { snapshot(); setEl(selEl.id, { y: 0.5 }); }} className="pressable meme-chip">Vertical</button>
            </div>
          </section>
        )}
        {selEl?.kind === 'image' && (
          <section className="meme-section">
            <span className="font-mono meme-field__label">Image</span>
            <Slider label="Zoom" value={selEl.zoom} min={0.5} max={3} step={0.01} fmt={(v) => `${v.toFixed(2)}×`} onDown={snapshot} onChange={(v) => setEl(selEl.id, { zoom: v })} />
            <div className="meme-seg">
              <button onClick={() => { snapshot(); setEl(selEl.id, { x: 0.5 }); }} className="pressable meme-chip">Centre ↔</button>
              <button onClick={() => { snapshot(); setEl(selEl.id, { y: 0.5 }); }} className="pressable meme-chip">Centre ↕</button>
            </div>
            <p className="meme-hint">Drag the image on the canvas to pan it.</p>
          </section>
        )}
        {!selEl && <section className="meme-section"><span className="font-mono meme-field__label">Editing</span><p className="meme-hint">Select a layer to edit it. Tip: drag on the canvas, arrow keys nudge, ⌘/Ctrl+Z undoes.</p></section>}

        <section className="meme-section">
          <span className="font-mono meme-field__label">Card background</span>
          <div className="meme-swatches">
            {BG_SWATCHES.map((cl) => <button key={cl} onClick={() => { snapshot(); setComp((s) => ({ ...s, bg: cl })); }} className="pressable meme-swatch" data-on={cl === comp.bg ? 'true' : 'false'} style={{ background: cl }} aria-label={cl} />)}
            <label className="meme-swatch meme-swatch--pick"><input type="color" value={comp.bg} onFocus={snapshot} onChange={(e) => setComp((s) => ({ ...s, bg: e.target.value }))} /><span>+</span></label>
          </div>
          <Slider label="Image darken" value={comp.overlay} min={0} max={1} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} onDown={snapshot} onChange={(v) => setComp((s) => ({ ...s, overlay: v }))} />
        </section>

        <section className="meme-section">
          <div className="meme-row"><span className="font-mono meme-field__label">Prosper logo</span>
            <button onClick={() => { snapshot(); setComp((s) => ({ ...s, showLogo: !s.showLogo })); }} className="pressable meme-mini" data-on={comp.showLogo ? 'true' : 'false'}>{comp.showLogo ? 'On' : 'Off'}</button>
          </div>
          {comp.showLogo && (
            <><span className="font-mono meme-sub">Corner</span>
              <div className="meme-seg">
                {CORNERS.map((c) => <button key={c.k} onClick={() => { snapshot(); setComp((s) => ({ ...s, logoCorner: c.k })); }} className="pressable meme-chip" data-on={comp.logoCorner === c.k ? 'true' : 'false'}>{c.label}</button>)}
              </div></>
          )}
          <label className="meme-row" style={{ cursor: 'pointer' }}><span className="font-mono meme-sub" style={{ margin: 0 }}>Alignment guides</span>
            <button onClick={() => { click(); setGuides((g) => !g); }} className="pressable meme-mini" data-on={guides ? 'true' : 'false'}>{guides ? 'On' : 'Off'}</button>
          </label>
        </section>
      </aside>
    </div>
  );
}
