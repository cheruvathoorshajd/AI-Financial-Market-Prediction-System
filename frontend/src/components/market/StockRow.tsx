import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Quote } from '../../services/marketService';
import Delta from '../ui/Delta';
import { formatCurrency } from '../../lib/format';

interface StockRowProps {
  quote: Quote;
  rank?: number;
}

/** Compact, navigable list row — symbol + name on the left, price + delta right. */
export const StockRow: FC<StockRowProps> = ({ quote, rank }) => (
  <Link
    to={`/markets/${quote.symbol}`}
    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-raised"
  >
    {rank !== undefined && (
      <span className="w-4 shrink-0 font-mono text-xs text-ink-muted tabular">{rank}</span>
    )}
    <div className="min-w-0 flex-1">
      <div className="font-mono text-sm font-semibold text-ink">{quote.symbol}</div>
      <div className="truncate text-xs text-ink-muted">{quote.name}</div>
    </div>
    <div className="text-right">
      <div className="font-mono text-sm text-ink tabular">{formatCurrency(quote.price)}</div>
      <Delta value={quote.changePercent} size="sm" />
    </div>
  </Link>
);

export default StockRow;
