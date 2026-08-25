import { motion } from 'framer-motion';
import { Container, CTA } from '@/components/PageBits';
import { RoadmapMap, type RoadStep } from '@/components/RoadmapMap';
import { OFFICIAL_LINKS } from '@/data/ecosystem';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];

const STEPS: RoadStep[] = [
  { n: '01', k: 'Pharos', c: '#9fb0a6', d: 'The infrastructure — observable, tradable, composable. A scalable RealFi Layer-1.' },
  { n: '02', k: 'Prosper', c: '#38e0a0', d: 'Activation — strategies, capital participation and the performance market.' },
  { n: '03', k: 'Curator', c: '#e4c877', d: 'Someone with an edge brings a strategy and takes accountability in the open.' },
  { n: '04', k: 'Strategy', c: '#38e0a0', d: 'The thesis and approach, made measurable by what can be observed.' },
  { n: '05', k: 'Vault', c: '#2fbf8f', d: 'The strategy becomes an on-chain vehicle for capital. One launch, two assets.' },
  { n: '06', k: 'Vault Shares', c: '#38e0a0', d: 'Capital allocation — direct exposure to the underlying assets; tracks NAV.' },
  { n: '07', k: 'Track Record', c: '#8fbca7', d: 'Performance becomes observable — a public, verifiable history.' },
  { n: '08', k: 'p{VAULT}', c: '#e4c877', d: 'An independent market prices conviction in the Curator and strategy.' },
  { n: '09', k: 'Performance Market', c: '#38e0a0', d: 'Discover · Evaluate · Price · Trade. Strategies become active markets.' },
];

export function Journey() {
  return (
    <div style={{ paddingTop: 92, paddingBottom: 110 }}>
      <Container style={{ maxWidth: 1180 }}>
        <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.9, ease }}>
          <RoadmapMap steps={STEPS} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} style={{ marginTop: 64, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <CTA primary href={OFFICIAL_LINKS.prosperX}>Join the Community</CTA>
          <CTA to="/ecosystem">Explore the ecosystem</CTA>
        </motion.div>
      </Container>
    </div>
  );
}
