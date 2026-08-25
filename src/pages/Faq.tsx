import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Container, Kicker } from '@/components/PageBits';
import { FAQS } from '@/data/ecosystem';
import { useAudio } from '@/audio/AudioProvider';
import { IconChevron, IconArrow } from '@/components/ui/icons';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const { click } = useAudio();
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100 }}>
      <Container style={{ maxWidth: 780 }}>
        <div style={{ textAlign: 'center' }}>
          <Kicker>Questions & Answers</Kicker>
          <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.2rem,5.5vw,4rem)', color: 'var(--text-hi)', margin: '16px 0 12px' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease }}>
            Everything about Prosper.
          </motion.h1>
          <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 560, margin: '0 auto' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Real answers, drawn straight from Prosper’s own material. Prefer to ask in your own words? Use{' '}
            <span style={{ color: 'var(--primary)' }}>Ask Prosper</span> in the corner.
          </motion.p>
        </div>

        <motion.div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 12 }}
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }} variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div key={f.q} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                style={{ borderRadius: 12, border: `1px solid ${isOpen ? 'rgba(228,200,119,0.35)' : 'var(--border)'}`, background: 'rgba(15,22,18,0.5)', overflow: 'hidden', transition: 'border-color 260ms var(--ease-out2)' }}>
                <button onClick={() => { click(); setOpen(isOpen ? null : i); }} className="pressable" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span className="font-head" style={{ fontSize: 16, fontWeight: 600, color: isOpen ? 'var(--primary)' : 'var(--text-hi)' }}>{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease }} style={{ color: 'var(--mist)', flexShrink: 0 }}><IconChevron size={16} /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.34, ease }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 22px 20px' }}>
                        <p className="font-display" style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text)', opacity: 0.85, margin: 0 }}>{f.a}</p>
                        {f.to && (
                          <button onClick={() => { click(); navigate(f.to!); }} className="pressable hover-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--primary)' }}>
                            Learn more <IconArrow size={12} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </div>
  );
}
