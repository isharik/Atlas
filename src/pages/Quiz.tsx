import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Container, Kicker, CTA } from '@/components/PageBits';
import { ShareModal, type ShareSpec } from '@/components/ShareCard';
import { useAudio } from '@/audio/AudioProvider';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const spring = { type: 'spring' as const, stiffness: 260, damping: 30, mass: 0.8 };

interface Q { q: string; options: string[]; a: number; note: string }
const QUESTIONS: Q[] = [
  { q: 'What is Prosper, in one line?', options: ['A meme-coin launchpad', 'The Performance Market for Liquid Alpha', 'A lending protocol', 'An NFT marketplace'], a: 1, note: 'Prosper turns elite on-chain strategies into transparent, investable markets.' },
  { q: 'What does a Curator actually do?', options: ['Runs the validators', 'Provides liquidity anonymously', 'Brings a strategy on-chain and stays accountable for it', 'Audits other protocols'], a: 2, note: 'Curators set the thesis, risk and fees, then build a public track record.' },
  { q: 'Vault Shares give you…', options: ['Governance votes only', 'Proportional exposure to the Vault that tracks NAV', 'A fixed APY', 'The Curator’s fees'], a: 1, note: 'Vault Shares are your direct claim on the Vault’s net assets.' },
  { q: 'A p{VAULT} is…', options: ['The Vault’s stablecoin', 'A market pricing conviction in the Curator and strategy', 'A staking receipt', 'A governance token'], a: 1, note: 'It’s an independent market on the Curator — separate from Vault Shares.' },
  { q: 'A p{VAULT} opens on a ___ then graduates to ___.', options: ['Auction → orderbook', 'Bonding curve → FaroSwap', 'Presale → CEX', 'Lottery → AMM'], a: 1, note: 'It fills on an internal bonding curve, then trades on FaroSwap.' },
  { q: 'Which chain is Prosper built on?', options: ['Solana', 'Base', 'Pharos', 'Arbitrum'], a: 2, note: 'Pharos — a scalable RealFi Layer-1.' },
  { q: 'What is a Track Record here?', options: ['A private PDF from the Curator', 'A public, verifiable on-chain performance history', 'A Discord role', 'A testnet badge'], a: 1, note: 'The whole point: proof you can check, not a pitch.' },
  { q: 'FaroSwap is…', options: ['A bridge', 'Pharos’s native AMM/PMM DEX', 'A wallet', 'A price oracle'], a: 1, note: 'Where a p{VAULT} trades once it graduates.' },
  { q: 'A market-neutral strategy mainly…', options: ['Bets hard on one direction', 'Captures funding and basis with low directional exposure', 'Only holds stablecoins', 'Mirrors the S&P'], a: 1, note: 'Steadier, lower-beta return — a different lens than macro.' },
  { q: 'The Early Depositor Reward is…', options: ['A referral bonus', 'A share of 6% of p{VAULT} supply for depositing in the first 14 days', 'Free gas', 'A staking multiplier'], a: 1, note: 'Deposit within the cap in the first 14 days to earn it.' },
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
  const [shareOpen, setShareOpen] = useState(false);
  const total = QUESTIONS.length;
  const cur = QUESTIONS[i];

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

  const shareSpec: ShareSpec = useMemo(() => ({
    eyebrow: 'Prosper Quiz · via Atlas',
    title: `${score}/${total}`,
    accentWord: scoreLabel(score),
    detail: 'How well do you know the Performance Market for Liquid Alpha? Take the quiz in Prosper Atlas.',
    footnote: 'Community-built · not an official Prosper product',
    poster: true,
  }), [score, total]);
  const shareCaption = `I scored ${score}/${total} on the Prosper quiz — "${scoreLabel(score)}". Think you can beat it?`;

  const pct = done ? 100 : Math.round((i / total) * 100);

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
          <motion.div initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={spring} className="quiz-card quiz-result">
            <div className="font-mono quiz-count" style={{ color: 'var(--emerald-glow)' }}>Your result</div>
            <div className="font-display quiz-score">{score}<span style={{ color: 'var(--mist)' }}>/{total}</span></div>
            <div className="font-head quiz-badge">{scoreLabel(score)}</div>
            <p className="font-display quiz-result__line">{score >= 7 ? 'You actually get how Prosper works. Go make some noise about it.' : 'Solid start. Skim the Guide and the Glossary, then run it back.'}</p>
            <div className="flex items-center gap-3 flex-wrap" style={{ justifyContent: 'center', marginTop: 22 }}>
              <button onClick={() => { click(); setShareOpen(true); }} className="pressable share-btn share-btn--gold">Share your score</button>
              <button onClick={restart} className="pressable share-btn">Try again</button>
              <CTA to="/guide">Read the Guide</CTA>
            </div>
          </motion.div>
        )}
      </Container>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} spec={shareSpec} caption={shareCaption} url={typeof window !== 'undefined' ? window.location.origin : 'https://pros-per.xyz'} />
    </div>
  );
}
