import { FC } from 'react';
import { Activity, Info, ShieldQuestion } from 'lucide-react';
import { cn } from '../../lib/cn';
import { InsightSignal, Confidence } from '../../services/insightsService';
import { DataSource } from '../../services/marketService';
import DataSourceBadge from '../ui/DataSourceBadge';

interface InsightPanelProps {
  method?: 'heuristic';
  headline: string;
  summary: string;
  reasoning: string;
  limits: string;
  disclaimer: string;
  observations?: InsightSignal[];
  confidence?: Confidence;
  source?: DataSource;
  className?: string;
}

const CONFIDENCE_TONE: Record<Confidence['level'], string> = {
  moderate: 'border-accent/30 bg-accent/10 text-accent',
  tentative: 'border-warn/30 bg-warn/10 text-warn',
  low: 'border-line-strong bg-raised text-ink-secondary',
};

const dirColor = (d: InsightSignal['direction']) =>
  d === 'up' ? 'bg-pos' : d === 'down' ? 'bg-neg' : 'bg-ink-muted';

/**
 * The signature surface. The transparency is the design: what the reading
 * looked at, how it reasons, how sure it honestly is, and what it can't say —
 * with "not advice" as a first-class part of the composition, not a footnote.
 */
export const InsightPanel: FC<InsightPanelProps> = ({
  headline,
  summary,
  reasoning,
  limits,
  disclaimer,
  observations,
  confidence,
  source,
  className,
}) => (
  <section
    className={cn(
      'relative overflow-hidden rounded-2xl border border-line bg-surface shadow-card',
      className
    )}
    aria-label="Signals reading"
  >
    {/* signature: a verdigris rule down the edge */}
    <div className="absolute inset-y-0 left-0 w-1 bg-accent/70" aria-hidden />

    <div className="p-6 pl-7 sm:p-7 sm:pl-8">
      {/* Provenance row — honest about what produced this */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-accent">
          <Activity size={12} />
          Signals reading
        </span>
        {confidence && (
          <span
            title={confidence.rationale}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em]',
              CONFIDENCE_TONE[confidence.level]
            )}
          >
            {confidence.level} confidence
          </span>
        )}
        {source && <DataSourceBadge source={source} className="ml-auto" />}
      </div>

      <h3 className="text-balance font-display text-2xl font-medium leading-snug tracking-tight text-ink">
        {headline}
      </h3>
      <p className="mt-2.5 text-pretty leading-relaxed text-ink-secondary">{summary}</p>

      <p className="mt-3 text-xs italic text-ink-muted">
        Composed deterministically from the technical signals below — no language
        model, nothing invented.
      </p>

      {/* What it looked at — the real, labelled signals */}
      {observations && observations.length > 0 && (
        <div className="mt-6">
          <div className="eyebrow mb-3">What it looked at</div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {observations.map((o) => (
              <div key={o.key} className="rounded-xl border border-line bg-base px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-ink-secondary">{o.label}</span>
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dirColor(o.direction))} />
                </div>
                <div className="mt-1 font-mono text-base text-ink tabular">{o.value}</div>
                <div className="mt-0.5 text-2xs leading-tight text-ink-muted">{o.reading}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning made visible */}
      {reasoning && (
        <div className="mt-6 rounded-xl border border-line bg-base p-4">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Info size={13} className="text-ink-muted" />
            <span className="eyebrow">How it reads this</span>
          </div>
          <p className="text-pretty text-sm leading-relaxed text-ink-secondary">{reasoning}</p>
        </div>
      )}

      {/* Explicit uncertainty */}
      {limits && (
        <div className="mt-3 rounded-xl border border-warn/20 bg-warn/5 p-4">
          <div className="mb-1.5 flex items-center gap-1.5">
            <ShieldQuestion size={13} className="text-warn" />
            <span className="font-mono text-2xs font-medium uppercase tracking-[0.16em] text-warn">
              What this can't tell you
            </span>
          </div>
          <p className="text-pretty text-sm leading-relaxed text-ink-secondary">{limits}</p>
        </div>
      )}

      {/* Not-advice, as first-class copy */}
      <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-muted">
        {disclaimer}
      </p>
    </div>
  </section>
);

export default InsightPanel;
