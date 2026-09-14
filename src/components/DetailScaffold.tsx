import { useEffect } from 'react';
import type { ReactNode } from 'react';
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
  backTo: string;
  backLabel: string;
  accent?: string;
  glyph?: ReactNode;
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
    <div style={{ paddingTop: 100, paddingBottom: 84 }}>
      <Container style={{ maxWidth: 880 }}>
        <motion.button onClick={() => navigate(p.backTo)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pressable detail-back font-mono">
          <span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={13} /></span> {p.backLabel}
        </motion.button>

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } }} style={{ marginTop: 20, position: 'relative' }}>
          {p.glyph && <div aria-hidden className="detail-glyph" style={{ color: accent }}>{p.glyph}</div>}

          <motion.div variants={rise} className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <Kicker>{p.kicker}</Kicker>
            {p.status && <StatusPill label={p.status} tone={p.statusTone ?? 'mute'} />}
          </motion.div>

          <motion.h1 variants={rise} className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.1rem,5vw,3.4rem)', color: 'var(--text-hi)', margin: '14px 0 6px', lineHeight: 1.04, letterSpacing: '-0.01em' }}>
            {p.title}{p.titleEm && <> <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>{p.titleEm}</em></>}
          </motion.h1>

          {p.pills && p.pills.length > 0 && (
            <motion.div variants={rise} className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
              {p.pills.map((x) => <span key={x} className="detail-pill font-mono">{x}</span>)}
            </motion.div>
          )}

          <motion.div variants={rise} style={{ marginTop: 26, maxWidth: 680, position: 'relative' }}>
            {p.long.map((para, i) => (
              <p key={i} className="font-display" style={{ fontSize: 15.5, lineHeight: 1.82, color: 'var(--text)', marginBottom: 16 }}>{para}</p>
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
            <motion.div variants={rise} className="flex items-center gap-3 flex-wrap" style={{ marginTop: 28 }}>
              {p.cta && (p.cta.href ? <CTA primary href={p.cta.href}>{p.cta.label}</CTA> : <CTA primary to={p.cta.to!}>{p.cta.label}</CTA>)}
              {p.secondary && <CTA to={p.secondary.to}>{p.secondary.label}</CTA>}
            </motion.div>
          )}
        </motion.div>

        <div className="detail-nav">
          {p.prev ? (
            <button className="pressable detail-nav__btn" onClick={() => navigate(p.prev!.to)} aria-label={`Previous: ${p.prev.label}`}>
              <span className="detail-nav__dir font-mono"><span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={12} /></span> Previous</span>
              <span className="detail-nav__name font-head">{p.prev.label}</span>
            </button>
          ) : <span />}
          {p.next ? (
            <button className="pressable detail-nav__btn detail-nav__btn--next" onClick={() => navigate(p.next!.to)} aria-label={`Next: ${p.next.label}`}>
              <span className="detail-nav__dir font-mono">Next <IconArrow size={12} /></span>
              <span className="detail-nav__name font-head">{p.next.label}</span>
            </button>
          ) : <span />}
        </div>

        {/* branding — a slight, tasteful touch at the foot of every detail page */}
        <div className="detail-brand">
          <span className="detail-brand__mark" aria-hidden><Compass size={22} color="#E4C877" /></span>
          <span className="detail-brand__text font-mono">Prosper · The Performance Market for Liquid Alpha</span>
          <a href={OFFICIAL_LINKS.pharosSite} target="_blank" rel="noopener noreferrer" className="detail-brand__pharos font-mono">Built on Pharos ↗</a>
        </div>
      </Container>
    </div>
  );
}
