import type { ZoneId } from '@/store/useAtlas';
import type { EcosystemRelationship } from './types';

/**
 * ZONE METADATA — all copy is grounded in official Prosper sources (pros-per.xyz and
 * @ProsperTicker on X). Prosper is "The Performance Market for Liquid Alpha": Curators
 * bring strategies → structured into Vaults → each launch mints Vault Shares + a p{VAULT}
 * market. No demo/fabricated entities anywhere in this file.
 */
export type ZoneIcon = 'curator' | 'strategy' | 'vault' | 'track' | 'pvault' | 'market';

export interface ZoneMeta {
  id: ZoneId;
  index: number;
  label: string;
  glyph: string;
  tagline: string;
  blurb: string;
  icon: ZoneIcon;
  simple: string;
  detailed: string;
  color: string;
  wizardLine: string;
}

export const ZONES: ZoneMeta[] = [
  {
    id: 'curators',
    index: 0,
    label: 'Curators',
    glyph: '01',
    tagline: 'Bring the strategy',
    blurb: 'The minds behind the strategies.',
    icon: 'curator',
    simple:
      'A Curator is a person or team with an edge. They bring a strategy to Prosper and become accountable for it in the open.',
    detailed:
      'Curators set custom risk parameters, thesis and fees for a Vault, then build a transparent on-chain track record, raise capital and earn fees. Prosper opened a Founding Curator Cohort to onboard the first Curators.',
    color: '#67E8F9',
    wizardLine: 'Every market here starts with a Curator — someone willing to be accountable.',
  },
  {
    id: 'strategies',
    index: 1,
    label: 'Strategies',
    glyph: '02',
    tagline: 'The investment thesis',
    blurb: 'Ideas transformed into approaches.',
    icon: 'strategy',
    simple:
      'A Strategy is the idea — the approach a Curator uses to try to generate returns. A thesis is only the starting point; what matters is what can be observed.',
    detailed:
      'On Prosper a strategy is judged by what’s observable: track record, methodology, risk, mandate and on-chain market state. The approach becomes measurable rather than a private claim.',
    color: '#8B82C4',
    wizardLine: 'A thesis is only the starting point — what matters is what can be observed.',
  },
  {
    id: 'vaults',
    index: 2,
    label: 'Vaults',
    glyph: '03',
    tagline: 'On-chain vehicle for capital',
    blurb: 'Onchain vehicles for capital.',
    icon: 'vault',
    simple:
      'A Vault is where a strategy lives on-chain. Capital is allocated into it, and its performance can be watched by anyone.',
    detailed:
      'The Vault is the on-chain vehicle for allocating capital and building an observable record. Every Vault launch mints two distinct instruments — Vault Shares and a p{VAULT} market. Vault mechanics are enabled with R25 where applicable, on Pharos.',
    color: '#67E8F9',
    wizardLine: 'This is where a strategy becomes an on-chain Vault.',
  },
  {
    id: 'track-record',
    index: 3,
    label: 'Track Record',
    glyph: '04',
    tagline: 'Performance, made observable',
    blurb: 'Performance made observable.',
    icon: 'track',
    simple:
      'The Track Record is the strategy’s history, in the open. Not a promise — a record anyone can check.',
    detailed:
      'Prosper is built to make strategy performance observable: track record, methodology, risk, mandate and on-chain market state, all legible. No live track records exist yet — Prosper is pre-launch.',
    color: '#8B82C4',
    wizardLine: 'Now the strategy has a history — and history can be priced.',
  },
  {
    id: 'pvault',
    index: 4,
    label: 'p{VAULT}',
    glyph: '05',
    tagline: 'An independent conviction market',
    blurb: 'An independent conviction market.',
    icon: 'pvault',
    simple:
      'The p{VAULT} is a separate public market about a Curator and their strategy. It’s where people price and trade their conviction — different from putting capital directly into the Vault.',
    detailed:
      'One launch, two assets. Vault Shares allocate capital and track NAV. The p{VAULT} is a standalone market for pricing conviction in the Curator and strategy — it opens on an internal bonding curve, then graduates to open DEX trading. It is NOT the same as Vault Shares.',
    color: '#A99EE0',
    wizardLine: 'The Vault and p{VAULT} serve different purposes. Let’s look closer.',
  },
  {
    id: 'performance-market',
    index: 5,
    label: 'Performance Market',
    glyph: '06',
    tagline: 'Discover · Evaluate · Price · Trade',
    blurb: 'Discover, evaluate and trade performance.',
    icon: 'market',
    simple:
      'The Performance Market is the whole picture: many strategies, out in the open, where people can discover, compare and back the ones they believe in.',
    detailed:
      'The conceptual heart of Prosper — turning elite strategies into transparent, investable markets. Strategy performance and market participation become observable. Prosper is activating the ecosystem now through its Founding Curator Cohort and Ambassador Program, ahead of launch.',
    color: '#67E8F9',
    wizardLine: 'Here strategy performance becomes part of a living market.',
  },
];

