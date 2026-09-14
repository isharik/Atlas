import { useEffect, useRef, useState } from 'react';
import { drawCard } from '@/components/ShareCard';
import { useAudio } from '@/audio/AudioProvider';
import { POST_LENGTHS, type PostTopic } from '@/data/postkits';

const FOOTNOTE = 'Made via Atlas for Prosper';
function siteUrl() {
  return typeof window !== 'undefined' ? window.location.origin : 'https://pros-per.xyz';
}

/** The branded graphic for a topic, with download / copy actions. */
export function ShareCardCanvas({ topic }: { topic: PostTopic }) {
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
    <div className="studio-share">
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <canvas ref={ref} style={{ width: '100%', height: 'auto', display: 'block' }} aria-label={`${topic.label} share card`} />
      </div>
      <div className="flex items-center gap-2.5" style={{ marginTop: 14 }}>
        <button onClick={download} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 auto' }}>Download image</button>
        <button onClick={copyImg} className="pressable share-btn" style={{ flex: '1 1 auto' }}>{copied ? 'Copied ✓' : 'Copy image'}</button>
      </div>
    </div>
  );
}

/** Captions in three lengths — a clean segmented picker, an editable body, copy / post to X. */
export function CaptionStudio({ topic }: { topic: PostTopic }) {
  const { click } = useAudio();
  const n = topic.posts.length;
  const [i, setI] = useState(0);
  const [draft, setDraft] = useState(topic.posts[0]);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setI(0); }, [topic.id]);
  useEffect(() => { setDraft(topic.posts[i]); setEditing(false); }, [topic.id, i]);

  const copy = () => { click(); navigator.clipboard?.writeText(draft).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const postX = () => { click(); window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`${draft}\n\n${siteUrl()}`)}`, '_blank', 'noopener'); };

  return (
    <div className="studio-caption">
      <div className="cap-tabs" role="tablist" aria-label="Caption length">
        {topic.posts.map((_, d) => (
          <button key={d} role="tab" aria-selected={d === i} onClick={() => { if (d !== i) click(); setI(d); }}
            className="pressable cap-tab font-mono" data-on={d === i ? 'true' : 'false'}>
            {POST_LENGTHS[d] ?? `Option ${d + 1}`}
          </button>
        ))}
      </div>

      <div className="cap-body">
        <div className="cap-body__head">
          <span className="font-mono cap-body__meta">Ready to post <span style={{ color: 'var(--mist)' }}>· {i + 1} / {n}</span></span>
          <button onClick={() => { click(); setEditing((v) => !v); }} className="pressable cap-edit font-mono" data-on={editing ? 'true' : 'false'}>
            {editing ? 'Done' : 'Customize'}
          </button>
        </div>

        {editing ? (
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={Math.min(22, Math.max(8, Math.ceil(draft.length / 40)))} className="create-textarea font-display" aria-label="Edit caption" />
        ) : (
          <p className="font-display cap-text">{draft}</p>
        )}

        <div className="cap-actions">
          <button onClick={postX} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 auto' }}>Post on X</button>
          <button onClick={copy} className="pressable share-btn" style={{ flex: '0 0 auto' }}>{copied ? 'Copied ✓' : 'Copy text'}</button>
        </div>
      </div>
    </div>
  );
}
