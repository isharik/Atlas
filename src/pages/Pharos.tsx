import { motion } from 'framer-motion';
import { Container, Kicker, CTA } from '@/components/PageBits';
import { TiltCard } from '@/components/TiltCard';
import { TRIAD, PILLARS, PARTNERS, TAGLINES, OFFICIAL_LINKS } from '@/data/ecosystem';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 22, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } } };
const viewport = { once: true, amount: 0.25 };

export function Pharos() {
  return (
    <div style={{ paddingTop: 100, paddingBottom: 90 }}>
      <Container>
        <Kicker>Built on Pharos</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.2rem,5.5vw,4rem)', color: 'var(--text-hi)', margin: '14px 0 10px' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease }}>
          Infrastructure, activated.
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 640 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Pharos provides the market infrastructure. Prosper activates it through strategies, capital and participation. {TAGLINES.realWorld}
        </motion.p>

        <motion.div variants={{ show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" whileInView="show" viewport={viewport} className="grid-cards" style={{ marginTop: 44 }}>
          {TRIAD.map((t) => (
            <motion.div key={t.key} variants={rise}>
              <TiltCard max={5} style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)', height: '100%' }}>
                <div className="font-head" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.06em' }}>{t.key}</div>
                <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--emerald-glow)', textTransform: 'uppercase', margin: '8px 0' }}>{t.role}</div>
                <div className="font-display" style={{ fontSize: 13, color: 'var(--mist)', lineHeight: 1.5 }}>{t.items}</div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={viewport} style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {PILLARS.map((p) => (
            <motion.div key={p.title} variants={rise} style={{ padding: 22, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.4)' }}>
              <div className="font-head" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-hi)' }}>{p.title}</div>
              <div className="font-display" style={{ fontSize: 13, color: 'var(--mist)', marginTop: 6 }}>{p.line}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={viewport} style={{ marginTop: 56 }}>
          <motion.div variants={rise} className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.4em', marginBottom: 18 }}>Partners</motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {PARTNERS.map((pt) => (
              <motion.div key={pt.name} variants={rise} className="flex items-center justify-between" style={{ padding: '18px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)' }}>
                <div>
                  <span className="font-head" style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)' }}>{pt.name}</span>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--mist)', marginLeft: 8 }}>{pt.handle}</span>
                </div>
                <span className="font-display" style={{ fontSize: 12, color: 'var(--mist)', maxWidth: 160, textAlign: 'right', lineHeight: 1.4 }}>{pt.role}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} style={{ marginTop: 52, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <CTA href={OFFICIAL_LINKS.pharosSite}>Visit Pharos</CTA>
          <CTA href={OFFICIAL_LINKS.pharosDocs}>Pharos Docs</CTA>
        </motion.div>
      </Container>
    </div>
  );
}
