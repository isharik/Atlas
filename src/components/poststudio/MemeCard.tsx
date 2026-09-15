import { useEffect, useRef, useState } from 'react';
import { useAudio } from '@/audio/AudioProvider';

const W = 1200, H = 630;
const PAL = {
  bg1: '#0e1613', bg2: '#080c0a',
  gold: '#ecd28a', goldDeep: '#c9a24b',
  emerald: '#35cf9b', emeraldGlow: '#48e8ac',
  text: '#f5f2e8', mist: '#c3cfc7', dim: '#8fa39a',
};

export type MemeTemplate = 'statement' | 'gm' | 'versus' | 'stat' | 'octo';
export interface MemeOpts { template: MemeTemplate; a: string; b: string; c?: string; img?: HTMLImageElement | null }

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function fit(ctx: CanvasRenderingContext2D, text: string, family: string, weight: string, start: number, maxW: number, min = 18) {
  let size = start;
  do { ctx.font = `${weight} ${size}px ${family}`; if (ctx.measureText(text).width <= maxW) break; size -= 2; } while (size > min);
  return size;
}
/** Centered wrapped text; returns the y after the last line. */
function wrapCentered(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, maxW: number, lh: number, maxLines = 4) {
  const words = text.split(' '); const lines: string[] = []; let line = '';
  for (const w of words) {
    if (ctx.measureText(line + w + ' ').width > maxW && line) { lines.push(line.trim()); line = w + ' '; }
    else line += w + ' ';
    if (lines.length === maxLines - 1 && ctx.measureText(line + '…').width > maxW) break;
  }
  if (line.trim()) lines.push(line.trim());
  const shown = lines.slice(0, maxLines);
  shown.forEach((l, i) => ctx.fillText(l, cx, y + i * lh));
  return y + (shown.length - 1) * lh;
}
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ir = img.width / img.height, r = w / h;
  let dw = w, dh = h;
  if (ir > r) { dh = h; dw = h * ir; } else { dw = w; dh = w / ir; }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export function drawMeme(canvas: HTMLCanvasElement, o: MemeOpts) {
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const dpr = 2; canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);

  // background
  if (o.img) {
    drawCover(ctx, o.img, 0, 0, W, H);
    const sc = ctx.createLinearGradient(0, 0, 0, H);
    sc.addColorStop(0, 'rgba(6,10,8,0.58)'); sc.addColorStop(1, 'rgba(6,10,8,0.82)');
    ctx.fillStyle = sc; ctx.fillRect(0, 0, W, H);
  } else {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, PAL.bg1); g.addColorStop(1, PAL.bg2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(56,224,160,0.05)'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const glow = ctx.createRadialGradient(W / 2, H * 0.5, 40, W / 2, H * 0.5, 520);
    glow.addColorStop(0, 'rgba(53,207,155,0.12)'); glow.addColorStop(1, 'rgba(53,207,155,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  }

  // gold frame
  ctx.strokeStyle = 'rgba(236,210,138,0.45)'; ctx.lineWidth = 1.5;
  roundRect(ctx, 24, 24, W - 48, H - 48, 22); ctx.stroke();

  const M = 72;
  // header
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = '700 28px "Cinzel", serif'; ctx.fillStyle = PAL.gold; ctx.fillText('PROSPER', M, 82);
  const pW = ctx.measureText('PROSPER').width;
  ctx.font = '600 12px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.dim; ctx.fillText('ATLAS', M + pW + 12, 82);

  ctx.textAlign = 'center';
  const CX = W / 2;

  if (o.template === 'gm') {
    const word = (o.a || 'GM').toUpperCase();
    const s = fit(ctx, word, '"Rajdhani", sans-serif', '700', 200, W - M * 2, 60);
    ctx.font = `700 ${s}px "Rajdhani", sans-serif`; ctx.fillStyle = PAL.text;
    ctx.fillText(word, CX, H / 2 + s * 0.18);
    ctx.font = '400 30px "Archivo", sans-serif'; ctx.fillStyle = PAL.emeraldGlow;
    wrapCentered(ctx, o.b || 'the markets are about to open.', CX, H / 2 + s * 0.18 + 54, W - M * 2, 40, 2);
  } else if (o.template === 'stat') {
    const num = o.a || '000';
    const s = fit(ctx, num, '"Rajdhani", sans-serif', '700', 190, W - M * 2, 70);
    ctx.font = `700 ${s}px "Rajdhani", sans-serif`; ctx.fillStyle = PAL.gold; ctx.fillText(num, CX, H / 2 - 10);
    ctx.font = '600 22px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.mist;
    ctx.fillText((o.b || 'label').toUpperCase(), CX, H / 2 + 44);
    if (o.c) { ctx.font = '400 26px "Archivo", sans-serif'; ctx.fillStyle = PAL.text; wrapCentered(ctx, o.c, CX, H / 2 + 96, W - M * 2, 34, 2); }
  } else if (o.template === 'versus') {
    ctx.strokeStyle = 'rgba(234,230,218,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(CX, 130); ctx.lineTo(CX, H - 120); ctx.stroke();
    const half = (W - M * 2) / 2 - 24;
    // left — the old way
    ctx.font = '600 16px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.dim;
    ctx.fillText('THE OLD WAY', M + half / 2 + 8, 190);
    ctx.font = '600 34px "Rajdhani", sans-serif'; ctx.fillStyle = PAL.mist;
    wrapCentered(ctx, o.a || 'trust me bro', M + half / 2 + 8, 260, half, 42, 4);
    // right — with prosper
    ctx.font = '600 16px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.emeraldGlow;
    ctx.fillText('WITH PROSPER', CX + half / 2 + 40, 190);
    ctx.font = '600 34px "Rajdhani", sans-serif'; ctx.fillStyle = PAL.gold;
    wrapCentered(ctx, o.b || 'check it on-chain', CX + half / 2 + 40, 260, half, 42, 4);
  } else if (o.template === 'octo') {
    ctx.font = '60px "Archivo", sans-serif'; ctx.fillText('🐙', CX, 220);
    const s = fit(ctx, o.a || 'read the tape, not the hype.', '"Rajdhani", sans-serif', '600', 56, W - M * 2, 34);
    ctx.font = `600 ${s}px "Rajdhani", sans-serif`; ctx.fillStyle = PAL.text;
    const endY = wrapCentered(ctx, `“${o.a || 'read the tape, not the hype.'}”`, CX, 300, W - M * 2, s + 12, 3);
    ctx.font = '600 18px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.gold;
    ctx.fillText(`— ${o.b || 'Professor Octo'}`, CX, endY + 54);
  } else {
    // statement
    const s = fit(ctx, o.a || 'your hook goes here', '"Rajdhani", sans-serif', '700', 70, W - M * 2, 32);
    ctx.font = `700 ${s}px "Rajdhani", sans-serif`; ctx.fillStyle = PAL.text;
    const endY = wrapCentered(ctx, o.a || 'Your hook goes here', CX, H / 2 - 20, W - M * 2, s + 12, 3);
    if (o.b) { ctx.font = '400 27px "Archivo", sans-serif'; ctx.fillStyle = PAL.emeraldGlow; wrapCentered(ctx, o.b, CX, endY + 52, W - M * 2 - 60, 36, 2); }
  }

  // footer
  ctx.textAlign = 'left';
  ctx.font = '600 14px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.dim;
  ctx.fillText('pros-per.xyz · via @ProsperTicker', M, H - 52);
  ctx.textAlign = 'right';
  ctx.font = '600 12px "JetBrains Mono", monospace'; ctx.fillStyle = PAL.dim;
  ctx.fillText('Made via Atlas for Prosper', W - M, H - 52);
  ctx.textAlign = 'left';
}

interface Tpl { id: MemeTemplate; label: string; fields: { key: 'a' | 'b' | 'c'; label: string; ph: string; area?: boolean }[]; caption: (o: MemeOpts) => string }
const TEMPLATES: Tpl[] = [
  { id: 'statement', label: 'Statement', fields: [{ key: 'a', label: 'Hook', ph: 'Tokenization made the assets. Prosper makes the market.', area: true }, { key: 'b', label: 'Subline', ph: 'The Performance Market for Liquid Alpha.' }], caption: (o) => `${o.a}` },
  { id: 'gm', label: 'GM', fields: [{ key: 'a', label: 'Big word', ph: 'GM' }, { key: 'b', label: 'Line', ph: 'the markets are about to open.' }], caption: (o) => `${o.a || 'GM'} — ${o.b || 'the markets are about to open on Prosper.'}` },
  { id: 'versus', label: 'This vs That', fields: [{ key: 'a', label: 'The old way', ph: 'trust me bro' }, { key: 'b', label: 'With Prosper', ph: 'check it on-chain' }], caption: (o) => `${o.a} → ${o.b}. That's the difference Prosper makes.` },
  { id: 'stat', label: 'Number drop', fields: [{ key: 'a', label: 'Number', ph: '$50K' }, { key: 'b', label: 'Label', ph: 'Founding Curator seed' }, { key: 'c', label: 'Line', ph: 'Bring your edge on-chain.' }], caption: (o) => `${o.a} ${o.b}. ${o.c ?? ''}`.trim() },
  { id: 'octo', label: 'Octo says', fields: [{ key: 'a', label: 'Quote', ph: 'read the tape, not the hype.', area: true }, { key: 'b', label: 'Who', ph: 'Professor Octo' }], caption: (o) => `“${o.a}” — ${o.b || 'Professor Octo'}` },
];

function siteUrl() { return typeof window !== 'undefined' ? window.location.origin : 'https://pros-per.xyz'; }

export function MemeStudio() {
  const { click } = useAudio();
  const ref = useRef<HTMLCanvasElement>(null);
  const [tid, setTid] = useState<MemeTemplate>('statement');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [copied, setCopied] = useState(false);
  const tpl = TEMPLATES.find((t) => t.id === tid)!;

  const opts: MemeOpts = { template: tid, a: vals[`${tid}-a`] ?? '', b: vals[`${tid}-b`] ?? '', c: vals[`${tid}-c`] ?? '', img };

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const render = () => drawMeme(c, opts);
    (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(render);
    render();
  });

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f); const im = new Image();
    im.onload = () => { setImg(im); URL.revokeObjectURL(url); };
    im.src = url;
  };
  const blob = () => new Promise<Blob | null>((res) => ref.current?.toBlob((b) => res(b), 'image/png'));
  const download = async () => { click(); const b = await blob(); if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `prosper-atlas-${tid}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  const copyImg = async () => { click(); try { const b = await blob(); if (!b) throw new Error(); await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); setCopied(true); } catch { download(); } setTimeout(() => setCopied(false), 2000); };
  const postX = () => { click(); const cap = tpl.caption(opts) || 'Made with Prosper Atlas'; window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`${cap}\n\n${siteUrl()}`)}`, '_blank', 'noopener'); };

  return (
    <div className="meme-studio">
      <div className="meme-controls">
        <div className="meme-templates">
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => { click(); setTid(t.id); }} className="pressable meme-tpl" data-on={t.id === tid ? 'true' : 'false'}>{t.label}</button>
          ))}
        </div>
        <div className="meme-fields">
          {tpl.fields.map((f) => (
            <label key={f.key} className="meme-field">
              <span className="font-mono meme-field__label">{f.label}</span>
              {f.area
                ? <textarea rows={2} value={vals[`${tid}-${f.key}`] ?? ''} onChange={(e) => setVals((v) => ({ ...v, [`${tid}-${f.key}`]: e.target.value }))} placeholder={f.ph} className="meme-input font-display" />
                : <input value={vals[`${tid}-${f.key}`] ?? ''} onChange={(e) => setVals((v) => ({ ...v, [`${tid}-${f.key}`]: e.target.value }))} placeholder={f.ph} className="meme-input font-display" />}
            </label>
          ))}
          <div className="meme-upload">
            <label className="pressable meme-upload__btn font-mono">
              {img ? 'Change image' : 'Add your image'}
              <input type="file" accept="image/*" onChange={onUpload} hidden />
            </label>
            {img && <button onClick={() => { click(); setImg(null); }} className="pressable meme-upload__clear font-mono">Remove</button>}
          </div>
        </div>
      </div>

      <div className="meme-preview">
        <div className="meme-canvas"><canvas ref={ref} style={{ width: '100%', height: 'auto', display: 'block' }} aria-label="Post preview" /></div>
        <div className="meme-actions">
          <button onClick={postX} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 auto' }}>Post on X</button>
          <button onClick={download} className="pressable share-btn">Download</button>
          <button onClick={copyImg} className="pressable share-btn">{copied ? 'Copied ✓' : 'Copy'}</button>
        </div>
      </div>
    </div>
  );
}