/** Right-rail journey steps. */
export const JOURNEY_STEPS: { n: string; text: string }[] = [
  { n: '01', text: 'Curator brings a strategy' },
  { n: '02', text: 'Strategy is structured and deployed' },
  { n: '03', text: 'Vault allocates capital' },
  { n: '04', text: 'Track record is built' },
  { n: '05', text: 'p{VAULT} market comes alive' },
  { n: '06', text: 'Performance market emerges' },
];

export const zoneById = (id: ZoneId) => ZONES.find((z) => z.id === id)!;

export const FLOW_ORDER: ZoneId[] = [
  'curators',
  'strategies',
  'vaults',
  'track-record',
  'pvault',
  'performance-market',
];

export const RELATIONSHIPS: EcosystemRelationship[] = [
  { from: 'pharos', to: 'prosper', label: 'provides infrastructure' },
  { from: 'prosper', to: 'curators', label: 'activates' },
  { from: 'curators', to: 'strategies', label: 'brings' },
  { from: 'strategies', to: 'vaults', label: 'is packaged into' },
  { from: 'vaults', to: 'track-record', label: 'produces' },
  { from: 'track-record', to: 'pvault', label: 'is priced by' },
  { from: 'pvault', to: 'performance-market', label: 'forms' },
];

/* ----------------------------------------------------------------------------
 * VERIFIED ECOSYSTEM DATA — sourced from pros-per.xyz and @ProsperTicker (X).
 * -------------------------------------------------------------------------- */

export const ECOSYSTEM_STATUS = {
  phase: 'Pre-launch',
  note: 'Vaults are not live yet. Prosper is activating its ecosystem ahead of launch.',
} as const;

/** The two instruments every Vault launch mints. Kept explicitly distinct. */
export const TWO_ASSETS = {
  shares: {
    name: 'Vault Shares',
    role: 'Capital allocation',
    mono: 'FOR ALLOCATORS',
    desc: 'Direct economic exposure to the Vault’s underlying assets. Tracks NAV performance.',
  },
  pvault: {
    name: 'p{VAULT}',
    role: 'Conviction pricing',
    mono: 'BONDING CURVE → DEX',
    desc: 'A standalone market to price and trade conviction in the Curator and strategy. Opens on an internal bonding curve, then graduates to open DEX trading.',
  },
} as const;

/** What Prosper makes observable about a strategy (source: @ProsperTicker, Aug 22 2026). */
export const OBSERVABLES = [
  'Track record',
  'Methodology',
  'Risk',
  'Mandate',
  'On-chain market state',
] as const;

/** Curator perks (source: @ProsperTicker, Aug 18 2026 — Founding Curator Cohort). */
export const CURATOR_PERKS = [
  'Custom risk parameters, thesis & fees',
  'Internal bonding curve + post-graduation DEX trading fees',
  'Build an on-chain track record and raise capital',
] as const;

export type ProgramStatus = 'Live' | 'Closed' | 'Upcoming';

export interface Program {
  name: string;
  status: ProgramStatus;
  detail: string;
  reward?: string;
}

/** Real programs Prosper has announced. */
export const PROGRAMS: Program[] = [
  {
    name: 'Founding Curator Cohort',
    status: 'Closed',
    detail:
      'The first Curators onboard to launch an on-chain Vault, build a track record and earn fees. Applications ran Aug 2026.',
  },
  {
    name: 'Ambassador Program',
    status: 'Live',
    reward: '20,000 $PROS',
    detail:
      'For storytellers, educators and community leaders. Early access for Pharos storytellers, with bi-weekly rewards.',
  },
  {
    name: 'Scholar Campaign',
    status: 'Live',
    detail: 'Learn the foundations of on-chain strategy markets — Vault Shares, p{VAULT} and bonding curves — on Layer3.',
  },
];

