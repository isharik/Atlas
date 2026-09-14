import { Navigate, useParams } from 'react-router-dom';
import { ROLES } from '@/data/ecosystem';
import { DetailScaffold } from '@/components/DetailScaffold';
import { StepGlyphFallback } from '@/components/ui/programGlyphs';

// Full, grounded write-ups per audience (source: pros-per.xyz "Join the First Generation").
const CONTENT: Record<string, { long: string[]; points: { k: string; v: string }[]; secondary?: { label: string; to: string } }> = {
  curators: {
    long: [
      'Curators are the people or teams with a real edge. On Prosper you turn that edge into an investable Vault, set your own thesis, risk parameters and fees, and let the results speak on-chain.',
      'Every deposit, position and return is observable, so you build a public track record instead of asking anyone to take a private claim on trust. As the record compounds, you raise capital from the community and earn performance fees.',
      'A $50K seed fund backs the first Curators, and you can shape the whole thing before launch — sketch the mandate, assets and fee structure of your Vault in the Studio.',
    ],
    points: [
      { k: 'Status', v: 'Available' },
      { k: 'Backing', v: '$50K Seed Fund' },
      { k: 'You set', v: 'Thesis, risk, fees' },
      { k: 'You earn', v: 'Performance fees on a public record' },
    ],
    secondary: { label: 'Design your Vault in the Studio', to: '/studio' },
  },
  issuers: {
    long: [
      'Asset Issuers bring tokenized real-world and on-chain assets into Prosper, where Curators can build strategies around them and active capital can find them.',
      'Instead of a tokenized asset sitting idle — on-chain but unwatched and unpriced — whitelisting connects it to Vaults, Curators and the Performance Market, so it participates in live strategies from day one.',
      'It’s the supply side of the market: the more high-quality assets are available, the richer the strategies Curators can run.',
    ],
    points: [
      { k: 'Status', v: 'Available' },
      { k: 'You bring', v: 'Tokenized assets, on-chain' },
      { k: 'You get', v: 'Access to Curators, Vaults and active capital' },
      { k: 'Why', v: 'Assets that participate, not assets that sit idle' },
    ],
  },
  investors: {
    long: [
      'Investors get transparent access to strategy returns. Rather than guessing at a manager’s claims, you discover curated Vaults, read a verifiable on-chain track record, and allocate to the ones that fit.',
      'Exposure comes through Vault Shares — direct exposure to the underlying assets that tracks the Vault’s NAV — so what you hold and how it performs is always observable.',
      'This surface opens with launch; for now you can learn the mechanics and follow the Curators taking shape in the first generation.',
    ],
    points: [
      { k: 'Status', v: 'Coming soon' },
      { k: 'You hold', v: 'Vault Shares (tracks NAV)' },
      { k: 'You see', v: 'Verifiable on-chain performance' },
      { k: 'Opens', v: 'With launch' },
    ],
  },
  traders: {
    long: [
      'Traders price conviction. Every Vault has a p{VAULT} — an independent market on the Curator and their strategy — that you can buy and trade as reputation and momentum shift.',
      'A p{VAULT} opens on a bonding curve and, once it graduates, trades on FaroSwap, Pharos’s native DEX. It’s the layer where the market’s belief in a strategy gets a live, tradable price.',
      'Backed by transparent on-chain performance, it turns "is this Curator good?" into a market you can actually take a position in. This surface opens with launch.',
    ],
    points: [
      { k: 'Status', v: 'Coming soon' },
      { k: 'You trade', v: 'p{VAULT} — conviction, priced' },
      { k: 'Where', v: 'Bonding curve → FaroSwap' },
      { k: 'Opens', v: 'With launch' },
    ],
    secondary: { label: 'How p{VAULT} works', to: '/zone/pvault' },
  },
};

export function ParticipateDetail() {
  const { id } = useParams();
  const idx = ROLES.findIndex((r) => r.id === id);
  if (idx < 0) return <Navigate to="/participate" replace />;

  const r = ROLES[idx];
  const c = CONTENT[r.id] ?? { long: [r.body], points: [] };
  const prev = ROLES[(idx - 1 + ROLES.length) % ROLES.length];
  const next = ROLES[(idx + 1) % ROLES.length];

  return (
    <DetailScaffold
      kicker={r.audience}
      title={r.title}
      status={r.status}
      statusTone={r.status === 'Available' ? 'emerald' : 'mute'}
      pills={r.badge ? [r.badge] : []}
      long={c.long}
      points={c.points}
      glyph={<StepGlyphFallback name={r.id} size={150} />}
      cta={r.cta ? { label: r.cta.label, href: r.cta.href } : undefined}
      secondary={c.secondary}
      prev={{ to: `/participate/${prev.id}`, label: prev.audience }}
      next={{ to: `/participate/${next.id}`, label: next.audience }}
      backTo="/participate"
      backLabel="All ways to participate"
    />
  );
}
