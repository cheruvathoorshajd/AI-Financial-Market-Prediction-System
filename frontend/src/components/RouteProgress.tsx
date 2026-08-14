import { FC, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * "Flux Line" route transition — a slim verdigris progress line with a gilt head
 * that draws across the top of the viewport on every in-app navigation (tab /
 * feature change), echoing the logo's wave. Mounted inside the app shell, so it
 * only fires for product-route changes, not for the landing or auth pages.
 */
export const RouteProgress: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false; // don't animate on the shell's initial mount
      return;
    }
    const el = ref.current;
    if (!el || prefersReduced()) return;

    let cancelled = false;
    el.getAnimations().forEach((a) => a.cancel());
    el.style.width = '0%';
    el.style.opacity = '1';

    const step = (kf: Keyframe[], opts: KeyframeAnimationOptions) =>
      new Promise<void>((resolve) => {
        const anim = el.animate(kf, { ...opts, fill: 'forwards' });
        anim.onfinish = () => {
          try {
            anim.commitStyles();
          } catch {
            /* ignore */
          }
          anim.cancel();
          resolve();
        };
        anim.oncancel = () => resolve();
      });

    (async () => {
      await step([{ width: '0%' }, { width: '75%' }], { duration: 300, easing: 'cubic-bezier(.3,0,.15,1)' });
      if (cancelled) return;
      await step([{ width: '75%' }, { width: '100%' }], { duration: 190, easing: 'ease' });
      if (cancelled) return;
      await step([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease' });
      if (cancelled) return;
      el.style.width = '0%';
      el.style.opacity = '1';
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  return <div ref={ref} className="route-progress" aria-hidden />;
};

export default RouteProgress;
