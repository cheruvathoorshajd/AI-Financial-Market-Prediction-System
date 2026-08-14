import { FC } from 'react';
import Sparkline from '../ui/Sparkline';

interface MiniSparklineProps {
  /** Pre-fetched close series (served with the list payload, no extra request). */
  data: number[];
  width?: number;
  height?: number;
}

/**
 * A sparkline rendered from a pre-fetched close series. The data travels with
 * the list payload, so a grid of these makes no additional requests.
 */
export const MiniSparkline: FC<MiniSparklineProps> = ({ data, width = 104, height = 32 }) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} aria-hidden />;
  }
  return <Sparkline data={data} width={width} height={height} />;
};

export default MiniSparkline;
