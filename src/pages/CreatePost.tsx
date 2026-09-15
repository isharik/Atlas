import { useMemo } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container, Kicker } from '@/components/PageBits';
import { IconArrow, Compass } from '@/components/ui/icons';
import { POST_KITS, POST_CATEGORIES } from '@/data/postkits';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 16, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } } };
const viewport = { once: true, amount: 0.12 };
const CAT_COLORS = ['#e4c877', '#38e0a0', '#69e7e0', '#8b82c4'];

export function CreatePost() {
  const reduce = useReducedMotion();
  const grouped = useMemo(
    () => POST_CATEGORIES.map((cat) => ({ cat, topics: POST_KITS.filter((t) => t.category === cat) })).filter((g) => g.topics.length),
    [],
  );
  const order = useMemo(() => {
    const m = new Map<string, number>();
    let n = 0;
    grouped.forEach((g) => g.topics.forEach((t) => m.set(t.id, ++n)));
    return m;
  }, [grouped]);

  // interactive 3D divider — the Prosper mark tilts toward the cursor (spring-smoothed)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(mx, { stiffness: 120, damping: 14, mass: 0.6 });
  const rotateX = useSpring(my, { stiffness: 120, damping: 14, mass: 0.6 });
  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 30);
    my.set(-((e.clientY - r.top) / r.height - 0.5) * 22);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <div style={{ paddingTop: 92, paddingBottom: 56 }}>
      <Container style={{ maxWidth: 1180 }}>
        <div className="studio-split" onMouseMove={onMove} onMouseLeave={onLeave}>
          {/* left — the intro, with room to breathe */}
          <motion.aside className="studio-aside" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}>
            <motion.div variants={rise}><Kicker>Post Studio</Kicker></motion.div>
            <motion.h1 variants={rise} className="font-display studio-aside__title">
              Post about Prosper. <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Via Atlas.</em>
            </motion.h1>
            <motion.p variants={rise} className="font-display studio-aside__lead">
              Pick a topic. Each one opens in its own space with a branded card and ready-to-post captions in three lengths — edit anything, then share. It’s yours.
            </motion.p>
            <motion.div variants={rise} className="studio-aside__foot font-mono">
              Grounded in real Prosper content · community-built
            </motion.div>
          </motion.aside>

          {/* divider — an interactive 3D Prosper mark */}
          <div className="studio-divider" aria-hidden>
            <motion.div className="studio-divider__logo" style={{ rotateY, rotateX, transformPerspective: 700 }}>
              <span className="studio-divider__glow" />
              <Compass size={30} color="#E4C877" />
            </motion.div>
          </div>

          {/* right — the topic cards */}
          <div className="studio-right">
            {grouped.map((g, gi) => {
              const color = CAT_COLORS[gi % CAT_COLORS.length];
              return (
                <motion.section key={g.cat} className="studio-group" variants={{ show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" whileInView="show" viewport={viewport}>
                  <motion.div variants={rise} className="studio-group__cat font-mono" style={{ color }}>
                    <span className="studio-section__tick" style={{ background: color }} />{g.cat}
                  </motion.div>
                  <div className="studio-group__grid">
                    {g.topics.map((t) => (
                      <motion.div key={t.id} variants={rise} className="studio-topic-wrap">
                        <Link to={`/create/${t.id}`} className="pressable studio-topic" aria-label={`Open ${t.label}`} style={{ ['--cat' as string]: color } as React.CSSProperties}>
                          <span aria-hidden className="studio-topic__ghost font-mono">{String(order.get(t.id) ?? 0).padStart(2, '0')}</span>
                          <div className="studio-topic__label font-head">{t.label}</div>
                          <div className="studio-topic__hint font-display">{t.hint}</div>
                          <span className="studio-topic__go font-mono">Open <span className="studio-topic__arrow"><IconArrow size={12} /></span></span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
