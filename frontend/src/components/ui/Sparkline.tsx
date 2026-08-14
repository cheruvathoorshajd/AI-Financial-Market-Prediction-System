import { FC, useId } from 'react';
import { colors } from '../../lib/tokens';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  /** Fill the area under the line with a faint gradient. */
  fill?: boolean;
  strokeWidth?: number;
  className?: string;
}

/** Lightweight inline SVG sparkline — no chart lib overhead for tiny trends. */
export const Sparkline: FC<SparklineProps> = ({
  data,
  width = 96,
  height = 28,
  color,
  fill = true,
  strokeWidth = 1.5,
  className,
}) => {
  const gid = useId();
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className={className} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stroke = color ?? (data[data.length - 1] >= data[0] ? colors.pos : colors.neg);
  const pad = strokeWidth;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(2)},${height} L${pts[0][0].toFixed(2)},${height} Z`;

  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <defs>
        <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#spark-${gid})`} stroke="none" />}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
