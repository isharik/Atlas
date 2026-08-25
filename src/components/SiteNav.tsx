import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAudio } from '@/audio/AudioProvider';
import { SoundControl } from './SoundControl';
import { Wordmark } from './Wordmark';
import { Compass, IconSearch } from './ui/icons';

const LINKS = [
  { label: 'Ecosystem', to: '/ecosystem' },
  { label: 'Participate', to: '/participate' },
  { label: 'Programs', to: '/programs' },
  { label: 'Journey', to: '/journey' },
  { label: 'Sandbox', to: '/sandbox' },
  { label: 'Studio', to: '/studio' },
  { label: 'Tracker', to: '/tracker' },
  { label: 'Pulse', to: '/pulse' },
  { label: 'Pharos', to: '/pharos' },
  { label: 'FAQ', to: '/faq' },
];

const isActive = (pathname: string, to: string) => pathname === to || (to !== '/' && pathname.startsWith(to));

export function SiteNav({ onSearch }: { onSearch: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { click } = useAudio();
  const [open, setOpen] = useState(false);

  const goto = (to: string) => { click(); setOpen(false); navigate(to); };

  return (
    <motion.nav
      className="absolute top-0 left-0 right-0 z-40"
      style={{ borderBottom: '1px solid var(--border)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', background: 'linear-gradient(to bottom, rgba(12,18,15,0.78), rgba(12,18,15,0.2) 72%, transparent)' }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between px-5 sm:px-10" style={{ height: 60 }}>
        <button onClick={() => goto('/')} className="pressable flex items-center gap-2.5" style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Prosper home">
          <span className="clip-badge flex items-center justify-center" style={{ width: 34, height: 34, border: '1px solid var(--border-strong)' }}>
            <Compass size={18} color="#E4C877" />
          </span>
          <span style={{ textAlign: 'left', lineHeight: 1 }}>
            <Wordmark size={18} letterSpacing="0.12em" />
            <span className="font-mono" style={{ display: 'block', fontSize: 7.5, color: 'var(--mist)', letterSpacing: '0.4em', marginTop: 3 }}>ATLAS</span>
          </span>
        </button>

        {/* inline links — full set on wide screens */}
        <div className="hidden 2xl:flex flex-1 items-center justify-center gap-4" style={{ margin: '0 14px', minWidth: 0 }}>
          {LINKS.map((l) => {
            const active = isActive(pathname, l.to);
            return (
              <button
                key={l.to}
                onClick={() => goto(l.to)}
                className="pressable"
                style={{ position: 'relative', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: active ? 'var(--primary)' : 'var(--text)', background: 'none', border: 'none', padding: '8px 2px', cursor: 'pointer' }}
              >
                {l.label}
                {active && (
                  <motion.span layoutId="nav-underline" style={{ position: 'absolute', left: '12%', right: '12%', bottom: -2, height: 1.5, borderRadius: 2, background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', boxShadow: '0 0 6px rgba(228,200,119,0.5)' }} transition={{ type: 'spring', duration: 0.45, bounce: 0.12 }} />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { click(); onSearch(); }}
            className="pressable flex items-center gap-2"
            aria-label="Search"
            style={{ color: 'var(--text)', background: 'rgba(12,18,15,0.5)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 12px', cursor: 'pointer' }}
          >
            <IconSearch size={14} />
            <span className="hidden sm:inline font-mono" style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Search</span>
            <kbd className="hidden md:inline font-mono" style={{ fontSize: 8.5, color: 'var(--mist)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>⌘K</kbd>
          </button>
          <SoundControl />

          {/* menu toggle — everything below xl */}
          <button
            onClick={() => { click(); setOpen((o) => !o); }}
            className="pressable 2xl:hidden flex items-center justify-center"
            aria-label="Menu" aria-expanded={open}
            style={{ width: 38, height: 38, borderRadius: 10, color: 'var(--text)', background: 'rgba(12,18,15,0.5)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open
                ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>
                : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile / tablet dropdown — CSS transition (works without rAF) */}
      <div
        className="2xl:hidden"
        style={{
          position: 'absolute', top: 60, left: 0, right: 0,
          opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(-10px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 220ms cubic-bezier(0.23,1,0.32,1), transform 220ms cubic-bezier(0.23,1,0.32,1)',
          borderBottom: '1px solid var(--border)', background: 'rgba(10,15,12,0.97)',
          backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        }}
      >
        <div className="flex flex-col" style={{ padding: '10px 20px 18px' }}>
          {LINKS.map((l) => {
            const active = isActive(pathname, l.to);
            return (
              <button key={l.to} onClick={() => goto(l.to)} className="pressable"
                style={{ textAlign: 'left', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: active ? 'var(--primary)' : 'var(--text)', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', padding: '14px 4px', cursor: 'pointer' }}>
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

export { LINKS };
