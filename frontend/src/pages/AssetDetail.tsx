import { FC, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';
import { AxiosError } from 'axios';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Delta from '../components/ui/Delta';
import DataSourceBadge from '../components/ui/DataSourceBadge';
import PriceAreaChart from '../components/charts/PriceAreaChart';
import InsightPanel from '../components/insights/InsightPanel';
import {
  useStock,
  useHistory,
  useAssetInsight,
  useWatchlist,
  useWatchlistMutations,
} from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/errors';
import { useToast } from '../components/Toast';
import {
  formatCurrency,
  formatDelta,
  formatPercent,
  formatVolume,
} from '../lib/format';

const PERIODS = ['1mo', '3mo', '6mo', '1y'] as const;
type Period = (typeof PERIODS)[number];
const PERIOD_LABEL: Record<Period, string> = {
  '1mo': '1M',
  '3mo': '3M',
  '6mo': '6M',
  '1y': '1Y',
};

const BackLink: FC = () => (
  <Link
    to="/markets"
    className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-ink"
  >
    <ArrowLeft size={15} /> Back to markets
  </Link>
);

const StatCell: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="px-4 py-3">
    <div className="eyebrow mb-1">{label}</div>
    <div className="font-mono text-sm text-ink tabular">{value}</div>
  </div>
);

const PriceHistory: FC<{ symbol: string }> = ({ symbol }) => {
  const [period, setPeriod] = useState<Period>('6mo');
  const { data, isLoading, isError, error, refetch } = useHistory(symbol, period);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="eyebrow">Price history</span>
        <div className="flex items-center gap-1 rounded-lg border border-line bg-base p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-2.5 py-1 font-mono text-2xs font-semibold transition-colors ${
                period === p ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="skeleton h-[260px] w-full rounded-xl" />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !data || data.history.length < 2 ? (
        <EmptyState title="No price history" body="We don't have a series for this asset yet." />
      ) : (
        <PriceAreaChart data={data.history.map((h) => ({ date: h.date, value: h.close }))} />
      )}
    </div>
  );
};

const AssetDetail: FC = () => {
  const { symbol = '' } = useParams<{ symbol: string }>();
  const sym = symbol.toUpperCase();
  const { data: quote, isLoading, isError, error, refetch } = useStock(sym);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <BackLink />
        <div className="skeleton h-6 w-24" />
        <div className="skeleton mt-3 h-12 w-48" />
        <div className="skeleton mt-6 h-[320px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !quote) {
    const status = (error as AxiosError | undefined)?.response?.status;
    if (status === 404) {
      return (
        <div className="animate-fade-in">
          <BackLink />
          <EmptyState
            title={`We don't cover ${sym}`}
            body="This symbol isn't in our data set. Search the markets for one we track."
            action={
              <Link
                to="/markets"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#F7F8F5] transition-colors hover:bg-accent-hover"
              >
                Browse markets
              </Link>
            }
          />
        </div>
      );
    }
    return (
      <div className="animate-fade-in">
        <BackLink />
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  const prevClose = +(quote.price - quote.change).toFixed(2);

  return (
    <div className="animate-fade-in">
      <BackLink />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              {quote.symbol}
            </h1>
            <DataSourceBadge source={quote.source} />
          </div>
          <p className="mt-1 text-ink-secondary">
            {quote.name}
            {quote.sector && <span className="text-ink-muted"> · {quote.sector}</span>}
          </p>
          <div className="mt-3">
            <WatchButton symbol={quote.symbol} />
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl text-ink tabular">{formatCurrency(quote.price)}</div>
          <div className="mt-1 flex items-center justify-end gap-2">
            <Delta value={quote.changePercent} pill />
            <span className="font-mono text-sm text-ink-secondary tabular">
              {formatDelta(quote.change)} today
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <PriceHistory symbol={sym} />
      </div>

      {/* Key stats */}
      <div className="mt-6 card divide-y divide-line p-0">
        <div className="grid grid-cols-2 divide-x divide-line sm:grid-cols-4">
          <StatCell label="Open" value={formatCurrency(quote.open)} />
          <StatCell label="Prev close" value={formatCurrency(prevClose)} />
          <StatCell label="Day high" value={formatCurrency(quote.high)} />
          <StatCell label="Day low" value={formatCurrency(quote.low)} />
        </div>
        <div className="grid grid-cols-2 divide-x divide-line sm:grid-cols-4">
          <StatCell label="Volume" value={formatVolume(quote.volume)} />
          <StatCell
            label="Market cap"
            value={quote.marketCap ? formatCurrency(quote.marketCap, { compact: true }) : '—'}
          />
          <StatCell label="Day change" value={formatPercent(quote.changePercent)} />
          <StatCell label="Sector" value={quote.sector || '—'} />
        </div>
      </div>

      {/* Signals reading — the signature transparency panel */}
      <div className="mt-6">
        <AssetInsightSection symbol={sym} />
      </div>
    </div>
  );
};

const WatchButton: FC<{ symbol: string }> = ({ symbol }) => {
  const { user } = useAuth();
  const wl = useWatchlist(Boolean(user));
  const { add, remove } = useWatchlistMutations();
  const toast = useToast();
  if (!user) return null;

  const watching = (wl.data ?? []).includes(symbol);
  const busy = add.isLoading || remove.isLoading;
  return (
    <button
      onClick={() => {
        if (watching) remove.mutate(symbol, { onError: (err) => toast(getErrorMessage(err), 'error') });
        else add.mutate(symbol, { onError: (err) => toast(getErrorMessage(err), 'error') });
      }}
      disabled={busy}
      aria-pressed={watching}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
        watching
          ? 'border-accent/30 bg-accent/10 text-accent'
          : 'border-line-strong text-ink hover:border-ink-muted'
      }`}
    >
      <Star size={15} className={watching ? 'fill-accent' : ''} />
      {watching ? 'Watching' : 'Watch'}
    </button>
  );
};

const AssetInsightSection: FC<{ symbol: string }> = ({ symbol }) => {
  const { data, isLoading, isError, error, refetch } = useAssetInsight(symbol);

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <span className="eyebrow">Reading the signals…</span>
        </div>
        <div className="skeleton mt-4 h-6 w-2/3" />
        <div className="skeleton mt-3 h-4 w-full" />
        <div className="skeleton mt-2 h-4 w-5/6" />
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
  }
  return (
    <InsightPanel
      method={data.method}
      headline={data.headline}
      summary={data.summary}
      reasoning={data.reasoning}
      limits={data.limits}
      disclaimer={data.disclaimer}
      observations={data.observations}
      confidence={data.confidence}
      source={data.source}
    />
  );
};

export default AssetDetail;
