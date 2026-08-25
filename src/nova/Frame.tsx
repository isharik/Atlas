import type { ReactNode } from 'react';

/** NOVAFALL outer frame: inset border, corner brackets, and container size-lines. */
export function Frame({ children }: { children: ReactNode }) {
  const bracket = 'absolute w-5 h-5 z-50 pointer-events-none';
  const sq = 'absolute w-[7px] h-[7px] border';
  return (
    <div
      className="fixed inset-2 sm:inset-4 md:inset-6 lg:inset-8"
      style={{ border: '1px solid var(--border)', boxShadow: '0 0 80px rgba(0,0,0,0.8)' }}
    >
      {/* corner brackets */}
      <span className={bracket} style={{ top: -1, left: -1, borderTop: '2px solid var(--border-strong)', borderLeft: '2px solid var(--border-strong)' }} />
      <span className={bracket} style={{ top: -1, right: -1, borderTop: '2px solid var(--border-strong)', borderRight: '2px solid var(--border-strong)' }} />
      <span className={bracket} style={{ bottom: -1, left: -1, borderBottom: '2px solid var(--border-strong)', borderLeft: '2px solid var(--border-strong)' }} />
      <span className={bracket} style={{ bottom: -1, right: -1, borderBottom: '2px solid var(--border-strong)', borderRight: '2px solid var(--border-strong)' }} />

      {/* container size-lines + mini squares (desktop) */}
      <div className="hidden lg:block absolute top-0 bottom-0 -left-5 w-px pointer-events-none" style={{ background: 'rgba(234,230,218,0.14)' }} aria-hidden>
        <span className={sq} style={{ left: -3, top: 0, borderColor: 'var(--border-strong)', background: 'var(--bg)' }} />
        <span className={sq} style={{ left: -3, bottom: 0, borderColor: 'var(--border-strong)', background: 'var(--bg)' }} />
        <span className={sq} style={{ left: -3, top: '50%', borderColor: 'var(--border-strong)', background: 'var(--bg)' }} />
      </div>
      <div className="hidden lg:block absolute top-0 bottom-0 -right-5 w-px pointer-events-none" style={{ background: 'rgba(234,230,218,0.14)' }} aria-hidden>
        <span className={sq} style={{ right: -3, top: 0, borderColor: 'var(--border-strong)', background: 'var(--bg)' }} />
        <span className={sq} style={{ right: -3, bottom: 0, borderColor: 'var(--border-strong)', background: 'var(--bg)' }} />
        <span className={sq} style={{ right: -3, top: '50%', borderColor: 'var(--border-strong)', background: 'var(--bg)' }} />
      </div>

      {children}
    </div>
  );
}
