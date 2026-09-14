import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];

/** Intentional page open — a snappy fade + lift. Transform/opacity only (no full-page blur filter),
 *  so navigation stays buttery even on high-refresh displays. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      style={{ minHeight: '100%', willChange: 'transform, opacity' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Reusable staggered reveal for section content. */
export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } } };
export const rise = {
  hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } },
};
