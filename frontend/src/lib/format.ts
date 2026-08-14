/** Formatting helpers — consistent money/number/percent rendering app-wide. */

type Num = number | null | undefined;

export function formatCurrency(value: Num, opts: { compact?: boolean } = {}): string {
  if (value == null || !Number.isFinite(value)) return '—';
  if (opts.compact && Math.abs(value) >= 1000) {
    return (
      '$' +
      new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)
    );
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: Num, compact = false): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

/** Signed percent, e.g. +2.41% / -0.83% */
export function formatPercent(value: Num, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

/** Signed currency delta, e.g. +$1,204.10 */
export function formatDelta(value: Num): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

export function formatVolume(value: Num): string {
  if (!value || !Number.isFinite(value)) return '—';
  return formatNumber(value, true);
}

/** Relative time, e.g. "3h ago" / "2d ago"; falls back to a date for old items. */
export function formatTimeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 0) return 'just now';
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Direction helper for color/icon decisions. */
export function trendDir(value: Num): 'up' | 'down' | 'flat' {
  if (value == null || !Number.isFinite(value)) return 'flat';
  if (value > 0.0001) return 'up';
  if (value < -0.0001) return 'down';
  return 'flat';
}
