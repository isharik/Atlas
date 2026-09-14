import { useState } from 'react';
import { motion } from 'framer-motion';
import { Container, Kicker, CTA } from '@/components/PageBits';
import { OFFICIAL_LINKS } from '@/data/ecosystem';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 20, filter: 'blur(5px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } } };
const viewport = { once: true, amount: 0.2 };

const OCTO_X = 'https://x.com/search?q=Professor%20Octo%20Prosper&src=typed_query&f=live';

const TRAITS = ['Reads the tape', 'Backs Curators early', 'Allergic to hype', 'Eight arms, eight strategies'];
const STATS = [
  { k: 'Conviction', v: '99' },
  { k: 'Patience', v: '88' },
  { k: 'Ink reserves', v: '∞' },
  { k: 'FUD resistance', v: '100' },
];
const LORE = [
  'Professor Octo is the face the Prosper community rallies behind. Part scholar, part market watcher, he shows up whenever people talk about reading strategies in the open and getting early to the right Curators. Basically the vibe of the Performance Market, in a suit.',
  'The story goes that he sits at the bottom of the market with eight arms in eight strategies at once, watching the tape nobody else bothers to read. When a Curator quietly starts to perform, he already knows. That gold coin he\'s holding is the one everyone else notices six months too late.',
  'The green matrix behind him is the point. Octo doesn\'t trade on stories, he trades on what can be observed. Verifiable performance, onchain, in real time. If it can\'t be checked, he isn\'t interested.',
];

export function ProfessorOcto() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div style={{ paddingTop: 100, paddingBottom: 96 }}>
      <Container style={{ maxWidth: 1080 }}>
        {/* hero */}
        <div className="octo-hero">
          {/* portrait */}
          <motion.div initial={{ opacity: 0, scale: 0.94, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 1, ease }}
            className="octo-portrait">
            <div aria-hidden className="octo-portrait__glow" />
            {imgOk ? (
              <img src="/professor-octo.png" alt="Professor Octo, the Prosper mascot" onError={() => setImgOk(false)}
                style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18 }} />
            ) : (
              <div className="octo-portrait__fallback">
                <span className="font-display" style={{ fontSize: 64, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>P.O.</span>
                <span className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mist)', marginTop: 12, textAlign: 'center', padding: '0 24px' }}>Add the artwork at public/professor-octo.png</span>
              </div>
            )}
          </motion.div>

          {/* intro */}
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}>
            <motion.div variants={rise}><Kicker>Prosper Character</Kicker></motion.div>
            <motion.h1 variants={rise} className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.4rem,5.5vw,4rem)', color: 'var(--text-hi)', margin: '12px 0 6px', lineHeight: 1.02 }}>
              Professor <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Octo.</em>
            </motion.h1>
            <motion.p variants={rise} className="font-mono" style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--emerald-glow)' }}>
              Eight arms · one thesis
            </motion.p>
            <motion.p variants={rise} className="font-display" style={{ fontSize: 15.5, lineHeight: 1.72, color: 'var(--mist)', marginTop: 18, maxWidth: 460 }}>
              The mascot the Prosper community trends behind. He reads strategies in the open, backs the right Curators early, and only cares about performance you can actually verify.
            </motion.p>
            <motion.div variants={rise} className="flex flex-wrap gap-2" style={{ marginTop: 20 }}>
              {TRAITS.map((t) => <span key={t} className="octo-trait">{t}</span>)}
            </motion.div>
            <motion.div variants={rise} className="flex items-center gap-3 flex-wrap" style={{ marginTop: 26 }}>
              <CTA primary href={OCTO_X}>See Octo on X</CTA>
              <CTA to="/ecosystem">Enter the ecosystem</CTA>
            </motion.div>
          </motion.div>
        </div>

        {/* stat card */}
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="octo-stats" style={{ marginTop: 48 }}>
          {STATS.map((s) => (
            <div key={s.k} className="octo-stat">
              <div className="font-display" style={{ fontSize: 'clamp(1.6rem,3.4vw,2.2rem)', fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
              <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mist)', marginTop: 6 }}>{s.k}</div>
            </div>
          ))}
        </motion.div>

        {/* lore */}
        <div style={{ marginTop: 52, maxWidth: 720 }}>
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="eyebrow" style={{ fontSize: 11, letterSpacing: '0.4em', marginBottom: 18 }}>The lore</motion.div>
          {LORE.map((p, i) => (
            <motion.p key={i} variants={rise} initial="hidden" whileInView="show" viewport={viewport}
              className="font-display" style={{ fontSize: 15.5, lineHeight: 1.8, color: 'var(--text)', marginBottom: 18 }}>{p}</motion.p>
          ))}
          <motion.p variants={rise} initial="hidden" whileInView="show" viewport={viewport} className="font-mono"
            style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.55)', marginTop: 14 }}>
            Community character · art from the Prosper community · not an official Prosper product
          </motion.p>
        </div>
      </Container>
    </div>
  );
}
