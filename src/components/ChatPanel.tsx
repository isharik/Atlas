import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ask, SUGGESTED, type Answer } from '@/lib/knowledge';
import { useAudio } from '@/audio/AudioProvider';
import { Compass, IconChat, IconClose, IconArrow } from './ui/icons';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];

type Msg =
  | { role: 'user'; text: string }
  | { role: 'bot'; answer: Answer };

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState('');
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { click } = useAudio();

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, thinking]);

  const send = (question: string) => {
    const text = question.trim();
    if (!text) return;
    click();
    setQ('');
    setMsgs((m) => [...m, { role: 'user', text }]);
    setThinking(true);
    // small delay so the answer feels considered (not a DB lookup)
    window.setTimeout(() => {
      const answer = ask(text);
      setMsgs((m) => [...m, { role: 'bot', answer }]);
      setThinking(false);
    }, 420);
  };

  const goto = (to?: string) => {
    if (!to) return;
    click();
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      {/* launcher */}
      <motion.button
        onClick={() => { click(); setOpen((v) => !v); }}
        className="pressable"
        aria-label="Ask Prosper"
        style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 120, display: 'flex', alignItems: 'center', gap: 9, padding: '11px 16px', borderRadius: 999, border: '1px solid rgba(228,200,119,0.4)', background: 'linear-gradient(180deg, rgba(18,30,22,0.92), rgba(13,19,16,0.94))', color: 'var(--primary)', cursor: 'pointer', boxShadow: '0 10px 34px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6, ease }}
      >
        {open ? <IconClose size={16} /> : <IconChat size={16} />}
        <span className="font-mono hidden sm:inline" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{open ? 'Close' : 'Ask Prosper'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            style={{ position: 'fixed', right: 24, bottom: 80, zIndex: 120, width: 'min(380px, calc(100vw - 32px))', height: 'min(560px, calc(100vh - 140px))', display: 'flex', flexDirection: 'column', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(19,28,23,0.97), rgba(13,19,16,0.98))', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0, y: 20, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 16, scale: 0.97, filter: 'blur(8px)' }}
            transition={{ type: 'spring', duration: 0.42, bounce: 0.14 }}
          >
            {/* header */}
            <div className="flex items-center gap-3" style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', border: '1px solid var(--border-strong)' }}><Compass size={16} color="#E4C877" /></span>
              <div>
                <div className="font-head" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)' }}>Ask Prosper</div>
                <div className="font-mono" style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--mist)', textTransform: 'uppercase' }}>Answers from the site itself</div>
              </div>
            </div>

            {/* body */}
            <div ref={bodyRef} className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {msgs.length === 0 && (
                <div>
                  <p className="font-display" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--mist)', margin: '4px 0 14px' }}>
                    Ask anything about Prosper. I answer only from the site’s verified content — no external sources.
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTED.map((s) => (
                      <button key={s} onClick={() => send(s)} className="pressable hover-gold" style={{ textAlign: 'left', fontFamily: 'Archivo, sans-serif', fontSize: 12.5, color: 'var(--text)', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(15,22,18,0.5)', cursor: 'pointer' }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease }}
                  style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                  {m.role === 'user' ? (
                    <div className="font-display" style={{ fontSize: 13, color: '#0b120d', background: 'linear-gradient(180deg, #e4c877, #c9a24b)', padding: '9px 13px', borderRadius: '12px 12px 4px 12px' }}>{m.text}</div>
                  ) : (
                    <div style={{ background: 'rgba(15,22,18,0.6)', border: '1px solid var(--border)', padding: '12px 14px', borderRadius: '12px 12px 12px 4px' }}>
                      <p className="font-display" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>{m.answer.text}</p>
                      {m.answer.to && (
                        <button onClick={() => goto(m.answer.to)} className="pressable hover-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--primary)' }}>
                          Open {m.answer.title} <IconArrow size={12} />
                        </button>
                      )}
                      {m.answer.related.length > 0 && (
                        <div className="flex flex-wrap gap-1.5" style={{ marginTop: 10 }}>
                          {m.answer.related.map((r) => (
                            <button key={r.title} onClick={() => r.to && goto(r.to)} className="pressable" style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: '0.1em', color: 'var(--mist)', border: '1px solid var(--border)', borderRadius: 999, padding: '3px 9px', background: 'none', cursor: 'pointer' }}>{r.title}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '10px 14px' }}>
                  {[0, 1, 2].map((d) => (
                    <motion.span key={d} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--primary)' }} animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.15 }} />
                  ))}
                </motion.div>
              )}
            </div>

            {/* input */}
            <form onSubmit={(e) => { e.preventDefault(); send(q); }} style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about Prosper…" className="font-display"
                style={{ flex: 1, background: 'rgba(13,19,16,0.6)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-hi)', fontSize: 13, outline: 'none' }} />
              <button type="submit" className="pressable" aria-label="Send" style={{ width: 40, borderRadius: 8, border: 'none', background: 'linear-gradient(180deg, #e4c877, #c9a24b)', color: '#0b120d', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><IconArrow size={16} /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
