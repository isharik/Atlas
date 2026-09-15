import { useEffect, useRef, useState, useCallback } from 'react';
import { useAudio } from '@/audio/AudioProvider';

// 16:9 HD canvas. Backing store is super-sampled, so downloads are well past 1080p.
const W = 1920, H = 1080;
const FOOTER = 78;                 // solid strip at the very bottom — branding lives here, never on the image
const STAGE_H = H - FOOTER;
const RENDER_SCALE = 2;            // 3840×2160 backing → crisp, HD export

const PAL = { gold: '#ecd28a', dim: '#8fa39a' };

export type FontKey = 'head' | 'display' | 'mono' | 'serif';
const FONTS: Record<FontKey, { label: string; stack: string; weight: string }> = {
  head: { label: 'Headline', stack: '"Rajdhani", system-ui, sans-serif', weight: '700' },
  display: { label: 'Body', stack: '"Archivo", system-ui, sans-serif', weight: '600' },
  mono: { label: 'Mono', stack: '"JetBrains Mono", ui-monospace, monospace', weight: '600' },
  serif: { label: 'Serif', stack: '"Cinzel", Georgia, serif', weight: '700' },
};

export interface TextEl { kind: 'text'; id: string; text: string; x: number; y: number; size: number; color: string; opacity: number; align: CanvasTextAlign; font: FontKey }
export interface ImageEl { kind: 'image'; id: string; img: HTMLImageElement; zoom: number; x: number; y: number }
export type El = TextEl | ImageEl;

type Box = { x: number; y: number; w: number; h: number };
export interface Comp { els: El[]; bg: string; overlay: number }

