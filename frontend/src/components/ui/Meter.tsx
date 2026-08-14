import { FC } from 'react';
import { cn } from '../../lib/cn';

interface MeterProps {
  value: number; // 0..100
  label?: string;
  valueLabel?: string;
  tone?: 'accent' | 'pos' | 'neg' | 'warn' | 'series-1';
  className?: string;
}

const fills: Record<NonNullable<MeterProps['tone']>, string> = {
  accent: 'bg-accent',
  pos: 'bg-pos',
  neg: 'bg-neg',
  warn: 'bg-warn',
  'series-1': 'bg-series-1',
};

export const Meter: FC<MeterProps> = ({
  value,
  label,
  valueLabel,
  tone = 'accent',
  className,
}) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {(label || valueLabel) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-xs text-ink-secondary">{label}</span>}
          {valueLabel && (
            <span className="text-xs font-semibold text-ink tabular">{valueLabel}</span>
          )}
        </div>
      )}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-raised"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', fills[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default Meter;
