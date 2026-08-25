import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

/**
 * A card with a subtle, spring-damped 3D tilt that follows the cursor, plus a soft
 * light-sheen that tracks the pointer. Restrained (Emil): small angles, natural spring,
 * press feedback. Used for ecosystem / role / program cards to make them feel alive.
 */
export function TiltCard({
  children,
  onClick,
  className,
  style,
  max = 7,
  accent = 'rgba(228,200,119,0.16)',
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  max?: number;
  accent?: string;
  ariaLabel?: string;
}) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 150, damping: 16 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 150, damping: 16 });
  const sheenX = useTransform(px, [0, 1], ['0%', '100%']);
  const sheenY = useTransform(py, [0, 1], ['0%', '100%']);

  const interactive = !!onClick;

  return (
    <motion.div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      className={className}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
        rotateX: rx,
        rotateY: ry,
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }}
    >
      <motion.span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: useTransform([sheenX, sheenY], ([x, y]) => `radial-gradient(140px circle at ${x} ${y}, ${accent}, transparent 60%)`),
          opacity: 0.9,
        }}
      />
      <div style={{ position: 'relative', transform: 'translateZ(28px)' }}>{children}</div>
    </motion.div>
  );
}
