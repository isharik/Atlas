import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container, Kicker } from '@/components/PageBits';
import { IconArrow } from '@/components/ui/icons';
import { POST_KITS, POST_CATEGORIES } from '@/data/postkits';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 18, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } } };
const viewport = { once: true, amount: 0.15 };
const CAT_COLORS = ['#e4c877', '#38e0a0', '#69e7e0', '#8b82c4'];

export function CreatePost() {
  const grouped = useMemo(
    () => POST_CATEGORIES.map((cat) => ({ cat, topics: POST_KITS.filter((t) => t.category === cat) })).filter((g) => g.topics.length),
    [],
  );
  const order = useMemo(() => new Map(POST_KITS.map((t, i) => [t.id, i + 1])), []);

  return (
    <div style={{ paddingTop: 84, paddingBottom: 40 }}>
      <Container style={{ maxWidth: 1160 }}>
        <div className="flex items-baseline justify-between flex-wrap" style={{ gap: 12 }}>
          <div>
            <Kicker>Post Studio</Kicker>
            <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(1.8rem,3.6vw,2.7rem)', color: 'var(--text-hi)', margin: '10px 0 0', letterSpacing: '-0.01em', lineHeight: 1.04 }}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
              Post about Prosper. <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Via Atlas.</em>
            </motion.h1>
          </div>
          <motion.p className="font-display" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--mist)', maxWidth: 340 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Pick a topic — each opens in its own space with a branded card and captions in three lengths.
          </motion.p>
        </div>

        {grouped.map((g, gi) => {
          const color = CAT_COLORS[gi % CAT_COLORS.length];
          return (
            <motion.section key={g.cat} className="studio-section" variants={{ show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" whileInView="show" viewport={viewport}>
              <motion.div variants={rise} className="studio-section__cat font-mono" style={{ color }}>
                <span className="studio-section__tick" style={{ background: color }} />{g.cat}
              </motion.div>
              <div className="studio-topics">
                {g.topics.map((t) => (
                  <motion.div key={t.id} variants={rise}>
                    <Link to={`/create/${t.id}`} className="pressable studio-topic" aria-label={`Open ${t.label}`} style={{ ['--cat' as string]: color } as React.CSSProperties}>
                      <span aria-hidden className="studio-topic__wash" />
                      <span aria-hidden className="studio-topic__no font-mono">{String(order.get(t.id) ?? 0).padStart(2, '0')}</span>
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
          );
        })}

        <p className="font-mono" style={{ textAlign: 'center', marginTop: 26, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.5)' }}>
          Grounded in real Prosper content · community-built · not an official Prosper product
        </p>
      </Container>
    </div>
  );
}
