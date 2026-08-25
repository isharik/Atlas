import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Container, Kicker, CTA } from '@/components/PageBits';
import { useAudio } from '@/audio/AudioProvider';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 20, filter: 'blur(5px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } } };
const viewport = { once: true, amount: 0.2 };
const spring = { type: 'spring' as const, stiffness: 150, damping: 26 };

// ── grounded mechanics constants (illustrative units; the model, not live data) ──
const P0 = 0.02;              // p{VAULT} opening price on the bonding curve
const CURVE_K = 250_000;      // bonding-curve scale
const CURVE_EXP = 1.4;        // convexity
const CONV_MAX = 1_000_000;   // domain of the conviction axis
const GRADUATION = 500_000;   // conviction at which p{VAULT} "graduates" to open DEX trading

const pvaultPrice = (conviction: number) => P0 * (1 + conviction / CURVE_K) ** CURVE_EXP;

// ── formatters ──
const usd = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (a >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${Math.round(v).toLocaleString()}`;
};
const pct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
const mult = (v: number) => `${v.toFixed(2)}×`;

interface Scenario { capital: number; ret: number; fee: number; conviction: number }
const DEFAULT: Scenario = { capital: 250_000, ret: 40, fee: 15, conviction: 300_000 };
const PRESETS: { label: string; note: string; s: Scenario }[] = [
  { label: 'Strong run', note: 'Edge plays out; conviction follows', s: { capital: 400_000, ret: 65, fee: 15, conviction: 460_000 } },
  { label: 'Drawdown', note: 'NAV falls — no fee on losses', s: { capital: 250_000, ret: -30, fee: 15, conviction: 140_000 } },
  { label: 'Cold start', note: 'p{VAULT} prices belief before results', s: { capital: 25_000, ret: 3, fee: 10, conviction: 320_000 } },
];

/** Number that springs to its target (respects reduced-motion). */
function AnimatedNumber({ value, format, style, className }: { value: number; format: (v: number) => string; style?: React.CSSProperties; className?: string }) {
  const reduce = useReducedMotion();
  const s = useSpring(value, { stiffness: 130, damping: 22 });
  useEffect(() => { s.set(value); }, [value, s]);
  const text = useTransform(s, (v) => format(v));
  if (reduce) return <span style={style} className={className}>{format(value)}</span>;
  return <motion.span style={style} className={className}>{text}</motion.span>;
}

function Slider({ label, hint, value, min, max, step, onChange, fmt, accent }: {
  label: string; hint: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt: (v: number) => string; accent: string;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between" style={{ marginBottom: 9 }}>
        <label className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text)' }}>{label}</label>
        <AnimatedNumber value={value} format={fmt} className="font-mono" style={{ fontSize: 13, color: accent, fontWeight: 600 }} />
      </div>
      <input
        type="range" className="pv-range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--p' as string]: `${p}%`, ['--accent' as string]: accent } as React.CSSProperties}
        aria-label={label}
      />
      <div className="font-mono" style={{ marginTop: 7, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.55)' }}>{hint}</div>
    </div>
  );
}

export function Sandbox() {
  const { click } = useAudio();
  const reduce = useReducedMotion();

  // read initial scenario from the URL (shareable, no backend/storage)
  const [sc, setSc] = useState<Scenario>(() => {
    if (typeof window === 'undefined') return DEFAULT;
    const q = new URLSearchParams(window.location.search);
    const num = (k: string, d: number) => (q.has(k) ? Number(q.get(k)) : d);
    return { capital: num('c', DEFAULT.capital), ret: num('r', DEFAULT.ret), fee: num('f', DEFAULT.fee), conviction: num('v', DEFAULT.conviction) };
  });
  const set = (patch: Partial<Scenario>) => setSc((p) => ({ ...p, ...patch }));

  // sync scenario → URL (replace, so back button isn't polluted)
  useEffect(() => {
    const q = new URLSearchParams({ c: String(sc.capital), r: String(sc.ret), f: String(sc.fee), v: String(sc.conviction) });
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`);
  }, [sc]);

  // ── Vault Shares (capital → NAV) ──
  const navAfter = sc.capital * (1 + sc.ret / 100);
  const gross = navAfter - sc.capital;
  const curatorFee = gross > 0 ? gross * (sc.fee / 100) : 0;   // performance fee on gains only
  const netNav = navAfter - curatorFee;
  const allocatorReturn = (netNav / sc.capital - 1) * 100;
  const barMax = Math.max(sc.capital, navAfter, 1);

  // ── p{VAULT} (conviction → bonding curve) ──
  const price = pvaultPrice(sc.conviction);
  const priceMult = price / P0;
  const graduated = sc.conviction >= GRADUATION;
  const curve = useMemo(() => {
    const n = 60, pts: { x: number; y: number }[] = [];
    const pMax = pvaultPrice(CONV_MAX);
    for (let i = 0; i <= n; i++) {
      const v = (i / n) * CONV_MAX;
      pts.push({ x: (v / CONV_MAX) * 300, y: 120 - (pvaultPrice(v) / pMax) * 108 });
    }
    return { d: pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '), pMax };
  }, []);
  const markerX = (sc.conviction / CONV_MAX) * 300;
  const markerY = 120 - (price / curve.pMax) * 108;
  const gradX = (GRADUATION / CONV_MAX) * 300;

  const copy = () => {
    click();
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 96 }}>
      <Container style={{ maxWidth: 1120 }}>
        {/* header */}
        <Kicker>Mechanics Sandbox</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.1rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '14px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          One launch, <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>two assets.</em>
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 640 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          Every Prosper Vault mints two instruments — capital and conviction — priced separately. Move the inputs and watch how <strong style={{ color: 'var(--emerald-bright)' }}>Vault Shares</strong> track NAV while the <strong style={{ color: 'var(--primary)' }}>p&#123;VAULT&#125;</strong> prices belief in the Curator on its own bonding curve.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginTop: 16 }}>
          <span className="font-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.7)', border: '1px solid var(--border)', borderRadius: 999, padding: '5px 12px' }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--mist)' }} />
            Educational model · not investment advice · not live data
          </span>
        </motion.div>

        {/* controls */}
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport}
          style={{ marginTop: 40, padding: '26px 28px', borderRadius: 18, border: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(10,15,11,0.6), rgba(13,19,16,0.72))' }}>
          <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 22 }}>
            <span className="eyebrow" style={{ fontSize: 10.5, letterSpacing: '0.34em' }}>Your Scenario</span>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => { click(); setSc(p.s); }} title={p.note} className="pressable font-mono"
                  style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)', background: 'rgba(15,22,18,0.6)', border: '1px solid var(--border-strong)', borderRadius: 999, padding: '6px 12px', cursor: 'pointer' }}>
                  {p.label}
                </button>
              ))}
              <button onClick={() => { click(); setSc(DEFAULT); }} className="pressable font-mono" style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mist)', background: 'none', border: '1px solid transparent', cursor: 'pointer', padding: '6px 8px' }}>Reset</button>
            </div>
          </div>
          <div className="sandbox-controls">
            <Slider label="Capital deposited" hint="→ Vault Shares" value={sc.capital} min={10_000} max={5_000_000} step={10_000} onChange={(v) => set({ capital: v })} fmt={usd} accent="#38e0a0" />
            <Slider label="Strategy return" hint="→ moves NAV only" value={sc.ret} min={-50} max={150} step={1} onChange={(v) => set({ ret: v })} fmt={pct} accent="#38e0a0" />
            <Slider label="Curator fee" hint="→ split of gains" value={sc.fee} min={0} max={30} step={0.5} onChange={(v) => set({ fee: v })} fmt={(v) => `${v}%`} accent="#e4c877" />
            <Slider label="Conviction inflow" hint="→ moves p{VAULT} only" value={sc.conviction} min={0} max={CONV_MAX} step={10_000} onChange={(v) => set({ conviction: v })} fmt={usd} accent="#e4c877" />
          </div>
        </motion.div>

        {/* two instruments */}
        <div className="sandbox-cols" style={{ marginTop: 20 }}>
          {/* Vault Shares */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="sandbox-card" style={{ ['--edge' as string]: '#2fbf8f' } as React.CSSProperties}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-head" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-hi)' }}>Vault Shares</div>
                <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--emerald-glow)', marginTop: 4 }}>Capital · tracks NAV</div>
              </div>
              <AnimatedNumber value={allocatorReturn} format={pct} className="font-mono" style={{ fontSize: 22, fontWeight: 600, color: allocatorReturn >= 0 ? '#38e0a0' : '#e0776f' }} />
            </div>

            {/* NAV bars */}
            <div className="flex items-end gap-5" style={{ height: 150, marginTop: 22 }}>
              {[{ k: 'Deposited', v: sc.capital, c: 'rgba(198,210,202,0.5)' }, { k: 'Net NAV', v: netNav, c: '#2fbf8f' }].map((b) => (
                <div key={b.k} className="flex flex-col items-center" style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <AnimatedNumber value={b.v} format={usd} className="font-mono" style={{ fontSize: 12, color: 'var(--text)', marginBottom: 8 }} />
                  <motion.div animate={{ height: `${Math.max(2, (b.v / barMax) * 100)}%` }} transition={reduce ? { duration: 0 } : spring}
                    style={{ width: '100%', maxWidth: 96, borderRadius: '8px 8px 0 0', background: `linear-gradient(180deg, ${b.c}, ${b.c}44)`, boxShadow: `0 0 24px ${b.c}33` }} />
                  <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mist)', marginTop: 8 }}>{b.k}</span>
                </div>
              ))}
            </div>

            <div className="sandbox-rows">
              <Row k="Gross P/L" v={<AnimatedNumber value={gross} format={usd} className="font-mono" style={{ color: gross >= 0 ? '#38e0a0' : '#e0776f' }} />} />
              <Row k="Curator fee (on gains)" v={<AnimatedNumber value={curatorFee} format={usd} className="font-mono" style={{ color: 'var(--primary)' }} />} />
              <Row k="Net to allocators" v={<AnimatedNumber value={netNav} format={usd} className="font-mono" style={{ color: 'var(--text-hi)' }} />} />
            </div>
          </motion.div>

          {/* p{VAULT} */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="sandbox-card" style={{ ['--edge' as string]: '#e4c877' } as React.CSSProperties}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-head" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-hi)' }}>p&#123;VAULT&#125;</div>
                <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--primary)', marginTop: 4 }}>Conviction · bonding curve</div>
              </div>
              <AnimatedNumber value={priceMult} format={mult} className="font-mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--primary)' }} />
            </div>

            {/* bonding curve */}
            <div style={{ marginTop: 22, position: 'relative' }}>
              <svg viewBox="0 0 300 130" width="100%" height="150" style={{ overflow: 'visible' }} aria-hidden>
                <defs>
                  <linearGradient id="pv-fill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c9a24b" /><stop offset="1" stopColor="#e4c877" /></linearGradient>
                </defs>
                {/* graduation marker */}
                <line x1={gradX} y1={0} x2={gradX} y2={120} stroke="rgba(228,200,119,0.25)" strokeWidth="1" strokeDasharray="3 3" />
                <text x={gradX} y={130} fontSize="7" fill="rgba(228,200,119,0.6)" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.5">GRADUATES → DEX</text>
                {/* curve */}
                <path d={curve.d} fill="none" stroke="url(#pv-fill)" strokeWidth="2" strokeLinecap="round" />
                {/* travelled portion */}
                <path d={curve.d} fill="none" stroke="#e4c877" strokeWidth="2.5" strokeLinecap="round"
                  pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, sc.conviction / CONV_MAX)} style={{ filter: 'drop-shadow(0 0 4px rgba(228,200,119,0.6))' }} />
                {/* marker — translate a group so no SVG attr flickers to undefined */}
                <motion.g animate={{ x: markerX, y: markerY }} transition={reduce ? { duration: 0 } : spring} style={{ x: markerX, y: markerY }}>
                  <circle r={5} fill="none" stroke="#e4c877" strokeWidth="1.5">
                    {!reduce && <animate attributeName="r" values="5;12;5" dur="2.2s" repeatCount="indefinite" />}
                    {!reduce && <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />}
                  </circle>
                  <circle r={5} fill="#f4e6b8" stroke="#050705" strokeWidth="1.5" />
                </motion.g>
              </svg>
            </div>

            <div className="sandbox-rows">
              <Row k="p{VAULT} price" v={<AnimatedNumber value={price} format={(v) => `$${v.toFixed(3)}`} className="font-mono" style={{ color: 'var(--primary)' }} />} />
              <Row k="vs. opening price" v={<AnimatedNumber value={priceMult} format={mult} className="font-mono" style={{ color: 'var(--text-hi)' }} />} />
              <Row k="Stage" v={<span className="font-mono" style={{ color: graduated ? '#38e0a0' : 'var(--mist)' }}>{graduated ? 'Open DEX trading' : 'Bonding curve'}</span>} />
            </div>
          </motion.div>
        </div>

        {/* the insight */}
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport}
          style={{ marginTop: 20, padding: '22px 26px', borderRadius: 16, border: '1px solid rgba(228,200,119,0.22)', background: 'radial-gradient(120% 140% at 0% 0%, rgba(228,200,119,0.08), transparent 60%), rgba(15,22,18,0.5)' }}>
          <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 10 }}>The point</div>
          <p className="font-display" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>
            Drag <strong style={{ color: 'var(--emerald-bright)' }}>Strategy return</strong> — only the NAV bars move. Drag <strong style={{ color: 'var(--primary)' }}>Conviction inflow</strong> — only the p&#123;VAULT&#125; curve moves. Same Vault, two independent prices: one for the capital in the strategy, one for the market's belief in the Curator. That separation is what lets a brand-new strategy find a price on day one, before any track record exists.
          </p>
        </motion.div>

        {/* actions */}
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="flex items-center gap-3 flex-wrap" style={{ marginTop: 34, justifyContent: 'center' }}>
          <button onClick={copy} className="pressable font-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 24px', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text)', background: 'rgba(15,22,18,0.6)', border: '1px solid var(--border-strong)', borderRadius: 8, cursor: 'pointer' }}>
            Copy this scenario
          </button>
          <CTA primary to="/studio">Design your Vault</CTA>
          <CTA to="/zone/pvault">How p&#123;VAULT&#125; works</CTA>
        </motion.div>
      </Container>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '11px 0', borderTop: '1px solid var(--border)', fontSize: 13 }}>
      <span className="font-display" style={{ color: 'var(--mist)' }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}
