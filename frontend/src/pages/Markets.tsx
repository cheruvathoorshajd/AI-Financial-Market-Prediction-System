import { FC, useState } from 'react';
import { GitCompareArrows, Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SectionHeading from '../components/ui/SectionHeading';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import DataSourceBadge from '../components/ui/DataSourceBadge';
import TrendingCard from '../components/market/TrendingCard';
import StockRow from '../components/market/StockRow';
import { ComparePanel } from '../components/market/CompareSection';
import { useTrending, useMovers, useSearch } from '../lib/queries';
import { useDebounce } from '../lib/useDebounce';
import { getErrorMessage } from '../lib/errors';

const SkeletonCard: FC = () => (
  <div className="card p-4">
    <div className="skeleton h-4 w-16" />
    <div className="skeleton mt-2 h-3 w-24" />
    <div className="mt-4 flex items-end justify-between">
      <div>
        <div className="skeleton h-6 w-20" />
        <div className="skeleton mt-2 h-4 w-14" />
      </div>
      <div className="skeleton h-8 w-[104px] rounded" />
    </div>
  </div>
);

const TrendingSection: FC = () => {
  const { data, isLoading, isError, error, refetch } = useTrending(8);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
  }
  if (!data || data.stocks.length === 0) {
    return <EmptyState title="Nothing trending right now" body="Check back shortly." />;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
      {data.stocks.map((q) => (
        <TrendingCard key={q.symbol} quote={q} />
      ))}
    </div>
  );
};

const MoversSection: FC = () => {
  const { data, isLoading, isError, error, refetch } = useMovers();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((c) => (
          <div key={c} className="card p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
  }
  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-3">
        <div className="mb-1 flex items-center gap-2 px-3 pt-1">
          <TrendingUp size={15} className="text-pos" />
          <span className="eyebrow">Top gainers</span>
        </div>
        {data.gainers.map((q, i) => (
          <StockRow key={q.symbol} quote={q} rank={i + 1} />
        ))}
      </div>
      <div className="card p-3">
        <div className="mb-1 flex items-center gap-2 px-3 pt-1">
          <TrendingDown size={15} className="text-neg" />
          <span className="eyebrow">Top losers</span>
        </div>
        {data.losers.map((q, i) => (
          <StockRow key={q.symbol} quote={q} rank={i + 1} />
        ))}
      </div>
    </div>
  );
};

const SearchResults: FC<{ query: string }> = ({ query }) => {
  const { data, isLoading, isError, error, refetch } = useSearch(query);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
  }
  if (!data || data.results.length === 0) {
    return (
      <EmptyState
        title={`Nothing matches “${query}”`}
        body="Try a ticker like AAPL or a company name like Nvidia."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
      {data.results.map((q) => (
        <TrendingCard key={q.symbol} quote={q} />
      ))}
    </div>
  );
};

const Markets: FC = () => {
  const [query, setQuery] = useState('');
  const [compareOpen, setCompareOpen] = useState(false);
  const debounced = useDebounce(query.trim(), 300);
  const searching = debounced.length > 0;

  const trending = useTrending(8);

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Markets"
        title="Read what's moving"
        description="Search for an asset, or follow the day's most active names — each with the shape of its recent month."
        actions={trending.data ? <DataSourceBadge source={trending.data.source} verbose /> : undefined}
      />

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-xl">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ticker or company — try AAPL, Nvidia…"
              aria-label="Search assets"
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-ink transition-colors placeholder:text-ink-muted focus:border-accent focus-visible:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Button
            variant={compareOpen ? 'secondary' : 'outline'}
            onClick={() => setCompareOpen((o) => !o)}
            aria-expanded={compareOpen}
            className="shrink-0"
          >
            <GitCompareArrows size={16} /> {compareOpen ? 'Hide compare' : 'Compare assets'}
          </Button>
        </div>

        {compareOpen && (
          <div className="mt-6 animate-fade-in">
            <ComparePanel defaultSymbols={['AAPL', 'NVDA']} />
          </div>
        )}
      </div>

      {searching ? (
        <section>
          <SectionHeading eyebrow="Search" title={`Results for “${debounced}”`} />
          <SearchResults query={debounced} />
        </section>
      ) : (
        <div className="space-y-12">
          <section>
            <SectionHeading
              eyebrow="Trending"
              title="Most active today"
              description="Ranked by the size of today's move."
            />
            <TrendingSection />
          </section>
          <section>
            <SectionHeading eyebrow="Movers" title="Gainers & losers" />
            <MoversSection />
          </section>
        </div>
      )}
    </div>
  );
};

export default Markets;