let uid = 0;
const nid = () => `e${++uid}`;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mkText = (over: Partial<TextEl> = {}): TextEl => ({ kind: 'text', id: nid(), text: 'Your hook goes here', x: 0.5, y: 0.44, size: 92, color: '#f5f2e8', opacity: 1, align: 'center', font: 'head', ...over });

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
function drawImageEl(ctx: CanvasRenderingContext2D, el: ImageEl, rx: number, rw: number) {
  const rh = STAGE_H;
  const ir = el.img.width / el.img.height, r = rw / rh;
  let dw: number, dh: number;
  if (ir > r) { dh = rh; dw = rh * ir; } else { dw = rw; dh = rw / ir; }
  dw *= el.zoom; dh *= el.zoom;
  const dx = rx + (rw - dw) / 2 + (el.x - 0.5) * rw;
  const dy = (rh - dh) / 2 + (el.y - 0.5) * rh;
  ctx.save();
  ctx.beginPath(); ctx.rect(rx, 0, rw, rh); ctx.clip();
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(el.img, dx, dy, dw, dh);
  ctx.restore();
}
function drawTextEl(ctx: CanvasRenderingContext2D, el: TextEl, shadow: boolean): Box {
  const f = FONTS[el.font];
  ctx.font = `${f.weight} ${el.size}px ${f.stack}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = el.align;
  const maxW = W * 0.88;
  const lines = wrap(ctx, el.text || ' ', maxW);
  const lh = el.size * 1.16;
  const totalH = lines.length * lh;
  let widest = 1;
  for (const l of lines) widest = Math.max(widest, ctx.measureText(l).width);
  const cx = el.x * W, cy = el.y * STAGE_H;
  const top = cy - totalH / 2;
  const anchorX = el.align === 'left' ? cx - widest / 2 : el.align === 'right' ? cx + widest / 2 : cx;
  ctx.save();
  ctx.globalAlpha = clamp(el.opacity, 0, 1);
  ctx.fillStyle = el.color;
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 3; }
  lines.forEach((l, i) => ctx.fillText(l, anchorX, top + i * lh));
  ctx.restore();
  return { x: cx - widest / 2, y: top, w: widest, h: totalH };
}

export function render(canvas: HTMLCanvasElement, c: Comp, selId: string | null, boxes: Record<string, Box>) {
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  canvas.width = W * RENDER_SCALE; canvas.height = H * RENDER_SCALE;
  ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

  const images = c.els.filter((e): e is ImageEl => e.kind === 'image');
  const texts = c.els.filter((e): e is TextEl => e.kind === 'text');

  // 1) background colour (fills the stage; shows where images don't reach)
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, STAGE_H);

  // 2) images — one fills the stage; two split left/right
  if (images.length === 1) drawImageEl(ctx, images[0], 0, W);
  else if (images.length >= 2) {
    drawImageEl(ctx, images[0], 0, W / 2);
    drawImageEl(ctx, images[1], W / 2, W / 2);
    ctx.strokeStyle = 'rgba(236,210,138,0.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W / 2, 34); ctx.lineTo(W / 2, STAGE_H - 34); ctx.stroke();
  }

  // 3) darken overlay for text legibility (only over imagery)
  if (images.length) {
    const g = ctx.createLinearGradient(0, 0, 0, STAGE_H);
    const b = clamp(c.overlay, 0, 1);
    g.addColorStop(0, `rgba(6,10,8,${(b * 0.72).toFixed(3)})`);
    g.addColorStop(1, `rgba(6,10,8,${Math.min(0.95, b * 0.72 + 0.22).toFixed(3)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, STAGE_H);
  } else {
    ctx.strokeStyle = 'rgba(56,224,160,0.05)'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, STAGE_H); ctx.stroke(); }
    for (let y = 0; y <= STAGE_H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const glow = ctx.createRadialGradient(W / 2, STAGE_H / 2, 60, W / 2, STAGE_H / 2, 760);
    glow.addColorStop(0, 'rgba(53,207,155,0.12)'); glow.addColorStop(1, 'rgba(53,207,155,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, STAGE_H);
  }

  // header (top-left, small)
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 14;
  ctx.font = '700 40px "Cinzel", serif'; ctx.fillStyle = PAL.gold; ctx.fillText('PROSPER', 72, 96);
  const pW = ctx.measureText('PROSPER').width;
  ctx.font = '600 17px "JetBrains Mono", monospace'; ctx.fillStyle = '#c3cfc7'; ctx.fillText('ATLAS', 72 + pW + 16, 96);
  ctx.restore();

  // 4) text elements
  for (const t of texts) boxes[t.id] = drawTextEl(ctx, t, images.length > 0);

  // selection outline
  const box = selId ? boxes[selId] : null;
  if (box) {
    ctx.save();
    ctx.strokeStyle = 'rgba(236,210,138,0.9)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
    roundRect(ctx, box.x - 16, box.y - 12, box.w + 32, box.h + 24, 10); ctx.stroke();
    ctx.restore();
  }

  // gold frame around the whole card
  ctx.strokeStyle = 'rgba(236,210,138,0.45)'; ctx.lineWidth = 2;
  roundRect(ctx, 24, 24, W - 48, H - 48, 26); ctx.stroke();

  // 5) FOOTER — solid bar at the exact bottom, never on the image
  ctx.fillStyle = c.bg; ctx.fillRect(24, STAGE_H, W - 48, FOOTER - 24);
  ctx.strokeStyle = 'rgba(236,210,138,0.18)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(72, STAGE_H + 8); ctx.lineTo(W - 72, STAGE_H + 8); ctx.stroke();
  const fy = STAGE_H + 50;
  ctx.textAlign = 'left'; ctx.font = '600 21px "JetBrains Mono", monospace';
  ctx.fillStyle = PAL.gold; ctx.fillText('pros-per.xyz', 72, fy);
  const uW = ctx.measureText('pros-per.xyz').width;
  ctx.fillStyle = PAL.dim; ctx.fillText('· via @ProsperTicker', 72 + uW + 14, fy);
  ctx.textAlign = 'right'; ctx.font = '600 18px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.dim;
  ctx.fillText('Made via Atlas for Prosper', W - 72, fy);
  ctx.textAlign = 'left';
}

