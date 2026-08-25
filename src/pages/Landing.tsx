import { motion } from 'framer-motion';
import { AtlasHero } from '@/components/atlas/AtlasHero';
import { Wordmark } from '@/components/Wordmark';
import { TiltCard } from '@/components/TiltCard';
import { Container, CTA } from '@/components/PageBits';
import { IconArrow, IconChevron } from '@/components/ui/icons';
import { TAGLINES, PILLARS } from '@/data/ecosystem';
import { useAudio } from '@/audio/AudioProvider';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 26, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } } };
const viewport = { once: true, amount: 0.3 };
const heroItem = { hidden: { opacity: 0, y: 18, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease } } };

export function Landing() {
  const { click } = useAudio();

  return (
    <div>
      {/* HERO — immersive atlas: black hole singularity + orbiting nodes */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 8rem)', overflow: 'hidden' }}>
        <AtlasHero className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
        {/* left scrim keeps the hero copy readable over the scene */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(13,19,16,0.92) 0%, rgba(13,19,16,0.6) 30%, transparent 58%)', pointerEvents: 'none' }} />

        <motion.div className="relative flex flex-col justify-center" style={{ minHeight: 'calc(100vh - 8rem)', maxWidth: 420, padding: '0 24px 0 clamp(24px, 5vw, 64px)', pointerEvents: 'none' }}
          initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } } }}>
          <motion.div variants={heroItem} className="flex items-center gap-2">
            <span className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.5em' }}>Welcome to</span>
            <span style={{ color: 'var(--emerald-bright)' }}><IconArrow size={13} /></span>
          </motion.div>

          <motion.div variants={heroItem} style={{ marginTop: 14 }}>
            <Wordmark style={{ fontSize: 'clamp(2.7rem, 6.2vw, 4.8rem)', letterSpacing: '0.02em', lineHeight: 1 }} />
          </motion.div>

          <motion.p variants={heroItem} className="font-display" style={{ marginTop: 20, fontSize: 'clamp(1rem,1.9vw,1.25rem)', lineHeight: 1.4, color: 'var(--text)', fontWeight: 300 }}>
            Explore how strategies become{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: 400, textShadow: '0 0 20px rgba(228,200,119,0.25)' }}>markets.</em>
          </motion.p>

          <motion.p variants={heroItem} className="font-display" style={{ marginTop: 16, fontSize: 13, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 320, opacity: 0.85 }}>
            An interactive atlas of the Prosper ecosystem — orbit the core, then open any node to go deeper.
          </motion.p>

          <motion.div variants={heroItem} style={{ marginTop: 28, pointerEvents: 'auto' }}>
            <CTA primary to="/ecosystem">Begin Exploring</CTA>
          </motion.div>

          <motion.div variants={heroItem} className="flex items-center gap-3" style={{ marginTop: 24, pointerEvents: 'auto' }}>
            <span style={{ width: 1, height: 30, background: 'linear-gradient(180deg, var(--mist), transparent)', opacity: 0.5 }} />
            <button onClick={() => { click(); document.querySelector('#activate')?.scrollIntoView({ behavior: 'smooth' }); }} className="pressable flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mist)' }}>
              <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase' }}>Scroll to discover</span>
              <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}><IconChevron size={13} /></motion.span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ACTIVATE */}
      <section id="activate" style={{ padding: '120px 0' }}>
        <Container style={{ textAlign: 'center', maxWidth: 820 }}>
          <motion.p className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(1.4rem,3.4vw,2.4rem)', lineHeight: 1.28, color: 'var(--text-hi)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.9, ease }}>
            Tokenization created the assets. <span style={{ color: 'var(--primary)' }}>Prosper activates the market.</span>
          </motion.p>
          <motion.p className="font-display" style={{ marginTop: 20, fontSize: 15.5, lineHeight: 1.75, color: 'var(--mist)' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.8, delay: 0.1, ease }}>
            {TAGLINES.one} {TAGLINES.two}
          </motion.p>
        </Container>
      </section>

      {/* PILLARS */}
      <section style={{ padding: '0 0 130px' }}>
        <Container>
          <motion.div variants={{ show: { transition: { staggerChildren: 0.09 } } }} initial="hidden" whileInView="show" viewport={viewport} className="grid-cards">
            {PILLARS.map((p) => (
              <motion.div key={p.title} variants={rise}>
                <TiltCard max={5} style={{ padding: 26, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)' }}>
                  <div className="font-head" style={{ fontSize: 18, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.04em' }}>{p.title}</div>
                  <div className="font-display" style={{ fontSize: 14, color: 'var(--mist)', marginTop: 10, lineHeight: 1.55 }}>{p.line}</div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
          <motion.p className="font-mono" style={{ textAlign: 'center', marginTop: 48, fontSize: 10, letterSpacing: '0.2em', color: 'rgba(198,210,202,0.6)', textTransform: 'uppercase' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={viewport} transition={{ duration: 0.8 }}>
            {TAGLINES.disclaimer}
          </motion.p>
        </Container>
      </section>
    </div>
  );
}
