import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Container, Kicker, CTA } from '@/components/PageBits';
import { drawCard, type ShareSpec } from '@/components/ShareCard';
import { useAudio } from '@/audio/AudioProvider';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const spring = { type: 'spring' as const, stiffness: 260, damping: 30, mass: 0.8 };

interface Q { q: string; options: string[]; a: number; note: string }
const QUESTIONS: Q[] = [
  { q: 'What is Prosper, in one line?', options: ['The Performance Market for Liquid Alpha', 'A meme-coin launchpad', 'A lending protocol', 'An NFT marketplace'], a: 0, note: 'Prosper turns elite on-chain strategies into transparent, investable markets.' },
  { q: 'What does a Curator actually do?', options: ['Runs the validators', 'Provides liquidity anonymously', 'Audits other protocols', 'Brings a strategy on-chain and stays accountable for it'], a: 3, note: 'Curators set the thesis, risk and fees, then build a public track record.' },
  { q: 'Vault Shares give you…', options: ['Governance votes only', 'A fixed APY', 'Proportional exposure to the Vault that tracks NAV', 'The Curator’s fees'], a: 2, note: 'Vault Shares are your direct claim on the Vault’s net assets.' },
  { q: 'A p{VAULT} is…', options: ['A market pricing conviction in the Curator and strategy', 'The Vault’s stablecoin', 'A staking receipt', 'A governance token'], a: 0, note: 'It’s an independent market on the Curator — separate from Vault Shares.' },
  { q: 'A p{VAULT} opens on a ___ then graduates to ___.', options: ['Auction → orderbook', 'Presale → CEX', 'Lottery → AMM', 'Bonding curve → FaroSwap'], a: 3, note: 'It fills on an internal bonding curve, then trades on FaroSwap.' },
  { q: 'Which chain is Prosper built on?', options: ['Solana', 'Pharos', 'Base', 'Arbitrum'], a: 1, note: 'Pharos — a scalable RealFi Layer-1.' },
  { q: 'What is a Track Record here?', options: ['A private PDF from the Curator', 'A Discord role', 'A public, verifiable on-chain performance history', 'A testnet badge'], a: 2, note: 'The whole point: proof you can check, not a pitch.' },
  { q: 'FaroSwap is…', options: ['Pharos’s native AMM/PMM DEX', 'A bridge', 'A wallet', 'A price oracle'], a: 0, note: 'Where a p{VAULT} trades once it graduates.' },
  { q: 'A market-neutral strategy mainly…', options: ['Bets hard on one direction', 'Only holds stablecoins', 'Mirrors the S&P', 'Captures funding and basis with low directional exposure'], a: 3, note: 'Steadier, lower-beta return — a different lens than macro.' },
  { q: 'The Early Depositor Reward is…', options: ['A referral bonus', 'Free gas', 'A share of 6% of p{VAULT} supply for depositing in the first 14 days', 'A staking multiplier'], a: 2, note: 'Deposit within the cap in the first 14 days to earn it.' },
];

function scoreLabel(s: number) {
  if (s >= 9) return 'Prosper native';
  if (s >= 7) return 'Sharp allocator';
  if (s >= 5) return 'Getting there';
  return 'Fresh recruit';
}

