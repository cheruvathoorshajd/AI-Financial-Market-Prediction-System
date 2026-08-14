import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Eases a number from its previous value to `target` (from 0 on first mount),
 * so figures resolve into place rather than snapping. A no-op — snaps instantly —
 * when the user prefers reduced motion.
 */
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0);
  const prev = useRef(prefersReducedMotion() ? target : 0);

  useEffect(() => {
    if (prefersReducedMotion() || prev.current === target) {
      setValue(target);
      prev.current = target;
      return;
    }
    const from = prev.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