/** Ecosystem partners (source: @ProsperTicker). */
export const PARTNERS = [
  { name: 'Pharos', handle: '@pharos_network', role: 'Scalable RealFi Layer-1 infrastructure' },
  { name: 'R25', handle: '@R25Official', role: 'Dedicated vault mechanics, where applicable' },
] as const;

/** Real FAQ — every answer is grounded in pros-per.xyz + @ProsperTicker. */
export interface Faq {
  q: string;
  a: string;
  to?: string;
}
export const FAQS: Faq[] = [
  {
    q: 'What is Prosper?',
    a: 'Prosper is the Performance Market for Liquid Alpha. It turns elite on-chain strategies into transparent, investable markets — so you can find exceptional Curators early, back their strategies, and trade conviction in their performance. Built on Pharos.',
    to: '/ecosystem',
  },
  {
    q: 'What problem does Prosper solve?',
    a: 'Tokenization created the assets, but on-chain assets are available yet not watched, traded, or priced. A new strategy faces a cold start — no record, no attention, no capital. Prosper activates a market around each strategy from day one.',
    to: '/zone/pvault',
  },
  {
    q: 'What is a Curator?',
    a: 'A Curator is a person or team with an edge who brings a strategy to Prosper. They set the thesis, risk parameters and fees, build a transparent on-chain track record, raise capital from the community, and earn fees.',
    to: '/zone/curators',
  },
  {
    q: 'What is a Vault?',
    a: 'A Vault is the on-chain vehicle a strategy lives in. Capital is allocated into it and its performance becomes observable. Every Vault launch mints two distinct instruments: Vault Shares and a p{VAULT} market.',
    to: '/zone/vaults',
  },
  {
    q: 'What is the difference between Vault Shares and p{VAULT}?',
    a: 'Vault Shares are capital allocation — direct economic exposure to the Vault’s underlying assets that tracks NAV, for allocators. The p{VAULT} is a separate, independent public market to price and trade conviction in the Curator and strategy. They are not the same instrument.',
    to: '/zone/pvault',
  },
  {
    q: 'What is p{VAULT}?',
    a: 'The p{VAULT} creates price discovery from day one. It opens on an internal bonding curve, then graduates to open DEX trading — an independent market for conviction in a Curator and their strategy.',
    to: '/zone/pvault',
  },
  {
    q: 'How do I become a Curator?',
    a: 'Prosper opened a Founding Curator Cohort with a $50K Seed Fund to onboard the first Curators. You can apply to become a Curator via the official form, and join the community on X.',
    to: '/participate',
  },
  {
    q: 'What is the Ambassador Program?',
    a: 'It is live — for high-signal storytellers, educators and community leaders, with early access for Pharos storytellers and 20,000 $PROS in rewards.',
    to: '/programs',
  },
  {
    q: 'Is Prosper live yet?',
    a: 'Prosper is pre-launch. Vaults are not live yet; the ecosystem is being activated ahead of launch through programs like the Founding Curator Cohort and the Ambassador Program.',
    to: '/programs',
  },
  {
    q: 'What is Pharos, and how does it relate to Prosper?',
    a: 'Pharos is the market infrastructure Prosper is built on — a scalable RealFi Layer-1 that is observable, tradable and composable. Prosper activates that infrastructure through strategies, capital and participation. Vault mechanics are enabled with R25 where applicable.',
    to: '/pharos',
  },
  {
    q: 'Who can participate in Prosper?',
    a: 'Four audiences: Curators (institutionalize your edge), Asset Issuers (whitelist tokenized assets into strategies), Investors (access transparent strategy returns — coming soon), and Traders (price the conviction — coming soon).',
    to: '/participate',
  },
  {
    q: 'Is any of this financial advice?',
    a: 'No. Vaults and p{VAULT}s involve substantial risk, including possible loss of principal. Nothing in Prosper is investment advice.',
  },
  {
    q: 'What is $PROS?',
    a: '$PROS is Prosper’s token, used across its programs — for example the Ambassador Program’s 20,000 $PROS rewards. As Prosper puts it: “PROS & PROS. No Cons.”',
    to: '/programs',
  },
];

