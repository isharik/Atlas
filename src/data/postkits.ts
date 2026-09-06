import type { ShareSpec } from '@/components/ShareCard';

export type PostCategory = 'The big picture' | 'Features' | 'News' | 'Campaigns';

export interface PostTopic {
  id: string;
  category: PostCategory;
  label: string;
  hint: string;
  card: ShareSpec;   // graphical poster card (footnote stamped in the page)
  posts: string[];   // 3 variants: Medium, Long, Article — real, casual, well-written
}

/** Length labels for the three variants, by index. */
export const POST_LENGTHS = ['Medium', 'Long', 'Article'];

/**
 * Post kits — every variant is grounded in real Prosper content (pros-per.xyz,
 * @ProsperTicker, the 3 Sep 2026 MemeRWA announcement). Written to read like a real
 * early member wrote them: proper sentences, casual tone, few symbols. Nothing invented.
 */
export const POST_KITS: PostTopic[] = [
  {
    id: 'what-is-prosper',
    category: 'The big picture',
    label: 'What is Prosper',
    hint: 'The clear intro',
    card: { eyebrow: 'Prosper · Performance Market', title: 'Strategies become', accentWord: 'markets.', poster: true, detail: 'Elite onchain strategies, turned into transparent, investable markets. Built on Pharos.' },
    posts: [
      `Been trying to explain Prosper without the jargon, so here's my attempt.\n\nMost "alpha" onchain is a screenshot and a promise. You never really know if it's real. Prosper flips that. Someone with an actual edge brings their strategy onchain, it runs in the open, and anyone can check how it's doing at any time.\n\nNo trust me bro. Just a record you can verify. That's the part of crypto I always wanted, and it's finally getting built. 📈`,
      `I keep coming back to Prosper, so let me lay out why in plain terms.\n\nThe pitch is that it turns elite onchain strategies into transparent, investable markets. It runs on Pharos. A Curator, meaning a person or team with a real edge, brings a strategy onchain and takes responsibility for it in public.\n\nYou get to see the track record, the methodology, the risk. Nothing hidden. And here's the part that makes it click. Every launch mints two assets at once. Vault Shares, which is your capital in the strategy and tracks its NAV. And a p{VAULT}, a separate market where people price how much they believe in that Curator.\n\nOne is the money. One is the conviction. They trade apart, and that separation simply didn't exist before.`,
      `Okay, proper thread on why Prosper actually matters, because I don't think enough people get it yet. 🧵\n\nCrypto has a trust problem with performance. Everyone claims they're up big, almost nobody can prove it, and the genuinely good traders stay hidden in private group chats. Meanwhile tokenization gave us a million assets that just sit there, unwatched and unpriced.\n\nProsper is built to fix both. It's the performance market for liquid alpha, running on Pharos. A Curator brings a real strategy onchain, sets the thesis, the risk parameters and the fees, then builds a track record anyone can read.\n\nThe clever part is the structure. Every vault launch creates two things. Vault Shares are your actual capital in the strategy, tracking its NAV. A p{VAULT} is a separate market where the crowd prices belief in the Curator. So you can back a strategy for the returns, trade the conviction in the person running it, or do both.\n\nAnd it isn't just talk. When a Curator earns performance fees, part of those fees buys their p{VAULT} on the open market, so real results turn into real demand.\n\nFirst vaults are expected mid September. If you like being early, this is the quiet window before it gets loud. 👇`,
    ],
  },
  {
    id: 'two-assets',
    category: 'Features',
    label: 'One launch, two assets',
    hint: 'Shares vs p{VAULT}',
    card: { eyebrow: 'Prosper · Vaults', title: 'One launch,', accentWord: 'two assets.', poster: true, detail: 'Capital and conviction, priced separately.' },
    posts: [
      `Here's the design choice in Prosper that I think is quietly brilliant.\n\nOne vault launch mints two assets. Your capital goes into Vault Shares, which tracks the strategy's NAV. Belief in the Curator goes into the p{VAULT}, which is its own market. They're kept separate on purpose, so the money and the hype never blur into one confusing number.\n\nSmall detail, big consequences. 🟢`,
      `If you've ever wanted to back a trader and also bet on them becoming a bigger deal, Prosper literally splits those into two instruments.\n\nVault Shares are for the returns. You deposit capital, and it tracks the strategy's NAV like you'd expect. The p{VAULT} is for the conviction. It's a separate market that prices how much people believe in the Curator, opening on a bonding curve before it graduates to open trading.\n\nThe reason this matters is that "how is the strategy doing" and "how much does the market believe in this person" are two different questions. Most platforms mash them together. Prosper gives each one its own price, and once you see it that way you can't unsee it.`,
      `Let me walk through the "one launch, two assets" idea properly, because it's the core of how Prosper works. 🧵\n\nWhen a Curator launches a vault, two distinct instruments are created in the same moment.\n\nThe first is Vault Shares. This is capital allocation. You deposit, you get proportional exposure to the strategy's assets, and your position tracks NAV. It's the part that behaves like investing in the strategy itself.\n\nThe second is the p{VAULT}. This is a fixed supply asset, a market where people trade their expectations about the Curator and their future performance. It opens on an internal bonding curve, then graduates to open DEX trading. It is not the same thing as Vault Shares, and that's the entire point.\n\nWhy separate them? Because conviction and capital move differently. A Curator can be early and unproven, with almost no NAV yet, while belief in them is already building. The p{VAULT} lets that belief have a price from day one, independent of how much capital has arrived.\n\nAnd the two are linked in a healthy way. When the strategy earns performance fees, a share of those fees buys the p{VAULT} on the open market. Good performance feeds real demand.\n\nTwo assets, two questions, one launch. Genuinely a new primitive. 👇`,
    ],
  },
  {
    id: 'pvault',
    category: 'Features',
    label: 'The p{VAULT}',
    hint: 'The conviction market',
    card: { eyebrow: 'Prosper · p{VAULT}', title: 'Price the', accentWord: 'conviction.', poster: true, detail: 'An independent market for belief in a Curator, from day one.' },
    posts: [
      `Took me a minute to get the p{VAULT}, so here's the plain version.\n\nIt's a separate token where the market prices how much it believes in a Curator. It opens on a bonding curve, then trades on a DEX, and it stays completely separate from the capital side.\n\nOne asset is the money. One is the conviction. Being able to trade the belief in a person, on its own, is the part nobody had built until now.`,
      `The p{VAULT} solves a problem that quietly kills good strategies, and I don't think it gets enough credit.\n\nA brand new strategy has a cold start. No record, no attention, no capital. Even if the Curator is genuinely good, there's nothing there yet for anyone to price or rally around. So the good ones stay invisible.\n\nThe p{VAULT} fixes that by giving the strategy a price on day one. It's an independent market for conviction in the Curator, opening on a bonding curve and later graduating to open trading. You're not waiting until something is "proven" and obvious. The market exists early, which means being early is actually possible.\n\nThat's the whole edge, and it's a smart one.`,
      `Real explainer on the p{VAULT}, because it's the most original piece of Prosper and the easiest to misread. 🧵\n\nStart with the problem. Onchain assets exist, but most of them are not watched, traded, or priced. A new strategy faces the same cold start. There's no history, so there's no attention, so there's no capital, so there's never any history. It loops.\n\nThe p{VAULT} breaks that loop. It's a fixed supply asset, a market that prices expectations around a Curator and their future performance. It creates price discovery from the very first day, before a track record even exists.\n\nHow it runs: it opens on an internal bonding curve, then graduates to open DEX trading once it's established. Crucially, it is not Vault Shares. Vault Shares are your capital tracking NAV. The p{VAULT} is pure conviction, priced on its own.\n\nAnd it stays honest because of one mechanic. When the Curator's strategy earns performance fees, a share of those fees buys the p{VAULT} on the open market. So the price isn't just vibes, it's fed by verified results.\n\nThe reason I care: it makes "being early to a person" a real, tradable thing. That basically didn't exist onchain before. 👇`,
    ],
  },
  {
    id: 'buyback',
    category: 'Features',
    label: 'Fee to buyback',
    hint: 'Performance becomes demand',
    card: { eyebrow: 'Prosper · Mechanics', title: 'Performance buys', accentWord: 'the token.', poster: true, detail: 'Fees buy the p{VAULT} on the open market. Results become demand.' },
    posts: [
      `The mechanic in Prosper I can't stop thinking about.\n\nWhen a Curator earns performance fees, a share of those fees buys their p{VAULT} on the open market. So doing well literally creates demand for their token.\n\nMost tokens just hope for demand. This one wires it in. Incentives pointed the right way for once. 🟢`,
      `Here's a small mechanic in Prosper that changes how you should think about the p{VAULT}.\n\nWhen a Curator's strategy earns performance fees, part of those fees is used to buy the paired p{VAULT} on the open market. That's it. Verified performance turns directly into real buy pressure for the asset.\n\nWhy it matters: most tokens are priced on stories and hope. The p{VAULT} has an actual link to results. If the Curator performs, that performance shows up as demand, not as a press release. It's the kind of thing you notice once and then can't unsee, because it quietly fixes the usual gap between "this token went up" and "anything real happened."`,
      `Let me sit on one Prosper mechanic for a second, because it's the sort of detail that separates a real design from a pitch deck. 🧵\n\nThe setup: every vault has a p{VAULT}, a market that prices conviction in the Curator. Fine. Lots of things claim to price conviction. The question is always, what actually connects the token to reality?\n\nProsper's answer is direct. When the Curator's strategy earns performance fees, a share of those fees buys the paired p{VAULT} on the open market.\n\nSo trace it through. The Curator does well. They earn performance fees. Those fees become buy pressure on their own p{VAULT}. Verified, onchain performance translates into demand for the asset that represents belief in them.\n\nThat closes a loop most of crypto leaves open. Normally a token's price and the underlying reality drift apart. Here they're tied together by design, and the tie is something you can verify rather than something you have to trust.\n\nIt's not flashy, which is exactly why I trust it more. Good incentives usually aren't. 👇`,
    ],
  },
  {
    id: 'curators',
    category: 'Features',
    label: 'Curators',
    hint: 'Institutionalize your edge',
    card: { eyebrow: 'Prosper · Curators', title: 'Institutionalize', accentWord: 'your edge.', poster: true, detail: 'Bring a real strategy onchain. Build a public record. Earn fees.' },
    posts: [
      `If you've got an edge and you're tired of it living in a private group chat, Prosper is worth a look.\n\nYou can institutionalize it. Set your thesis, your risk parameters, your fees. Build a public track record. Raise capital from people who can actually see how you're doing.\n\nThe founding cohort even came with a 50k seed fund. That's runway, not a vibe.`,
      `Curators are the whole game on Prosper, so it's worth understanding what one actually is.\n\nA Curator is a person or team with a real edge who brings a strategy onchain and takes accountability for it in the open. They set the thesis, the category, the hard coded risk parameters and the fees. Then they build a transparent track record and raise capital from the community, earning fees as they go.\n\nWhat I like is the bar. No anon promises, no "trust me." A record anyone can check, in public, with real skin in it. That's a higher standard than most of crypto asks for, and the first strategies aren't small either. They span US equities, global market equities and Hyperliquid.`,
      `If you can actually trade, this is the Prosper pitch aimed straight at you. 🧵\n\nRight now your edge probably lives somewhere private. A group chat, a spreadsheet, a handful of people who know you're good. The problem is that none of it compounds into anything you own. There's no public record, no way to raise real capital off it, no asset that represents your reputation.\n\nProsper turns your edge into an institution. You become a Curator. You bring a strategy onchain and set the rules yourself: the thesis, the category, the hard coded risk parameters, the fee schedule. From there you build a transparent, onchain track record that anyone can verify.\n\nOn top of that, your strategy launches as a vault with two assets. Vault Shares let allocators put capital behind you and track NAV. A p{VAULT} gives the market a way to price conviction in you specifically, and when you earn performance fees, a share buys that p{VAULT} on the open market.\n\nThe first Curators didn't start from zero either. The founding cohort came with a 50k seed fund, and the early strategies cover US equities, global equities and Hyperliquid.\n\nIf you've been waiting for a real way to go pro onchain, this is it. 👇`,
    ],
  },
  {
    id: 'memerwa',
    category: 'News',
    label: 'MemeRWA',
    hint: 'New framework, 3 Sep 2026',
    card: { eyebrow: 'Prosper · MemeRWA', title: 'Proof you can', accentWord: 'trade.', poster: true, detail: 'Verifiable performance data, wired to an openly traded asset.' },
    posts: [
      `Prosper just introduced MemeRWA, and it's a cleaner idea than the name makes it sound.\n\nTake a real, verifiable performance number. Wire it to a market with fixed, predefined rules. Let people trade an open, crypto native asset against it. That's the framework, and Prosper is the first thing built on top of it.\n\nProof of performance you can actually trade. 📈`,
      `New from Prosper, and worth understanding before it's everywhere. They announced MemeRWA on September 3rd.\n\nThe short version: MemeRWA is a framework with three parts. A verifiable economic reference, a predefined mechanism that connects that reference to the market, and an openly traded crypto native asset. In plain words, it links real performance data to something you can actually trade, with the connection defined by protocol rules instead of trust.\n\nProsper is the first application of it. That's why the vaults work the way they do, with verifiable performance feeding the p{VAULT}. First curator vaults are expected mid September. Good moment to look early.`,
      `Let me actually break down MemeRWA, since Prosper just launched it and the name undersells the idea. 🧵\n\nEveryone did RWAs the obvious way. Tokenize a bond, tokenize a treasury, put a real world asset onchain. Useful, but it's mostly wrapping something that already exists.\n\nMemeRWA is a different angle. Instead of tokenizing the asset, you tokenize the performance, and you keep the data verifiable. The framework has three components. First, a verifiable economic reference, some real performance number that can be checked. Second, a predefined mechanism that connects that reference to a market, so the link is rules, not promises. Third, an openly traded crypto native asset that people can actually buy and sell.\n\nProsper is the first application of this framework, announced on September 3rd. It's why a Curator's verified results can feed demand into their p{VAULT}, and why the whole thing reads as a market rather than a claim.\n\nThe reason I think it ages well: it's a genuinely crypto native way to do real world assets. Not a wrapper on tradfi, an actual new shape. And the timing is good, with the first vaults expected mid September.\n\nWorth watching. 👇`,
    ],
  },
  {
    id: 'launch',
    category: 'News',
    label: 'Launch is close',
    hint: 'First vaults, mid-Sep 2026',
    card: { eyebrow: 'Prosper · Launch', title: 'The first Vaults are', accentWord: 'close.', poster: true, detail: 'First Curator vaults expected mid-September 2026.' },
    posts: [
      `Marking this down. The first Curator operated vaults on Prosper are expected to go live in mid September 2026.\n\nThat's when strategies start trading and you can actually deposit into a vault and get the paired p{VAULT}. The quiet pre launch window is basically right now. 👇`,
      `Prosper has been pre launch for a while, and it's finally close.\n\nThe first Curator operated vaults are expected mid September 2026. That's the moment strategies from the inaugural cohort start trading, and users can deposit into vaults and access the paired p{VAULT} instruments. First strategies cover US equities, global equities and Hyperliquid.\n\nIf you've been meaning to actually understand how this works, now is the time. It's a lot easier to learn something while it's calm than to catch up once the timeline is loud about it.`,
      `The "be early" window on Prosper finally has a real date, so let me put the timeline in one place. 🧵\n\nWhere it stands: Prosper is pre launch, built on Pharos, activating through programs like the founding curator cohort and the ambassador program. The infrastructure is live. The first curators are onboarded. The framework, MemeRWA, is out as of early September.\n\nWhat's next: the first Curator operated vaults are expected to go live in mid September 2026. When that happens, strategies from the first cohort begin trading, and you can deposit into vaults and access the paired p{VAULT} for each one. The early strategies span US equities, global market equities and Hyperliquid.\n\nWhy I'm paying attention now instead of later: the interesting part of any of these is the stretch right before it goes live, when almost nobody is looking and you can actually take the time to understand it. That's this exact moment.\n\nBuilt on Pharos. First vaults, mid September. I'd rather be here for it than show up after. 👇`,
    ],
  },
  {
    id: 'ambassador',
    category: 'Campaigns',
    label: 'Ambassador Program',
    hint: 'Live · 20,000 $PROS',
    card: { eyebrow: 'Prosper · Ambassadors', title: 'For the', accentWord: 'storytellers.', poster: true, detail: 'Live. 20,000 $PROS for people who teach and tell the story well.' },
    posts: [
      `Prosper's ambassador program is live, and it's built for storytellers rather than shillers.\n\nThere's early access for Pharos storytellers and 20,000 $PROS in rewards. If you actually enjoy explaining things clearly, this is a good one to be early on. 🟢`,
      `Quietly one of the better ways to get early on Prosper is the ambassador program.\n\nIt's live now, with 20,000 $PROS in rewards, and it's aimed at storytellers, educators and community leaders. There's early access for Pharos storytellers too. The whole thing is built around people who teach well, not people who spam.\n\nWe're still pre launch, which is the part that matters. Being genuinely useful to a project now, before it's obvious, is how you end up with a real seat later. If explaining things is your thing, this one's worth it.`,
      `A little advice for anyone who likes being early but hates aping blindly. 🧵\n\nThe best way to get real position in something isn't buying the top of the hype. It's being useful before the crowd shows up. You help people understand it, you become part of the story, and that compounds in ways a chart never will.\n\nProsper's ambassador program is basically built for exactly that. It's live right now. There's 20,000 $PROS in rewards, early access for Pharos storytellers, and the whole thing is aimed at educators and community leaders rather than reply guys.\n\nAnd the timing is the point. Prosper is pre launch, with the first vaults expected mid September. So the storytelling you do now lands while it actually matters, not after everyone already knows.\n\nIf you're the person friends message to ask "wait, explain this to me," you already have the skill. This is a place to use it early. 👇`,
    ],
  },
  {
    id: 'cohort',
    category: 'Campaigns',
    label: 'Founding Curator Cohort',
    hint: '$50K Seed Fund',
    card: { eyebrow: 'Prosper · Curators', title: 'Seeded the', accentWord: 'first Curators.', poster: true, detail: 'The founding cohort came with a $50K seed fund.' },
    posts: [
      `The founding curator cohort is the thing that made me take Prosper seriously.\n\nThey seeded the first Curators with a 50k fund to actually launch. That's not a vibe, that's runway. And the first strategies aren't toys either. They span US equities, global equities and Hyperliquid. 📈`,
      `Most protocols "invite" curators and hope for the best. Prosper put money behind theirs.\n\nThe founding curator cohort onboarded the first Curators with a 50k seed fund, so they had real runway to launch onchain vaults, build a track record and start earning fees. It's closed now, but it tells you a lot about how serious the first generation is.\n\nAnd the strategies reflect that. US equities, global market equities and Hyperliquid, not random noise. When the first vaults go live in mid September, this is the group behind them.`,
      `Worth understanding the founding curator cohort, because it's a good signal about where Prosper is headed. 🧵\n\nA lot of new protocols treat their earliest contributors as free marketing. Come build, we'll retweet you, good luck. Prosper did the opposite. The founding cohort onboarded the first Curators and came with a 50k seed fund, so those Curators had actual runway to launch a vault, build an onchain track record, raise capital and earn fees.\n\nThat changes the quality of who shows up. When there's real seed behind it, you get people who can actually trade, not just people chasing an airdrop. It shows in the strategies too, which span US equities, global market equities and Hyperliquid.\n\nThe cohort is closed now, but the point isn't to join it. The point is what it tells you. This is the group whose vaults are expected to go live in mid September, and they were set up to be serious from day one.\n\nWhen the first vaults land, remember this is where they came from. 👇`,
    ],
  },
  {
    id: 'pharos',
    category: 'The big picture',
    label: 'Built on Pharos',
    hint: 'The infra and partners',
    card: { eyebrow: 'Prosper · Pharos', title: 'Built on Pharos,', accentWord: 'by design.', poster: true, detail: 'A scalable RealFi Layer-1. Observable, tradable, composable.' },
    posts: [
      `Prosper doesn't run on hype, it runs on Pharos.\n\nPharos is a scalable RealFi Layer 1 that makes strategies observable, tradable and composable. On top of that there are real partners like R25 Protocol, Stove Finance and TopNod Wallet. The plumbing is actually there. 🟢`,
      `If you want to understand why Prosper can do the things it claims, look at the base layer.\n\nIt's built on Pharos, a scalable RealFi Layer 1. The whole promise of Prosper, that strategies are observable, tradable and composable, only works if the infrastructure underneath supports it. That's what Pharos is for.\n\nAnd it isn't building alone. The early ecosystem already includes R25 Protocol for vault mechanics, plus Stove Finance and TopNod Wallet as first generation partners. Pre launch, but the pieces are real, not a roadmap slide.`,
      `Quick one on the part of Prosper people skip, the infrastructure, because it's actually the reason the rest is possible. 🧵\n\nProsper's pitch is that strategies become observable, tradable and composable. That's a big claim. You can't make performance genuinely observable and composable on infrastructure that wasn't built for it. So the base layer matters more than usual here.\n\nProsper is built on Pharos, a scalable RealFi Layer 1, by design. That's what lets a strategy's state live onchain in a way anyone can read and build on top of. It's the difference between "trust our dashboard" and "check it yourself."\n\nThe ecosystem around it is filling in too. R25 Protocol handles vault mechanics where applicable, and Stove Finance and TopNod Wallet are early partners. None of this is live-and-forgotten roadmap fluff, it's the actual stack the first vaults will run on.\n\nIf you like the infra side of crypto, this is the interesting layer to watch. 👇`,
    ],
  },
];

export const POST_CATEGORIES: PostCategory[] = ['The big picture', 'Features', 'News', 'Campaigns'];
