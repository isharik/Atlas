import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Kicker } from '@/components/PageBits';
import { IconArrow } from '@/components/ui/icons';
import { POST_KITS } from '@/data/postkits';
import { ShareCardCanvas, CaptionStudio } from '@/components/poststudio/StudioParts';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 18, filter: 'blur(5px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } } };

export function PostStudioTopic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idx = POST_KITS.findIndex((t) => t.id === id);

  const prev = idx >= 0 ? POST_KITS[(idx - 1 + POST_KITS.length) % POST_KITS.length] : null;
  const next = idx >= 0 ? POST_KITS[(idx + 1) % POST_KITS.length] : null;

  useEffect(() => {
    if (!prev || !next) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') navigate(`/create/${prev.id}`);
      else if (e.key === 'ArrowRight') navigate(`/create/${next.id}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, prev, next]);

  if (idx < 0) return <Navigate to="/create" replace />;
  const topic = POST_KITS[idx];

  return (
    <div style={{ paddingTop: 100, paddingBottom: 84 }}>
      <Container style={{ maxWidth: 1120 }}>
        <motion.button onClick={() => navigate('/create')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pressable detail-back font-mono">
          <span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={13} /></span> All topics
        </motion.button>

        <motion.div key={topic.id} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } } }} style={{ marginTop: 20 }}>
          <motion.div variants={rise}><Kicker>{topic.category}</Kicker></motion.div>
          <motion.h1 variants={rise} className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2rem,4.6vw,3.2rem)', color: 'var(--text-hi)', margin: '12px 0 6px', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
            {topic.label}
          </motion.h1>
          <motion.p variants={rise} className="font-display" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 560 }}>{topic.hint}</motion.p>

          <motion.div variants={rise} className="studio-grid">
            <div className="studio-grid__card"><ShareCardCanvas topic={topic} /></div>
            <div className="studio-grid__cap"><CaptionStudio topic={topic} /></div>
          </motion.div>
        </motion.div>

        {prev && next && (
          <div className="detail-nav">
            <button className="pressable detail-nav__btn" onClick={() => navigate(`/create/${prev.id}`)} aria-label={`Previous topic: ${prev.label}`}>
              <span className="detail-nav__dir font-mono"><span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={12} /></span> Previous</span>
              <span className="detail-nav__name font-head">{prev.label}</span>
            </button>
            <button className="pressable detail-nav__btn detail-nav__btn--next" onClick={() => navigate(`/create/${next.id}`)} aria-label={`Next topic: ${next.label}`}>
              <span className="detail-nav__dir font-mono">Next <IconArrow size={12} /></span>
              <span className="detail-nav__name font-head">{next.label}</span>
            </button>
          </div>
        )}

        <p className="font-mono" style={{ textAlign: 'center', marginTop: 34, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.55)' }}>
          Every caption is grounded in real Prosper content · community-built · not an official Prosper product
        </p>
      </Container>
    </div>
  );
}
