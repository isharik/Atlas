import { Navigate, useParams } from 'react-router-dom';
import { PROGRAMS } from '@/data/ecosystem';
import { slugify } from '@/lib/slug';
import { DetailScaffold } from '@/components/DetailScaffold';
import { StepGlyphFallback } from '@/components/ui/programGlyphs';

// Full, grounded write-ups for each announced program (source: pros-per.xyz + @ProsperTicker).
const CONTENT: Record<string, { long: string[]; points: { k: string; v: string }[] }> = {
  'founding-curator-cohort': {
    long: [
      'The Founding Curator Cohort is Prosper’s first intake of Curators — the people who bring a strategy to the protocol and become accountable for it in the open. Applications ran through August 2026, ahead of the first Vault launches.',
      'A Founding Curator sets the thesis, risk parameters and fees for a Vault, then builds a transparent, on-chain track record. In return they raise capital from the community and earn performance fees as the strategy proves out over time.',
      'Selection prioritised a demonstrable edge, a clear and observable methodology, and a willingness to be measured publicly — on what can be verified on-chain rather than on private claims.',
    ],
    points: [
      { k: 'Status', v: 'Applications closed · Aug 2026' },
      { k: 'Who it’s for', v: 'Individuals or teams with a proven edge' },
      { k: 'You get', v: 'A launchable Vault, performance fees, seed support' },
      { k: 'The deal', v: 'A public, verifiable on-chain track record' },
    ],
  },
  'ambassador-program': {
    long: [
      'The Ambassador Program is for storytellers, educators and community leaders who help more people understand the Performance Market. It offers early access for Pharos storytellers and pays recurring rewards for consistent, high-quality contribution.',
      'Ambassadors explain how strategies become markets — Curators, Vaults, Vault Shares, p{VAULT} and bonding curves — to new audiences, and help the first generation of participants find their footing before launch.',
      'Rewards are distributed on a bi-weekly cadence from a pool denominated in $PROS, so ongoing contribution is recognised rather than one-off activity.',
    ],
    points: [
      { k: 'Status', v: 'Live' },
      { k: 'Reward pool', v: '20,000 $PROS' },
      { k: 'Cadence', v: 'Bi-weekly rewards' },
      { k: 'Who it’s for', v: 'Storytellers, educators, community leaders' },
    ],
  },
  'scholar-campaign': {
    long: [
      'The Scholar Campaign teaches the foundations of on-chain strategy markets on Layer3 — the mechanics behind Vault Shares, p{VAULT} and bonding curves — so newcomers arrive at launch already fluent.',
      'It’s a structured, quest-based path: complete tasks, learn each concept in turn, and build the context you need to participate as an investor, trader or future Curator.',
      'No prior experience is assumed. The campaign starts from first principles and works up to how a private strategy becomes a transparent, tradable market.',
    ],
    points: [
      { k: 'Status', v: 'Live' },
      { k: 'Platform', v: 'Layer3' },
      { k: 'Covers', v: 'Vault Shares · p{VAULT} · bonding curves' },
      { k: 'Who it’s for', v: 'Anyone new to Prosper' },
    ],
  },
};

export function ProgramDetail() {
  const { slug } = useParams();
  const idx = PROGRAMS.findIndex((p) => slugify(p.name) === slug);
  if (idx < 0) return <Navigate to="/programs" replace />;

  const p = PROGRAMS[idx];
  const c = CONTENT[slug!] ?? { long: [p.detail], points: [] };
  const prev = PROGRAMS[(idx - 1 + PROGRAMS.length) % PROGRAMS.length];
  const next = PROGRAMS[(idx + 1) % PROGRAMS.length];

  return (
    <DetailScaffold
      kicker="Program"
      title={p.name}
      status={p.status}
      statusTone={p.status === 'Live' ? 'emerald' : 'mute'}
      pills={p.reward ? [p.reward] : []}
      long={c.long}
      points={c.points}
      glyph={<StepGlyphFallback name={p.name} size={150} />}
      cta={p.href ? { label: p.hrefLabel ?? 'Learn more', href: p.href } : undefined}
      secondary={{ label: 'All programs', to: '/programs' }}
      prev={{ to: `/programs/${slugify(prev.name)}`, label: prev.name }}
      next={{ to: `/programs/${slugify(next.name)}`, label: next.name }}
      backTo="/programs"
      backLabel="All programs"
    />
  );
}
