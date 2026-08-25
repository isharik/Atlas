import { useEffect } from 'react';

/**
 * Global normalized pointer position in [-1, 1], updated without triggering React
 * re-renders. Consumers (Wizard, camera parallax) read `pointer.x/pointer.y` in a
 * useFrame loop and interpolate toward it — never snap. Falls back to touch.
 */
export const pointer = { x: 0, y: 0, active: false, lastMove: 0 };

let listening = false;

export function useGlobalPointer() {
  useEffect(() => {
    if (listening) return;
    listening = true;

    const set = (clientX: number, clientY: number) => {
      pointer.x = (clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((clientY / window.innerHeight) * 2 - 1);
      pointer.active = true;
      pointer.lastMove = performance.now();
    };

    const onMove = (e: PointerEvent) => set(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) set(t.clientX, t.clientY);
    };
    const onLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('pointerleave', onLeave);
      listening = false;
    };
  }, []);
}