// quick starters — grounded Prosper copy, freely editable / movable after
const PRESETS: { label: string; make: () => TextEl[] }[] = [
  { label: 'Statement', make: () => [mkText({ text: 'Tokenization made the assets.\nProsper makes the market.', y: 0.4, size: 96 }), mkText({ text: 'The Performance Market for Liquid Alpha.', y: 0.66, size: 40, font: 'display', color: '#48e8ac' })] },
  { label: 'GM', make: () => [mkText({ text: 'GM', y: 0.42, size: 220 }), mkText({ text: 'the markets are about to open.', y: 0.66, size: 44, font: 'display', color: '#48e8ac' })] },
  { label: 'This vs That', make: () => [mkText({ text: 'trust me bro', x: 0.27, y: 0.46, size: 60, color: '#c3cfc7' }), mkText({ text: 'check it on-chain', x: 0.73, y: 0.46, size: 60, color: '#ecd28a' })] },
  { label: 'Number drop', make: () => [mkText({ text: '$50K', y: 0.38, size: 200, color: '#ecd28a' }), mkText({ text: 'FOUNDING CURATOR SEED', y: 0.6, size: 40, font: 'mono' }), mkText({ text: 'Bring your edge on-chain.', y: 0.72, size: 40, font: 'display' })] },
  { label: 'Octo says', make: () => [mkText({ text: '“read the tape, not the hype.”', y: 0.44, size: 84 }), mkText({ text: '— Professor Octo', y: 0.64, size: 38, font: 'mono', color: '#ecd28a' })] },
];
const BG_SWATCHES = ['#0e1613', '#080c0a', '#12100a', '#0a1016', '#160a12', '#1a1206', '#0b0b0d'];
const TEXT_SWATCHES = ['#f5f2e8', '#ecd28a', '#48e8ac', '#69e7e0', '#8b82c4', '#ff8f6b', '#c3cfc7', '#0e1613'];
const siteUrl = () => (typeof window !== 'undefined' ? window.location.origin : 'https://pros-per.xyz');

