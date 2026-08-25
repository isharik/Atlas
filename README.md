# Prosper Atlas

An immersive, community-built 3D exploration of the **Pharos-affiliated Prosper** ecosystem —
_"Explore how strategies become markets."_

Prosper Atlas is **not** the official Prosper website and **not** a DeFi dashboard. It is an
educational world that lets people _experience_ the flow:

```
Pharos → Prosper → Curator → Strategy → Vault → Vault Shares → Track Record → p{VAULT} → Performance Market
```

> Community-built educational experience. Not an official Prosper product unless explicitly authorized.
> Demo data is clearly labelled and never presented as live.

## Stack

React 18 · TypeScript · Vite · Three.js · React Three Fiber · Drei · @react-three/postprocessing
(Bloom/Vignette) · Framer Motion · Zustand · Tailwind CSS.

## Run

```bash
npm install
npm run dev      # http://localhost:5177
npm run build    # typecheck + production build
```

## Architecture

- `src/store/useAtlas.ts` — single Zustand store driving **phase** (`loading → opening → atlas → zone → journey → flow`), active zone, Prosper Lens (simple/detailed), quality (cinematic/performance), reduced-motion and sound.
- `src/data/` — typed models (`types.ts`) and the ecosystem content (`ecosystem.ts`): zone metadata (Lens-aware copy) + clearly-labelled **DEMO** Curators / Strategies / Vaults. UI consumes data; copy is never scattered in components.
- `src/three/` — the living world:
  - `AtlasCanvas.tsx` — Canvas, DPR/quality, Bloom + Vignette.
  - `world/` — `Atmosphere` (fog/lights), `WireField` (signature emerald flow motif), `Particles`, `PharosFoundation` (infrastructure grid), `CentralProsper` (monumental core), `ZoneNode` (six zones), `LightStream` (relationship + flowing activity), `AtlasWorld` (composition).
  - `camera/CameraRig.tsx` — spherical controller: cinematic enter-travel, drag-orbit, scroll-move, zone focus, pointer parallax.
  - `wizard/Wizard.tsx` — the **Prosper Wizard**: procedural guardian with cursor-tracking (eyes → head → body), randomized blink, idle float, reactive staff, contextual speech.
- `src/components/ui/` — overlay: `Loader`, `Opening`, `Nav`, `Controls` (Prosper Lens), `AtlasOverlay` (Built-on-Pharos + CTAs + disclaimer), `ZonePanel` (incl. the **Vault Shares vs p{VAULT}** two-asset distinction), `Journey` (8 chapters), `Flow` (the "From strategy to market" cinematic).

## Design DNA (from official Prosper branding)

Near-black grounds · deep emerald flow linework · teal accent for mono eyebrows · antique gold
serif wordmark. Serif (Cinzel) + mono (JetBrains Mono) pairing. Calm, cinematic, never neon.
Motion follows the Emil Kowalski curves in `index.css` (`--ease-out2`, `--ease-inout2`).

## Built in this version

Opening cinematic · Atlas world with all six zones on a clean orbit-flow ring · camera rig ·
Prosper Wizard · Prosper Lens (Simple/Detailed) · zone panels with demo data + the two-asset
distinction · 8-chapter Journey · "Strategy → Market" flow sequence · quality/perf +
reduced-motion handling · SEO/OG · community-built disclaimer with official links.

**Detail layer** (`src/components/detail/`) — focused, scrim-backed experiences layered over the
zone view:
- **Curator detail** — the clickable Curator → Thesis → Strategy → Vault chain.
- **Vault detail** — two-asset breakdown (Vault Shares vs p{VAULT}), risk/fees (Detailed lens),
  sample track record, and the signature CTAs.
- **Understand This Strategy** — a scoped, auto-advancing 6-stage educational environment
  (Curator → Strategy → Vault → Capital → Track Record → p{VAULT}).
- **Track Record timeline** — a scrubbable NAV timeline (drag / click / ← → keys, `role="slider"`)
  with demo event markers.

## Roadmap (not yet built)

Rigged GLB wizard · social share cards · mobile-specific gestures · ambient sound ·
live-data adapters (currently demo only) · true per-object 3D camera dives (details currently
use a scrim + subtle push-in rather than flying the camera to each structure).

## Source-of-truth hierarchy

Official Prosper site → Prosper docs/announcements → official Pharos → verified on-chain/public data
→ clearly-labelled community content. Unverifiable mechanics are omitted or labelled, never invented.
