import { createContext, FC, ReactNode, useCallback, useContext, useRef } from 'react';

interface WipeOptions {
  /**
   * Show a confirmation message (with a drawn checkmark) instead of a random
   * financial quote — used for sign-out ("Signed out / See you soon.").
   */
  message?: { title: string; sub?: string };
}

interface TransitionCtx {
  /** Play the verdigris wipe: cover → run `action` (auth + navigate) → reveal. */
  wipe: (action: () => void | Promise<void>, opts?: WipeOptions) => Promise<void>;
}

const noop: TransitionCtx = { wipe: async (action) => { await action(); } };
const TransitionContext = createContext<TransitionCtx>(noop);

/** Short, readable-in-a-glance quotes — honestly attributed. */
const QUOTES: Array<{ t: string; a: string }> = [
  { t: 'Price is what you pay. Value is what you get.', a: 'Warren Buffett' },
  { t: 'Know what you own, and know why you own it.', a: 'Peter Lynch' },
  { t: 'Risk comes from not knowing what you’re doing.', a: 'Warren Buffett' },
  { t: 'An investment in knowledge pays the best interest.', a: 'Benjamin Franklin' },
  { t: 'In investing, what is comfortable is rarely profitable.', a: 'Robert Arnott' },
  { t: 'Investing is most intelligent when it is most businesslike.', a: 'Benjamin Graham' },
  { t: 'Time in the market beats timing the market.', a: 'Market adage' },
  { t: 'Compound interest is the eighth wonder of the world.', a: 'Attributed to Einstein' },
  { t: 'The stock market rewards patience over prediction.', a: 'Fluxus Fisci' },
  { t: 'Understand first. Act second.', a: 'Fluxus Fisci' },
  { t: 'Know the numbers before the narrative.', a: 'Fluxus Fisci' },
];

const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const EASE = 'cubic-bezier(.76,0,.24,1)';
const HOLD = 1400; // ms the quote is held — readable, under 1.5s
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function slide(el: HTMLElement, from: string, to: string) {
  const anim = el.animate([{ transform: from }, { transform: to }], { duration: 340, easing: EASE, fill: 'forwards' });
  await anim.finished;
  try {
    anim.commitStyles();
  } catch {
    el.style.transform = to;
  }
  anim.cancel();
}

/**
 * "Verdigris Wipe" auth transition. A full-viewport verdigris panel wipes in and
 * shows a different financial quote each time — held ~1.4s so it reads in under
 * 1.5s — while the auth action + navigation run; then it wipes off to reveal the
 * destination. Honours prefers-reduced-motion (runs the action with no animation).
 */
export const TransitionProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const qRef = useRef<HTMLParagraphElement>(null);
  const byRef = useRef<HTMLParagraphElement>(null);
  const markRef = useRef<SVGSVGElement>(null);
  const checkRef = useRef<SVGSVGElement>(null);
  const checkPathRef = useRef<SVGPathElement>(null);
  const lastIdx = useRef(-1);
  const busy = useRef(false);

  const pickQuote = () => {
    if (QUOTES.length < 2) return QUOTES[0];
    let i = lastIdx.current;
    while (i === lastIdx.current) i = Math.floor(Math.random() * QUOTES.length);
    lastIdx.current = i;
    return QUOTES[i];
  };

  const wipe = useCallback(async (action: () => void | Promise<void>, opts?: WipeOptions) => {
    const panel = panelRef.current;
    const box = quoteRef.current;
    if (!panel || prefersReduced() || busy.current) {
      await action();
      return;
    }
    busy.current = true;
    try {
      const msg = opts?.message;
      // Swap the mark for a checkmark in confirmation (sign-out) mode.
      if (markRef.current) markRef.current.style.display = msg ? 'none' : '';
      if (checkRef.current) checkRef.current.style.display = msg ? '' : 'none';

      if (msg) {
        if (qRef.current) qRef.current.textContent = msg.title;
        if (byRef.current) byRef.current.textContent = msg.sub ?? '';
      } else {
        const q = pickQuote();
        if (qRef.current) qRef.current.textContent = q.t;
        if (byRef.current) byRef.current.textContent = `— ${q.a}`;
      }
      if (box) box.style.opacity = '0';

      await slide(panel, 'translateX(-101%)', 'translateX(0)');
      if (box) {
        box.animate(
          [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
          { duration: 280, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
        box.style.opacity = '1';
        box.style.transform = 'none';
      }
      // Draw the checkmark stroke in confirmation mode.
      if (msg && checkPathRef.current) {
        try {
          const len = checkPathRef.current.getTotalLength();
          checkPathRef.current.style.strokeDasharray = `${len}`;
          checkPathRef.current.style.strokeDashoffset = `${len}`;
          checkPathRef.current.animate(
            [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }],
            { duration: 460, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }
          );
          checkPathRef.current.style.strokeDashoffset = '0';
        } catch {
          /* getTotalLength unsupported — the check simply appears without drawing */
        }
      }
      const shownAt = performance.now();

      try {
        await action();
      } finally {
        const remaining = HOLD - (performance.now() - shownAt);
        if (remaining > 0) await wait(remaining);
        if (box) {
          box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease' });
          box.style.opacity = '0';
        }
        await slide(panel, 'translateX(0)', 'translateX(101%)');
        panel.style.transform = 'translateX(-101%)'; // reset off-screen-left for next time
      }
    } finally {
      busy.current = false;
    }
  }, []);

  return (
    <TransitionContext.Provider value={{ wipe }}>
      {children}
      <div ref={panelRef} className="auth-wipe" aria-hidden>
        {/* Flux mark — shown for quote (auth) transitions. */}
        <svg ref={markRef} width="36" height="36" viewBox="0 0 32 32" fill="none">
          <path d="M6 23H26" stroke="#F4F5F2" strokeOpacity=".4" strokeWidth="1.4" strokeLinecap="round" />
          <path
            d="M6.5 19.5C9.5 19.5 10 9.5 14 9.5C18 9.5 17.5 19.5 21.5 19.5"
            stroke="#F4F5F2"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="24.5" cy="10.5" r="2.2" fill="#E7C77A" />
        </svg>
        {/* Checkmark — shown for confirmation (sign-out) transitions. */}
        <svg ref={checkRef} width="46" height="46" viewBox="0 0 46 46" fill="none" style={{ display: 'none' }}>
          <circle cx="23" cy="23" r="21" stroke="#F4F5F2" strokeOpacity=".35" strokeWidth="1.5" />
          <path
            ref={checkPathRef}
            d="M14.5 23.5L20.5 29.5L31.5 16.5"
            stroke="#E7C77A"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div ref={quoteRef} className="auth-wipe__quote">
          <p ref={qRef} className="auth-wipe__q" />
          <p ref={byRef} className="auth-wipe__by" />
        </div>
      </div>
    </TransitionContext.Provider>
  );
};

export const useTransition = (): TransitionCtx => useContext(TransitionContext);
