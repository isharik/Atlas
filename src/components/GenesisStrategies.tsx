import { StepGlyphFallback } from '@/components/ui/programGlyphs';

// The Genesis cohort's strategy archetypes, exactly as named in the allocator's guide.
// (Prosper hasn't published individual Founding-Curator cards yet — these reveal at launch.)
const STRATS = [
  { k: 'Systematic US Equity', tag: 'Systematic', c: '#67a8ff', d: 'A rules-based risk-trimming engine that scales exposure down as conditions deteriorate.' },
  { k: 'Market-Neutral Carry', tag: 'Market-neutral', c: '#38e0a0', d: 'Captures funding and basis with limited directional exposure — steadier, low-beta return.' },
  { k: 'Hard-Money Macro', tag: 'Macro', c: '#e4c877', d: 'High-conviction, defined-risk exposure to commodities and secular macro trends.' },
  { k: 'Machine-Economy Index', tag: 'Index', c: '#9b8cff', d: 'Tracks the emerging autonomous, machine-driven economy as an investable basket.' },
  { k: 'AI Infrastructure', tag: 'Thematic', c: '#5fd4d0', d: 'Backs the teams building AI energy and compute — the picks-and-shovels layer.' },
  { k: 'AI-Agent Treasury', tag: 'Autonomous', c: '#ef9f5a', d: 'An AI agent manages an on-chain treasury autonomously, executing against rules, not discretion.' },
];

export function GenesisStrategies() {
  return (
    <div style={{ marginTop: 30 }}>
      <div className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.4em', marginBottom: 14 }}>Genesis Curator strategies</div>
      <div className="genesis-grid">
        {STRATS.map((s) => (
          <div key={s.k} className="genesis-card" style={{ ['--c' as string]: s.c } as React.CSSProperties}>
            <div className="genesis-card__top">
              <span className="genesis-card__mark" aria-hidden style={{ color: s.c }}><StepGlyphFallback name={s.k} size={22} /></span>
              <span className="genesis-card__tag font-mono">{s.tag}</span>
            </div>
            <div className="genesis-card__name font-head">{s.k}</div>
            <p className="genesis-card__desc font-display">{s.d}</p>
          </div>
        ))}
      </div>
      <p className="font-mono genesis-note">Strategy archetypes from the guide · individual Founding Curators reveal at launch</p>
    </div>
  );
}
