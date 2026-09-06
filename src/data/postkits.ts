import type { ShareSpec } from '@/components/ShareCard';

export type PostCategory = 'The big picture' | 'Features' | 'News' | 'Campaigns';

export interface PostTopic {
  id: string;
  category: PostCategory;
  label: string;
  hint: string;
  card: ShareSpec;   // graphical card (footnote is stamped in the page)
  posts: string[];   // ready-to-post variants — real, casual, non-generic
}

/**
 * Post kits — every variant is grounded in real Prosper content (pros-per.xyz,
 * @ProsperTicker, the 3 Sep 2026 MemeRWA announcement). Written to sound like a real
 * early member, not marketing copy. Nothing here is fabricated.
 */
export const POST_KITS: PostTopic[] = [
  {
    id: 'what-is-prosper',
    category: 'The big picture',
    label: 'What is Prosper',
    hint: 'The one-liner people actually get',
    card: {
      eyebrow: 'Prosper · Performance Market',
      title: 'Strategies become',
      accentWord: 'markets.',
      detail: 'Prosper turns elite onchain strategies into transparent, investable markets. A Curator brings a real strategy, it runs onchain, and the performance is there for anyone to check. Built on Pharos.',
    },
    posts: [
      `most "alpha" onchain is a screenshot and a promise.\n\nprosper flips it. a curator brings a real strategy, it runs onchain, and the performance is right there for anyone to check. no trust-me-bro, just the record.\n\nthis is the part of crypto i actually wanted.`,
      `simplest way i've found to explain @ProsperTicker:\n\nit takes people who are genuinely good at trading, and turns their track record into something you can invest in and price. built on @pharos_network.\n\nthat's the whole pitch, and it's a good one.`,
      `the thing that clicked for me about prosper — assets don't make markets, strategies do.\n\ntokenizing something doesn't mean anyone watches it or prices it. prosper builds the market and the attention around the strategy itself. that's the missing piece nobody shipped.`,
    ],
  },
  {
    id: 'two-assets',
    category: 'Features',
    label: 'One launch, two assets',
    hint: 'Vault Shares vs p{VAULT}',
    card: {
      eyebrow: 'Prosper · Vaults',
      title: 'One launch,',
      accentWord: 'two assets.',
      detail: 'Every Vault mints Vault Shares (capital that tracks NAV) and a p{VAULT} (a separate market that prices conviction in the Curator). Kept apart on purpose — the money and the belief never get confused.',
    },
    posts: [
      `one vault launch on prosper = two assets.\n\ncapital goes into Vault Shares (tracks NAV). belief goes into the p{VAULT} (its own market). kept separate on purpose so the money and the hype never blur together.\n\nsmall design choice, genuinely big deal.`,
      `if you've ever wanted to back a trader AND bet on them getting bigger — prosper literally splits those into two instruments.\n\ndeposit into Vault Shares for the returns. trade the p{VAULT} for the conviction. wild that this didn't exist yet.`,
      `been sitting with prosper's "one launch, two assets" idea and it's clean:\n\n· Vault Shares = your exposure to the strategy's NAV\n· p{VAULT} = the market's read on the curator\n\ntwo different questions, two different prices. finally.`,
    ],
  },
  {
    id: 'pvault',
    category: 'Features',
    label: 'The p{VAULT}',
    hint: 'The conviction market',
    card: {
      eyebrow: 'Prosper · p{VAULT}',
      title: 'Price the',
      accentWord: 'conviction.',
      detail: 'The p{VAULT} solves the cold start. A new strategy usually has no record and no attention. p{VAULT} gives it a price from day one — bonding curve first, then open DEX trading. An independent market for belief in a Curator.',
    },
    posts: [
      `took me a minute to get the p{VAULT} so here's the plain version:\n\nit's a separate token where the market prices how much it believes in a curator. opens on a bonding curve, then trades on a DEX. totally apart from the capital side.\n\none's the money. one's the conviction.`,
      `the p{VAULT} is the part of prosper nobody's built before.\n\na brand new strategy has a cold start — no record, no eyes, no capital. the p{VAULT} gives it a price from day one so you can actually discover and back a curator early. that's the whole edge.`,
      `why i keep pointing people to the p{VAULT}:\n\nit's price discovery for a strategy before it even has a track record. you're not late by the time it's "proven" — the market exists on day one. being early is the point and prosper made it a feature.`,
    ],
  },
  {
    id: 'buyback',
    category: 'Features',
    label: 'Fee → p{VAULT} buyback',
    hint: 'Performance becomes demand',
    card: {
      eyebrow: 'Prosper · Mechanics',
      title: 'Performance buys',
      accentWord: 'the token.',
      detail: 'When a Curator’s strategy earns performance fees, a share of those fees buys the paired p{VAULT} on the open market. Verified performance turns straight into real demand for the asset.',
    },
    posts: [
      `the mechanic on prosper i can't stop thinking about:\n\na curator earns performance fees → a share of those fees buys their p{VAULT} on the open market.\n\nso doing well literally creates demand for their token. incentives pointed the right way for once.`,
      `most tokens just hope for demand.\n\nprosper wires it in — performance fees buy back the p{VAULT}. verified results become real buy pressure. it's the kind of thing you only notice once and then can't unsee.`,
      `why the p{VAULT} isn't "just another token":\n\nit's fed by real performance. when the strategy earns, fees buy the p{VAULT}. the price is tied to something you can actually verify onchain. that's rare and it matters.`,
    ],
  },
  {
    id: 'curators',
    category: 'Features',
    label: 'Curators',
    hint: 'Institutionalize your edge',
    card: {
      eyebrow: 'Prosper · Curators',
      title: 'Institutionalize',
      accentWord: 'your edge.',
      detail: 'A Curator is a person or team with a real edge who brings a strategy to Prosper, sets the thesis, risk params and fees, builds a public track record, and raises capital. Accountability in the open.',
    },
    posts: [
      `if you've got an edge and you're tired of it living in a private group chat — prosper lets you institutionalize it.\n\nset your thesis, risk params, fees. build a public track record. raise capital. the founding cohort even came with a $50K seed fund.`,
      `curators are the whole game on prosper.\n\na person or team takes real accountability for a strategy in the open. no anon promises — a record anyone can check. that's a higher bar than most of crypto and honestly i'm here for it.`,
      `the pitch to anyone who can actually trade:\n\nprosper turns your track record into an investable vault. you set the rules, the market prices your conviction, and you earn fees. first strategies span US equities, global equities and hyperliquid.`,
    ],
  },
  {
    id: 'memerwa',
    category: 'News',
    label: 'MemeRWA',
    hint: 'The new framework (3 Sep 2026)',
    card: {
      eyebrow: 'Prosper · MemeRWA',
      title: 'Proof you can',
      accentWord: 'trade.',
      detail: 'MemeRWA: a verifiable performance reference, a fixed mechanism connecting it to the market, and an openly traded crypto-native asset. Prosper is the first application. Announced 3 Sep 2026.',
    },
    posts: [
      `prosper just dropped MemeRWA and it's a cleaner idea than the name suggests.\n\ntake a real, verifiable performance number → wire it to a market with fixed rules → let people trade an open crypto-native asset against it.\n\nprosper is the first thing built on it.`,
      `MemeRWA in one line: proof-of-performance you can actually trade.\n\nverifiable reference + a fixed mechanism + an open asset. @ProsperTicker is the first application, first vaults expected mid-september.\n\nworth a look before it gets loud.`,
      `everyone did RWAs as "tokenize the bond."\n\nprosper's MemeRWA is different — it's tokenizing the performance itself, with the data kept verifiable. a way more crypto-native way to do it, and i think it ages well.`,
    ],
  },
  {
    id: 'launch',
    category: 'News',
    label: 'Launch is close',
    hint: 'First Vaults ~ mid-Sep 2026',
    card: {
      eyebrow: 'Prosper · Launch',
      title: 'The first Vaults are',
      accentWord: 'close.',
      detail: 'The first Curator-operated Vaults are expected to go live in mid-September 2026 — strategies start trading and you can deposit into Vaults and access the paired p{VAULT}. Built on Pharos.',
    },
    posts: [
      `mark it: first curator-operated vaults on prosper are expected mid-september 2026.\n\nthat's when strategies start trading and you can actually deposit + get the paired p{VAULT}. the quiet pre-launch window is basically right now.`,
      `prosper's been "pre-launch" for a while and it's finally close — first vaults expected mid-september.\n\nif you've been meaning to actually understand how this works, do it now, before the timeline gets loud.`,
      `the "be early" window on @ProsperTicker has a date now: mid-september 2026 for the first vaults. built on @pharos_network.\n\nthis is the calm-before part. i'd rather be here for it than show up after.`,
    ],
  },
  {
    id: 'ambassador',
    category: 'Campaigns',
    label: 'Ambassador Program',
    hint: 'Live · 20,000 $PROS',
    card: {
      eyebrow: 'Prosper · Ambassadors',
      title: 'For the',
      accentWord: 'storytellers.',
      detail: 'The Ambassador Program is live — early access for Pharos storytellers, with 20,000 $PROS in rewards. Built for people who teach and tell the story well, not just shill.',
    },
    posts: [
      `prosper's ambassador program is live and it's built for storytellers, not shillers.\n\nearly access for pharos storytellers, 20,000 $PROS in rewards. if you actually like explaining things, this is a good one to be early on.`,
      `quietly one of the better ways to get early on @ProsperTicker: the ambassador program.\n\n20k $PROS, made for people who teach and tell the story well. we're pre-launch, so being here now genuinely counts for something.`,
      `not advice but — being an early ambassador for something before it launches is how you end up with a real seat later.\n\nprosper's program is live, 20,000 $PROS, aimed at educators. worth it if you get in.`,
    ],
  },
  {
    id: 'cohort',
    category: 'Campaigns',
    label: 'Founding Curator Cohort',
    hint: '$50K Seed Fund',
    card: {
      eyebrow: 'Prosper · Curators',
      title: 'Seeded the',
      accentWord: 'first Curators.',
      detail: 'The Founding Curator Cohort onboarded the first Curators with a $50K Seed Fund to actually launch. First strategies span U.S. equities, global market equities and Hyperliquid.',
    },
    posts: [
      `the founding curator cohort is what made me take prosper seriously.\n\nthey seeded the first curators with $50k to actually launch. that's not a vibe, that's runway. first strategies span US equities, global equities and hyperliquid.`,
      `most protocols "invite" curators. prosper put $50k behind theirs.\n\nthe founding cohort is closed now, but it tells you how serious the first generation is. real strategies, real seed, launching soon.`,
    ],
  },
  {
    id: 'pharos',
    category: 'The big picture',
    label: 'Built on Pharos',
    hint: 'The infra + partners',
    card: {
      eyebrow: 'Prosper · Pharos',
      title: 'Built on Pharos,',
      accentWord: 'by design.',
      detail: 'Prosper runs on Pharos — a scalable RealFi Layer-1 that makes strategies observable, tradable and composable. Early partners include R25 Protocol, Stove Finance and TopNod Wallet.',
    },
    posts: [
      `prosper doesn't run on hype, it runs on @pharos_network — a scalable RealFi layer-1 that makes strategies observable, tradable and composable.\n\nplus real partners: R25, stove finance, topnod. the plumbing is actually there.`,
      `the reason prosper can even do "observable performance" is the base layer.\n\nbuilt on pharos by design. if you're into the infra side, that's where the interesting composability lives.`,
      `prosper's ecosystem is filling in — pharos underneath, R25 for vault mechanics, stove finance and topnod as early partners.\n\npre-launch, but the pieces are real, not roadmap fluff.`,
    ],
  },
];

export const POST_CATEGORIES: PostCategory[] = ['The big picture', 'Features', 'News', 'Campaigns'];
