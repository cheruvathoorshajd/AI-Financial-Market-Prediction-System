import { FC } from 'react';
import { useCountUp } from '../../lib/useCountUp';
import { formatCurrency } from '../../lib/format';

interface AnimatedCurrencyProps {
  value: number;
  compact?: boolean;
}

/** A currency figure that eases into place on mount (respects reduced-motion). */
export const AnimatedCurrency: FC<AnimatedCurrencyProps> = ({ value, compact }) => {
  const animated = useCountUp(value);
  return <>{formatCurrency(animated, { compact })}</>;
};

export default AnimatedCurrency;