export function Quiz() {
  const { click } = useAudio();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const total = QUESTIONS.length;
  const cur = QUESTIONS[i];
  const url = typeof window !== 'undefined' ? window.location.origin : 'https://pros-per.xyz';

  const pick = (idx: number) => {
    if (picked !== null) return;
    click();
    setPicked(idx);
    if (idx === cur.a) setScore((s) => s + 1);
  };
  const next = () => {
    click();
    if (i + 1 >= total) { setDone(true); return; }
    setI((v) => v + 1);
    setPicked(null);
  };
  const restart = () => { click(); setI(0); setPicked(null); setScore(0); setDone(false); };

  // score ≥ 5 → the "did well" card; below 5 → the alternate card
  const cardBg = score >= 5 ? '/quiz_bg.png' : '/quiz2_bg.png';
  const shareSpec: ShareSpec = useMemo(() => ({
    eyebrow: 'Prosper Quiz · via Atlas',
    title: `${score} / ${total}`,
    accentWord: scoreLabel(score),
    minimal: true,
    bgImage: cardBg,
  }), [score, total, cardBg]);
  const shareCaption = `I scored ${score}/${total} on the Prosper quiz — "${scoreLabel(score)}". Think you can beat it?`;

  // draw the result card as soon as the quiz is done, loading the score-matched image
  useEffect(() => {
    if (!done) return;
    let cancelled = false;
    const render = () => { if (!cancelled && cardRef.current) drawCard(cardRef.current, shareSpec, bgRef.current); };
    (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(render);
    if (!bgRef.current || !bgRef.current.src.endsWith(cardBg)) {
      bgRef.current = null; render();
      const im = new Image(); im.onload = () => { bgRef.current = im; render(); }; im.src = cardBg;
    } else render();
    return () => { cancelled = true; };
  }, [done, shareSpec, cardBg]);

  const downloadCard = () => {
    click(); const c = cardRef.current; if (!c) return;
    c.toBlob((b) => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'prosper-quiz-score.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }, 'image/png');
  };
  const copyCard = async () => {
    click(); const c = cardRef.current; if (!c) return;
    try { const b = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png')); if (!b) throw new Error(); await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); setCopied(true); } catch { downloadCard(); }
    setTimeout(() => setCopied(false), 2000);
  };
  const postX = () => { click(); window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`${shareCaption}\n\n${url}`)}`, '_blank', 'noopener'); };

  return (
    <div style={{ paddingTop: 84, paddingBottom: 72 }}>
      <Container style={{ maxWidth: 720 }}>
        <div style={{ textAlign: 'center' }}>
          <Kicker>Prosper Quiz</Kicker>
          <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(1.9rem,4vw,3rem)', color: 'var(--text-hi)', margin: '10px 0 6px', letterSpacing: '-0.01em', lineHeight: 1.04 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            How well do you know <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Prosper?</em>
          </motion.h1>
        </div>

        {/* progress */}
        <div className="quiz-progress"><motion.div className="quiz-progress__fill" animate={{ scaleX: (done ? total : i) / total }} transition={{ type: 'spring', stiffness: 130, damping: 26 }} /></div>

        {!done ? (
          <motion.div key={i} initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={spring} className="quiz-card">
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <span className="font-mono quiz-count">Question {i + 1} / {total}</span>
              <span className="font-mono quiz-count" style={{ color: 'var(--primary)' }}>Score {score}</span>
            </div>
            <div className="font-head quiz-q">{cur.q}</div>
            <div className="quiz-options">
              {cur.options.map((o, idx) => {
                const isAnswer = idx === cur.a;
                const state = picked === null ? 'idle' : isAnswer ? 'right' : idx === picked ? 'wrong' : 'dim';
                return (
                  <button key={idx} onClick={() => pick(idx)} disabled={picked !== null} className="pressable quiz-option" data-state={state}>
                    <span className="quiz-option__dot" />{o}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }} className="quiz-note">
                <span className="font-mono" style={{ color: picked === cur.a ? 'var(--emerald-glow)' : 'var(--primary)' }}>{picked === cur.a ? 'Correct.' : 'Not quite.'}</span> {cur.note}
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <button onClick={next} className="pressable share-btn share-btn--gold">{i + 1 >= total ? 'See result' : 'Next'}</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={spring} className="quiz-resultcard">
            <div className="quiz-cardframe">
              <canvas ref={cardRef} style={{ width: '100%', height: 'auto', display: 'block' }} aria-label={`Your score: ${score} out of ${total}`} />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button onClick={postX} className="pressable share-btn share-btn--gold" style={{ flex: '1 1 150px' }}>Share on X</button>
              <button onClick={downloadCard} className="pressable share-btn">Download</button>
              <button onClick={copyCard} className="pressable share-btn">{copied ? 'Copied ✓' : 'Copy'}</button>
              <button onClick={restart} className="pressable share-btn">Try again</button>
              <CTA to="/guide">Read the Guide</CTA>
            </div>
          </motion.div>
        )}
      </Container>
    </div>
  );
}
