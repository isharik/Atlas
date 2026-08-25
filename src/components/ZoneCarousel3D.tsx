import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/audio/AudioProvider';
import { ZoneGlyph, IconArrow } from './ui/icons';
import type { ZoneMeta } from '@/data/ecosystem';

const spring = { type: 'spring' as const, stiffness: 220, damping: 30, mass: 0.9 };

/** Coverflow transform for a card at signed distance `d` from centre. */
function slot(d: number) {
  const ad = Math.abs(d);
  const cap = Math.min(ad, 2.4);
  return {
    x: d * 268,
    z: -cap * 190,
    rotateY: -Math.sign(d) * Math.min(ad, 2) * 30,
    scale: Math.max(0.72, 1 - ad * 0.13),
    opacity: ad > 2.15 ? 0 : 1 - Math.min(ad, 2) * 0.26,
    zIndex: 100 - Math.round(ad * 10),
    blur: ad < 0.5 ? 0 : Math.min(ad * 1.6, 4.5),
  };
}

export function ZoneCarousel3D({ zones }: { zones: ZoneMeta[] }) {
  const navigate = useNavigate();
  const { click } = useAudio();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const n = zones.length;

  const go = useCallback((next: number) => {
    setActive((prev) => {
      const t = Math.max(0, Math.min(n - 1, next));
      if (t !== prev) click();
      return t;
    });
  }, [n, click]);

  const open = (z: ZoneMeta) => { click(); navigate(`/zone/${z.id}`); };

  // keyboard arrows
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
      else if (e.key === 'Enter') { e.preventDefault(); open(zones[active]); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [active, go, zones]);

  // drag → momentum projection (Apple §6): project the resting slot from release velocity
  const onDragEnd = (_e: unknown, info: PanInfo) => {
    const projected = info.offset.x + info.velocity.x * 0.14;
    const steps = Math.round(-projected / 268);
    go(active + steps);
  };

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="listbox"
      aria-label="Prosper ecosystem — use arrow keys, drag, or click a card"
      style={{ outline: 'none', position: 'relative' }}
    >
      {/* 3D stage */}
      <div style={{ position: 'relative', height: 380, perspective: 1600, perspectiveOrigin: '50% 45%' }}>
        <motion.div
          drag="x"
          dragElastic={0.12}
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={onDragEnd}
          whileTap={{ cursor: 'grabbing' }}
          style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', cursor: 'grab' }}
        >
          {zones.map((z, i) => {
            const s = reduce
              ? { x: (i - active) * 268, z: 0, rotateY: 0, scale: i === active ? 1 : 0.82, opacity: Math.abs(i - active) > 2.15 ? 0 : 1 - Math.min(Math.abs(i - active), 2) * 0.26, zIndex: 100 - Math.abs(i - active), blur: 0 }
              : slot(i - active);
            const isCenter = i === active;
            return (
              <motion.button
                key={z.id}
                role="option"
                aria-selected={isCenter}
                aria-label={isCenter ? `Open ${z.label}` : `Focus ${z.label}`}
                onClick={() => (isCenter ? open(z) : go(i))}
                animate={{ x: s.x, z: s.z, rotateY: s.rotateY, scale: s.scale, opacity: s.opacity, filter: `blur(${s.blur}px)` }}
                transition={reduce ? { duration: 0.2 } : spring}
                style={{
                  position: 'absolute', top: '50%', left: '50%', width: 300, height: 320,
                  marginLeft: -150, marginTop: -160, zIndex: s.zIndex,
                  transformStyle: 'preserve-3d', transformOrigin: '50% 50%',
                  cursor: isCenter ? 'pointer' : 'pointer',
                  pointerEvents: s.opacity < 0.15 ? 'none' : 'auto',
                  border: 'none', background: 'transparent', padding: 0, textAlign: 'left',
                }}
              >
                <div
                  style={{
                    position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 14,
                    padding: 26, borderRadius: 18, overflow: 'hidden',
                    border: `1px solid ${isCenter ? `${z.color}66` : 'var(--border)'}`,
                    background: 'linear-gradient(180deg, rgba(12,19,14,0.82), rgba(13,19,16,0.9))',
                    boxShadow: isCenter
                      ? `0 30px 80px -20px ${z.color}44, inset 0 1px 0 rgba(255,255,255,0.05)`
                      : '0 20px 50px -30px rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    transition: 'border-color 240ms ease, box-shadow 240ms ease',
                  }}
                >
                  {/* accent wash for the active card */}
                  <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 90% at 50% 0%, ${z.color}${isCenter ? '1f' : '00'}, transparent 60%)`, transition: 'background 240ms ease', pointerEvents: 'none' }} />
                  <div className="flex items-center justify-between" style={{ position: 'relative' }}>
                    <span style={{ width: 48, height: 48, borderRadius: 13, display: 'grid', placeItems: 'center', border: `1px solid ${z.color}`, color: z.color, boxShadow: `0 0 20px ${z.color}22 inset` }}>
                      <ZoneGlyph icon={z.icon} size={23} />
                    </span>
                    <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--mist)' }}>{z.glyph}</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div className="font-head" style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-hi)', letterSpacing: '0.01em' }}>{z.label}</div>
                    <div className="font-display" style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--mist)', marginTop: 8 }}>{z.simple}</div>
                  </div>
                  {isCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.35 }}
                      className="font-mono flex items-center gap-2" style={{ marginTop: 'auto', position: 'relative', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: z.color }}
                    >
                      Open <IconArrow size={13} />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* arrows */}
        <button aria-label="Previous" onClick={() => go(active - 1)} disabled={active === 0}
          className="pressable" style={arrowStyle('left', active === 0)}>
          <IconArrow size={18} />
        </button>
        <button aria-label="Next" onClick={() => go(active + 1)} disabled={active === n - 1}
          className="pressable" style={arrowStyle('right', active === n - 1)}>
          <IconArrow size={18} />
        </button>
      </div>

      {/* dots */}
      <div className="flex items-center justify-center gap-2.5" style={{ marginTop: 26 }}>
        {zones.map((z, i) => {
          const on = i === active;
          return (
            <button key={z.id} aria-label={`Go to ${z.label}`} onClick={() => go(i)} className="pressable"
              style={{ height: 6, width: on ? 26 : 6, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
                background: on ? z.color : 'rgba(198,210,202,0.3)', boxShadow: on ? `0 0 10px ${z.color}88` : 'none',
                transition: 'width 260ms cubic-bezier(0.23,1,0.32,1), background 200ms ease, box-shadow 200ms ease' }} />
          );
        })}
      </div>
    </div>
  );
}

function arrowStyle(side: 'left' | 'right', disabled: boolean): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', [side]: 0, transform: `translateY(-50%) ${side === 'left' ? 'scaleX(-1)' : ''}`,
    zIndex: 200, width: 44, height: 44, borderRadius: 999, display: 'grid', placeItems: 'center',
    background: 'rgba(15,22,18,0.7)', border: '1px solid var(--border-strong)', color: 'var(--text)',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.28 : 1,
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    transition: 'opacity 200ms ease, transform 200ms ease',
  };
}
