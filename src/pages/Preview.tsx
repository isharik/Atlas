import { motion } from 'framer-motion';
import { Container, Kicker, CTA } from '@/components/PageBits';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 20, filter: 'blur(5px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } } };
const viewport = { once: true, amount: 0.15 };

// Early preview shared by the Prosper team. The mechanics are real; the vault names,
// prices and totals here are illustrative teaser values, NOT live protocol data.
type Status = 'graduated' | 'curve' | 'ended';
interface PVault { name: string; ticker: string; type: string; perf: number; tvl: string; p: string; ticker2: string; status: Status }
const VAULTS: PVault[] = [
  { name: 'Stable Yield Plus', ticker: 'SYP', type: 'RWA', perf: 5.8, tvl: '$31.74M', p: '$0.000052', ticker2: 'pSYP', status: 'graduated' },
  { name: 'Momentum Crypto', ticker: 'MOMO', type: 'Bluechip', perf: 31.2, tvl: '$23.62M', p: '$0.000118', ticker2: 'pMOMO', status: 'graduated' },
  { name: 'Delta Neutral Pro', ticker: 'DNP', type: 'Delta-Neutral', perf: 8.3, tvl: '$21.66M', p: '$0.000071', ticker2: 'pDNP', status: 'graduated' },
  { name: 'Legacy Balanced', ticker: 'LEGB', type: 'Bluechip', perf: 22.4, tvl: '$12.24M', p: '$0.000061', ticker2: 'pLEGB', status: 'graduated' },
  { name: 'Carbon RWA Fund', ticker: 'CRBN', type: 'RWA', perf: 4.1, tvl: '$10.41M', p: '$0.000058', ticker2: 'pCRBN', status: 'graduated' },
  { name: 'Helios DeFi Yield', ticker: 'HLDF', type: 'Bluechip', perf: 0.0, tvl: '$7.04M', p: '$0.000049', ticker2: 'pHLDF', status: 'curve' },
  { name: 'Sovereign Treasury', ticker: 'SOVT', type: 'Sovereign Treasury', perf: 0.0, tvl: '$6.30M', p: '$0.000012', ticker2: 'pSOVT', status: 'curve' },
  { name: 'Apex Multi-Strategy', ticker: 'APEX', type: 'AI Quant', perf: 0.0, tvl: '$6.24M', p: '$0.000086', ticker2: 'pAPEX', status: 'curve' },
];

const STATUS: Record<Status, { label: string; color: string }> = {
  graduated: { label: 'Graduated', color: '#48e8ac' },
  curve: { label: 'On Curve', color: '#ecd28a' },
  ended: { label: 'Vault ended', color: '#c3cfc7' },
};

const MECHANICS = [
  { k: 'Vault Token Price', v: 'Price per Vault Token, after fees. Updates every block.' },
  { k: 'On Curve → Graduated', v: 'A p{VAULT} opens on its bonding curve, then graduates to FaroSwap, the native AMM/PMM DEX on Pharos.' },
  { k: 'Early Depositor Reward', v: 'Deposit within the Reward Cap in the first 14 days to earn a share of 6% of the Vault’s p{VAULT} supply. Beyond that, you still get Vault Tokens, just no reward.' },
];
const TYPES = ['RWA', 'Bluechip', 'Delta-Neutral', 'Sovereign Treasury', 'AI Quant'];
const SURFACES = ['Vaults', 'Launchpad', 'Portfolio', 'Curator', 'Whitelist Assets'];

export function Preview() {
  return (
    <div style={{ paddingTop: 100, paddingBottom: 96 }}>
      <Container style={{ maxWidth: 1080 }}>
        <Kicker>Sneak Peek</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.1rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '14px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          What launch <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>looks like.</em>
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 660 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          An early look at the live Prosper app, shared by the team ahead of launch. The mechanics below are real. The vault names, prices and totals are illustrative previews, not live data.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginTop: 16 }}>
          <span className="font-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--primary)', border: '1px solid rgba(228,200,119,0.4)', borderRadius: 999, padding: '5px 12px' }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--primary)' }} />
            Early preview · illustrative, not live
          </span>
        </motion.div>

        {/* metric tiles */}
        <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={viewport}
          className="grid-cards" style={{ marginTop: 36 }}>
          {[['Total Value Locked', '$121,010,000'], ['Total Live Vaults', '10'], ['Early Depositor Reward', '5']].map(([k, v]) => (
            <motion.div key={k} variants={rise} className="preview-tile">
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mist)' }}>{k}</div>
              <div className="font-mono" style={{ fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 600, color: 'var(--text-hi)', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* vaults preview */}
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} style={{ marginTop: 34 }}>
          <div className="flex items-baseline justify-between" style={{ marginBottom: 14 }}>
            <span className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.4em' }}>Vaults on Prosper</span>
            <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.5)' }}>Preview</span>
          </div>
          <div className="preview-vaults">
            {VAULTS.map((v) => {
              const s = STATUS[v.status];
              return (
                <div key={v.ticker} className="preview-vault">
                  <div style={{ minWidth: 0 }}>
                    <div className="font-head" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>{v.name} <span className="font-mono" style={{ fontSize: 10, color: 'var(--mist)' }}>{v.ticker}</span></div>
                    <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--mist)', marginTop: 3 }}>{v.type}</div>
                  </div>
                  <div className="preview-vault__stats">
                    <span className="font-mono" style={{ color: v.perf > 0 ? '#48e8ac' : 'var(--mist)', fontVariantNumeric: 'tabular-nums' }}>{v.perf > 0 ? '+' : ''}{v.perf.toFixed(1)}%</span>
                    <span className="font-mono" style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{v.tvl}</span>
                    <span className="font-mono" style={{ color: 'var(--primary)' }}>{v.ticker2} <span style={{ color: 'var(--mist)' }}>{v.p}</span></span>
                    <span className="font-mono preview-pill" style={{ color: s.color, borderColor: `${s.color}55` }}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* mechanics */}
        <motion.div variants={{ show: { transition: { staggerChildren: 0.09 } } }} initial="hidden" whileInView="show" viewport={viewport} style={{ marginTop: 40 }}>
          <span className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.4em' }}>How it works at launch</span>
          <div className="grid-cards" style={{ marginTop: 16 }}>
            {MECHANICS.map((m) => (
              <motion.div key={m.k} variants={rise} className="preview-tile">
                <div className="font-head" style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary)' }}>{m.k}</div>
                <p className="font-display" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--mist)', marginTop: 8 }}>{m.v}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* types + surfaces */}
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="preview-tile" style={{ marginTop: 20 }}>
          <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--emerald-glow)', marginBottom: 10 }}>Strategy types at launch</div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => <span key={t} className="preview-chip">{t}</span>)}
          </div>
          <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--emerald-glow)', margin: '18px 0 10px' }}>App surfaces coming</div>
          <div className="flex flex-wrap gap-2">
            {SURFACES.map((t) => <span key={t} className="preview-chip">{t}</span>)}
          </div>
        </motion.div>

        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="flex items-center gap-3 flex-wrap" style={{ marginTop: 34, justifyContent: 'center' }}>
          <CTA primary to="/tracker">See launch status</CTA>
          <CTA to="/zone/pvault">How p&#123;VAULT&#125; works</CTA>
        </motion.div>

        <motion.p className="font-mono" style={{ textAlign: 'center', marginTop: 34, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.5)' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={viewport} transition={{ duration: 0.6 }}>
          Early preview from the Prosper team · illustrative values · community-built
        </motion.p>
      </Container>
    </div>
  );
}
