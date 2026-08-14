import { FC } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, LineChart } from 'lucide-react';
import { useOutlook } from '../../lib/queries';
import { formatCurrency } from '../../lib/format';
import { cn } from '../../lib/cn';

/**
 * Experimental LSTM outlook board. Ranks assets by the model's expected next-day
 * return — and puts its honest backtest (skill vs. a naive guess, directional
 * accuracy) right next to the numbers, so the ranking is never mistaken for a
 * reliable prediction. It explains a model; it never advises.
 */
export const OutlookBoard: FC = () => {
  const { data, isLoading, isError } = useOutlook();

  return (
    <section className="card overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">
        <LineChart size={17} className="text-accent" />
        <h2 className="font-display text-lg font-medium text-ink">Model outlook</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-[0.1em] text-warn">
          Experimental · LSTM
        </span>
        {data?.ranked?.length ? (
          <span className="ml-auto font-mono text-2xs uppercase tracking-[0.1em] text-ink-muted">
            next trading day
          </span>
        ) : null}
      </div>

      {/* Loading — training happens server-side, so the first call is slow. */}
      {isLoading && (
        <div className="p-5">
          <div className="skeleton h-4 w-3/4" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-11 w-full rounded-lg" />
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-muted">Training the model on each asset — one moment…</p>
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-2 p-5 text-sm text-ink-secondary">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-warn" />
          <span>The forecaster isn’t available right now. It runs a real model server-side, which may be starting up.</span>
        </div>
      )}

      {data && !data.available && !isLoading && (
        <div className="flex items-start gap-2 p-5 text-sm text-ink-secondary">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-warn" />
          <span>The model couldn’t run (PyTorch may be unavailable on the server). The rest of Insights still works.</span>
        </div>
      )}

      {data?.available && (
        <>
          {/* Honesty banner — deliberately louder than the ranking. */}
          <div className="border-b border-line bg-gold/5 px-5 py-3 text-sm leading-relaxed text-ink-secondary">
            {data.honesty}
            <span className="mt-1 block font-mono text-2xs uppercase tracking-[0.08em] text-warn">
              avg skill vs. naive:{' '}
              {Number.isFinite(data.avg_skill_vs_naive_pct)
                ? `${data.avg_skill_vs_naive_pct > 0 ? '+' : ''}${data.avg_skill_vs_naive_pct}%`
                : '—'}
            </span>
          </div>

          <div className="hidden grid-cols-[auto_1.4fr_1fr_1fr_1fr] gap-3 px-5 py-2.5 sm:grid">
            <span className="eyebrow">#</span>
            <span className="eyebrow">Asset</span>
            <span className="eyebrow text-right">Forecast</span>
            <span className="eyebrow text-right">Dir. acc.</span>
            <span className="eyebrow text-right">Skill vs naive</span>
          </div>

          <ul className="divide-y divide-line">
            {data.ranked.map((r, i) => (
              <li key={r.symbol}>
                <Link
                  to={`/markets/${r.symbol}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-raised sm:grid-cols-[auto_1.4fr_1fr_1fr_1fr]"
                >
                  <span className="font-mono text-sm text-ink-muted tabular">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-semibold text-ink">{r.symbol}</div>
                    <div className="truncate text-xs text-ink-muted">{r.name}</div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'font-mono text-sm font-semibold tabular',
                        r.forecast_return_pct >= 0 ? 'text-pos' : 'text-neg'
                      )}
                    >
                      {Number.isFinite(r.forecast_return_pct)
                        ? `${r.forecast_return_pct >= 0 ? '+' : ''}${r.forecast_return_pct.toFixed(2)}%`
                        : '—'}
                    </div>
                    <div className="text-2xs text-ink-muted tabular">
                      → {formatCurrency(r.forecast_price)}
                    </div>
                  </div>
                  <div className="hidden text-right font-mono text-sm text-ink-secondary tabular sm:block">
                    {Number.isFinite(r.directional_accuracy)
                      ? `${(r.directional_accuracy * 100).toFixed(0)}%`
                      : '—'}
                  </div>
                  <div className="hidden text-right font-mono text-sm tabular sm:block">
                    <span className={r.skill_vs_naive_pct >= 0 ? 'text-ink-secondary' : 'text-neg'}>
                      {Number.isFinite(r.skill_vs_naive_pct)
                        ? `${r.skill_vs_naive_pct > 0 ? '+' : ''}${r.skill_vs_naive_pct}%`
                        : '—'}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <p className="border-t border-line px-5 py-3 text-xs leading-relaxed text-ink-muted">
            {data.disclaimer}
          </p>
        </>
      )}
    </section>
  );
};

export default OutlookBoard;
