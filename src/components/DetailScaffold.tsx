import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Container, Kicker, CTA, StatusPill } from '@/components/PageBits';
import { IconArrow, Compass } from '@/components/ui/icons';
import { OFFICIAL_LINKS } from '@/data/ecosystem';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 20, filter: 'blur(5px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } } };

export interface DetailNav { to: string; label: string }
export interface DetailProps {
  kicker: string;
  title: string;
  titleEm?: string;
  status?: string;
  statusTone?: 'emerald' | 'mute';
  pills?: string[];
  long: string[];
  points?: { k: string; v: string }[];
  cta?: { label: string; href?: string; to?: string };
  secondary?: { label: string; to: string };
  prev?: DetailNav;
  next?: DetailNav;
  siblings?: DetailNav[];
  currentTo?: string;
  backTo: string;
  backLabel: string;
  accent?: string;
  glyph?: ReactNode;
  extra?: ReactNode;
}

export function DetailScaffold(p: DetailProps) {
  const navigate = useNavigate();
  const accent = p.accent ?? 'var(--primary)';

  // arrow keys move between siblings — fast, keyboard-friendly navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && p.prev) navigate(p.prev.to);
      else if (e.key === 'ArrowRight' && p.next) navigate(p.next.to);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, p.prev, p.next]);

  return (
    <div style={{ paddingTop: 80, paddingBottom: 56 }}>
      <Container style={{ maxWidth: 880 }}>
        <motion.button onClick={() => navigate(p.backTo)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pressable detail-back font-mono">
          <span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={13} /></span> {p.backLabel}
        </motion.button>

        {/* navigator — jump straight between siblings, no card grid */}
        {p.siblings && p.siblings.length > 1 && (
          <div className="detail-tabs" role="tablist" aria-label="Browse">
            {p.siblings.map((s) => (
              <button key={s.to} role="tab" aria-selected={s.to === p.currentTo} onClick={() => navigate(s.to)}
                className="pressable detail-tab" data-on={s.to === p.currentTo ? 'true' : 'false'}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } }} style={{ marginTop: 20, position: 'relative' }}>
          {p.glyph && <div aria-hidden className="detail-glyph" style={{ color: accent }}>{p.glyph}</div>}

          <motion.div variants={rise} className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <Kicker>{p.kicker}</Kicker>
            {p.status && <StatusPill label={p.status} tone={p.statusTone ?? 'mute'} />}
          </motion.div>

          <motion.h1 variants={rise} className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(1.9rem,4.4vw,3rem)', color: 'var(--text-hi)', margin: '10px 0 4px', lineHeight: 1.04, letterSpacing: '-0.01em' }}>
            {p.title}{p.titleEm && <> <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>{p.titleEm}</em></>}
          </motion.h1>

          {p.pills && p.pills.length > 0 && (
            <motion.div variants={rise} className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
              {p.pills.map((x) => <span key={x} className="detail-pill font-mono">{x}</span>)}
            </motion.div>
          )}

          <motion.div variants={rise} style={{ marginTop: 18, maxWidth: 700, position: 'relative' }}>
            {p.long.map((para, i) => (
              <p key={i} className="font-display" style={{ fontSize: 14.5, lineHeight: 1.72, color: 'var(--text)', marginBottom: 12 }}>{para}</p>
            ))}
          </motion.div>

          {p.points && p.points.length > 0 && (
            <motion.div variants={rise} className="detail-facts">
              {p.points.map((pt) => (
                <div key={pt.k} className="detail-fact">
                  <div className="font-mono detail-fact__k">{pt.k}</div>
                  <div className="font-display detail-fact__v">{pt.v}</div>
                </div>
              ))}
            </motion.div>
          )}

          {(p.cta || p.secondary) && (
            <motion.div variants={rise} className="flex items-center gap-3 flex-wrap" style={{ marginTop: 20 }}>
              {p.cta && (p.cta.href ? <CTA primary href={p.cta.href}>{p.cta.label}</CTA> : <CTA primary to={p.cta.to!}>{p.cta.label}</CTA>)}
              {p.secondary && <CTA to={p.secondary.to}>{p.secondary.label}</CTA>}
            </motion.div>
          )}
        </motion.div>

        {p.extra}

        {/* branding — a slight, tasteful touch at the foot of every detail page */}
        <div className="detail-brand">
          <span className="detail-brand__mark" aria-hidden><Compass size={22} color="#E4C877" /></span>
          <span className="detail-brand__text font-mono">Prosper · The Performance Market for Liquid Alpha</span>
          <a href={OFFICIAL_LINKS.pharosSite} target="_blank" rel="noopener noreferrer" className="detail-brand__pharos font-mono">Built on Pharos ↗</a>
        </div>
      </Container>

      {/* icon-only prev / next pinned to the viewport sides — portalled out of the page-transition
          wrapper so position:fixed anchors to the viewport (a transformed ancestor would break it) */}
      {createPortal(
        <>
          {p.prev && (
            <button className="pressable detail-side detail-side--prev" onClick={() => navigate(p.prev!.to)} title={`Previous · ${p.prev.label}`} aria-label={`Previous: ${p.prev.label}`}>
              <span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={18} /></span>
            </button>
          )}
          {p.next && (
            <button className="pressable detail-side detail-side--next" onClick={() => navigate(p.next!.to)} title={`Next · ${p.next.label}`} aria-label={`Next: ${p.next.label}`}>
              <IconArrow size={18} />
            </button>
          )}
        </>,
        document.body,
      )}
    </div>
  );
}
