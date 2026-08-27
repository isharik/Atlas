import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Frame } from '@/nova/Frame';
import { FogCanvas } from '@/nova/FogCanvas';
import { ScrollerCtx } from '@/nova/scroll';
import { SiteNav } from './SiteNav';
import { SearchOverlay } from './SearchOverlay';
import { ChatPanel } from './ChatPanel';
import { OFFICIAL_LINKS } from '@/data/ecosystem';

function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono" style={{ padding: '26px 24px 96px', borderTop: '1px solid var(--border)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.5)' }}>
      <span>© 2026 Prosper Atlas · Community-built</span>
      <span className="hidden sm:inline">Not an official Prosper product</span>
      <span className="flex items-center gap-4">
        <a href={OFFICIAL_LINKS.prosperSite} target="_blank" rel="noreferrer" className="hover-gold" style={{ color: 'inherit', textDecoration: 'none' }}>Prosper ↗</a>
        <a href={OFFICIAL_LINKS.prosperX} target="_blank" rel="noreferrer" className="hover-gold" style={{ color: 'inherit', textDecoration: 'none' }}>X ↗</a>
        <a href={OFFICIAL_LINKS.pharosSite} target="_blank" rel="noreferrer" className="hover-gold" style={{ color: 'inherit', textDecoration: 'none' }}>Pharos ↗</a>
      </span>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // reset scroll on navigation
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // ⌘K / Ctrl+K search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <ScrollerCtx.Provider value={scrollRef}>
      {/* persistent atmospheric background (continuity across pages) */}
      <div className="fixed inset-0" style={{ zIndex: 0 }} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(53,207,155,0.10), transparent 58%)' }} />
        <FogCanvas className="absolute inset-0 w-full h-full" style={{ mixBlendMode: 'screen', opacity: 0.1 }} />
        {/* subtle vignette for depth — keeps the frame cinematic without new graphics */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(135% 115% at 50% 32%, transparent 64%, rgba(0,0,0,0.30) 100%)' }} />
      </div>

      <Frame>
        <SiteNav onSearch={() => setSearchOpen(true)} />
        <main
          ref={scrollRef}
          className="hide-scroll h-full overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          {children}
          <Footer />
        </main>
      </Frame>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ChatPanel />
    </ScrollerCtx.Provider>
  );
}
