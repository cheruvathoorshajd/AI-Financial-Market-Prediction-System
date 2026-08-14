import { FC, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompareArrows, PieChart, Plus, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SectionHeading from '../components/ui/SectionHeading';
import StatTile from '../components/ui/StatTile';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import Delta from '../components/ui/Delta';
import Sparkline from '../components/ui/Sparkline';
import DataSourceBadge from '../components/ui/DataSourceBadge';
import AnimatedCurrency from '../components/ui/AnimatedNumber';
import AllocationDonut from '../components/charts/AllocationDonut';
import { ComparePanel } from '../components/market/CompareSection';
import { usePortfolio, usePortfolioMutations } from '../lib/queries';
import { cn } from '../lib/cn';
import { getErrorMessage } from '../lib/errors';
import { useToast } from '../components/Toast';
import { Holding, AllocationSlice } from '../services/portfolioService';
import { formatCurrency, formatNumber } from '../lib/format';

/** Fold allocation beyond 5 slices into a single "Other" so the donut stays legible. */
function foldAllocation(slices: AllocationSlice[]): AllocationSlice[] {
  if (slices.length <= 6) return slices;
  const top = slices.slice(0, 5);
  const rest = slices.slice(5).reduce((s, x) => s + x.value, 0);
  return [...top, { name: 'Other', value: rest }];
}

const HoldingRow: FC<{ h: Holding }> = ({ h }) => (
  <Link
    to={`/markets/${h.symbol}`}
    className="grid min-w-0 flex-1 grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-raised sm:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]"
  >
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-sm font-semibold text-ink">{h.symbol}</span>
        {h.priced === false && (
          <span className="rounded border border-line px-1 py-px text-2xs uppercase tracking-wide text-ink-muted">
            no quote
          </span>
        )}
      </div>
      <div className="truncate text-xs text-ink-muted">
        {formatNumber(h.shares)} sh · avg {formatCurrency(h.avgCost)}
      </div>
    </div>
    <div className="hidden text-right sm:block">
      <div className="font-mono text-sm text-ink tabular">{formatCurrency(h.price)}</div>
      <div className="text-xs text-ink-muted">last</div>
    </div>
    <div className="hidden text-right sm:block">
      <div className="font-mono text-sm text-ink tabular">{formatCurrency(h.marketValue)}</div>
      <Delta value={h.gainPercent} size="sm" />
    </div>
    <div className="hidden items-center justify-end sm:flex">
      <Sparkline data={h.spark} width={72} height={26} />
    </div>
    {/* mobile-condensed value + delta */}
    <div className="text-right sm:hidden">
      <div className="font-mono text-sm text-ink tabular">{formatCurrency(h.marketValue)}</div>
      <Delta value={h.gainPercent} size="sm" />
    </div>
    <div className="hidden text-right font-mono text-xs text-ink-muted tabular sm:block">
      {h.weight.toFixed(1)}%
    </div>
  </Link>
);

const Portfolio: FC = () => {
  const { data, isLoading, isError, error, refetch } = usePortfolio();
  const { upsert, remove } = usePortfolioMutations();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<'sector' | 'compare'>('sector');
  const [form, setForm] = useState({ symbol: '', shares: '', avgCost: '' });

  const submitAdd = (e: FormEvent) => {
    e.preventDefault();
    const symbol = form.symbol.trim().toUpperCase();
    const shares = Number(form.shares);
    const avgCost = Number(form.avgCost);
    if (
      !symbol ||
      !Number.isFinite(shares) ||
      shares <= 0 ||
      !Number.isFinite(avgCost) ||
      avgCost <= 0
    )
      return;
    upsert.mutate(
      { symbol, shares, avgCost },
      {
        onSuccess: () => {
          setForm({ symbol: '', shares: '', avgCost: '' });
          setShowAdd(false);
        },
        onError: (err) => toast(getErrorMessage(err), 'error'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader eyebrow="Portfolio" title="What you hold, clearly" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton mt-3 h-7 w-28" />
            </div>
          ))}
        </div>
        <div className="skeleton mt-8 h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader eyebrow="Portfolio" title="What you hold, clearly" />
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  const t = data.totals;

  const addForm = showAdd && (
    <form onSubmit={submitAdd} className="card mb-8 p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Ticker</span>
          <input
            value={form.symbol}
            onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
            placeholder="AAPL"
            aria-label="Ticker symbol"
            maxLength={12}
            className="w-full rounded-xl border border-line bg-elevated px-3.5 py-2.5 font-mono text-sm uppercase text-ink placeholder:text-ink-muted focus:border-accent focus-visible:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Shares</span>
          <input
            value={form.shares}
            onChange={(e) => setForm((f) => ({ ...f, shares: e.target.value }))}
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="10"
            aria-label="Number of shares"
            className="w-full rounded-xl border border-line bg-elevated px-3.5 py-2.5 font-mono text-sm text-ink tabular placeholder:text-ink-muted focus:border-accent focus-visible:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Avg cost</span>
          <input
            value={form.avgCost}
            onChange={(e) => setForm((f) => ({ ...f, avgCost: e.target.value }))}
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="181.20"
            aria-label="Average cost per share"
            className="w-full rounded-xl border border-line bg-elevated px-3.5 py-2.5 font-mono text-sm text-ink tabular placeholder:text-ink-muted focus:border-accent focus-visible:outline-none"
          />
        </label>
        <Button type="submit" disabled={upsert.isLoading || !form.symbol.trim()}>
          {upsert.isLoading ? 'Saving…' : 'Save'}
        </Button>
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        Adding a ticker you already hold updates its shares and average cost.
      </p>
      {upsert.isError && (
        <p className="mt-2 text-xs text-neg" role="alert">
          {getErrorMessage(upsert.error)}
        </p>
      )}
    </form>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Portfolio"
        title="What you hold, clearly"
        description="Holdings, allocation, and gains over cost basis — the shape of your positions without the noise."
        actions={
          <>
            <DataSourceBadge source={data.source} verbose />
            <Button size="sm" variant="secondary" onClick={() => setShowAdd((s) => !s)}>
              <Plus size={15} /> Add position
            </Button>
          </>
        }
      />

      {addForm}

      {data.holdings.length === 0 ? (
        <EmptyState
          icon={<PieChart size={20} />}
          title="No holdings yet"
          body="Add positions to see your allocation, day change, and total return laid out."
          action={
            <Button variant="outline" onClick={() => setShowAdd(true)}>
              <Plus size={15} /> Add your first position
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Total value" value={<AnimatedCurrency value={t.totalValue} />} delta={t.dayChangePercent} hint="today" />
            <StatTile label="Total return" value={formatCurrency(t.totalGain)} delta={t.totalGainPercent} hint="over cost basis" />
            <StatTile label="Invested" value={formatCurrency(t.investedValue)} hint={`${data.holdings.length} holdings`} />
            <StatTile label="Cash" value={formatCurrency(t.cash)} hint="uninvested" />
          </div>

          <section className="mt-10">
            <div className="mb-5 inline-flex rounded-xl border border-line bg-raised p-1 text-sm">
              <button
                type="button"
                onClick={() => setView('sector')}
                aria-pressed={view === 'sector'}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-colors',
                  view === 'sector'
                    ? 'bg-surface text-ink shadow-card'
                    : 'text-ink-secondary hover:text-ink'
                )}
              >
                <PieChart size={14} /> By sector
              </button>
              <button
                type="button"
                onClick={() => setView('compare')}
                aria-pressed={view === 'compare'}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-colors',
                  view === 'compare'
                    ? 'bg-surface text-ink shadow-card'
                    : 'text-ink-secondary hover:text-ink'
                )}
              >
                <GitCompareArrows size={14} /> Compare
              </button>
            </div>

            {view === 'sector' ? (
              <div className="card p-6">
                <AllocationDonut
                  data={foldAllocation(data.allocation)}
                  centerLabel="Invested"
                  centerValue={formatCurrency(t.investedValue, { compact: true })}
                />
              </div>
            ) : (
              <div className="animate-fade-in">
                <ComparePanel
                  defaultSymbols={[...data.holdings]
                    .sort((a, b) => b.weight - a.weight)
                    .slice(0, 3)
                    .map((h) => h.symbol)}
                />
              </div>
            )}
          </section>

          <section className="mt-10">
            <SectionHeading eyebrow="Holdings" title="Your positions" />
            <div className="card overflow-hidden p-0">
              <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] gap-3 border-b border-line px-4 py-2.5 pr-14 sm:grid">
                <span className="eyebrow">Asset</span>
                <span className="eyebrow text-right">Last</span>
                <span className="eyebrow text-right">Value</span>
                <span className="eyebrow text-right">30d</span>
                <span className="eyebrow text-right">Weight</span>
              </div>
              <div className="divide-y divide-line">
                {data.holdings.map((h) => (
                  <div key={h.symbol} className="group flex items-center">
                    <HoldingRow h={h} />
                    <button
                      onClick={() =>
                        remove.mutate(h.symbol, {
                          onError: (err) => toast(getErrorMessage(err), 'error'),
                        })
                      }
                      disabled={remove.isLoading}
                      aria-label={`Remove ${h.symbol} from portfolio`}
                      className="mr-2 shrink-0 rounded-lg p-2 text-ink-muted opacity-100 transition-colors hover:bg-raised hover:text-neg focus-visible:opacity-100 disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Portfolio;
