import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, GitCompareArrows, Search, X } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import Delta from '../ui/Delta';
import PriceAreaChart from '../charts/PriceAreaChart';
import { useAssetInsight, useHistory, useSearch, useStock } from '../../lib/queries';
import { useDebounce } from '../../lib/useDebounce';
import { formatCurrency } from '../../lib/format';
import { cn } from '../../lib/cn';
import { SignalDirection, Confidence } from '../../services/insightsService';

const MAX = 3;

const dirColor = (d: SignalDirection) =>
  d === 'up' ? 'bg-pos' : d === 'down' ? 'bg-neg' : 'bg-ink-muted';

const CONFIDENCE_TONE: Record<Confidence['level'], string> = {
  moderate: 'border-accent/30 bg-accent/10 text-accent',
  tentative: 'border-warn/30 bg-warn/10 text-warn',
  low: 'border-line-strong bg-raised text-ink-secondary',
};

/** A single comparison column — each instance owns its own data queries. */
const CompareColumn: FC<{ symbol: string; onRemove: () => void }> = ({ symbol, onRemove }) => {
  const stock = useStock(symbol);
  const history = useHistory(symbol, '6mo');
  const insight = useAssetInsight(symbol);

  const points = (history.data?.history ?? []).map((h) => ({ date: h.date, value: h.close }));

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-lg font-semibold text-ink">{symbol}</div>
          <div className="truncate text-xs text-ink-muted">{stock.data?.name ?? '—'}</div>
        </div>
        <button
          onClick={onRemove}
          aria-label={`Remove ${symbol} from comparison`}
          className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-raised hover:text-neg"
        >
          <X size={15} />
        </button>
      </div>

      {stock.isLoading ? (
        <div className="skeleton mt-3 h-8 w-32 rounded" />
      ) : stock.isError || !stock.data ? (
        <p className="mt-3 text-sm text-neg">Couldn't load {symbol}.</p>
      ) : (
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="font-mono text-2xl text-ink tabular">{formatCurrency(stock.data.price)}</span>
          <Delta value={stock.data.changePercent} />
        </div>
      )}

      <div className="mt-4">
        {history.isLoading ? (
          <div className="skeleton h-[140px] w-full rounded-xl" />
        ) : points.length > 1 ? (
          <PriceAreaChart data={points} height={140} showAxes={false} />
        ) : (
          <div className="h-[140px]" aria-hidden />
        )}
      </div>

      <div className="mt-4">
        <div className="eyebrow mb-2">Signals</div>
        {insight.isLoading ? (
          <div className="space-y-1.5" aria-hidden>
            <div className="skeleton h-8 w-full rounded-lg" />
            <div className="skeleton h-8 w-full rounded-lg" />
            <div className="skeleton h-8 w-full rounded-lg" />
          </div>
        ) : insight.data?.observations.length ? (
          <ul className="space-y-1.5">
            {insight.data.observations.map((o) => (
              <li
                key={o.key}
                className="flex items-center justify-between gap-2 rounded-lg border border-line bg-base px-3 py-1.5"
              >
                <span className="flex min-w-0 items-center gap-2 text-xs text-ink-secondary">
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dirColor(o.direction))} />
                  <span className="truncate">{o.label}</span>
                </span>
                <span className="shrink-0 font-mono text-sm text-ink tabular">{o.value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-muted">Not enough data to read {symbol}.</p>
        )}
      </div>

      {insight.data && (
        <div className="mt-4 border-t border-line pt-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.08em] text-accent">
              {insight.data.method === 'llm' ? 'AI reading' : 'Signals reading'}
            </span>
            <span
              title={insight.data.confidence.rationale}
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.08em]',
                CONFIDENCE_TONE[insight.data.confidence.level]
              )}
            >
              {insight.data.confidence.level} confidence
            </span>
          </div>
          <p className="text-balance font-display text-base font-medium leading-snug text-ink">
            {insight.data.headline}
          </p>
          <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-secondary">
            {insight.data.summary}
          </p>
        </div>
      )}

      <Link
        to={`/markets/${symbol}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-all hover:gap-1.5"
      >
        Full reading <ChevronRight size={15} />
      </Link>
    </div>
  );
};

/**
 * Search-to-add: find an asset by company name OR ticker (the same
 * `/market/search` source Markets uses) and add it to the comparison.
 * Mirrors the command-palette combobox so typing "Nvidia" resolves to NVDA
 * instead of failing as the literal, invalid ticker "NVIDIA".
 */
const AssetSearchAdd: FC<{ existing: string[]; onAdd: (symbol: string) => void }> = ({
  existing,
  onAdd,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query.trim(), 200);
  const search = useSearch(debounced);

  const results = (search.data?.results ?? [])
    .filter((r) => !existing.includes(r.symbol.toUpperCase()))
    .slice(0, 6);

  const pick = (symbol: string) => {
    onAdd(symbol);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative mb-6 max-w-sm">
      <div className="flex items-center gap-2 rounded-xl border border-line bg-elevated px-3 focus-within:border-accent">
        <Search size={16} className="shrink-0 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (results.length) pick(results[0].symbol);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Add an asset — name or ticker"
          aria-label="Search an asset to compare"
          className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </div>

      {open && debounced.length > 0 && (
        <div
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-line bg-elevated shadow-pop"
          // Keep the input focused so a result's onClick fires before onBlur closes the menu.
          onMouseDown={(e) => e.preventDefault()}
        >
          {search.isLoading ? (
            <p className="px-3 py-3 text-sm text-ink-muted">Searching…</p>
          ) : results.length ? (
            <ul>
              {results.map((r) => (
                <li key={r.symbol}>
                  <button
                    type="button"
                    onClick={() => pick(r.symbol)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent-soft"
                  >
                    <span className="font-mono text-sm font-semibold text-ink">{r.symbol}</span>
                    <span className="min-w-0 truncate text-xs text-ink-muted">{r.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-ink-muted">No matches for “{query.trim()}”.</p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * The compare workspace itself: search-to-add plus up to three side-by-side
 * columns. Owns its own symbol set (seeded by `defaultSymbols`). Rendered on
 * its own — e.g. under a compact inline toggle on Markets — or inside
 * `CompareSection` below.
 */
export const ComparePanel: FC<{ defaultSymbols?: string[] }> = ({ defaultSymbols = [] }) => {
  const [symbols, setSymbols] = useState<string[]>(() => defaultSymbols.slice(0, MAX));

  const addSym = (symbol: string) => {
    const s = symbol.trim().toUpperCase();
    if (!s || symbols.includes(s) || symbols.length >= MAX) return;
    setSymbols((prev) => [...prev, s]);
  };
  const remove = (sym: string) => setSymbols((prev) => prev.filter((s) => s !== sym));

  return (
    <>
      {symbols.length < MAX && <AssetSearchAdd existing={symbols} onAdd={addSym} />}

      {symbols.length === 0 ? (
        <EmptyState
          icon={<GitCompareArrows size={20} />}
          title="Nothing to compare yet"
          body="Search for a couple of assets above to see them side by side."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {symbols.map((sym) => (
            <CompareColumn key={sym} symbol={sym} onRemove={() => remove(sym)} />
          ))}
        </div>
      )}
    </>
  );
};

/**
 * Collapsible Compare section (heading + description + toggle), used on
 * Portfolio. Collapsed by default so it fires no queries until the reader opts
 * in; `defaultSymbols` seeds the panel (e.g. the reader's top holdings).
 */
export const CompareSection: FC<{ defaultSymbols?: string[]; description?: string }> = ({
  defaultSymbols = [],
  description,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <SectionHeading
        eyebrow="Compare"
        title="Compare assets side by side"
        description={
          description ??
          'Put two or three assets next to each other — their price shape, the same labelled signals, and an honest reading of each. For understanding, not a recommendation.'
        }
        action={
          <Button
            size="sm"
            variant={open ? 'secondary' : 'outline'}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <GitCompareArrows size={15} /> {open ? 'Hide' : 'Compare'}
          </Button>
        }
      />

      {open && <ComparePanel defaultSymbols={defaultSymbols} />}
    </section>
  );
};

export default CompareSection;
