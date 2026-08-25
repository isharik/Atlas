import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Container, Kicker, CTA } from '@/components/PageBits';
import { OFFICIAL_LINKS } from '@/data/ecosystem';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];
const rise = { hidden: { opacity: 0, y: 20, filter: 'blur(5px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } } };
const viewport = { once: true, amount: 0.15 };

const HANDLE = 'ProsperTicker'; // @ProsperTicker — Prosper's official handle
const SEARCH_MENTIONS = `https://x.com/search?q=%40${HANDLE}&src=typed_query&f=live`;
const COMPOSE = `https://x.com/intent/tweet?text=${encodeURIComponent('Watching @' + HANDLE + ' — the Performance Market for Liquid Alpha on @pharos_network. ')}`;

// Real, hand-verified tweet URLs to feature as community mentions. Leave empty until
// you have genuine links — never fabricate. Paste real tweet URLs here to showcase them.
const FEATURED_TWEETS: string[] = [];

/** Loads X's widgets.js once, then (re)renders any embeds inside `root`. */
function useXWidgets(root: React.RefObject<HTMLElement>, dep: unknown) {
  useEffect(() => {
    const render = () => (window as unknown as { twttr?: { widgets?: { load?: (el?: HTMLElement) => void } } }).twttr?.widgets?.load?.(root.current ?? undefined);
    const id = 'twitter-wjs';
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if ((window as unknown as { twttr?: unknown }).twttr) { render(); return; }
    if (existing) { existing.addEventListener('load', render); return () => existing.removeEventListener('load', render); }
    const sc = document.createElement('script');
    sc.id = id; sc.src = 'https://platform.twitter.com/widgets.js'; sc.async = true; sc.charset = 'utf-8';
    sc.onload = render;
    document.body.appendChild(sc);
  }, [root, dep]);
}

export function Pulse() {
  const root = useRef<HTMLDivElement>(null);
  useXWidgets(root, FEATURED_TWEETS.length);

  return (
    <div style={{ paddingTop: 100, paddingBottom: 96 }} ref={root}>
      <Container style={{ maxWidth: 1100 }}>
        <Kicker>Ecosystem Pulse</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.1rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '14px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          Live from <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>the community.</em>
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 640 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          Straight from <a href={OFFICIAL_LINKS.prosperX} target="_blank" rel="noreferrer" className="hover-gold" style={{ color: 'var(--primary)', textDecoration: 'none' }}>@{HANDLE}</a> and everyone building around it. Real posts, pulled live from X — nothing rewritten or faked.
        </motion.p>

        <div className="pulse-cols" style={{ marginTop: 40 }}>
          {/* Official handle — live profile timeline */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport}>
            <div className="pulse-head">
              <span className="live-dot" /> <span className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text)' }}>@{HANDLE} · Live</span>
            </div>
            <div className="pulse-panel">
              <a className="twitter-timeline" data-theme="dark" data-chrome="noheader nofooter transparent" data-tweet-limit="8"
                href={`https://twitter.com/${HANDLE}?ref_src=twsrc%5Etfw`}>
                {/* graceful fallback if widgets.js can't load */}
                Posts from @{HANDLE} — open on X ↗
              </a>
            </div>
          </motion.div>

          {/* Community mentions */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport}>
            <div className="pulse-head">
              <span className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text)' }}>Tagging @{HANDLE}</span>
            </div>

            {FEATURED_TWEETS.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {FEATURED_TWEETS.map((url) => (
                  <div className="pulse-panel" key={url} style={{ padding: 0 }}>
                    <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true"><a href={url}>{url}</a></blockquote>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pulse-empty">
                <p className="font-display" style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--mist)', margin: 0 }}>
                  Featured community posts land here. See everyone talking about Prosper right now on X, or post your own.
                </p>
                <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 18 }}>
                  <CTA primary href={SEARCH_MENTIONS}>See mentions on X</CTA>
                  <CTA href={COMPOSE}>Post about Prosper</CTA>
                </div>
              </div>
            )}

            <div className="pulse-panel" style={{ marginTop: 14 }}>
              <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--emerald-glow)', marginBottom: 8 }}>Follow the ecosystem</div>
              <div className="flex flex-col gap-2 font-display" style={{ fontSize: 13.5 }}>
                <a href={OFFICIAL_LINKS.prosperX} target="_blank" rel="noreferrer" className="hover-gold" style={{ color: 'var(--text)', textDecoration: 'none' }}>Prosper — @{HANDLE} ↗</a>
                <a href="https://x.com/pharos_network" target="_blank" rel="noreferrer" className="hover-gold" style={{ color: 'var(--text)', textDecoration: 'none' }}>Pharos — @pharos_network ↗</a>
                <a href={OFFICIAL_LINKS.prosperSite} target="_blank" rel="noreferrer" className="hover-gold" style={{ color: 'var(--text)', textDecoration: 'none' }}>pros-per.xyz ↗</a>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p className="font-mono" style={{ textAlign: 'center', marginTop: 40, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(198,210,202,0.55)' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={viewport} transition={{ duration: 0.6 }}>
          Posts load live from X · community-built · not an official Prosper product
        </motion.p>
      </Container>
    </div>
  );
}
