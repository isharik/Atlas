import { motion } from 'framer-motion';
import { Container, Kicker } from '@/components/PageBits';
import { TiltCard } from '@/components/TiltCard';
import { ZoneCarousel3D } from '@/components/ZoneCarousel3D';
import { ZONES, TRIAD, TAGLINES } from '@/data/ecosystem';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 22, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } } };
const viewport = { once: true, amount: 0.25 };

export function Ecosystem() {
  return (
    <div style={{ paddingTop: 100, paddingBottom: 90 }}>
      <Container>
        <Kicker>The Ecosystem</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.2rem,5.5vw,4rem)', color: 'var(--text-hi)', margin: '14px 0 10px' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease }}>
          How Prosper fits together.
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 620 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {TAGLINES.strategies} Drag or use the arrows, then open any part for its dedicated page.
        </motion.p>

        {/* zone carousel — 3D coverflow */}
        <motion.div initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={viewport} transition={{ duration: 0.8, ease }} style={{ marginTop: 36 }}>
          <ZoneCarousel3D zones={ZONES} />
        </motion.div>

        {/* triad */}
        <motion.div variants={{ show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" whileInView="show" viewport={viewport} style={{ marginTop: 72 }}>
          <motion.div variants={rise} className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.4em', marginBottom: 20 }}>Pharos → Prosper → Outcome</motion.div>
          <div className="grid-cards">
            {TRIAD.map((t) => (
              <motion.div key={t.key} variants={rise}>
                <TiltCard max={5} style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)' }}>
                  <div className="font-head" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.06em' }}>{t.key}</div>
                  <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--emerald-glow)', textTransform: 'uppercase', margin: '8px 0' }}>{t.role}</div>
                  <div className="font-display" style={{ fontSize: 13, color: 'var(--mist)', lineHeight: 1.5 }}>{t.items}</div>
                  {t.rel && <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(198,210,202,0.6)', textTransform: 'uppercase', marginTop: 12 }}>↓ {t.rel}</div>}
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
