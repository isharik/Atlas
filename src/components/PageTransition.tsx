import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const ease = [0.23, 1, 0.32, 1] as [number, number, number, number];

/** Intentional page open/close — soft fade + lift + blur, matching the source's power-ease feel. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      style={{ minHeight: '100%' }}
      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
      transition={{ duration: 0.5, ease }}
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
