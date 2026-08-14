import { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SectionHeading from '../components/ui/SectionHeading';
import StatTile from '../components/ui/StatTile';
import AnimatedCurrency from '../components/ui/AnimatedNumber';
import Delta from '../components/ui/Delta';
import ErrorState from '../components/ui/ErrorState';
import DataSourceBadge from '../components/ui/DataSourceBadge';
import StockRow from '../components/market/StockRow';
import { useAuth } from '../context/AuthContext';
import {
  useIndices,
  usePortfolio,
  useStocks,
  useMovers,
  useWatchlist,
  useWatchlistMutations,
} from '../lib/queries';
import { getErrorMessage } from '../lib/errors';
import { useToast } from '../components/Toast';
import { formatCurrency } from '../lib/format';

const IndicesStrip: FC = () => {
  const { data, isLoading, isError } = useIndices();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-4">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton mt-2 h-6 w-28" />
          </div>
        ))}
      </div>
    );
  }
  if (isError || !data) return null; // indices are ambient; fail quietly

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {data.indices.map((ix) => (
        <div key={ix.symbol} className="card flex items-center justify-between p-4">
          <div>
            <div className="text-sm font-medium text-ink">{ix.name}</div>
            <div className="font-mono text-lg text-ink tabular">
              {Number.isFinite(ix.value)
                ? ix.value.toLocaleString('en-US', { minimumFractionDigits: 2 })
                : '—'}
            </div>
          </div>
          <Delta value={ix.changePercent} pill />
        </div>
      ))}
    </div>
  );
};

const PortfolioSnapshot: FC = () => {
  const { data, isLoading, isError, error, refetch } = usePortfolio();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-3 h-7 w-32" />
            <div className="skeleton mt-3 h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  const t = data.totals;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatTile label="Portfolio value" value={<AnimatedCurrency value={t.totalValue} />} delta={t.dayChangePercent} hint="today" />
      <StatTile label="Total return" value={formatCurrency(t.totalGain)} delta={t.totalGainPercent} hint="all time" />
      <StatTile label="Cash" value={formatCurrency(t.cash)} hint="uninvested" />
    </div>
  );
};

const Watchlist: FC = () => {
  const wl = useWatchlist(true);
  const symbols = wl.data ?? [];
  const quotes = useStocks(symbols);
  const { remove } = useWatchlistMutations();
  const toast = useToast();

  if (wl.isLoading) {
    return (
      <div className="card p-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }
  if (wl.isError) {
    return <ErrorState message={getErrorMessage(wl.error)} onRetry={() => wl.refetch()} />;
  }
  if (symbols.length === 0) {
    return (
      <div className="card bg-dotgrid px-6 py-10 text-center">
        <p className="text-pretty text-sm text-ink-secondary">
          Your watchlist is empty. Open any asset and tap{' '}
          <span className="font-medium text-ink">Watch</span> to follow it here.
        </p>
        <Link
          to="/markets"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink-muted"
        >
          Find assets
        </Link>
      </div>
    );
  }
  if (quotes.isError) {
    return <ErrorState message={getErrorMessage(quotes.error)} onRetry={() => quotes.refetch()} />;
  }
  return (
    <div className="card p-2">
      {quotes.isLoading || !quotes.data
        ? symbols.map((s) => (
            <div key={s} className="flex items-center justify-between px-3 py-2.5">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-16" />
            </div>
          ))
        : quotes.data.stocks.map((q) => (
            <div key={q.symbol} className="group flex items-center gap-1">
              <Link
                to={`/markets/${q.symbol}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-raised"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-sm font-semibold text-ink">{q.symbol}</div>
                  <div className="truncate text-xs text-ink-muted">{q.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-ink tabular">{formatCurrency(q.price)}</div>
                  <Delta value={q.changePercent} size="sm" />
                </div>
              </Link>
              <button
                onClick={() =>
                  remove.mutate(q.symbol, {
                    onError: (err) => toast(getErrorMessage(err), 'error'),
                  })
                }
                aria-label={`Remove ${q.symbol} from watchlist`}
                className="rounded-lg p-2 text-ink-muted transition-opacity hover:text-neg sm:opacity-0 sm:group-hover:opacity-100"
              >
                <X size={15} />
              </button>
            </div>
          ))}
    </div>
  );
};

const Movers: FC = () => {
  const { data, isLoading, isError, error, refetch } = useMovers();

  if (isLoading) {
    return (
      <div className="card p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
  }
  const top = [...data.gainers.slice(0, 2), ...data.losers.slice(0, 2)];
  return (
    <div className="card p-3">
      {top.map((q) => (
        <StockRow key={q.symbol} quote={q} />
      ))}
    </div>
  );
};

const Dashboard: FC = () => {
  const { user } = useAuth();
  const portfolio = usePortfolio();
  const name = user?.full_name?.split(' ')[0] || user?.username || 'there';

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Dashboard"
        title={`Good to see you, ${name}.`}
        description="A calm read on your day — the market's backdrop, how your holdings sit, and what's moving."
        actions={portfolio.data ? <DataSourceBadge source={portfolio.data.source} verbose /> : undefined}
      />

      <div className="space-y-12">
        <section>
          <SectionHeading eyebrow="Markets" title="Today's backdrop" />
          <IndicesStrip />
        </section>

        <section>
          <SectionHeading
            eyebrow="Portfolio"
            title="Where you stand"
            action={
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
              >
                View portfolio <ArrowRight size={15} />
              </Link>
            }
          />
          <PortfolioSnapshot />
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <SectionHeading
              eyebrow="Watchlist"
              title="On your radar"
              action={
                <Link to="/markets" className="text-sm font-medium text-accent hover:text-accent-hover">
                  Edit
                </Link>
              }
            />
            <Watchlist />
          </section>
          <section>
            <SectionHeading
              eyebrow="Movers"
              title="What's moving today"
              action={
                <Link to="/markets" className="text-sm font-medium text-accent hover:text-accent-hover">
                  All markets
                </Link>
              }
            />
            <Movers />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
