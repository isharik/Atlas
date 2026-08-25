import { FAQS, ZONES, ZONE_DETAIL, ROLES, PROGRAMS, TWO_ASSETS, PARTNERS, TAGLINES } from '@/data/ecosystem';

/**
 * On-site intelligence — a purely client-side retrieval engine. It answers questions
 * using only the site's own verified content (no database, no localStorage, no external
 * API). Every answer is a real sentence drawn from Prosper's material, with a source link.
 */

export interface Doc {
  title: string;
  text: string;
  to?: string;
  weight?: number; // FAQs are answer-shaped → weighted higher
}

const STOP = new Set(
  'a an the is are was were be been being of to in on for and or as at by with from that this it its into about what which who whom how do does did can could would should will your you i we they them their our my me is'.split(
    ' ',
  ),
);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9{}$ ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

let DOCS: Doc[] | null = null;
function build(): Doc[] {
  if (DOCS) return DOCS;
  const docs: Doc[] = [];
  FAQS.forEach((f) => docs.push({ title: f.q, text: f.a, to: f.to, weight: 2.4 }));
  ZONES.forEach((z) =>
    docs.push({ title: z.label, text: `${z.tagline}. ${z.simple} ${ZONE_DETAIL[z.id].purpose} ${ZONE_DETAIL[z.id].points.join('. ')}`, to: `/zone/${z.id}`, weight: 1.2 }),
  );
  ROLES.forEach((r) => docs.push({ title: r.audience, text: `${r.title}. ${r.body}`, to: '/participate', weight: 1 }));
  PROGRAMS.forEach((p) => docs.push({ title: p.name, text: `${p.status}. ${p.reward ?? ''} ${p.detail}`, to: '/programs', weight: 1 }));
  docs.push({ title: 'Vault Shares', text: `${TWO_ASSETS.shares.name}. ${TWO_ASSETS.shares.desc}`, to: '/zone/vaults', weight: 1.1 });
  docs.push({ title: 'p{VAULT}', text: `${TWO_ASSETS.pvault.name}. ${TWO_ASSETS.pvault.desc}`, to: '/zone/pvault', weight: 1.1 });
  PARTNERS.forEach((p) => docs.push({ title: p.name, text: `${p.name} (${p.handle}) — ${p.role}.`, to: '/pharos', weight: 0.9 }));
  docs.push({ title: 'About Prosper', text: `${TAGLINES.hero}. ${TAGLINES.one} ${TAGLINES.two} ${TAGLINES.activate}`, to: '/', weight: 1.3 });
  DOCS = docs;
  return docs;
}

export interface Answer {
  text: string;
  title: string;
  to?: string;
  confident: boolean;
  related: { title: string; to?: string }[];
}

export function ask(query: string): Answer {
  const docs = build();
  const q = tokens(query);
  if (q.length === 0) return fallback();

  const scored = docs.map((d) => {
    const hay = tokens(`${d.title} ${d.title} ${d.text}`); // title counted twice
    const set = new Set(hay);
    let score = 0;
    for (const w of q) {
      if (set.has(w)) score += 1;
      // partial (e.g. "curators" vs "curator")
      else if (hay.some((h) => h.startsWith(w) || w.startsWith(h))) score += 0.5;
    }
    // phrase-ish boost
    if (`${d.title} ${d.text}`.toLowerCase().includes(query.trim().toLowerCase())) score += 2;
    return { d, score: score * (d.weight ?? 1) };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 1) return fallback();

  const related = scored
    .slice(1, 4)
    .filter((s) => s.score > 0.8)
    .map((s) => ({ title: s.d.title, to: s.d.to }));

  return { text: best.d.text, title: best.d.title, to: best.d.to, confident: best.score >= 1.6, related };
}

function fallback(): Answer {
  return {
    text: 'I can answer questions about Prosper using the site’s own content — the ecosystem (Curators, Strategies, Vaults, Track Record, p{VAULT}, Performance Market), the programs, Pharos, and how to participate. Try asking one of the suggestions below.',
    title: 'Ask Prosper',
    to: '/faq',
    confident: false,
    related: [],
  };
}

export const SUGGESTED = [
  'What is Prosper?',
  'Vault Shares vs p{VAULT}?',
  'How do I become a Curator?',
  'Is Prosper live yet?',
  'What is Pharos?',
];
