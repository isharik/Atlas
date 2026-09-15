import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container, Kicker } from '@/components/PageBits';
import { IconSearch, IconArrow } from '@/components/ui/icons';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];

interface Term { t: string; cat: string; d: string; more?: string; to?: string }

// Plain-English definitions, grounded in Prosper's own material.
const TERMS: Term[] = [
  { t: 'Prosper', cat: 'Core', d: 'The Performance Market for Liquid Alpha — it turns elite on-chain strategies into transparent, investable markets.', to: '/ecosystem' },
  { t: 'Curator', cat: 'Roles', d: 'A person or team with an edge who brings a strategy on-chain and stays accountable for it in the open.', more: 'Curators set the thesis, risk parameters and fees, then build a public track record and earn performance fees.', to: '/zone/curators' },
  { t: 'Strategy', cat: 'Core', d: 'The approach a Curator uses to try to generate returns. Judged by what can be observed, not by claims.', to: '/zone/strategies' },
  { t: 'Vault', cat: 'Core', d: 'The on-chain vehicle a strategy runs inside. One launch produces two assets.', more: 'A deposit gives you Vault Shares; a separate market (p{VAULT}) prices conviction in the Curator.', to: '/zone/vaults' },
  { t: 'Vault Shares', cat: 'Instruments', d: 'Your proportional claim on the Vault’s net assets. Direct exposure that tracks NAV.', to: '/zone/vaults' },
  { t: 'p{VAULT}', cat: 'Instruments', d: 'An independent market that prices the community’s conviction in a Curator and their strategy.', more: 'Opens on a bonding curve, then graduates to FaroSwap once it fills.', to: '/zone/pvault' },
  { t: 'Performance Market', cat: 'Core', d: 'The layer where strategies become active markets: discover, evaluate, price, trade.', to: '/zone/performance-market' },
  { t: 'Track Record', cat: 'Mechanics', d: 'A public, verifiable, on-chain history of a strategy’s performance. The proof, not the pitch.', to: '/zone/track-record' },
  { t: 'NAV', cat: 'Mechanics', d: 'Net Asset Value — what the Vault’s holdings are worth. Vault Shares move with it.' },
  { t: 'Bonding curve', cat: 'Mechanics', d: 'A pricing curve a p{VAULT} opens on. Price rises as more is bought, until the market graduates.', to: '/guide/thesis-to-vault' },
  { t: 'Graduation', cat: 'Mechanics', d: 'When a p{VAULT} finishes its bonding curve and moves to open trading on a DEX.' },
  { t: 'FaroSwap', cat: 'Infra', d: 'Pharos’s native AMM/PMM DEX. Where a p{VAULT} trades after it graduates.' },
  { t: 'Pharos', cat: 'Infra', d: 'The scalable RealFi Layer-1 that Prosper is built on — observable, tradable, composable.', to: '/pharos' },
  { t: 'Performance fee', cat: 'Mechanics', d: 'The cut a Curator earns on returns. For graduated markets, fees can be recycled to buy and burn.', to: '/guide/strategy-to-market' },
  { t: 'Early Depositor Reward', cat: 'Mechanics', d: 'Deposit within the cap in a Vault’s first 14 days to earn a share of 6% of its p{VAULT} supply.', to: '/preview' },
  { t: 'MemeRWA', cat: 'Core', d: 'The framework behind the two instruments — Vault Shares for exposure, p{VAULT} for conviction.', to: '/guide/strategy-to-market' },
  { t: 'Whitelist Assets', cat: 'Roles', d: 'How asset issuers bring tokenized assets on-chain so Curators can build strategies around them.', to: '/participate/issuers' },
  { t: 'Liquid Alpha', cat: 'Core', d: 'Sustainable, risk-adjusted, on-chain-verifiable returns — the thing allocators are actually after.', to: '/guide/strategy-to-market' },
];

const CATS = ['All', 'Core', 'Instruments', 'Mechanics', 'Roles', 'Infra'];
const CAT_COLOR: Record<string, string> = { Core: '#e4c877', Instruments: '#48e8ac', Mechanics: '#67a8ff', Roles: '#9b8cff', Infra: '#5fd4d0' };

function TermCard({ term }: { term: Term }) {
  const color = CAT_COLOR[term.cat] ?? 'var(--primary)';
  const inner = (
    <>
      <div className="gloss-card__head">
        <span className="gloss-card__mono font-head" aria-hidden>{term.t.replace(/[^A-Za-z0-9]/g, '').charAt(0) || 'P'}</span>
        <span className="gloss-card__cat font-mono">{term.cat}</span>
      </div>
      <div className="gloss-card__term font-head">{term.t}</div>
      <p className="gloss-card__def font-display">{term.d}</p>
      {term.to && <span className="gloss-card__link font-mono">Open <span className="gloss-card__arrow"><IconArrow size={12} /></span></span>}
    </>
  );
  const style = { ['--c' as string]: color } as React.CSSProperties;
  return term.to
    ? <Link to={term.to} className="pressable gloss-card" style={style} aria-label={term.t}>{inner}</Link>
    : <div className="gloss-card" style={style}>{inner}</div>;
}

export function Glossary() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return TERMS.filter((t) => (cat === 'All' || t.cat === cat) && (!query || t.t.toLowerCase().includes(query) || t.d.toLowerCase().includes(query)));
  }, [q, cat]);

  return (
    <div style={{ paddingTop: 80, paddingBottom: 64 }}>
      <Container style={{ maxWidth: 1080 }}>
        <Kicker>Glossary</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(1.9rem,4vw,3rem)', color: 'var(--text-hi)', margin: '10px 0 8px', letterSpacing: '-0.01em', lineHeight: 1.04 }}
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          Prosper, in <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>plain words.</em>
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--mist)', maxWidth: 560 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Every term you’ll hear around Prosper, explained once and clearly. Search it, or filter by kind.
        </motion.p>

        <div className="gloss-controls">
          <label className="gloss-search">
            <IconSearch size={15} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms…" aria-label="Search glossary" />
          </label>
          <div className="gloss-filters">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className="pressable gloss-chip" data-on={c === cat ? 'true' : 'false'}>{c}</button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="font-mono" style={{ marginTop: 34, fontSize: 12, color: 'var(--mist)' }}>No terms match “{q}”.</p>
        ) : (
          <div className="gloss-grid" style={{ marginTop: 22 }}>
            {shown.map((t) => <TermCard key={t.t} term={t} />)}
          </div>
        )}
      </Container>
    </div>
  );
}
