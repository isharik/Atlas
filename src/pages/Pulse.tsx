import { useEffect, useRef, useState } from 'react';
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

// ── Nitter feed (real posts from @ProsperTicker via nitter RSS) ──
const NITTER_HOSTS = ['nitter.net', 'nitter.privacydev.net', 'nitter.poast.org', 'nitter.1d4.us'];
// public CORS proxies — nitter instances don't send CORS headers, so we route through one
const PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
];

interface Post { text: string; date: string; link: string }

function decodeEntities(s: string) {
  const el = document.createElement('textarea');
  el.innerHTML = s;
  return el.value;
}
function stripHtml(s: string) {
  const d = document.createElement('div');
  d.innerHTML = s;
  return (d.textContent || '').replace(/\s+/g, ' ').trim();
}
function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d`;
  return new Date(t).toLocaleDateString();
}

function parseRss(xml: string): Post[] {
  if (!xml.includes('<item')) throw new Error('no items');
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const items = [...doc.querySelectorAll('item')];
  const posts = items.slice(0, 8).map((it) => {
    const raw = it.querySelector('title')?.textContent || it.querySelector('description')?.textContent || '';
    const link = (it.querySelector('link')?.textContent || '')
      .replace(/^https?:\/\/[^/]+/, 'https://x.com')
      .replace(/#.*$/, '');
    return { text: stripHtml(decodeEntities(raw)), date: it.querySelector('pubDate')?.textContent || '', link };
  }).filter((p) => p.text);
  if (!posts.length) throw new Error('empty');
  return posts;
}

/** Try every host×proxy combo in parallel; first that works wins, fail fast otherwise. */
async function fetchNitter(handle: string): Promise<Post[]> {
  const attempts: Promise<Post[]>[] = [];
  for (const host of NITTER_HOSTS) {
    for (const proxy of PROXIES) {
      attempts.push((async () => {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 5000);
        try {
          const res = await fetch(proxy(`https://${host}/${handle}/rss`), { signal: ctrl.signal });
          if (!res.ok) throw new Error(String(res.status));
          return parseRss(await res.text());
        } finally { clearTimeout(to); }
      })());
    }
  }
  return Promise.any(attempts); // rejects (AggregateError) only if every combo fails
}

/** Loads X's widgets.js once, then (re)renders any embeds inside `root` (fallback only). */
function loadXWidgets(root: HTMLElement | null) {
  const render = () => (window as unknown as { twttr?: { widgets?: { load?: (el?: HTMLElement) => void } } }).twttr?.widgets?.load?.(root ?? undefined);
  const id = 'twitter-wjs';
  if ((window as unknown as { twttr?: unknown }).twttr) { render(); return; }
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) { existing.addEventListener('load', render); return; }
  const sc = document.createElement('script');
  sc.id = id; sc.src = 'https://platform.twitter.com/widgets.js'; sc.async = true; sc.charset = 'utf-8';
  sc.onload = render;
  document.body.appendChild(sc);
}

function HandleFeed() {
  const [state, setState] = useState<'loading' | 'ok' | 'fallback'>('loading');
  const [posts, setPosts] = useState<Post[]>([]);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetchNitter(HANDLE)
      .then((p) => { if (alive) { setPosts(p); setState('ok'); } })
      .catch(() => { if (alive) setState('fallback'); });
    return () => { alive = false; };
  }, []);

  useEffect(() => { if (state === 'fallback') loadXWidgets(fallbackRef.current); }, [state]);

  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="pulse-panel" style={{ opacity: 0.6 }}>
            <div className="pulse-skeleton" style={{ width: '40%', height: 9, marginBottom: 12 }} />
            <div className="pulse-skeleton" style={{ width: '100%', height: 9, marginBottom: 8 }} />
            <div className="pulse-skeleton" style={{ width: '80%', height: 9 }} />
          </div>
        ))}
      </div>
    );
  }

  if (state === 'fallback') {
    return (
      <div ref={fallbackRef}>
        <div className="pulse-panel">
          <a className="twitter-timeline" data-theme="dark" data-chrome="noheader nofooter transparent" data-tweet-limit="8"
            href={`https://twitter.com/${HANDLE}?ref_src=twsrc%5Etfw`}>Posts from @{HANDLE} — open on X ↗</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {posts.map((p, i) => (
        <motion.a key={p.link + i} href={p.link} target="_blank" rel="noreferrer"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4, ease }}
          className="pulse-tweet">
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--primary)' }}>@{HANDLE}</span>
            <span className="font-mono" style={{ fontSize: 9.5, color: 'var(--mist)' }}>{timeAgo(p.date)}</span>
          </div>
          <p className="font-display" style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>{p.text}</p>
        </motion.a>
      ))}
    </div>
  );
}

export function Pulse() {
  return (
    <div style={{ paddingTop: 100, paddingBottom: 96 }}>
      <Container style={{ maxWidth: 1100 }}>
        <Kicker>Ecosystem Pulse</Kicker>
        <motion.h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(2.1rem,5vw,3.6rem)', color: 'var(--text-hi)', margin: '14px 0 12px', letterSpacing: '-0.01em', lineHeight: 1.05 }}
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
          Live from <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>the community.</em>
        </motion.h1>
        <motion.p className="font-display" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--mist)', maxWidth: 640 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          Straight from <a href={OFFICIAL_LINKS.prosperX} target="_blank" rel="noreferrer" className="hover-gold" style={{ color: 'var(--primary)', textDecoration: 'none' }}>@{HANDLE}</a> and everyone building around it. Real posts, nothing rewritten or faked.
        </motion.p>

        <div className="pulse-cols" style={{ marginTop: 40 }}>
          {/* Official handle — real posts via nitter */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport}>
            <div className="pulse-head">
              <span className="live-dot" /> <span className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text)' }}>@{HANDLE}</span>
            </div>
            <HandleFeed />
          </motion.div>

          {/* Community mentions */}
          <motion.div variants={rise} initial="hidden" whileInView="show" viewport={viewport}>
            <div className="pulse-head">
              <span className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text)' }}>Tagging @{HANDLE}</span>
            </div>

            {FEATURED_TWEETS.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {FEATURED_TWEETS.map((url) => (
                  <a className="pulse-tweet" key={url} href={url} target="_blank" rel="noreferrer">{url}</a>
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
          Posts pulled live via nitter · community-built · not an official Prosper product
        </motion.p>
      </Container>
    </div>
  );
}
