import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { buildSearchIndex } from '@/data/ecosystem';
import { useAudio } from '@/audio/AudioProvider';
import { IconArrow } from './ui/icons';

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { click } = useAudio();
  const index = useMemo(() => buildSearchIndex(), []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return index.slice(0, 8);
    return index
      .map((e) => {
        const hay = `${e.title} ${e.kind} ${e.keywords}`.toLowerCase();
        let score = 0;
        if (e.title.toLowerCase().includes(t)) score += 5;
        if (hay.includes(t)) score += 2;
        for (const w of t.split(/\s+/)) if (w && hay.includes(w)) score += 1;
        return { e, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.e);
  }, [q, index]);

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);
  useEffect(() => setSel(0), [q]);

  const go = (to: string) => {
    click();
    onClose();
    navigate(to);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-start justify-center"
          style={{ zIndex: 200, padding: '12vh 20px 20px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,5,4,0.72)', backdropFilter: 'blur(8px)' }} />
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full"
            style={{ maxWidth: 560, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(19,28,23,0.96), rgba(13,19,16,0.98))', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.98, filter: 'blur(6px)' }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.14 }}
          >
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
                if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
                if (e.key === 'Enter' && results[sel]) go(results[sel].to);
              }}
              placeholder="Search Prosper — curators, vaults, p{VAULT}, programs…"
              className="font-display"
              style={{ width: '100%', padding: '18px 20px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text-hi)', fontSize: 15, outline: 'none' }}
            />
            <div className="hide-scroll" style={{ maxHeight: '52vh', overflowY: 'auto', padding: 8 }}>
              {results.length === 0 && (
                <div className="font-display" style={{ padding: 20, color: 'var(--mist)', fontSize: 13 }}>No matches. Try “vault”, “curator”, “ambassador”…</div>
              )}
              {results.map((r, i) => (
                <button
                  key={r.to + r.title}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => go(r.to)}
                  className="pressable"
                  style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left', padding: '12px 14px', borderRadius: 8, border: '1px solid transparent', background: i === sel ? 'rgba(228,200,119,0.08)' : 'transparent', cursor: 'pointer' }}
                >
                  <span>
                    <span className="font-head" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-hi)' }}>{r.title}</span>
                    <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--primary)' }}>{r.kind}</span>
                  </span>
                  <span style={{ color: i === sel ? 'var(--primary)' : 'var(--mist)' }}><IconArrow size={14} /></span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
