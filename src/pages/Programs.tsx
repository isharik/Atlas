import { motion } from 'framer-motion';
import { Container, Kicker, StatusPill } from '@/components/PageBits';
import { TiltCard } from '@/components/TiltCard';
import { PROGRAMS, PARTNERS } from '@/data/ecosystem';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 22, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } } };
const viewport = { once: true, amount: 0.2 };

export function Programs() {
  return (
    <div style={{ paddingTop: 100, paddingBottom: 90 }}>
      <Container>
        <Kicker>Activating the Ecosystem</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.2rem,5.5vw,4rem)', color: 'var(--text-hi)', margin: '14px 0 10px' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease }}>
          Programs & partners.
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 620 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Ahead of launch, Prosper is building its first generation of Curators, storytellers and partners.
        </motion.p>

        <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={viewport} className="grid-cards" style={{ marginTop: 40 }}>
          {PROGRAMS.map((p) => (
            <motion.div key={p.name} variants={rise}>
              <TiltCard max={5} accent="rgba(56,224,160,0.12)" style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)', height: '100%' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <span className="font-head" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-hi)' }}>{p.name}</span>
                  <StatusPill label={p.status} tone={p.status === 'Live' ? 'emerald' : 'mute'} />
                </div>
                {p.reward && <div className="font-mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--primary)', marginBottom: 8 }}>{p.reward}</div>}
                <p className="font-display" style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--mist)', margin: 0 }}>{p.detail}</p>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={{ show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" whileInView="show" viewport={viewport} style={{ marginTop: 64 }}>
          <motion.div variants={rise} className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.4em', marginBottom: 18 }}>Ecosystem Partners</motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {PARTNERS.map((pt) => (
              <motion.div key={pt.name} variants={rise} className="flex items-center justify-between" style={{ padding: '18px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)' }}>
                <div>
                  <span className="font-head" style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)' }}>{pt.name}</span>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--mist)', marginLeft: 8 }}>{pt.handle}</span>
                </div>
                <span className="font-display" style={{ fontSize: 12, color: 'var(--text-secondary, #9fb0a6)', maxWidth: 160, textAlign: 'right', lineHeight: 1.4 }}>{pt.role}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
