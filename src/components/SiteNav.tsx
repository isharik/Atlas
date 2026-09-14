import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAudio } from '@/audio/AudioProvider';
import { SoundControl } from './SoundControl';
import { Wordmark } from './Wordmark';
import { Compass, IconSearch, IconChevron } from './ui/icons';

interface NavItem { label: string; to: string }
interface NavGroup { label: string; to?: string; items?: NavItem[] }

// Grouped navigation — categories keep the bar uncluttered.
const NAV: NavGroup[] = [
  { label: 'Explore', items: [{ label: 'Ecosystem', to: '/ecosystem' }, { label: 'Journey', to: '/journey' }, { label: 'Pharos', to: '/pharos' }] },
  { label: 'Tools', items: [{ label: 'Sandbox', to: '/sandbox' }, { label: 'Studio', to: '/studio' }, { label: 'Create posts', to: '/create' }] },
  { label: 'Live', items: [{ label: 'Tracker', to: '/tracker' }, { label: 'Pulse', to: '/pulse' }, { label: 'Preview', to: '/preview' }] },
  { label: 'Community', items: [{ label: 'Participate', to: '/participate' }, { label: 'Programs', to: '/programs' }, { label: 'Professor Octo', to: '/octo' }] },
  { label: 'FAQ', to: '/faq' },
];

const matches = (pathname: string, to: string) => pathname === to || (to !== '/' && pathname.startsWith(to));
const groupActive = (pathname: string, g: NavGroup) => (g.to ? matches(pathname, g.to) : (g.items ?? []).some((i) => matches(pathname, i.to)));

export function SiteNav({ onSearch }: { onSearch: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { click } = useAudio();
  const [menu, setMenu] = useState(false);          // mobile menu
  const [openIdx, setOpenIdx] = useState<number | null>(null); // desktop dropdown
  const pointerFine = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const goto = (to: string) => { click(); setMenu(false); setOpenIdx(null); navigate(to); };

  // close everything on route change + on Escape
  useEffect(() => { setOpenIdx(null); setMenu(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpenIdx(null); setMenu(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <motion.nav
      className="absolute top-0 left-0 right-0 z-40"
      style={{ borderBottom: '1px solid var(--border)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', background: 'linear-gradient(to bottom, rgba(12,18,15,0.82), rgba(12,18,15,0.22) 72%, transparent)' }}
      initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
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

        {/* grouped links */}
        <div className="hidden lg:flex items-center gap-1.5" onMouseLeave={() => setOpenIdx(null)}>
          {NAV.map((g, i) => {
            const active = groupActive(pathname, g);
            if (g.to) {
              return (
                <button key={g.label} onClick={() => goto(g.to!)} className="pressable nav-top" data-active={active ? 'true' : 'false'}>
                  {g.label}
                </button>
              );
            }
            const isOpen = openIdx === i;
            return (
              <div key={g.label} style={{ position: 'relative' }} onMouseEnter={() => pointerFine && setOpenIdx(i)}>
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-haspopup="menu" aria-expanded={isOpen}
                  className="pressable nav-top flex items-center gap-1" data-active={active ? 'true' : 'false'} data-open={isOpen ? 'true' : 'false'}
                >
                  {g.label}
                  <span style={{ display: 'inline-flex', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms cubic-bezier(0.23,1,0.32,1)' }}><IconChevron size={11} /></span>
                </button>
                <div role="menu" className="nav-drop" data-open={isOpen ? 'true' : 'false'}>
                  {g.items!.map((it) => (
                    <button key={it.to} role="menuitem" onClick={() => goto(it.to)} className="pressable nav-drop__item" data-active={matches(pathname, it.to) ? 'true' : 'false'}>
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={() => { click(); onSearch(); }} className="pressable flex items-center gap-2" aria-label="Search"
            style={{ color: 'var(--text)', background: 'rgba(12,18,15,0.5)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 12px', cursor: 'pointer' }}>
            <IconSearch size={14} />
            <span className="hidden sm:inline font-mono" style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Search</span>
            <kbd className="hidden md:inline font-mono" style={{ fontSize: 8.5, color: 'var(--mist)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>⌘K</kbd>
          </button>
          <SoundControl />

          <button onClick={() => { click(); setMenu((o) => !o); }} className="pressable lg:hidden flex items-center justify-center"
            aria-label="Menu" aria-expanded={menu}
            style={{ width: 38, height: 38, borderRadius: 10, color: 'var(--text)', background: 'rgba(12,18,15,0.5)', border: '1px solid var(--border)', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menu ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile / tablet menu — grouped, CSS transition (no rAF needed) */}
      <div className="lg:hidden" style={{
        position: 'absolute', top: 60, left: 0, right: 0, maxHeight: 'calc(100vh - 60px)', overflowY: 'auto',
        opacity: menu ? 1 : 0, transform: menu ? 'translateY(0)' : 'translateY(-10px)', pointerEvents: menu ? 'auto' : 'none',
        transition: 'opacity 220ms cubic-bezier(0.23,1,0.32,1), transform 220ms cubic-bezier(0.23,1,0.32,1)',
        borderBottom: '1px solid var(--border)', background: 'rgba(10,15,12,0.98)',
        backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      }}>
        <div className="flex flex-col" style={{ padding: '12px 20px 20px' }}>
          {NAV.map((g) => (
            <div key={g.label} style={{ marginBottom: 6 }}>
              {g.to ? (
                <button onClick={() => goto(g.to!)} className="pressable nav-m__link" data-active={matches(pathname, g.to) ? 'true' : 'false'}>{g.label}</button>
              ) : (
                <>
                  <div className="font-mono nav-m__cat">{g.label}</div>
                  {g.items!.map((it) => (
                    <button key={it.to} onClick={() => goto(it.to)} className="pressable nav-m__link" data-active={matches(pathname, it.to) ? 'true' : 'false'}>{it.label}</button>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
