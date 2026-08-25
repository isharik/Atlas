import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container, Kicker, CTA, StatusPill } from '@/components/PageBits';
import { TiltCard } from '@/components/TiltCard';
import { ROLES } from '@/data/ecosystem';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 22, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } } };
const viewport = { once: true, amount: 0.2 };

export function Participate() {
  return (
    <div style={{ paddingTop: 100, paddingBottom: 90 }}>
      <Container>
        <Kicker>Join the First Generation</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.2rem,5.5vw,4rem)', color: 'var(--text-hi)', margin: '14px 0 10px' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease }}>
          Four ways to participate.
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 620 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          The first wave of Curators, communities and strategies is taking shape. Join before the first Vaults go live.
        </motion.p>

        <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={viewport}
          className="grid-2x2" style={{ marginTop: 44 }}>
          {ROLES.map((r) => (
            <motion.div key={r.id} variants={rise}>
            <TiltCard max={5} accent="rgba(228,200,119,0.12)" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 26, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)', height: '100%' }}>
              <div className="flex items-center justify-between">
                <span className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.32em' }}>{r.audience}</span>
                <StatusPill label={r.status} tone={r.status === 'Available' ? 'emerald' : 'mute'} />
              </div>
              <div className="font-head" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-hi)', letterSpacing: '0.01em' }}>{r.title}</div>
              <p className="font-display" style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--mist)', margin: 0, flex: 1 }}>{r.body}</p>
              <div className="flex items-center gap-3" style={{ marginTop: 6 }}>
                {r.cta ? <CTA primary href={r.cta.href}>{r.cta.label}</CTA> : <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--mist)', textTransform: 'uppercase' }}>Opens with launch</span>}
                {r.badge && <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--primary)', border: '1px solid rgba(228,200,119,0.4)', padding: '5px 10px', borderRadius: 999 }}>{r.badge}</span>}
              </div>
              {r.id === 'curators' && (
                <Link to="/studio" className="hover-gold font-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mist)', textDecoration: 'none' }}>
                  Design your Vault in the Studio →
                </Link>
              )}
            </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </div>
  );
}
