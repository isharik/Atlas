import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '@/audio/AudioProvider';
import { ZoneGlyph } from './ui/icons';
import type { ZoneIcon } from '@/data/ecosystem';
import { IconArrow } from './ui/icons';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];

export function Container({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <motion.p className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.5em' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
      {children}
    </motion.p>
  );
}

export function StatusPill({ label, tone = 'gold' }: { label: string; tone?: 'gold' | 'emerald' | 'mute' }) {
  const color = tone === 'emerald' ? '#38e0a0' : tone === 'mute' ? '#9fb0a6' : '#e4c877';
  const live = /live|available/i.test(label);
  return (
    <span className="font-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color, border: `1px solid ${color}55`, padding: '4px 10px', borderRadius: 999 }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: color, boxShadow: live ? `0 0 8px ${color}` : 'none' }} />
      {label}
    </span>
  );
}

/** Primary / ghost CTA — refined outlined gold with a soft glow + spring hover. */
export function CTA({ children, to, href, primary = false, onClick }: { children: ReactNode; to?: string; href?: string; primary?: boolean; onClick?: () => void }) {
  const navigate = useNavigate();
  const { click } = useAudio();
  const style: React.CSSProperties = {
    position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', gap: 12,
    padding: '15px 28px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.3em',
    textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
    color: primary ? 'var(--primary)' : 'var(--text)',
    background: primary ? 'linear-gradient(180deg, rgba(228,200,119,0.10), rgba(228,200,119,0.02))' : 'transparent',
    border: `1px solid ${primary ? 'rgba(228,200,119,0.5)' : 'var(--border-strong)'}`,
    borderRadius: 8,
    boxShadow: primary ? 'inset 0 1px 0 rgba(255,240,200,0.16), 0 10px 30px rgba(228,200,119,0.10)' : 'none',
  };
  const hover = primary
    ? { borderColor: 'rgba(228,200,119,0.85)', boxShadow: 'inset 0 1px 0 rgba(255,240,200,0.22), 0 14px 40px rgba(228,200,119,0.22)' }
    : { borderColor: 'rgba(228,200,119,0.55)', color: 'var(--primary)' };
  const go = () => { click(); onClick?.(); if (to) navigate(to); };
  const inner = (
    <>
      {/* soft light sweep on hover */}
      {primary && <motion.span aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 30%, rgba(255,240,200,0.14) 50%, transparent 70%)' }} initial={{ x: '-120%' }} whileHover={{ x: '120%' }} transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }} />}
      <span style={{ position: 'relative' }}>{children}</span>
      <motion.span style={{ position: 'relative', display: 'inline-flex' }} variants={{ rest: { x: 0 }, hovered: { x: 3 } }}><IconArrow size={15} /></motion.span>
    </>
  );
  const common = { className: 'pressable', style, initial: 'rest', whileHover: 'hovered', whileTap: { scale: 0.985 }, transition: { type: 'spring' as const, bounce: 0.2, duration: 0.4 }, variants: { rest: { scale: 1 }, hovered: { scale: 1.015, ...hover } } };
  if (href) return <motion.a {...common} href={href} target="_blank" rel="noreferrer" onClick={() => click()}>{inner}</motion.a>;
  return <motion.button {...common} onClick={go}>{inner}</motion.button>;
}

/**
 * Custom, per-zone hero art (generative — no external assets). A large emblem built
 * from the zone's glyph over concentric rings + a radial burst, tinted the zone color.
 */
export function ZoneEmblem({ icon, color, seed = 0, size = 320 }: { icon: ZoneIcon; color: string; seed?: number; size?: number }) {
  const rays = Array.from({ length: 48 }, (_, i) => i);
  return (
    <motion.div
      style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, ease }}
    >
      <motion.div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 50% 50%, ${color}26, transparent 62%)` }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1.04, 0.98] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} />
      <motion.svg viewBox="0 0 200 200" width="100%" height="100%" style={{ position: 'absolute', inset: 0, transformOrigin: '50% 50%' }} aria-hidden
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 80, ease: 'linear' }}>
        <g>
          {rays.map((i) => {
            const a = (i / rays.length) * Math.PI * 2 + seed;
            const r1 = 62 + ((i * 7 + seed * 13) % 11);
            const r2 = 92 + ((i * 5) % 8);
            return (
              <line key={i} x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1} x2={100 + Math.cos(a) * r2} y2={100 + Math.sin(a) * r2} stroke={color} strokeWidth={0.5} opacity={0.22 + ((i * 3) % 5) * 0.05} />
            );
          })}
        </g>
        <circle cx="100" cy="100" r="58" fill="none" stroke={color} strokeWidth="0.6" opacity="0.5" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={color} strokeWidth="0.4" opacity="0.25" strokeDasharray="1 3" />
        <circle cx="100" cy="100" r="46" fill="#0b120d" stroke={color} strokeWidth="0.8" opacity="0.9" />
      </motion.svg>
      <span style={{ position: 'relative', color }}>
        <ZoneGlyph icon={icon} size={Math.round(size * 0.18)} />
      </span>
    </motion.div>
  );
}
