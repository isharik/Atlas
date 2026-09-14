import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { IconArrow, ZoneGlyph } from './ui/icons';
import type { ZoneIcon } from '@/data/ecosystem';

export interface RoadStep { n: string; k: string; c: string; d: string }

/** Per-step emblem — reuses the ecosystem glyphs, with three extras for the stages that have none. */
const STEP_ICON: Record<string, ZoneIcon> = {
  Curator: 'curator', Strategy: 'strategy', Vault: 'vault',
  'Track Record': 'track', 'p{VAULT}': 'pvault', 'Performance Market': 'market',
};
const STEP_LOGO: Record<string, string> = { Pharos: 'pharos_network', Prosper: 'ProsperTicker' };
function StepGlyph({ k, size = 18 }: { k: string; size?: number }) {
  const handle = STEP_LOGO[k];
  const [imgOk, setImgOk] = useState(Boolean(handle));
  if (handle && imgOk) {
    return <img src={`https://unavatar.io/x/${handle}?fallback=false`} alt={`${k} logo`} width={size} height={size}
      onError={() => setImgOk(false)} loading="lazy"
      style={{ width: size, height: size, borderRadius: size > 40 ? 16 : 6, objectFit: 'cover', display: 'block' }} />;
  }
  if (STEP_ICON[k]) return <ZoneGlyph icon={STEP_ICON[k]} size={size} />;
  const P = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  // Pharos — a layered Layer-1 beacon: a broad base, a tower, a light burst.
  if (k === 'Pharos') return (
    <svg {...P}>
      <path d="M6 20.5 18 20.5" opacity="0.5" />
      <path d="M9 20.5 10 9.5 14 9.5 15 20.5 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M9 20.5 10 9.5 14 9.5 15 20.5" />
      <circle cx="12" cy="6.4" r="2.1" fill="currentColor" fillOpacity="0.22" /><circle cx="12" cy="6.4" r="2.1" />
      <path d="M12 2.6v1.3M7.4 6.4H6M18 6.4h-1.4M8.6 3.5l.9.9M15.4 3.5l-.9.9" opacity="0.55" strokeWidth="1" />
    </svg>
  );
  // Prosper — the compass/star brand mark.
  if (k === 'Prosper') return (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" strokeWidth="0.85" opacity="0.28" />
      <path d="M12 3 13.6 10.4 21 12 13.6 13.6 12 21 10.4 13.6 3 12 10.4 10.4 Z" fill="currentColor" fillOpacity="0.14" />
      <path d="M12 3 13.6 10.4 21 12 13.6 13.6 12 21 10.4 13.6 3 12 10.4 10.4 Z" />
    </svg>
  );
  // Vault Shares — capital split into shares: a divided disc.
  if (k === 'Vault Shares') return (
    <svg {...P}>
      <circle cx="12" cy="12" r="8.6" fill="currentColor" fillOpacity="0.08" /><circle cx="12" cy="12" r="8.6" />
      <path d="M12 3.4V12l6 6" opacity="0.55" strokeWidth="1" />
      <path d="M12 12 3.9 14.6" opacity="0.4" strokeWidth="1" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
  return <svg {...P}><circle cx="12" cy="12" r="7" /></svg>;
}

const SPACING = 336;
const spring = { type: 'spring' as const, stiffness: 260, damping: 32, mass: 0.9 };

// a distinct entrance per stop — one signature move for each card
const STEP_ENTERS = [
  { opacity: 0, x: 72, filter: 'blur(10px)' },                 // in from right
  { opacity: 0, scale: 0.9, filter: 'blur(10px)' },            // scale up
  { opacity: 0, rotateY: -32, filter: 'blur(10px)' },          // turn in (Y)
  { opacity: 0, y: 60, filter: 'blur(10px)' },                 // rise
  { opacity: 0, x: -72, filter: 'blur(10px)' },                // in from left
  { opacity: 0, rotateX: 30, y: 22, filter: 'blur(10px)' },    // tilt down (X)
  { opacity: 0, scale: 1.08, filter: 'blur(12px)' },           // settle from big
  { opacity: 0, y: -50, filter: 'blur(10px)' },                // drop in
  { opacity: 0, rotateY: 26, x: 44, filter: 'blur(10px)' },    // twist in
] as const;

// Apple momentum projection (§6) — where a flick would come to rest.
function project(v: number, decel = 0.9985) { return (v / 1000) * decel / (1 - decel); }

export function RoadmapMap({ steps }: { steps: RoadStep[] }) {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const n = steps.length;
  const cur = steps[active];

  const go = useCallback((next: number) => setActive(() => Math.max(0, Math.min(n - 1, next))), [n]);

  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stageRef.current; if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [active, go]);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    const projected = info.offset.x + project(info.velocity.x);
    if (projected < -SPACING * 0.4) go(active + 1);
    else if (projected > SPACING * 0.4) go(active - 1);
  };

  const frac = n > 1 ? active / (n - 1) : 1;
  const s = cur;

  // each stop has its own signature entrance — a different move every time you change card
  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
    : {
        initial: STEP_ENTERS[active % STEP_ENTERS.length],
        animate: { opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, scale: 1, filter: 'blur(0px)' },
        transition: spring,
      };

  return (
    <div>
      {/* header */}
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 8px' }}>
        <span className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.5em' }}>The Prosper Journey</span>
        <h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.2rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '16px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}>
          From strategy <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>to market.</em>
        </h1>
        <p className="font-display" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--mist)' }}>
          Nine stops a private edge travels to become a transparent, investable market. Follow the map, swipe the card, or use the arrows.
        </p>
      </div>

      {/* one focused journey card */}
      <div ref={stageRef} tabIndex={0} role="group" aria-label="Prosper journey — swipe or use arrow keys" className="jmap-stage" style={{ outline: 'none' }}>
        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.16} dragMomentum={false} onDragEnd={onDragEnd}
          whileTap={{ cursor: 'grabbing' }} className="jmap-stage__drag">
          <motion.div key={active} {...enter} className="jmap-focus">
            <div className="jmap-card" data-active="true" style={{ ['--sc' as string]: s.c } as React.CSSProperties}>
              <div aria-hidden className="jmap-card__wash" style={{ background: `radial-gradient(120% 90% at 8% 0%, ${s.c}2e, transparent 62%)` }} />
              <div aria-hidden className="jmap-card__grid" />
              <div aria-hidden className="jmap-card__mark" style={{ color: s.c }}><StepGlyph k={s.k} size={168} /></div>
              <div className="jmap-card__head">
                <span className="jmap-chip" style={{ color: s.c, borderColor: `${s.c}55`, background: `${s.c}16` }}><StepGlyph k={s.k} size={18} /></span>
                <span className="jmap-badge" style={{ color: s.c, borderColor: `${s.c}66`, background: `${s.c}14` }}>{s.n}</span>
                <span className="jmap-card__rule" style={{ background: `linear-gradient(90deg, ${s.c}66, transparent)` }} />
                <span className="font-mono jmap-card__count">{s.n} / {String(n).padStart(2, '0')}</span>
              </div>
              <div className="font-head jmap-card__title" style={{ color: s.c }}>{s.k}</div>
              <p className="font-display jmap-card__desc">{s.d}</p>
              <div aria-hidden className="jmap-card__signal">
                {[0.35, 0.6, 0.45, 0.78, 0.5, 0.9, 0.62].map((h, bi) => (
                  <span key={bi} style={{ height: `${h * 100}%`, background: `linear-gradient(180deg, ${s.c}, ${s.c}44)` }} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* the journey map — stations along a path */}
      <div className="jmap-map">
        <div className="jmap-map__cur font-mono">
          <span style={{ color: s.c }}>{s.n}</span><span className="jmap-map__sep">/{String(n).padStart(2, '0')}</span>{s.k}
        </div>
        <div className="jmap-rail">
          <div className="jmap-rail__track">
            <motion.div className="jmap-rail__fill" animate={{ scaleX: frac }} transition={{ type: 'spring', stiffness: 130, damping: 26 }} />
          </div>
          <div className="jmap-rail__nodes">
            {steps.map((st, i) => {
              const on = i === active; const done = i < active;
              return (
                <button key={st.k} aria-label={`Go to ${st.k}`} onClick={() => go(i)} className="pressable jmap-node" data-on={on ? 'true' : 'false'}
                  style={{ ['--sc' as string]: st.c } as React.CSSProperties} title={st.k}>
                  <span className="jmap-node__dot" data-state={on ? 'on' : done ? 'done' : 'off'} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3" style={{ marginTop: 20 }}>
        <button aria-label="Previous" onClick={() => go(active - 1)} disabled={active === 0} className="pressable jmap-arrow"><span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={16} /></span></button>
        <button aria-label="Next" onClick={() => go(active + 1)} disabled={active === n - 1} className="pressable jmap-arrow"><IconArrow size={16} /></button>
      </div>
    </div>
  );
}
