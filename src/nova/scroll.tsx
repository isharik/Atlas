import { createContext, useContext, type RefObject } from 'react';

/** Shares the custom snap-scroller element so framer whileInView / useScroll can target it. */
export const ScrollerCtx = createContext<RefObject<HTMLElement> | null>(null);
export const useScroller = () => useContext(ScrollerCtx);

/** Smoothly scroll the snap-scroller to a section id. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Default framer whileInView viewport options bound to the scroller. */
export function inView(root: RefObject<HTMLElement> | null, amount = 0.4) {
  return { root: root ?? undefined, amount, once: true };
}