/** Official links — source-of-truth hierarchy + real CTA destinations. */
export const OFFICIAL_LINKS = {
  prosperSite: 'https://pros-per.xyz',
  prosperX: 'https://x.com/ProsperTicker',
  pharosSite: 'https://pharos.xyz',
  pharosDocs: 'https://docs.pharos.xyz',
  becomeCurator: 'https://forms.gle/cdCwCSdnNrCaAa35A',
  whitelistAsset: 'https://forms.gle/rJthZoir7ACMh3Bd8',
};

/* ------------------------------------------------------------------ *
 * Extended verified content (pros-per.xyz landing + @ProsperTicker).
 * ------------------------------------------------------------------ */

export const TAGLINES = {
  hero: 'The Performance Market for Liquid Alpha',
  motto: 'PROS & PROS. No Cons.',
  one: 'Prosper turns elite onchain strategies into transparent, investable markets.',
  two: 'Find exceptional Curators early, back their strategies, and trade conviction in their performance.',
  strategies: 'Assets don’t create markets. Strategies do — and every strategy here launches with one.',
  activate: 'Tokenization created the assets. Prosper activates the market.',
  realWorld: 'Where real-world assets enter active markets.',
  disclaimer:
    'Vaults and p{VAULT}s involve substantial risk, including possible loss of principal. Nothing here is investment advice.',
} as const;

/** The three pillars from the site. */
export const PILLARS = [
  { title: 'Built on Pharos', line: 'Pharos brings the infrastructure.' },
  { title: 'Priced by Markets', line: 'Prosper brings the capital and market participation.' },
  { title: 'Proven Onchain', line: 'Curators bring the strategies.' },
] as const;

/** Pharos → Prosper → Outcome triad. */
export const TRIAD = [
  { key: 'Pharos', role: 'Market Infrastructure', items: 'Observable · Tradable · Composable', rel: 'Enables' },
  { key: 'Prosper', role: 'Market Activation', items: 'Strategies · Capital Participation · Performance Market', rel: 'Activates' },
  { key: 'Outcome', role: 'Active Markets', items: 'Discovery · Evaluation · Adoption', rel: '' },
] as const;

export type RoleId = 'curators' | 'issuers' | 'investors' | 'traders';
export interface Role {
  id: RoleId;
  audience: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  badge?: string;
  status: 'Available' | 'Coming soon';
}

/** The four audiences from the "Join the First Generation" section. */
export const ROLES: Role[] = [
  {
    id: 'curators',
    audience: 'For Curators',
    title: 'Institutionalize your edge',
    body: 'Turn your strategy into an investable Vault, build your on-chain track record, and raise capital from the community.',
    cta: { label: 'Become a Curator', href: OFFICIAL_LINKS.becomeCurator },
    badge: '$50K Seed Fund',
    status: 'Available',
  },
  {
    id: 'issuers',
    audience: 'For Asset Issuers',
    title: 'Bring your assets into active strategies',
    body: 'Bring tokenized assets on-chain and connect them with Curators, Vaults, and active capital across Prosper.',
    cta: { label: 'Whitelist an Asset', href: OFFICIAL_LINKS.whitelistAsset },
    status: 'Available',
  },
  {
    id: 'investors',
    audience: 'For Investors',
    title: 'Access transparent strategy returns',
    body: 'Discover curated Vaults, invest in transparent strategies, and track real on-chain performance through Vault Shares.',
    status: 'Coming soon',
  },
  {
    id: 'traders',
    audience: 'For Traders',
    title: 'Price the conviction',
    body: 'Buy and trade p{VAULT}s that reflect Curator reputation and market conviction, backed by transparent on-chain performance.',
    status: 'Coming soon',
  },
];

