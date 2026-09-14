/** Lightweight emblem marks for Program / Participate detail pages, matched by name keyword. */
export function StepGlyphFallback({ name, size = 140 }: { name: string; size?: number }) {
  const P = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const k = name.toLowerCase();

  // Ambassador — a broadcast / megaphone
  if (k.includes('ambassador')) return (
    <svg {...P}>
      <path d="M4 10 4 14 8 14 15 18 15 6 8 10 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M4 10 4 14 8 14 15 18 15 6 8 10 Z" />
      <path d="M18 8.5a4 4 0 0 1 0 7" opacity="0.6" />
      <path d="M20 6a7 7 0 0 1 0 12" opacity="0.35" />
    </svg>
  );
  // Scholar — a mortarboard / learning
  if (k.includes('scholar')) return (
    <svg {...P}>
      <path d="M3 9 12 5 21 9 12 13 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M3 9 12 5 21 9 12 13 Z" />
      <path d="M7 11v4c0 1.2 2.2 2.4 5 2.4s5-1.2 5-2.4v-4" opacity="0.55" />
      <path d="M21 9v4" opacity="0.5" />
    </svg>
  );
  // Curator (cohort / figure) — an accountable figure medallion
  if (k.includes('curator')) return (
    <svg {...P}>
      <circle cx="12" cy="12" r="9.2" strokeWidth="0.85" opacity="0.28" />
      <path d="M5.7 18.6a6.4 6.4 0 0 1 12.6 0" fill="currentColor" fillOpacity="0.12" />
      <path d="M5.7 18.6a6.4 6.4 0 0 1 12.6 0" />
      <circle cx="12" cy="8.6" r="3.1" fill="currentColor" fillOpacity="0.18" /><circle cx="12" cy="8.6" r="3.1" />
    </svg>
  );
  // Asset issuers — a minted token / asset
  if (k.includes('issuer') || k.includes('asset')) return (
    <svg {...P}>
      <circle cx="12" cy="12" r="8.4" fill="currentColor" fillOpacity="0.1" /><circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.4 15.4 12 12 16.6 8.6 12 Z" opacity="0.6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
  // Investors — growth / returns
  if (k.includes('investor')) return (
    <svg {...P}>
      <path d="M3.6 20 20.4 20" opacity="0.4" />
      <path d="M5 15 10 11 13 13 19 6.5" />
      <path d="M19 6.5 15 6.5 M19 6.5 19 10.5" opacity="0.6" />
    </svg>
  );
  // Traders — candlesticks
  if (k.includes('trader')) return (
    <svg {...P}>
      <path d="M3.6 20.4 20.4 20.4" opacity="0.35" />
      <path d="M7 8.6 7 16.4" /><rect x="5.7" y="10.4" width="2.6" height="4" rx="0.5" fill="currentColor" fillOpacity="0.14" />
      <path d="M12 5.6 12 15" /><rect x="10.7" y="7.6" width="2.6" height="5" rx="0.5" fill="currentColor" fillOpacity="0.14" />
      <path d="M17 4.2 17 13" /><rect x="15.7" y="6" width="2.6" height="4.6" rx="0.5" fill="currentColor" fillOpacity="0.14" />
    </svg>
  );
  // default — a compass star
  return (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" strokeWidth="0.85" opacity="0.28" />
      <path d="M12 3 13.6 10.4 21 12 13.6 13.6 12 21 10.4 13.6 3 12 10.4 10.4 Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 3 13.6 10.4 21 12 13.6 13.6 12 21 10.4 13.6 3 12 10.4 10.4 Z" />
    </svg>
  );
}
