import type { ZoneIcon } from '@/data/ecosystem';

const S = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/**
 * Zone emblems — crafted duotone medallions rather than flat outlines. Each layers a
 * translucent fill (currentColor) under crisp strokes and a bright accent detail, so the
 * mark reads with depth and mint even at ~15px. Colour comes from the node (currentColor).
 */
export function ZoneGlyph({ icon, size = 18 }: { icon: ZoneIcon; size?: number }) {
  const P = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
  } as const;
  switch (icon) {
    // Curator — an engraved profile medallion: framing ring, shoulders, poised head.
    case 'curator':
      return (
        <svg {...P}>
          <circle cx="12" cy="12" r="9.4" strokeWidth="0.85" opacity="0.28" />
          <path d="M5.7 18.6a6.4 6.4 0 0 1 12.6 0" fill="currentColor" fillOpacity="0.14" />
          <path d="M5.7 18.6a6.4 6.4 0 0 1 12.6 0" />
          <circle cx="12" cy="8.6" r="3.1" fill="currentColor" fillOpacity="0.2" />
          <circle cx="12" cy="8.6" r="3.1" />
        </svg>
      );
    // Strategy — an ascent: a faceted peak with strata and a summit ridge (a thesis climbing).
    case 'strategy':
      return (
        <svg {...P}>
          <path d="M12 3.4 20.4 19.6 3.6 19.6 Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M12 3.4 20.4 19.6 3.6 19.6 Z" />
          <path d="M12 3.4 12 19.6" opacity="0.45" strokeWidth="1" />
          <path d="M12 11.4 16.2 19.6 M12 11.4 7.8 19.6" opacity="0.3" strokeWidth="1" />
          <path d="M9.2 15.4 14.8 15.4" opacity="0.4" strokeWidth="1" />
        </svg>
      );
    // Vault — a real safe: framed door, combination dial with pointer, top bolts.
    case 'vault':
      return (
        <svg {...P}>
          <rect x="3.6" y="4.6" width="16.8" height="14.8" rx="2.2" fill="currentColor" fillOpacity="0.1" />
          <rect x="3.6" y="4.6" width="16.8" height="14.8" rx="2.2" />
          <rect x="6.2" y="7.2" width="11.6" height="9.6" rx="1.3" opacity="0.5" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.7" />
          <path d="M12 9.5v2.5l1.9 1.1" strokeWidth="1.1" />
          <path d="M9.4 5.7V4.4 M14.6 5.7V4.4" opacity="0.55" strokeWidth="1" />
        </svg>
      );
    // Track record — a verifiable record: concentric grooves with a progress tick.
    case 'track':
      return (
        <svg {...P}>
          <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.08" />
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5.9" opacity="0.42" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.9" opacity="0.6" strokeWidth="1" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          <path d="M12 3 12 5.6" strokeWidth="1.3" />
        </svg>
      );
    // p{VAULT} — a struck coin: faceted rhombus with mint facets and a set stone.
    case 'pvault':
      return (
        <svg {...P}>
          <path d="M12 2.6 21.4 12 12 21.4 2.6 12 Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M12 2.6 21.4 12 12 21.4 2.6 12 Z" />
          <path d="M12 7 17 12 12 17 7 12 Z" opacity="0.55" strokeWidth="1" />
          <path d="M12 2.6 12 7 M12 17 12 21.4 M2.6 12 7 12 M17 12 21.4 12" opacity="0.32" strokeWidth="1" />
          <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    // Performance market — a live market: candlesticks with wicks over a trend line.
    case 'market':
      return (
        <svg {...P}>
          <path d="M3.6 20.4 20.4 20.4" opacity="0.35" strokeWidth="1" />
          <path d="M7 8.6 7 16.4" strokeWidth="1" />
          <rect x="5.7" y="10.4" width="2.6" height="4" rx="0.5" fill="currentColor" fillOpacity="0.16" />
          <rect x="5.7" y="10.4" width="2.6" height="4" rx="0.5" strokeWidth="1.1" />
          <path d="M12 5.6 12 15" strokeWidth="1" />
          <rect x="10.7" y="7.6" width="2.6" height="5" rx="0.5" fill="currentColor" fillOpacity="0.16" />
          <rect x="10.7" y="7.6" width="2.6" height="5" rx="0.5" strokeWidth="1.1" />
          <path d="M17 4.2 17 13" strokeWidth="1" />
          <rect x="15.7" y="6" width="2.6" height="4.6" rx="0.5" fill="currentColor" fillOpacity="0.16" />
          <rect x="15.7" y="6" width="2.6" height="4.6" rx="0.5" strokeWidth="1.1" />
          <path d="M5.6 15.2 10 11.4 14.6 12.4 19 6.8" strokeWidth="1.2" opacity="0.7" />
        </svg>
      );
  }
}

