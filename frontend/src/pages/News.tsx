import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ExternalLink } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Badge from '../components/ui/Badge';
import DataSourceBadge from '../components/ui/DataSourceBadge';
import { useNews } from '../lib/queries';
import { getErrorMessage } from '../lib/errors';
import { formatTimeAgo } from '../lib/format';
import { Article } from '../services/newsService';
import { cn } from '../lib/cn';

const TOPICS: Array<{ label: string; value?: string }> = [
  { label: 'All' },
  { label: 'Technology', value: 'technology' },
  { label: 'Earnings', value: 'earnings' },
  { label: 'Economy', value: 'economy' },
  { label: 'Financials', value: 'financials' },
  { label: 'Energy', value: 'energy' },
  { label: 'Crypto', value: 'crypto' },
];

const sentimentTone = (s: string | null): 'pos' | 'neg' | 'neutral' => {
  if (!s) return 'neutral';
  if (/bull/i.test(s)) return 'pos';
  if (/bear/i.test(s)) return 'neg';
  return 'neutral';
};

const ArticleCard: FC<{ article: Article }> = ({ article }) => {
  const hasLink = Boolean(article.url);
  const TitleTag = hasLink ? 'a' : 'span';
  return (
    <article className="card p-5 transition-colors hover:border-line-strong">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-2xs text-ink-muted">
        <span className="font-medium text-ink-secondary">{article.source}</span>
        {article.published && (
          <>
            <span aria-hidden>·</span>
            <time dateTime={article.published}>{formatTimeAgo(article.published)}</time>
          </>
        )}
        {article.sentiment && (
          <Badge tone={sentimentTone(article.sentiment)} className="ml-auto">
            {article.sentiment}
          </Badge>
        )}
      </div>

      <TitleTag
        {...(hasLink
          ? { href: article.url, target: '_blank', rel: 'noopener noreferrer' }
          : {})}
        className={cn(
          'group inline-flex items-start gap-1.5 font-display text-lg font-medium leading-snug tracking-tight text-ink',
          hasLink && 'hover:text-accent'
        )}
      >
        {article.title}
        {hasLink && (
          <ExternalLink
            size={14}
            className="mt-1.5 shrink-0 text-ink-muted transition-colors group-hover:text-accent"
          />
        )}
      </TitleTag>

      {article.summary && (
        <p className="mt-2 line-clamp-3 text-pretty text-sm leading-relaxed text-ink-secondary">
          {article.summary}
        </p>
      )}

      {article.tickers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.tickers.slice(0, 6).map((t) => (
            <Link
              key={t}
              to={`/markets/${t}`}
              className="rounded-md border border-line bg-base px-2 py-0.5 font-mono text-2xs font-semibold text-ink-secondary transition-colors hover:border-accent/40 hover:text-accent"
            >
              {t}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
};

const News: FC = () => {
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const { data, isLoading, isError, error, refetch } = useNews({
    topics: topic ? [topic] : undefined,
    limit: 24,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="News"
        title="The finance desk"
        description="Markets, earnings, and the economy — a focused feed for investing, nothing else. Every batch is honestly labelled live or snapshot."
        actions={data ? <DataSourceBadge source={data.source} verbose /> : undefined}
      />

      {/* Topic filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TOPICS.map((t) => {
          const active = topic === t.value;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => setTopic(t.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-line bg-surface text-ink-secondary hover:border-line-strong hover:text-ink'
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-3 w-28" />
              <div className="skeleton mt-3 h-5 w-4/5" />
              <div className="skeleton mt-3 h-4 w-full" />
              <div className="skeleton mt-2 h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />}

      {!isLoading && !isError && data && data.articles.length === 0 && (
        <EmptyState
          icon={<Newspaper size={20} />}
          title="No headlines here yet"
          body="Nothing matched this filter. Try another topic, or check back shortly."
        />
      )}

      {!isLoading && !isError && data && data.articles.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {data.articles.map((a, i) => (
              <ArticleCard key={`${a.url || a.title}-${i}`} article={a} />
            ))}
          </div>
          {data.source === 'snapshot' && (
            <p className="mt-6 text-center text-xs text-ink-muted">
              Showing a labelled news snapshot{data.asOf ? ` from ${data.asOf}` : ''}. Set a
              free Finnhub or Alpha Vantage key on the server for a live feed.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default News;
