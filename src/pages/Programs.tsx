import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container, Kicker, StatusPill } from '@/components/PageBits';
import { TiltCard } from '@/components/TiltCard';
import { IconArrow } from '@/components/ui/icons';
import { PROGRAMS, PARTNERS } from '@/data/ecosystem';
import { slugify } from '@/lib/slug';

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
              <TiltCard max={5} accent="rgba(56,224,160,0.12)" style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <span className="font-head" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-hi)' }}>{p.name}</span>
                  <StatusPill label={p.status} tone={p.status === 'Live' ? 'emerald' : 'mute'} />
                </div>
                {p.reward && <div className="font-mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--primary)', marginBottom: 8 }}>{p.reward}</div>}
                <p className="font-display" style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--mist)', margin: 0, flex: 1 }}>{p.detail}</p>
                <Link to={`/programs/${slugify(p.name)}`} className="pressable card-open font-mono" aria-label={`Open ${p.name}`} style={{ marginTop: 18 }}>
                  Open<span className="card-open__arrow"><IconArrow size={14} /></span>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} style={{ marginTop: 64 }}>
          <div className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.4em', marginBottom: 18 }}>Ecosystem Partners</div>
          <div className="partner-strip">
            {PARTNERS.map((pt) => (
              <div key={pt.name} className="partner">
                <span className="partner__logo font-head" aria-hidden>{pt.name[0]}</span>
                <span className="partner__name font-head">{pt.name}</span>
                {pt.handle ? <span className="partner__handle font-mono">{pt.handle}</span> : <span className="partner__handle font-mono" style={{ opacity: 0 }}>—</span>}
                <span className="partner__role font-display">{pt.role}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