export function MemeStudio() {
  const { click } = useAudio();
  const ref = useRef<HTMLCanvasElement>(null);
  const boxes = useRef<Record<string, Box>>({});
  const drag = useRef<{ id: string; fx: number; fy: number } | null>(null);
  const [comp, setComp] = useState<Comp>(() => ({ els: PRESETS[0].make(), bg: '#0e1613', overlay: 0.5 }));
  const [sel, setSel] = useState<string | null>(() => comp.els[0]?.id ?? null);
  const [copied, setCopied] = useState(false);

  const selEl = comp.els.find((e) => e.id === sel) ?? null;
  const imgCount = comp.els.filter((e) => e.kind === 'image').length;

  const paint = useCallback(() => { const c = ref.current; if (c) render(c, comp, sel, boxes.current); }, [comp, sel]);
  useEffect(() => { paint(); (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(paint); }, [paint]);

  const setEl = (id: string, patch: Partial<TextEl> & Partial<ImageEl>) =>
    setComp((c) => ({ ...c, els: c.els.map((e) => e.id === id ? { ...e, ...patch } as El : e) }));
  const remove = (id: string) => { click(); setComp((c) => ({ ...c, els: c.els.filter((e) => e.id !== id) })); setSel((s) => s === id ? null : s); };
  const addText = () => { click(); const t = mkText({ text: 'New text' }); setComp((c) => ({ ...c, els: [...c.els, t] })); setSel(t.id); };
  const usePreset = (p: typeof PRESETS[number]) => { click(); const els = p.make(); setComp((c) => ({ ...c, els: [...c.els.filter((e) => e.kind === 'image'), ...els] })); setSel(els[0].id); };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f); const im = new Image();
    im.onload = () => {
      const el: ImageEl = { kind: 'image', id: nid(), img: im, zoom: 1, x: 0.5, y: 0.5 };
      setComp((c) => ({ ...c, els: [...c.els, el] }));   // images render first; keep them ahead of text
      setSel(el.id); URL.revokeObjectURL(url);
    };
    im.src = url; e.target.value = '';
  };

  // pointer mapping → fractional canvas coords
  const toFrac = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height };
  };
  const hit = (fx: number, fy: number): string | null => {
    const px = fx * W, py = fy * H;
    const texts = comp.els.filter((e): e is TextEl => e.kind === 'text');
    for (let i = texts.length - 1; i >= 0; i--) {           // topmost text first
      const b = boxes.current[texts[i].id]; if (!b) continue;
      if (px >= b.x - 20 && px <= b.x + b.w + 20 && py >= b.y - 16 && py <= b.y + b.h + 16) return texts[i].id;
    }
    if (fy < STAGE_H / H) {                                  // otherwise grab an image (its half)
      const imgs = comp.els.filter((e): e is ImageEl => e.kind === 'image');
      if (imgs.length === 1) return imgs[0].id;
      if (imgs.length >= 2) return fx < 0.5 ? imgs[0].id : imgs[1].id;
    }
    return null;
  };
  const onDown = (e: React.PointerEvent) => {
    const { fx, fy } = toFrac(e);
    const id = hit(fx, fy);
    setSel(id);
    if (id) { drag.current = { id, fx, fy }; ref.current!.setPointerCapture(e.pointerId); }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { fx, fy } = toFrac(e);
    const dx = fx - drag.current.fx, dy = fy - drag.current.fy;
    drag.current.fx = fx; drag.current.fy = fy;
    const el = comp.els.find((x) => x.id === drag.current!.id); if (!el) return;
    if (el.kind === 'text') setEl(el.id, { x: clamp(el.x + dx, 0, 1), y: clamp(el.y + dy, 0, 1) });
    else setEl(el.id, { x: clamp(el.x + dx, -0.5, 1.5), y: clamp(el.y + dy, -0.5, 1.5) });
  };
  const onUp = (e: React.PointerEvent) => { drag.current = null; try { ref.current!.releasePointerCapture(e.pointerId); } catch { /* noop */ } };

  const blob = () => new Promise<Blob | null>((res) => {
    const c = ref.current; if (!c) return res(null);
    const prev = sel; render(c, comp, null, boxes.current);   // export without the selection outline
    c.toBlob((b) => { render(c, comp, prev, boxes.current); res(b); }, 'image/png');
  });
  const download = async () => { click(); const b = await blob(); if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'prosper-atlas.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  const copyImg = async () => { click(); try { const b = await blob(); if (!b) throw new Error(); await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); setCopied(true); } catch { download(); } setTimeout(() => setCopied(false), 2000); };
  const postX = () => {
    click();
    const cap = comp.els.filter((e): e is TextEl => e.kind === 'text').map((t) => t.text).join(' — ') || 'Made with Prosper Atlas';
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`${cap}\n\n${siteUrl()}`)}`, '_blank', 'noopener');
  };

  return (
    <div className="meme-studio">
      {/* LEFT — compact control rail */}
      <div className="meme-controls">
        <div className="meme-section">
          <span className="font-mono meme-field__label">Quick start</span>
          <div className="meme-templates">
            {PRESETS.map((p) => <button key={p.label} onClick={() => usePreset(p)} className="pressable meme-tpl">{p.label}</button>)}
          </div>
        </div>

        <div className="meme-section">
          <div className="meme-row">
            <span className="font-mono meme-field__label">Layers</span>
            <div className="meme-addrow">
              <button onClick={addText} className="pressable meme-mini">+ Text</button>
              <label className="pressable meme-mini" data-dim={imgCount >= 2 ? 'true' : 'false'}>
                + Image
                <input type="file" accept="image/*" onChange={addImage} hidden disabled={imgCount >= 2} />
              </label>
            </div>
          </div>
          <div className="meme-layers">
            {comp.els.map((e) => (
              <div key={e.id} className="meme-layer" data-on={e.id === sel ? 'true' : 'false'} onClick={() => setSel(e.id)}>
                <span className="meme-layer__name font-mono">{e.kind === 'text' ? (e.text.split('\n')[0].slice(0, 22) || 'Text') : 'Image'}</span>
                <button onClick={(ev) => { ev.stopPropagation(); remove(e.id); }} className="meme-layer__x" aria-label="Delete layer">×</button>
              </div>
            ))}
            {!comp.els.length && <p className="meme-hint">Add a text or image layer to start.</p>}
          </div>
        </div>

        {/* selected element props */}
        {selEl?.kind === 'text' && (
          <div className="meme-section">
            <span className="font-mono meme-field__label">Text</span>
            <textarea rows={2} value={selEl.text} onChange={(e) => setEl(selEl.id, { text: e.target.value })} className="meme-input font-display" placeholder="Type…" />
            <div className="meme-seg">
              {(Object.keys(FONTS) as FontKey[]).map((k) => (
                <button key={k} onClick={() => setEl(selEl.id, { font: k })} className="pressable meme-chip" data-on={selEl.font === k ? 'true' : 'false'}>{FONTS[k].label}</button>
              ))}
            </div>
            <div className="meme-seg">
              {(['left', 'center', 'right'] as CanvasTextAlign[]).map((a) => (
                <button key={a} onClick={() => setEl(selEl.id, { align: a })} className="pressable meme-chip" data-on={selEl.align === a ? 'true' : 'false'}>{a === 'left' ? '⇤' : a === 'center' ? '↔' : '⇥'}</button>
              ))}
            </div>
            <label className="meme-adj"><span className="font-mono">Size</span>
              <input type="range" min={24} max={260} step={1} value={selEl.size} onChange={(e) => setEl(selEl.id, { size: +e.target.value })} className="meme-range" /></label>
            <label className="meme-adj"><span className="font-mono">Opacity</span>
              <input type="range" min={0.1} max={1} step={0.01} value={selEl.opacity} onChange={(e) => setEl(selEl.id, { opacity: +e.target.value })} className="meme-range" /></label>
            <div className="meme-swatches">
              {TEXT_SWATCHES.map((c) => <button key={c} onClick={() => setEl(selEl.id, { color: c })} className="pressable meme-swatch" data-on={c === selEl.color ? 'true' : 'false'} style={{ background: c }} aria-label={c} />)}
              <label className="meme-swatch meme-swatch--pick"><input type="color" value={selEl.color} onChange={(e) => setEl(selEl.id, { color: e.target.value })} /><span>+</span></label>
            </div>
            <p className="meme-hint">Drag it on the preview to place it.</p>
          </div>
        )}
        {selEl?.kind === 'image' && (
          <div className="meme-section">
            <span className="font-mono meme-field__label">Image</span>
            <label className="meme-adj"><span className="font-mono">Zoom</span>
              <input type="range" min={0.5} max={3} step={0.01} value={selEl.zoom} onChange={(e) => setEl(selEl.id, { zoom: +e.target.value })} className="meme-range" /></label>
            <p className="meme-hint">Drag the image on the preview to pan it.</p>
          </div>
        )}

        <div className="meme-section">
          <span className="font-mono meme-field__label">Card background</span>
          <div className="meme-swatches">
            {BG_SWATCHES.map((c) => <button key={c} onClick={() => { click(); setComp((s) => ({ ...s, bg: c })); }} className="pressable meme-swatch" data-on={c === comp.bg ? 'true' : 'false'} style={{ background: c }} aria-label={c} />)}
            <label className="meme-swatch meme-swatch--pick"><input type="color" value={comp.bg} onChange={(e) => setComp((s) => ({ ...s, bg: e.target.value }))} /><span>+</span></label>
          </div>
          <label className="meme-adj" style={{ marginTop: 4 }}><span className="font-mono">Darken</span>
            <input type="range" min={0} max={1} step={0.01} value={comp.overlay} onChange={(e) => setComp((s) => ({ ...s, overlay: +e.target.value }))} className="meme-range" /></label>
        </div>
      </div>

      {/* RIGHT — live, draggable preview */}
      <div className="meme-preview">
        <div className="meme-canvas">
          <canvas ref={ref} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'none', cursor: drag.current ? 'grabbing' : 'grab' }} aria-label="Post preview" />
        </div>
        <div className="meme-actions">
          <button onClick={postX} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 auto' }}>Post on X</button>
          <button onClick={download} className="pressable share-btn">Download HD</button>
          <button onClick={copyImg} className="pressable share-btn">{copied ? 'Copied ✓' : 'Copy'}</button>
        </div>
      </div>
    </div>
  );
}
