import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Container, Kicker } from '@/components/PageBits';
import { drawCard } from '@/components/ShareCard';
import { POST_KITS, POST_CATEGORIES, type PostTopic } from '@/data/postkits';
import { useAudio } from '@/audio/AudioProvider';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const FOOTNOTE = 'Made via Atlas for Prosper';

function siteUrl() {
  return typeof window !== 'undefined' ? window.location.origin : 'https://pros-per.xyz';
}

/** The branded graphic for the selected topic + image actions. */
function TopicCard({ topic }: { topic: PostTopic }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const { click } = useAudio();

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const render = () => drawCard(c, { ...topic.card, footnote: FOOTNOTE });
    (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(render);
    render();
  }, [topic]);

  const blob = () => new Promise<Blob | null>((res) => ref.current?.toBlob((b) => res(b), 'image/png'));
  const download = async () => {
    click();
    const b = await blob(); if (!b) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = `prosper-atlas-${topic.id}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const copyImg = async () => {
    click();
    try { const b = await blob(); if (!b) throw new Error(); await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); setCopied(true); }
    catch { download(); }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="create-card">
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <canvas ref={ref} style={{ width: '100%', height: 'auto', display: 'block' }} aria-label={`${topic.label} share card`} />
      </div>
      <div className="flex items-center gap-2.5" style={{ marginTop: 12 }}>
        <button onClick={download} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 auto' }}>Download image</button>
        <button onClick={copyImg} className="pressable share-btn" style={{ flex: '1 1 auto' }}>{copied ? 'Copied ✓' : 'Copy image'}</button>
      </div>
    </div>
  );
}

function PostVariant({ text, index }: { text: string; index: number }) {
  const reduce = useReducedMotion();
  const { click } = useAudio();
  const [draft, setDraft] = useState(text);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setDraft(text); setEditing(false); }, [text]);

  const value = draft;
  const copy = () => { click(); navigator.clipboard?.writeText(value).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const postX = () => { click(); window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`${value}\n\n${siteUrl()}`)}`, '_blank', 'noopener'); };

  return (
    <motion.div className="create-post"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.06, duration: 0.4, ease }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <span className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mist)' }}>Option {String.fromCharCode(65 + index)}</span>
        <button onClick={() => { click(); setEditing((v) => !v); }} className="pressable font-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: editing ? 'var(--primary)' : 'var(--mist)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {editing ? 'Done' : 'Customize'}
        </button>
      </div>

      {editing ? (
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={Math.max(4, Math.ceil(draft.length / 46))} className="create-textarea font-display" aria-label="Edit post" />
      ) : (
        <p className="font-display create-post__text">{value}</p>
      )}

      <div className="flex items-center gap-2.5" style={{ marginTop: 14 }}>
        <button onClick={postX} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 auto' }}>Post on X</button>
        <button onClick={copy} className="pressable share-btn" style={{ flex: '0 0 auto' }}>{copied ? 'Copied ✓' : 'Copy text'}</button>
      </div>
    </motion.div>
  );
}

export function CreatePost() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(POST_KITS[0].id);
  const topic = useMemo(() => POST_KITS.find((t) => t.id === activeId) ?? POST_KITS[0], [activeId]);
  const { click } = useAudio();

  const grouped = useMemo(() =>
    POST_CATEGORIES.map((cat) => ({ cat, topics: POST_KITS.filter((t) => t.category === cat) })).filter((g) => g.topics.length),
  []);

  return (
    <div style={{ paddingTop: 100, paddingBottom: 96 }}>
      <Container style={{ maxWidth: 1180 }}>
        <Kicker>Post Studio</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.1rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '14px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          Post about Prosper. <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Via Atlas.</em>
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 660 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          Pick a topic. Grab a ready-to-post caption written to actually sound human, download the matching card, and share. Edit anything before you post — it's yours.
        </motion.p>

        <div className="create-cols" style={{ marginTop: 40 }}>
          {/* topic nav */}
          <aside className="create-nav" aria-label="Choose a topic">
            {grouped.map((g) => (
              <div key={g.cat} style={{ marginBottom: 18 }}>
                <div className="font-mono create-nav__cat">{g.cat}</div>
                <div className="flex flex-col" style={{ gap: 4 }}>
                  {g.topics.map((t) => {
                    const on = t.id === activeId;
                    return (
                      <button key={t.id} onClick={() => { click(); setActiveId(t.id); }} aria-current={on}
                        className="pressable create-nav__item" data-on={on ? 'true' : 'false'}>
                        <span className="create-nav__label">{t.label}</span>
                        <span className="create-nav__hint">{t.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>

          {/* selected topic */}
          <motion.section key={topic.id} className="create-panel"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 240, damping: 30, mass: 0.8 }}>
            <TopicCard topic={topic} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topic.posts.map((p, i) => <PostVariant key={topic.id + i} text={p} index={i} />)}
            </div>
          </motion.section>
        </div>

        <motion.p className="font-mono" style={{ textAlign: 'center', marginTop: 40, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.55)' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          Every caption is grounded in real Prosper content · community-built · not an official Prosper product
        </motion.p>
      </Container>
    </div>
  );
}
