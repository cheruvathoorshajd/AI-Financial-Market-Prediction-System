import { FC } from 'react';
import { formatCurrency } from '../../lib/format';

interface TooltipRow {
  label: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  rows: TooltipRow[];
}

/** Shared dark tooltip card. Text uses ink tokens; the swatch carries identity. */
export const ChartTooltip: FC<ChartTooltipProps> = ({ active, label, rows }) => {
  if (!active || !rows.length) return null;
  return (
    <div className="pointer-events-none rounded-lg border border-line-strong bg-elevated/95 px-3 py-2 shadow-pop backdrop-blur">
      {label !== undefined && (
        <div className="mb-1.5 text-2xs font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: r.color }}
            />
            <span className="text-ink-secondary">{r.label}</span>
            <span className="ml-auto font-semibold text-ink tabular">
              {formatCurrency(r.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartTooltip;
