import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container, Kicker, CTA } from '@/components/PageBits';
import { OFFICIAL_LINKS } from '@/data/ecosystem';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 20, filter: 'blur(5px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } } };
const viewport = { once: true, amount: 0.2 };

type State = 'live' | 'closed' | 'launch';

interface Item { label: string; state: State; note: string; to?: string; href?: string }
interface Phase { key: string; title: string; caption: string; standing: 'done' | 'current' | 'ahead'; items: Item[] }

// Every status below is grounded in pros-per.xyz + @ProsperTicker. Prosper is pre-launch;
// no launch date is public, so there is no countdown — only real, observable states.
const PHASES: Phase[] = [
  {
    key: '01', title: 'Infrastructure', caption: 'The market rails Prosper is built on.', standing: 'done',
    items: [
      { label: 'Pharos — RealFi Layer-1', state: 'live', note: 'Observable, tradable, composable market infrastructure.', to: '/pharos' },
      { label: 'R25 — vault mechanics', state: 'live', note: 'Dedicated vault mechanics, enabled where applicable.', to: '/pharos' },
    ],
  },
  {
    key: '02', title: 'Activation', caption: 'Building the first generation, ahead of launch.', standing: 'current',
    items: [
      { label: 'Founding Curator Cohort', state: 'closed', note: 'Onboarded the first Curators with a $50K Seed Fund. Applications ran Aug 2026.', to: '/programs' },
      { label: 'Ambassador Program', state: 'live', note: 'Live for storytellers and educators — 20,000 $PROS in rewards.', to: '/programs' },
      { label: 'Scholar Campaign', state: 'live', note: 'Learn Vault Shares, p{VAULT} and bonding curves on Layer3.', to: '/programs' },
    ],
  },
  {
    key: '03', title: 'Launch', caption: 'The Performance Market goes live.', standing: 'ahead',
    items: [
      { label: 'Vaults', state: 'launch', note: 'One launch mints two assets — capital and conviction.', to: '/zone/vaults' },
      { label: 'Vault Shares', state: 'launch', note: 'Capital allocation that tracks NAV, for allocators.', to: '/zone/vaults' },
      { label: 'p{VAULT}', state: 'launch', note: 'Independent conviction market — bonding curve, then DEX.', to: '/zone/pvault' },
      { label: 'Performance Market', state: 'launch', note: 'Discover · Evaluate · Price · Trade.', to: '/zone/performance-market' },
    ],
  },
];

const STATE_META: Record<State, { label: string; color: string; live?: boolean }> = {
  live: { label: 'Live', color: '#48e8ac', live: true },
  closed: { label: 'Closed', color: '#c3cfc7' },
  launch: { label: 'Opens at launch', color: '#ecd28a' },
};

function StatePill({ state }: { state: State }) {
  const m = STATE_META[state];
  return (
    <span className="font-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: m.color, border: `1px solid ${m.color}55`, borderRadius: 999, padding: '4px 9px', whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: m.color, boxShadow: m.live ? `0 0 8px ${m.color}` : 'none' }} />
      {m.label}
    </span>
  );
}

function ItemRow({ item }: { item: Item }) {
  const inner = (
    <div className="tracker-item">
      <div style={{ minWidth: 0 }}>
        <div className="font-head" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>{item.label}</div>
        <div className="font-display" style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--mist)', marginTop: 4 }}>{item.note}</div>
      </div>
      <StatePill state={item.state} />
    </div>
  );
  if (item.to) return <Link to={item.to} className="tracker-link">{inner}</Link>;
  return inner;
}

export function Tracker() {
  return (
    <div style={{ paddingTop: 100, paddingBottom: 96 }}>
      <Container style={{ maxWidth: 1000 }}>
        <Kicker>Launch Status</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.1rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '14px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          Where Prosper is <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>right now.</em>
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 640 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          Prosper is pre-launch. The ecosystem is being activated ahead of launch — the infrastructure is live, the first programs are running, and the market opens when Vaults go live. Everything below is real and observable.
        </motion.p>

        {/* phase rail */}
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="tracker-rail" style={{ marginTop: 40 }}>
          {PHASES.map((p, i) => (
            <div key={p.key} className="tracker-rail__step" data-standing={p.standing}>
              <span className="tracker-rail__dot" />
              <span className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{p.title}</span>
              {p.standing === 'current' && (
                <motion.span className="tracker-rail__now font-mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>You are here</motion.span>
              )}
              {i < PHASES.length - 1 && <span className="tracker-rail__line" />}
            </div>
          ))}
        </motion.div>

        {/* phases */}
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {PHASES.map((phase) => (
            <motion.section key={phase.key} variants={rise} initial="hidden" whileInView="show" viewport={viewport}
              className="tracker-phase" data-standing={phase.standing}>
              <div className="tracker-phase__head">
                <div className="flex items-center gap-3">
                  <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--mist)' }}>{phase.key}</span>
                  <span className="font-head" style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-hi)' }}>{phase.title}</span>
                </div>
                <span className="font-display" style={{ fontSize: 13, color: 'var(--mist)' }}>{phase.caption}</span>
              </div>
              <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
                {phase.items.map((it) => <ItemRow key={it.label} item={it} />)}
              </div>
            </motion.section>
          ))}
        </div>

        <motion.p className="font-mono" style={{ textAlign: 'center', marginTop: 40, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.55)' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={viewport} transition={{ duration: 0.6 }}>
          Status reflects public info from pros-per.xyz + @ProsperTicker · community-built
        </motion.p>

        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="flex items-center gap-3 flex-wrap" style={{ marginTop: 28, justifyContent: 'center' }}>
          <CTA primary href={OFFICIAL_LINKS.prosperX}>Follow for updates</CTA>
          <CTA to="/participate">Join the first generation</CTA>
        </motion.div>
      </Container>
    </div>
  );
}