/** Rich per-zone detail for the dedicated project pages. */
export interface ZoneDetail {
  purpose: string;
  points: string[];
}
export const ZONE_DETAIL: Record<ZoneId, ZoneDetail> = {
  curators: {
    purpose:
      'Curators are the people and teams with an edge. They bring a strategy to Prosper, take responsibility for it in the open, and turn a private track record into a public, investable one — institutionalizing their edge.',
    points: [
      'Set the thesis, category, hard-coded risk parameters and fees for a Vault',
      'Build a transparent on-chain track record and raise capital from the community',
      'Earn fees, including an internal bonding curve + post-graduation DEX trading fees',
      'The Founding Curator Cohort onboarded the first Curators, with a $50K Seed Fund',
    ],
  },
  strategies: {
    purpose:
      'A strategy is the approach a Curator uses to try to generate returns. On Prosper, a compelling thesis is only the starting point — what matters is what can be observed. Assets don’t create markets; strategies do.',
    points: [
      'Track record — the strategy’s observable history',
      'Methodology — how the approach actually works',
      'Risk — parameters, drawdown discipline and mandate',
      'Mandate & on-chain market state — legible to anyone',
    ],
  },
  vaults: {
    purpose:
      'A Vault is the on-chain vehicle a strategy lives in. Capital is allocated into it and performance becomes observable. Every Vault launch mints two distinct instruments — one for capital, one for conviction.',
    points: [
      'Vault Shares — capital allocation to the strategy; tracks NAV; for allocators',
      'p{VAULT} — an independent public market to price conviction in the Curator',
      'One launch, two assets — kept explicitly distinct',
      'Vault mechanics enabled with R25 where applicable, on Pharos',
    ],
  },
  'track-record': {
    purpose:
      'Prosper is built to make strategy performance observable. The track record turns a strategy’s history into a public, verifiable record anyone can check — not a promise, a proof.',
    points: [
      'Real-time observable performance and methodology',
      'Hard-coded risk parameters and transparent mandate',
      'On-chain market state, legible to all participants',
      'No live track records exist yet — Prosper is pre-launch',
    ],
  },
  pvault: {
    purpose:
      'The p{VAULT} solves the cold start. Onchain assets are available, but not watched, traded, or priced. The p{VAULT} creates price discovery from day one — an independent market for conviction in the Curator and strategy.',
    points: [
      'Without p{VAULT}: a new strategy faces a cold start — no record, no attention, no capital',
      'With p{VAULT}: price discovery from day one, independent of Vault Shares',
      'Opens on an internal bonding curve, then graduates to open DEX trading',
      'It is NOT the same as Vault Shares — different purpose entirely',
    ],
  },
  'performance-market': {
    purpose:
      'The Performance Market is the whole picture — many strategies out in the open, where participants discover, evaluate, price and trade. It is where real-world assets enter active markets.',
    points: [
      'Discover · Evaluate · Price · Trade',
      'Built on Pharos · Priced by markets · Proven onchain',
      'Prosper is activating the ecosystem now, ahead of launch',
      'Founding Curator Cohort + Ambassador Program are live drivers',
    ],
  },
};

/** Flat searchable index across the whole app. */
export interface SearchEntry {
  title: string;
  kind: string;
  to: string;
  keywords: string;
}
export function buildSearchIndex(): SearchEntry[] {
  const zones = ZONES.map((z) => ({
    title: z.label,
    kind: 'Ecosystem',
    to: `/zone/${z.id}`,
    keywords: `${z.tagline} ${z.blurb} ${z.simple} ${ZONE_DETAIL[z.id].purpose}`,
  }));
  const roles = ROLES.map((r) => ({
    title: r.title,
    kind: r.audience,
    to: '/participate',
    keywords: `${r.audience} ${r.body}`,
  }));
  const programs = PROGRAMS.map((p) => ({
    title: p.name,
    kind: 'Program',
    to: '/programs',
    keywords: `${p.status} ${p.detail} ${p.reward ?? ''}`,
  }));
  const pages: SearchEntry[] = [
    { title: 'The Prosper Journey', kind: 'Page', to: '/journey', keywords: 'flow strategy market curator vault pvault' },
    { title: 'Built on Pharos', kind: 'Page', to: '/pharos', keywords: 'pharos r25 infrastructure realfi partners' },
    { title: 'Participate', kind: 'Page', to: '/participate', keywords: 'curators asset issuers investors traders roles' },
    { title: 'Ecosystem', kind: 'Page', to: '/ecosystem', keywords: 'curators strategies vaults track record pvault performance market' },
    { title: 'FAQ', kind: 'Page', to: '/faq', keywords: 'questions answers help what is how does become curator risk advice pros' },
  ];
  const faqs = FAQS.map((f) => ({ title: f.q, kind: 'FAQ', to: f.to ?? '/faq', keywords: f.a }));
  return [...zones, ...roles, ...programs, ...faqs, ...pages];
}
