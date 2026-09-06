import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { Container, Kicker } from '@/components/PageBits';
import { drawCard } from '@/components/ShareCard';
import { IconArrow } from '@/components/ui/icons';
import { POST_KITS, POST_CATEGORIES, POST_LENGTHS, type PostTopic } from '@/data/postkits';
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

/** A single post (editable) + copy / post-to-X. Entrance is handled by the carousel. */
function PostVariant({ text }: { text: string }) {
  const { click } = useAudio();
  const [draft, setDraft] = useState(text);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setDraft(text); setEditing(false); }, [text]);

  const copy = () => { click(); navigator.clipboard?.writeText(draft).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const postX = () => { click(); window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`${draft}\n\n${siteUrl()}`)}`, '_blank', 'noopener'); };

  return (
    <div className="create-post">
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <span className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mist)' }}>Use this post</span>
        <button onClick={() => { click(); setEditing((v) => !v); }} className="pressable font-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: editing ? 'var(--primary)' : 'var(--mist)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {editing ? 'Done' : 'Customize'}
        </button>
      </div>

      {editing ? (
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={Math.min(20, Math.max(6, Math.ceil(draft.length / 42)))} className="create-textarea font-display" aria-label="Edit post" />
      ) : (
        <p className="font-display create-post__text">{draft}</p>
      )}

      <div className="flex items-center gap-2.5" style={{ marginTop: 16 }}>
        <button onClick={postX} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 auto' }}>Post on X</button>
        <button onClick={copy} className="pressable share-btn" style={{ flex: '0 0 auto' }}>{copied ? 'Copied ✓' : 'Copy text'}</button>
      </div>
    </div>
  );
}

/** One post at a time — arrows, dots, swipe, keyboard. */
function PostCarousel({ topic }: { topic: PostTopic }) {
  const reduce = useReducedMotion();
  const { click } = useAudio();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const n = topic.posts.length;
  useEffect(() => { setI(0); setDir(1); }, [topic.id]);

  const go = (next: number) => {
    const t = (next + n) % n;
    setDir(next > i ? 1 : -1);
    if (t !== i) click();
    setI(t);
  };

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [i]);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -350) go(i + 1);
    else if (info.offset.x > 60 || info.velocity.x > 350) go(i - 1);
  };

  return (
    <div ref={ref} tabIndex={0} role="group" aria-label="Post options" style={{ outline: 'none' }}>
      <div className="create-carousel__head">
        <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--primary)' }}>
          {POST_LENGTHS[i] ?? `Option ${i + 1}`}
          <span style={{ color: 'var(--mist)', marginLeft: 8 }}>{i + 1} / {n}</span>
        </span>
        <div className="flex items-center gap-2">
          <button aria-label="Previous post" onClick={() => go(i - 1)} className="pressable create-arrow"><span style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}><IconArrow size={15} /></span></button>
          <button aria-label="Next post" onClick={() => go(i + 1)} className="pressable create-arrow"><IconArrow size={15} /></button>
        </div>
      </div>

      <motion.div
        key={i}
        drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.14} onDragEnd={onDragEnd}
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 56 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }}
        style={{ cursor: 'grab' }}
      >
        <PostVariant text={topic.posts[i]} />
      </motion.div>

      <div className="flex items-center justify-center gap-2" style={{ marginTop: 16 }}>
        {topic.posts.map((_, d) => (
          <button key={d} aria-label={`Post ${d + 1}`} onClick={() => go(d)} className="pressable"
            style={{ height: 6, width: d === i ? 24 : 6, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0, background: d === i ? 'var(--primary)' : 'rgba(159,176,166,0.3)', boxShadow: d === i ? '0 0 10px rgba(228,200,119,0.6)' : 'none', transition: 'width 260ms var(--ease-out2), background 200ms ease' }} />
        ))}
      </div>
    </div>
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
          Pick a topic, then flip through ready-to-post captions in three lengths. Grab the matching card, edit anything you like, and share. It's yours.
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
            <PostCarousel topic={topic} />
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
