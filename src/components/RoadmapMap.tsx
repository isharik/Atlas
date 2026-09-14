import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { IconArrow } from './ui/icons';

export interface RoadStep { n: string; k: string; c: string; d: string }

const SPACING = 336;
const spring = { type: 'spring' as const, stiffness: 260, damping: 32, mass: 0.9 };

// Apple momentum projection (§6) — where a flick would come to rest.
function project(v: number, decel = 0.9985) { return (v / 1000) * decel / (1 - decel); }

/** Perspective "path" slot for a card at signed distance d from the active one. */
function slot(d: number, reduce: boolean) {
  const ad = Math.abs(d);
  if (reduce) return { x: d * SPACING, y: 0, z: 0, rotateY: 0, scale: ad === 0 ? 1 : 0.86, opacity: ad > 2.4 ? 0 : 1 - Math.min(ad, 2) * 0.34, blur: 0, zi: 100 - Math.round(ad) };
  return {
    x: d * SPACING,
    y: Math.min(ad, 3) * 14,               // gentle downward arc for distant stops
    z: -Math.min(ad, 3) * 180,
    rotateY: -Math.sign(d) * Math.min(ad, 2) * 26,
    scale: Math.max(0.68, 1 - ad * 0.13),
    opacity: ad > 2.6 ? 0 : 1 - Math.min(ad, 2.2) * 0.32,
    blur: ad < 0.55 ? 0 : Math.min(ad * 1.7, 5.5),
    zi: 100 - Math.round(ad * 10),
  };
}

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
    go(active + Math.round(-projected / SPACING));
  };

  const frac = n > 1 ? active / (n - 1) : 1;

  return (
    <div>
      {/* header */}
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 8px' }}>
        <span className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.5em' }}>The Prosper Journey</span>
        <h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.2rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '16px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}>
          From strategy <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>to market.</em>
        </h1>
        <p className="font-display" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--mist)' }}>
          Nine steps a private edge takes to become a transparent, investable market. Drag the path, or tap a station below.
        </p>
      </div>

      {/* filmstrip */}
      <div ref={stageRef} tabIndex={0} role="group" aria-label="Prosper journey — drag or use arrow keys" className="jmap-stage" style={{ outline: 'none' }}>
        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.14} dragMomentum={false} onDragEnd={onDragEnd}
          whileTap={{ cursor: 'grabbing' }} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', cursor: 'grab' }}>
          {steps.map((s, i) => {
            const o = slot(i - active, reduce);
            const isActive = i === active;
            return (
              <motion.button key={s.k} onClick={() => (isActive ? null : go(i))} aria-label={`${s.n} ${s.k}`} aria-current={isActive}
                animate={{ x: o.x, y: o.y, z: o.z, rotateY: o.rotateY, scale: o.scale, opacity: o.opacity, filter: `blur(${o.blur}px)` }}
                transition={reduce ? { duration: 0.2 } : spring}
                style={{ position: 'absolute', top: '50%', left: '50%', width: 440, height: 300, marginLeft: -220, marginTop: -150, zIndex: o.zi, transformStyle: 'preserve-3d', transformOrigin: '50% 50%', pointerEvents: o.opacity < 0.15 ? 'none' : 'auto', border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: isActive ? 'grab' : 'pointer' }}>
                <div className="jmap-card" data-active={isActive ? 'true' : 'false'} style={{ ['--sc' as string]: s.c } as React.CSSProperties}>
                  <div aria-hidden className="jmap-card__wash" style={{ background: `radial-gradient(120% 80% at 0% 0%, ${s.c}${isActive ? '20' : '00'}, transparent 60%)` }} />
                  <div className="flex items-center gap-3" style={{ position: 'relative' }}>
                    <span className="jmap-badge" style={{ color: s.c, borderColor: `${s.c}66`, background: `${s.c}14` }}>{s.n}</span>
                    <span style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${s.c}55, transparent)` }} />
                    <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--mist)' }}>{s.n} / {String(n).padStart(2, '0')}</span>
                  </div>
                  <div className="font-head" style={{ position: 'relative', fontSize: 'clamp(1.4rem,2.6vw,1.9rem)', fontWeight: 600, color: s.c, letterSpacing: '0.005em', marginTop: 18 }}>{s.k}</div>
                  <p className="font-display" style={{ position: 'relative', fontSize: 14, lineHeight: 1.66, color: 'var(--text)', marginTop: 10, opacity: isActive ? 1 : 0, transition: 'opacity 240ms ease' }}>{s.d}</p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* numbered progress rail */}
      <div className="jmap-rail">
        <div className="jmap-rail__track">
          <motion.div className="jmap-rail__fill" animate={{ scaleX: frac }} transition={{ type: 'spring', stiffness: 120, damping: 24 }} />
        </div>
        <div className="jmap-rail__nodes">
          {steps.map((s, i) => {
            const on = i === active; const done = i < active;
            return (
              <button key={s.k} aria-label={`Go to ${s.k}`} onClick={() => go(i)} className="pressable jmap-node" data-on={on ? 'true' : 'false'}
                style={{ ['--sc' as string]: s.c } as React.CSSProperties} title={s.k}>
                <span className="jmap-node__dot" data-state={on ? 'on' : done ? 'done' : 'off'} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3" style={{ marginTop: 22 }}>
        <button aria-label="Previous" onClick={() => go(active - 1)} disabled={active === 0} className="pressable jmap-arrow"><span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={16} /></span></button>
        <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mist)', minWidth: 120, textAlign: 'center' }}>{cur.k}</span>
        <button aria-label="Next" onClick={() => go(active + 1)} disabled={active === n - 1} className="pressable jmap-arrow"><IconArrow size={16} /></button>
      </div>
    </div>
  );
}
