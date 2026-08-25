import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Container, Kicker, CTA } from '@/components/PageBits';
import { OFFICIAL_LINKS } from '@/data/ecosystem';
import { useAudio } from '@/audio/AudioProvider';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 20, filter: 'blur(5px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } } };

// generic strategy categories offered as examples — the Curator's own choice, not official Prosper taxonomy
const CATEGORIES = ['Market-neutral', 'Directional', 'Yield', 'Arbitrage', 'Systematic', 'Fundamental'];

interface Spec {
  name: string; category: string; thesis: string;
  maxDrawdown: number; leverage: number; maxPosition: number;
  perfFee: number; mgmtFee: number;
}
const DEFAULT: Spec = { name: '', category: '', thesis: '', maxDrawdown: 20, leverage: 2, maxPosition: 25, perfFee: 15, mgmtFee: 2 };

function Slider({ label, value, min, max, step, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt: (v: number) => string;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between" style={{ marginBottom: 8 }}>
        <label className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mist)' }}>{label}</label>
        <span className="font-mono" style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{fmt(value)}</span>
      </div>
      <input type="range" className="pv-range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--p' as string]: `${p}%`, ['--accent' as string]: '#e4c877' } as React.CSSProperties} aria-label={label} />
    </div>
  );
}

export function CuratorStudio() {
  const { click } = useAudio();
  const reduce = useReducedMotion();

  const [s, setS] = useState<Spec>(() => {
    if (typeof window === 'undefined') return DEFAULT;
    const q = new URLSearchParams(window.location.search);
    const num = (k: string, d: number) => (q.has(k) ? Number(q.get(k)) : d);
    return {
      name: q.get('n') ?? '', category: q.get('cat') ?? '', thesis: q.get('t') ?? '',
      maxDrawdown: num('dd', 20), leverage: num('lev', 2), maxPosition: num('pos', 25),
      perfFee: num('pf', 15), mgmtFee: num('mf', 2),
    };
  });
  const set = (patch: Partial<Spec>) => setS((p) => ({ ...p, ...patch }));

  useEffect(() => {
    const q = new URLSearchParams();
    if (s.name) q.set('n', s.name);
    if (s.category) q.set('cat', s.category);
    if (s.thesis) q.set('t', s.thesis);
    q.set('dd', String(s.maxDrawdown)); q.set('lev', String(s.leverage)); q.set('pos', String(s.maxPosition));
    q.set('pf', String(s.perfFee)); q.set('mf', String(s.mgmtFee));
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`);
  }, [s]);

  // completeness — weighted toward the fields that need real thought
  const completeness = useMemo(() => {
    let v = 0;
    if (s.name.trim()) v += 25;
    if (s.category) v += 20;
    v += Math.min(s.thesis.trim().length / 80, 1) * 35;
    v += 20; // risk + fees always configured (sensible defaults)
    return Math.round(v);
  }, [s]);
  const ready = completeness >= 80;

  // completeness ring
  const RC = 2 * Math.PI * 26;
  const ringSpring = useSpring(0, { stiffness: 120, damping: 22 });
  useEffect(() => { ringSpring.set(completeness / 100); }, [completeness, ringSpring]);
  const dash = useTransform(ringSpring, (v) => `${v * RC} ${RC}`);

  const specText = useMemo(() => [
    `PROSPER VAULT — DRAFT SPEC`,
    `Strategy: ${s.name || '—'}`,
    `Category: ${s.category || '—'}`,
    ``,
    `Thesis:`,
    s.thesis || '—',
    ``,
    `Hard-coded risk parameters:`,
    `  Max drawdown: ${s.maxDrawdown}%`,
    `  Leverage cap: ${s.leverage}×`,
    `  Max position size: ${s.maxPosition}%`,
    ``,
    `Fee schedule:`,
    `  Performance fee: ${s.perfFee}%`,
    `  Management fee: ${s.mgmtFee}%`,
    ``,
    `Launches as one Vault → Vault Shares (capital, tracks NAV) + p{VAULT} (conviction, bonding curve → DEX).`,
    `Drafted in the Prosper Atlas Curator Studio · not an official submission.`,
  ].join('\n'), [s]);

  const copySpec = () => { click(); navigator.clipboard?.writeText(specText).catch(() => {}); };
  const copyLink = () => { click(); navigator.clipboard?.writeText(window.location.href).catch(() => {}); };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 96 }}>
      <Container style={{ maxWidth: 1120 }}>
        <Kicker>Curator Studio</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.1rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '14px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          Design your <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Vault.</em>
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 640 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          Curators set the thesis, category, hard-coded risk parameters and fees for a Vault. Draft yours here, get a clean spec sheet to share, then take it to the real application.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginTop: 16 }}>
          <span className="font-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.7)', border: '1px solid var(--border)', borderRadius: 999, padding: '5px 12px' }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--mist)' }} />
            Draft tool · not an official submission
          </span>
        </motion.div>

        <div className="studio-cols" style={{ marginTop: 40 }}>
          {/* BUILDER */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
            style={{ padding: '26px 28px', borderRadius: 18, border: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(10,15,11,0.6), rgba(13,19,16,0.72))', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <span className="eyebrow" style={{ fontSize: 10.5, letterSpacing: '0.34em' }}>Build the spec</span>

            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mist)', marginBottom: 8 }}>Strategy name</label>
              <input value={s.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Delta-Neutral Basis" maxLength={48} className="studio-input font-head" />
            </div>

            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mist)', marginBottom: 10 }}>Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const on = s.category === c;
                  return (
                    <button key={c} onClick={() => { click(); set({ category: on ? '' : c }); }} className="pressable studio-chip" data-on={on ? 'true' : 'false'} style={{ position: 'relative' }}>
                      {on && <motion.span layoutId="cat-hl" className="studio-chip__hl" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
                      <span style={{ position: 'relative' }}>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mist)', marginBottom: 8 }}>Thesis</label>
              <textarea value={s.thesis} onChange={(e) => set({ thesis: e.target.value })} maxLength={280} rows={3}
                placeholder="What's the edge? A thesis is only the starting point — what matters is what can be observed." className="studio-input font-display" style={{ resize: 'vertical', lineHeight: 1.6 }} />
              <div className="font-mono" style={{ textAlign: 'right', fontSize: 9, color: 'rgba(198,210,202,0.5)', marginTop: 4 }}>{s.thesis.length}/280</div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: 14 }}>Hard-coded risk parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Slider label="Max drawdown" value={s.maxDrawdown} min={5} max={60} step={1} onChange={(v) => set({ maxDrawdown: v })} fmt={(v) => `${v}%`} />
                <Slider label="Leverage cap" value={s.leverage} min={1} max={10} step={0.5} onChange={(v) => set({ leverage: v })} fmt={(v) => `${v}×`} />
                <Slider label="Max position size" value={s.maxPosition} min={5} max={100} step={5} onChange={(v) => set({ maxPosition: v })} fmt={(v) => `${v}%`} />
              </div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: 14 }}>Fee schedule</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Slider label="Performance fee" value={s.perfFee} min={0} max={30} step={0.5} onChange={(v) => set({ perfFee: v })} fmt={(v) => `${v}%`} />
                <Slider label="Management fee" value={s.mgmtFee} min={0} max={5} step={0.25} onChange={(v) => set({ mgmtFee: v })} fmt={(v) => `${v}%`} />
              </div>
            </div>
          </motion.div>

          {/* SPEC SHEET */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} style={{ position: 'relative' }}>
            <div className="studio-sheet">
              {/* header + completeness ring */}
              <div className="flex items-start justify-between" style={{ gap: 16 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.6)' }}>Draft Vault Spec</div>
                  <div className="font-head" style={{ fontSize: 'clamp(1.3rem,2.6vw,1.7rem)', fontWeight: 600, color: s.name ? 'var(--text-hi)' : 'var(--mist)', marginTop: 6, wordBreak: 'break-word' }}>{s.name || 'Your strategy'}</div>
                  {s.category && <span className="font-mono" style={{ display: 'inline-block', marginTop: 8, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--primary)', border: '1px solid rgba(228,200,119,0.4)', borderRadius: 999, padding: '3px 10px' }}>{s.category}</span>}
                </div>
                <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(234,230,218,0.1)" strokeWidth="4" />
                    <motion.circle cx="32" cy="32" r="26" fill="none" stroke="#e4c877" strokeWidth="4" strokeLinecap="round"
                      transform="rotate(-90 32 32)" style={{ strokeDasharray: dash }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{completeness}%</span>
                  </div>
                </div>
              </div>

              <p className="font-display" style={{ fontSize: 13.5, lineHeight: 1.65, color: s.thesis ? 'var(--text)' : 'rgba(198,210,202,0.5)', marginTop: 18, minHeight: 44 }}>
                {s.thesis || 'Your thesis will appear here as you write it.'}
              </p>

              {/* risk grid */}
              <div className="studio-grid" style={{ marginTop: 22 }}>
                {[['Max drawdown', `${s.maxDrawdown}%`], ['Leverage cap', `${s.leverage}×`], ['Max position', `${s.maxPosition}%`]].map(([k, v]) => (
                  <div key={k} className="studio-stat">
                    <span className="font-mono studio-stat__k">{k}</span>
                    <span className="font-head studio-stat__v">{v}</span>
                  </div>
                ))}
              </div>
              <div className="studio-grid" style={{ marginTop: 10 }}>
                {[['Performance fee', `${s.perfFee}%`], ['Management fee', `${s.mgmtFee}%`]].map(([k, v]) => (
                  <div key={k} className="studio-stat">
                    <span className="font-mono studio-stat__k">{k}</span>
                    <span className="font-head studio-stat__v" style={{ color: 'var(--primary)' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* two-asset note */}
              <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)' }}>
                <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--emerald-glow)', marginBottom: 6 }}>At launch — one Vault, two assets</div>
                <p className="font-display" style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--mist)', margin: 0 }}>
                  <strong style={{ color: 'var(--emerald-bright)' }}>Vault Shares</strong> take capital and track NAV. <strong style={{ color: 'var(--primary)' }}>p&#123;VAULT&#125;</strong> opens on a bonding curve to price conviction in you, then graduates to open DEX trading.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* actions */}
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ marginTop: 34 }}>
          <div className="flex items-center gap-3 flex-wrap" style={{ justifyContent: 'center' }}>
            <button onClick={copySpec} className="pressable font-mono studio-action">Copy spec sheet</button>
            <button onClick={copyLink} className="pressable font-mono studio-action">Share draft link</button>
            <CTA primary href={OFFICIAL_LINKS.becomeCurator}>Apply as a Curator</CTA>
          </div>
          <motion.p className="font-mono" style={{ textAlign: 'center', marginTop: 16, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: ready ? 'var(--emerald-glow)' : 'rgba(198,210,202,0.55)' }}
            animate={{ opacity: [0.7, 1, 0.7] }} transition={reduce ? {} : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
            {ready ? '✓ Fund-ready — the Founding Curator Cohort came with a $50K seed fund' : 'Add a name, category and thesis to make it fund-ready'}
          </motion.p>
        </motion.div>
      </Container>
    </div>
  );
}
