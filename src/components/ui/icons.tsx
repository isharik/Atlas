import type { ZoneIcon } from '@/data/ecosystem';

const S = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export function ZoneGlyph({ icon, size = 18 }: { icon: ZoneIcon; size?: number }) {
  switch (icon) {
    case 'curator':
      return (
        <S size={size}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </S>
      );
    case 'strategy':
      return (
        <S size={size}>
          <path d="M12 4 20 19 4 19 Z" />
        </S>
      );
    case 'vault':
      return (
        <S size={size}>
          <path d="M12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 Z" />
          <path d="M12 3 12 12 20 7.5 M12 12 4 7.5 M12 12 12 21" opacity="0.6" />
        </S>
      );
    case 'track':
      return (
        <S size={size}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.6" />
          <circle cx="12" cy="12" r="0.6" fill="currentColor" />
        </S>
      );
    case 'pvault':
      return (
        <S size={size}>
          <path d="M12 3 20 12 12 21 4 12 Z" />
          <path d="M12 8.5 15.5 12 12 15.5 8.5 12 Z" opacity="0.6" />
        </S>
      );
    case 'market':
      return (
        <S size={size}>
          <path d="M4 20 20 20" />
          <rect x="5.5" y="12" width="3" height="6" rx="0.6" />
          <rect x="10.5" y="8" width="3" height="10" rx="0.6" />
          <rect x="15.5" y="4.5" width="3" height="13.5" rx="0.6" />
        </S>
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
