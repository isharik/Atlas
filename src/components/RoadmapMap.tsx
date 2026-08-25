import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { IconArrow } from './ui/icons';
import { NetworkGlobe } from './NetworkGlobe';

export interface RoadStep { n: string; k: string; c: string; d: string }

const VB = { w: 1000, h: 680 };

const CX = 500, CY = 348, RX = 372, RY = 250; // node-orbit ellipse
const START = -90, STEP = 40;                  // 9 stations over 320°, a 40° open gap

// stations sit evenly on an open elliptical orbit around the central globe —
// clean, spaced, and the connecting path is a perfect arc that never self-crosses.
const NODES = Array.from({ length: 9 }, (_, i) => {
  const a = ((START + i * STEP) * Math.PI) / 180;
  return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
});

/** Perfect elliptical-arc path through the stations (clockwise). */
function arcPath(pts: { x: number; y: number }[]) {
  if (!pts.length) return '';
  return pts.map((p, i) => (i === 0
    ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    : `A ${RX} ${RY} 0 0 1 ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)).join(' ');
}

export function RoadmapMap({ steps }: { steps: RoadStep[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const n = steps.length;
  const nodes = NODES.slice(0, n);
  const trail = arcPath(nodes);
  const cur = steps[active];
  const frac = n > 1 ? active / (n - 1) : 1;

  const go = useCallback((next: number) => {
    setActive(() => Math.max(0, Math.min(n - 1, next)));
  }, [n]);

  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(active - 1); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(active + 1); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [active, go]);

  return (
    <div className="roadmap">
      {/* LEFT — editorial intro + active step */}
      <div className="roadmap-panel">
        <span className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.5em' }}>The Prosper Journey</span>
        <h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.2rem,4.8vw,3.6rem)', color: 'var(--text-hi)', margin: '18px 0 14px', letterSpacing: '-0.01em', lineHeight: 1.04 }}>
          From strategy<br />to market.
        </h1>
        <p className="font-display" style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--mist)', maxWidth: 400 }}>
          Every step is real and observable. Travel the path a private edge takes to become a transparent, investable market.
        </p>

        {/* active station card */}
        <div style={{ position: 'relative', marginTop: 28, minHeight: 176 }}>
          <motion.div
            key={active}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.8 }}
            style={{
              position: 'absolute', inset: 0, padding: '24px 26px', borderRadius: 18,
              border: '1px solid rgba(234,230,218,0.10)',
              background: 'linear-gradient(180deg, rgba(10,15,11,0.72), rgba(13,19,16,0.82))',
              boxShadow: '0 30px 70px -40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 18, background: `radial-gradient(130% 90% at 12% 0%, ${cur.c}12, transparent 58%)`, pointerEvents: 'none' }} />
            {/* header: index + gold progress + counter */}
            <div className="flex items-center gap-4" style={{ position: 'relative' }}>
              <span className="font-mono" style={{ fontSize: 12, letterSpacing: '0.24em', color: 'var(--primary)' }}>{cur.n}</span>
              <span style={{ position: 'relative', flex: 1, height: 2, borderRadius: 2, background: 'rgba(234,230,218,0.1)', overflow: 'hidden' }}>
                <motion.span animate={{ scaleX: frac }} transition={{ type: 'spring', stiffness: 120, damping: 24 }}
                  style={{ position: 'absolute', inset: 0, transformOrigin: 'left', background: 'linear-gradient(90deg, #c9a24b, #e4c877)', borderRadius: 2 }} />
              </span>
              <span className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.2em', color: 'var(--mist)' }}>{cur.n} / {String(n).padStart(2, '0')}</span>
            </div>
            <div className="font-head" style={{ position: 'relative', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 600, color: 'var(--text-hi)', letterSpacing: '0.005em', marginTop: 16 }}>{cur.k}</div>
            <p className="font-display" style={{ position: 'relative', fontSize: 14, lineHeight: 1.65, color: 'var(--mist)', marginTop: 10 }}>{cur.d}</p>
          </motion.div>
        </div>

        {/* nav */}
        <div className="flex items-center gap-3" style={{ marginTop: 24 }}>
          <button aria-label="Previous step" onClick={() => go(active - 1)} disabled={active === 0} className="pressable" style={navBtn(active === 0, 'muted')}>
            <span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={15} /></span>
          </button>
          <button aria-label="Next step" onClick={() => go(active + 1)} disabled={active === n - 1} className="pressable" style={navBtn(active === n - 1, 'gold')}>
            <IconArrow size={15} />
          </button>
          <span className="font-mono" style={{ marginLeft: 8, fontSize: 10, letterSpacing: '0.22em', color: 'var(--mist)', textTransform: 'uppercase' }}>Step {cur.n} of {String(n).padStart(2, '0')}</span>
        </div>
      </div>

      {/* RIGHT — orbital journey map */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label="Prosper journey map — arrow keys or click a station"
        className="roadmap-stage"
        style={{ position: 'relative', outline: 'none' }}
      >
        <div style={{ position: 'relative', width: '100%', aspectRatio: `${VB.w} / ${VB.h}` }}>
          {/* atmosphere: faint grid + radial glow + vignette */}
          <div aria-hidden className="rm-atmos" />
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(42% 40% at 50% 51%, rgba(47,191,143,0.13), transparent 72%)', pointerEvents: 'none' }} />

          {/* orbital paths + trail + particles */}
          <svg viewBox={`0 0 ${VB.w} ${VB.h}`} width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
            <defs>
              <filter id="rm-soft" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* faint orbital rings around the globe (slow spin) */}
            <g className="rm-orbit" style={{ transformOrigin: '500px 348px' }}>
              <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="rgba(56,224,160,0.10)" strokeWidth="1" />
              <ellipse cx={CX} cy={CY} rx="212" ry="150" fill="none" stroke="rgba(56,224,160,0.07)" strokeWidth="1" />
            </g>
            {/* the journey path — thin glowing arc through every station, behind the globe */}
            <path id="journeyPath" d={trail} fill="none" stroke="rgba(56,224,160,0.5)" strokeWidth="1.5" strokeLinecap="round" filter="url(#rm-soft)" />
            {/* small connection points at every station */}
            {nodes.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2.4} fill={i === active ? '#ecd28a' : 'rgba(140,240,200,0.7)'} />
            ))}
            {/* particles travelling along the path (staggered via negative begin) — always on */}
            {[0, 1, 2].map((i) => {
              const dur = 18 + i * 4;
              return (
                <circle key={i} r={2.6} fill="#8cf0c8">
                  <animateMotion dur={`${dur}s`} begin={`-${(i * dur) / 3}s`} repeatCount="indefinite" rotate="auto">
                    <mpath href="#journeyPath" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.12;0.88;1" dur={`${dur}s`} begin={`-${(i * dur) / 3}s`} repeatCount="indefinite" />
                </circle>
              );
            })}
          </svg>

          {/* central network globe */}
          <div style={{ position: 'absolute', left: '50%', top: '51.2%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
            <NetworkGlobe size={220} spin={0.32} />
          </div>

          {/* stations */}
          {nodes.map((p, i) => {
            const isActive = i === active;
            const s = steps[i];
            return (
              <motion.button
                key={s.k}
                onClick={() => go(i)}
                aria-label={`${s.n} ${s.k}`}
                aria-current={isActive}
                className="pressable"
                initial={false}
                animate={{ scale: isActive ? 1.12 : 1 }}
                whileHover={{ scale: isActive ? 1.14 : 1.09 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                style={{
                  position: 'absolute', left: `${(p.x / VB.w) * 100}%`, top: `${(p.y / VB.h) * 100}%`,
                  transform: 'translate(-50%,-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                }}
              >
                <span style={{
                  display: 'grid', placeItems: 'center', width: isActive ? 52 : 44, height: isActive ? 52 : 44, borderRadius: 999,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: isActive ? 14 : 12.5, fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--text)',
                  background: isActive ? 'radial-gradient(circle at 50% 35%, rgba(228,200,119,0.16), rgba(13,19,16,0.85))' : 'rgba(6,10,8,0.82)',
                  border: `1.5px solid ${isActive ? 'var(--primary)' : 'rgba(234,230,218,0.22)'}`,
                  boxShadow: isActive ? '0 0 24px rgba(228,200,119,0.5), inset 0 0 12px rgba(228,200,119,0.15)' : '0 6px 16px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                  transition: 'background 240ms ease, border-color 240ms ease, box-shadow 240ms ease, color 240ms ease, width 240ms ease, height 240ms ease',
                }}>{s.n}</span>
                <span className="font-mono" style={{
                  position: 'absolute', top: 'calc(100% + 7px)', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap',
                  fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: isActive ? 'var(--primary)' : 'var(--mist)',
                  transition: 'color 240ms ease',
                }}>{s.k}</span>
              </motion.button>
            );
          })}
        </div>

        <p className="font-mono roadmap-hint" style={{ marginTop: 22, textAlign: 'center', fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.5)' }}>
          Move with ← → ↑ ↓ · click a station
        </p>
      </div>
    </div>
  );
}

function navBtn(disabled: boolean, tone: 'muted' | 'gold'): React.CSSProperties {
  const gold = tone === 'gold';
  return {
    width: 44, height: 44, borderRadius: 999, display: 'grid', placeItems: 'center',
    background: gold ? 'linear-gradient(180deg, rgba(228,200,119,0.10), rgba(228,200,119,0.02))' : 'rgba(15,22,18,0.55)',
    border: `1px solid ${gold ? 'rgba(228,200,119,0.5)' : 'var(--border-strong)'}`,
    color: gold ? 'var(--primary)' : 'var(--text)',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.32 : 1,
    boxShadow: gold && !disabled ? '0 0 18px rgba(228,200,119,0.18)' : 'none',
    transition: 'opacity 200ms ease',
  };
}
