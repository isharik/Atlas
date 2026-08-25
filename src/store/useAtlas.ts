import { create } from 'zustand';

export type Phase = 'loading' | 'opening' | 'atlas' | 'zone' | 'journey' | 'flow';

/** The six canonical zones of the Prosper ecosystem, in conceptual flow order. */
export type ZoneId =
  | 'curators'
  | 'strategies'
  | 'vaults'
  | 'track-record'
  | 'pvault'
  | 'performance-market';

export type LensMode = 'simple' | 'detailed';
export type Quality = 'cinematic' | 'performance';
/** The reference's single 3-way control. Drives content density (lens) + render richness. */
export type VisualMode = 'simple' | 'detailed' | 'cinematic';

interface AtlasState {
  phase: Phase;
  activeZone: ZoneId | null;
  hoverZone: ZoneId | null;
  lens: LensMode;
  quality: Quality;
  visualMode: VisualMode;
  reducedMotion: boolean;
  soundOn: boolean;

  // actions
  setPhase: (p: Phase) => void;
  enterAtlas: () => void;
  openZone: (z: ZoneId) => void;
  closeZone: () => void;
  setHoverZone: (z: ZoneId | null) => void;
  setLens: (l: LensMode) => void;
  toggleLens: () => void;
  setQuality: (q: Quality) => void;
  setVisualMode: (m: VisualMode) => void;
  setReducedMotion: (v: boolean) => void;
  toggleSound: () => void;
  startJourney: () => void;
  startFlow: () => void;
}

export const useAtlas = create<AtlasState>((set, get) => ({
  phase: 'loading',
  activeZone: null,
  hoverZone: null,
  lens: 'simple',
  quality: 'cinematic',
  visualMode: 'simple',
  reducedMotion: false,
  soundOn: false,

  setPhase: (phase) => set({ phase }),
  enterAtlas: () => set({ phase: 'atlas', activeZone: null }),
  openZone: (z) => set({ phase: 'zone', activeZone: z }),
  closeZone: () => set({ phase: 'atlas', activeZone: null }),
  setHoverZone: (z) => set({ hoverZone: z }),
  setLens: (lens) => set({ lens }),
  toggleLens: () => set({ lens: get().lens === 'simple' ? 'detailed' : 'simple' }),
  setQuality: (quality) => set({ quality }),
  setVisualMode: (m) =>
    set({
      visualMode: m,
      lens: m === 'simple' ? 'simple' : 'detailed',
      quality: m === 'cinematic' ? 'cinematic' : get().quality,
    }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  toggleSound: () => set({ soundOn: !get().soundOn }),
  startJourney: () => set({ phase: 'journey', activeZone: null }),
  startFlow: () => set({ phase: 'flow', activeZone: null }),
}));
