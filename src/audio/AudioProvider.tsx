import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { initAudio, playClick } from './engine';

interface AudioApi {
  enabled: boolean;
  toggle: () => void;
  click: () => void;
}

const Ctx = createContext<AudioApi | null>(null);
export const useAudio = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAudio outside provider');
  return c;
};

const LS = 'prosper.sound.enabled';

export function AudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(LS) !== '0');
  const started = useRef(false);

  // one-time first-gesture init (autoplay-safe: buffer decodes after interaction)
  useEffect(() => {
    const onGesture = async () => {
      if (started.current) return;
      started.current = true;
      await initAudio();
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(LS, next ? '1' : '0');
      return next;
    });
  }, []);

  const click = useCallback(() => {
    if (enabled) playClick();
  }, [enabled]);

  return <Ctx.Provider value={{ enabled, toggle, click }}>{children}</Ctx.Provider>;
}