export const IconWallet = ({ size = 15 }: { size?: number }) => (
  <S size={size}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 9h18M16.5 13h1.5" />
  </S>
);
export const IconMenu = ({ size = 16 }: { size?: number }) => (
  <S size={size}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </S>
);
export const IconArrow = ({ size = 14 }: { size?: number }) => (
  <S size={size}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </S>
);
export const IconChevron = ({ size = 16 }: { size?: number }) => (
  <S size={size}>
    <path d="M6 9l6 6 6-6" />
  </S>
);
export const IconMouse = ({ size = 16 }: { size?: number }) => (
  <S size={size}>
    <rect x="7" y="3.5" width="10" height="17" rx="5" />
    <path d="M12 7v3" />
  </S>
);
export const IconSoundOn = ({ size = 15 }: { size?: number }) => (
  <S size={size}>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" />
  </S>
);
export const IconSoundOff = ({ size = 15 }: { size?: number }) => (
  <S size={size}>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" />
    <path d="M17 10l4 4M21 10l-4 4" />
  </S>
);
export const IconModeSimple = ({ size = 15 }: { size?: number }) => (
  <S size={size}>
    <circle cx="12" cy="6" r="2.4" />
    <path d="M12 8.4V12M12 12l-5 6M12 12l5 6" />
  </S>
);
export const IconModeDetailed = ({ size = 15 }: { size?: number }) => (
  <S size={size}>
    <rect x="3.5" y="4" width="7" height="7" rx="1" />
    <rect x="13.5" y="4" width="7" height="7" rx="1" />
    <rect x="3.5" y="13" width="7" height="7" rx="1" />
    <rect x="13.5" y="13" width="7" height="7" rx="1" />
  </S>
);
export const IconModeCinematic = ({ size = 15 }: { size?: number }) => (
  <S size={size}>
    <path d="M8 6l-4 6 4 6M16 6l4 6-4 6" />
  </S>
);

export const IconChat = ({ size = 16 }: { size?: number }) => (
  <S size={size}>
    <path d="M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 4v-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
  </S>
);
export const IconClose = ({ size = 16 }: { size?: number }) => (
  <S size={size}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
);
export const IconSearch = ({ size = 15 }: { size?: number }) => (
  <S size={size}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </S>
);
export const IconSettings = ({ size = 15 }: { size?: number }) => (
  <S size={size}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.2" />
    <circle cx="9" cy="17" r="2.2" />
  </S>
);

/** Prosper compass / star emblem — used in the brand mark. */
export const Compass = ({ size = 26, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="18" stroke={color} strokeWidth="1" opacity="0.5" />
    <path d="M20 3 L23 17 L37 20 L23 23 L20 37 L17 23 L3 20 L17 17 Z" fill={color} opacity="0.9" />
    <path d="M20 9 L22 18 L31 20 L22 22 L20 31 L18 22 L9 20 L18 18 Z" fill="#101113" opacity="0.35" />
  </svg>
);
