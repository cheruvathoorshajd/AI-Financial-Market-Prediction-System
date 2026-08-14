import { FC, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import Delta from './Delta';

interface StatTileProps {
  label: string;
  value: ReactNode;
  delta?: number; // percent, optional
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * A single headline number. Per the dataviz form heuristic, a KPI is a stat
 * tile — not a chart. Value uses proportional figures; the label is muted ink.
 */
export const StatTile: FC<StatTileProps> = ({
  label,
  value,
  delta,
  hint,
  icon,
  className,
}) => (
  <div className={cn('card p-5', className)}>
    <div className="mb-3 flex items-center justify-between">
      <span className="eyebrow">{label}</span>
      {icon && <span className="text-ink-muted">{icon}</span>}
    </div>
    <div className="text-2xl font-semibold tracking-tight text-ink tabular">{value}</div>
    <div className="mt-2 flex items-center gap-2">
      {delta !== undefined && <Delta value={delta} size="sm" />}
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </div>
  </div>
);

export default StatTile;
