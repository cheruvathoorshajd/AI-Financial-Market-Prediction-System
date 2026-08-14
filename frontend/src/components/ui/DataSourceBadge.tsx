import { FC } from 'react';
import { Database } from 'lucide-react';
import { cn } from '../../lib/cn';
import { DataSource } from '../../services/marketService';

interface DataSourceBadgeProps {
  source: DataSource;
  className?: string;
  /** Show a longer explanatory label. */
  verbose?: boolean;
}

/**
 * Honest provenance indicator. Fluxus Fisci tries live Alpha Vantage data first
 * and falls back to a realistic market snapshot when the free-tier quota
 * (~25 req/day) is exhausted — this badge always tells the user which they see.
 */
export const DataSourceBadge: FC<DataSourceBadgeProps> = ({
  source,
  className,
  verbose,
}) => {
  const isLive = source === 'live';
  const label = isLive
    ? verbose
      ? 'Live market data'
      : 'Live'
    : source === 'mixed'
    ? verbose
      ? 'Live + snapshot'
      : 'Mixed'
    : verbose
    ? 'Snapshot data'
    : 'Snapshot';

  return (
    <span
      title={
        isLive
          ? 'Real-time quotes from Alpha Vantage.'
          : 'Showing a realistic saved market snapshot — the live Alpha Vantage free-tier quota (~25 requests/day) is exhausted. Values are real, just not live.'
      }
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em]',
        isLive
          ? 'border-pos/25 bg-pos/10 text-pos'
          : 'border-warn/25 bg-warn/10 text-warn',
        className
      )}
    >
      {isLive ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-pos" />
        </span>
      ) : (
        <Database size={11} strokeWidth={2.5} />
      )}
      {label}
    </span>
  );
};

export default DataSourceBadge;
