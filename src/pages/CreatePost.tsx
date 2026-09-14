import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container, Kicker } from '@/components/PageBits';
import { IconArrow } from '@/components/ui/icons';
import { POST_KITS, POST_CATEGORIES } from '@/data/postkits';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 18, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } } };
const viewport = { once: true, amount: 0.15 };

export function CreatePost() {
  const grouped = useMemo(
    () => POST_CATEGORIES.map((cat) => ({ cat, topics: POST_KITS.filter((t) => t.category === cat) })).filter((g) => g.topics.length),
    [],
  );

  return (
    <div style={{ paddingTop: 100, paddingBottom: 96 }}>
      <Container style={{ maxWidth: 1120 }}>
        <Kicker>Post Studio</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.1rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '14px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          Post about Prosper. <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Via Atlas.</em>
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 640 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          Pick a topic — each opens in its own space with a branded card and ready-to-post captions in three lengths. Edit anything you like, then share. It’s yours.
        </motion.p>

        {grouped.map((g) => (
          <motion.section key={g.cat} className="studio-section" variants={{ show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" whileInView="show" viewport={viewport}>
            <motion.div variants={rise} className="studio-section__cat font-mono">{g.cat}</motion.div>
            <div className="studio-topics">
              {g.topics.map((t) => (
                <motion.div key={t.id} variants={rise}>
                  <Link to={`/create/${t.id}`} className="pressable studio-topic" aria-label={`Open ${t.label}`}>
                    <div className="studio-topic__body">
                      <div className="studio-topic__label font-head">{t.label}</div>
                      <div className="studio-topic__hint font-display">{t.hint}</div>
                    </div>
                    <span className="studio-topic__open font-mono">Open<span className="studio-topic__arrow"><IconArrow size={13} /></span></span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}

        <motion.p className="font-mono" style={{ textAlign: 'center', marginTop: 46, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.55)' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          Every caption is grounded in real Prosper content · community-built · not an official Prosper product
        </motion.p>
      </Container>
    </div>
  );
}
