import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Quote } from '../../services/marketService';
import Delta from '../ui/Delta';
import MiniSparkline from './MiniSparkline';
import { formatCurrency } from '../../lib/format';

/** A trending asset tile: identity, price, delta, and the shape of the month. */
export const TrendingCard: FC<{ quote: Quote }> = ({ quote }) => (
  <Link
    to={`/markets/${quote.symbol}`}
    className="card group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-elevated"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="font-mono text-sm font-semibold text-ink">{quote.symbol}</div>
        <div className="truncate text-xs text-ink-muted">{quote.name}</div>
      </div>
      {quote.sector && (
        <span className="shrink-0 font-mono text-2xs uppercase tracking-[0.08em] text-ink-muted">
          {quote.sector.split(' ')[0]}
        </span>
      )}
    </div>
    <div className="mt-4 flex items-end justify-between gap-3">
      <div>
        <div className="font-mono text-xl text-ink tabular">{formatCurrency(quote.price)}</div>
        <div className="mt-1">
          <Delta value={quote.changePercent} size="sm" pill />
        </div>
      </div>
      <MiniSparkline data={quote.spark ?? []} />
    </div>
  </Link>
);

export default TrendingCard;
