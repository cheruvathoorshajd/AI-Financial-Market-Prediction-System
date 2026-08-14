import { FC } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../../lib/cn';
import { formatPercent, trendDir } from '../../lib/format';

interface DeltaProps {
  value: number | null | undefined; // percent
  className?: string;
  size?: 'sm' | 'md';
  pill?: boolean;
  showIcon?: boolean;
}

/**
 * Signed change indicator. Colour is ALWAYS paired with an arrow icon + sign,
 * so direction never relies on hue alone (accessibility / CVD).
 */
export const Delta: FC<DeltaProps> = ({
  value,
  className,
  size = 'md',
  pill,
  showIcon = true,
}) => {
  const dir = trendDir(value);
  const color =
    dir === 'up' ? 'text-pos' : dir === 'down' ? 'text-neg' : 'text-ink-muted';
  const Icon = dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : Minus;
  const iconSize = size === 'sm' ? 13 : 15;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold tabular',
        color,
        size === 'sm' ? 'text-xs' : 'text-sm',
        pill &&
          cn(
            'rounded-md border px-1.5 py-0.5',
            dir === 'up'
              ? 'border-pos/25 bg-pos/10'
              : dir === 'down'
              ? 'border-neg/25 bg-neg/10'
              : 'border-line bg-raised'
          ),
        className
      )}
    >
      {showIcon && <Icon size={iconSize} strokeWidth={2.5} />}
      {formatPercent(value)}
    </span>
  );
};

export default Delta;
