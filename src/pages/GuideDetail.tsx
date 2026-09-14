import { Navigate, useParams } from 'react-router-dom';
import { DetailScaffold } from '@/components/DetailScaffold';
import { StepGlyphFallback } from '@/components/ui/programGlyphs';

const BLOG_URL = 'https://www.pros-per.xyz/blogs/an-allocators-guide-to-prosper-curators-vaults';

// Faithful summaries of the Prosper allocator's guide (pros-per.xyz, 13 Sep 2026).
interface Section { slug: string; title: string; long: string[]; points: { k: string; v: string }[] }
const SECTIONS: Section[] = [
  {
    slug: 'strategy-to-market',
    title: 'From Strategy to Market',
    long: [
      'Allocators want sustainable, risk-adjusted alpha they can actually verify on-chain — not back-tested projections. Prosper is built for that: Curators (quant teams, macro strategists, trading KOLs) turn their strategies into non-custodial, transparent on-chain Vaults.',
      'Each strategy exposes two instruments. Vault Shares give proportional exposure to the Vault’s underlying assets. A p{VAULT} token is a separate market where the community prices its conviction in the Curator and the strategy.',
      'Once a p{VAULT} graduates, performance fees can be recycled to buy and burn paired tokens — a transparent, trackable value cycle rather than an opaque fee take.',
    ],
    points: [
      { k: 'Allocators want', v: 'Verifiable on-chain alpha' },
      { k: 'Two instruments', v: 'Vault Shares · p{VAULT}' },
      { k: 'Fees', v: 'Recycled to buy & burn' },
      { k: 'Framework', v: 'MemeRWA' },
    ],
  },
  {
    slug: 'thesis-to-vault',
    title: 'From Thesis to Vault',
    long: [
      'A Vault starts as a thesis. Curators identify a structural inefficiency — perpetual-funding arbitrage, physical commodity pairs, an infrastructure bottleneck — and write it down as an explicit mandate.',
      'The mandate is disclosed up front: eligible assets, risk limits, leverage and redemption terms. Depositors receive Vault Shares reflecting their proportional claim on net assets, and the Vault token price moves with strategy performance.',
      'For graduated strategies, performance fees can route through protocol mechanisms to purchase and permanently burn tokens — so success stays legible on-chain.',
    ],
    points: [
      { k: 'Starts as', v: 'A written thesis' },
      { k: 'Disclosed up front', v: 'Assets · risk · leverage · redemption' },
      { k: 'You hold', v: 'Vault Shares (claim on NAV)' },
      { k: 'On success', v: 'Fees → buy & burn' },
    ],
  },
  {
    slug: 'sneak-peek',
    title: 'A Sneak Peek',
    long: [
      'The Genesis Vault Founding Curators are about to launch, spanning TradFi and crypto talent. Expect systematic US-equity risk-trimming engines, market-neutral carry strategies, hard-money macro mandates, machine-economy indices and AI-infrastructure teams.',
      'Some Vaults are run by AI agents that manage on-chain treasuries autonomously — executing against rules rather than discretion.',
      'Every Vault is a distinct thesis, team and strategy, not a single blended fund. The markets are about to open.',
    ],
    points: [
      { k: 'Cohort', v: 'Genesis Founding Curators' },
      { k: 'Spans', v: 'TradFi + crypto talent' },
      { k: 'Includes', v: 'Market-neutral · macro · AI' },
      { k: 'Some run by', v: 'Autonomous AI agents' },
    ],
  },
  {
    slug: 'strategy-lens',
    title: 'Choosing Your Strategy Lens',
    long: [
      'Two lenses help you read any Vault. Market-neutral strategies capture funding and basis opportunities with limited directional exposure — steadier, lower-beta return.',
      'Macro strategies take high-conviction, defined-risk exposure to secular trends — AI energy, autonomous economies, commodities — accepting more directionality for more upside.',
      'Neither is inherently better; they serve different portfolio objectives. Knowing which lens a Vault is built on is the fastest way to decide whether it fits your book.',
    ],
    points: [
      { k: 'Market-neutral', v: 'Funding & basis · low beta' },
      { k: 'Macro', v: 'Secular trends · defined risk' },
      { k: 'Choose by', v: 'Your portfolio objective' },
      { k: 'Both are', v: 'Transparent, on-chain' },
    ],
  },
];

export function GuideDetail() {
  const { slug } = useParams();
  const idx = SECTIONS.findIndex((s) => s.slug === slug);
  if (idx < 0) return <Navigate to={`/guide/${SECTIONS[0].slug}`} replace />;

  const s = SECTIONS[idx];
  const prev = SECTIONS[(idx - 1 + SECTIONS.length) % SECTIONS.length];
  const next = SECTIONS[(idx + 1) % SECTIONS.length];

  return (
    <DetailScaffold
      kicker="An Allocator’s Guide"
      title={s.title}
      pills={[`${String(idx + 1).padStart(2, '0')} / ${String(SECTIONS.length).padStart(2, '0')}`]}
      long={s.long}
      points={s.points}
      glyph={<StepGlyphFallback name={s.title} size={150} />}
      cta={{ label: 'Read the full guide', href: BLOG_URL }}
      secondary={{ label: 'Meet the Curators', to: '/zone/curators' }}
      siblings={SECTIONS.map((x) => ({ to: `/guide/${x.slug}`, label: x.title }))}
      currentTo={`/guide/${s.slug}`}
      prev={{ to: `/guide/${prev.slug}`, label: prev.title }}
      next={{ to: `/guide/${next.slug}`, label: next.title }}
      backTo="/"
      backLabel="Home"
    />
  );
}
