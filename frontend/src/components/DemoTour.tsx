import { FC, useEffect, useState } from 'react';
import {
  ChevronRight,
  Database,
  GitCompareArrows,
  type LucideIcon,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { useIsDemo, takeDemoTour } from '../lib/demo';
import { cn } from '../lib/cn';

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

/** The four things the live demo is meant to show off, in order. */
const STEPS: Step[] = [
  {
    icon: Database,
    title: 'Every number is labelled',
    body: 'Prices carry their provenance — “live” when Alpha Vantage responds, a labelled “snapshot” otherwise. The app never dresses up offline data as live.',
  },
  {
    icon: Sparkles,
    title: 'Signals, then an honest reading',
    body: 'Open any asset to see labelled signals plus a plain-English reading — with a stated confidence level. Heuristics by default; grounded AI when a key is present.',
  },
  {
    icon: GitCompareArrows,
    title: 'Compare, side by side',
    body: 'Search a company by name or ticker and put two or three next to each other — their price shape, the same signals, and each honest reading. It lives under Markets and Portfolio.',
  },
  {
    icon: Wallet,
    title: 'A portfolio that adds up',
    body: 'This demo comes seeded: real P/L over cost basis, sector allocation, and calm sparklines. Edit the holdings and watchlist freely — it’s a sandbox.',
  },
];

/**
 * One-time guided highlight shown right after the visitor starts the live demo.
 * A centred, dismissible carousel over the seeded product — it teaches what to
 * look for rather than pinning coach-marks to elements across routes.
 */
export const DemoTour: FC = () => {
  const isDemo = useIsDemo();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  // Open once, when the demo has just been armed (Live demo click).
  useEffect(() => {
    if (isDemo && takeDemoTour()) setOpen(true);
  }, [isDemo]);

  // Escape closes; lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const Icon = step.icon;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-tour-title"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-ink/30 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="relative w-full max-w-md animate-rise overflow-hidden rounded-2xl border border-line bg-elevated shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.1em] text-warn">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Live demo
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Skip the tour"
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Icon size={20} />
          </div>
          <h2 id="demo-tour-title" className="mt-4 font-display text-xl font-medium text-ink">
            {step.title}
          </h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-secondary">{step.body}</p>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
          <div className="flex items-center gap-1.5" aria-hidden>
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  idx === i ? 'w-5 bg-accent' : 'w-1.5 bg-line-strong'
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {i > 0 && (
              <button
                onClick={() => setI((n) => n - 1)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                Back
              </button>
            )}
            {last ? (
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#F7F8F5] transition-colors hover:bg-accent-hover"
              >
                Explore
              </button>
            ) : (
              <button
                onClick={() => setI((n) => n + 1)}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#F7F8F5] transition-colors hover:bg-accent-hover"
              >
                Next <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoTour;
