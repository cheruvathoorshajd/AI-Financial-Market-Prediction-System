import { FC, useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { colors } from '../../lib/tokens';
import { formatCurrency } from '../../lib/format';
import ChartTooltip from './ChartTooltip';

export interface PricePoint {
  date: string;
  value: number;
}

interface PriceAreaChartProps {
  data: PricePoint[];
  height?: number;
  color?: string;
  showAxes?: boolean;
}

/**
 * Single-series price area over time. One series → no legend (the card title
 * names it). Crosshair + tooltip on by default (dataviz interaction rule).
 */
export const PriceAreaChart: FC<PriceAreaChartProps> = ({
  data,
  height = 260,
  color,
  showAxes = true,
}) => {
  const gid = useId();
  const stroke =
    color ?? (data.length > 1 && data[data.length - 1].value >= data[0].value ? colors.pos : colors.neg);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: showAxes ? 4 : 0 }}>
        <defs>
          <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.24} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxes && (
          <CartesianGrid stroke={colors.line} strokeDasharray="0" vertical={false} />
        )}
        <XAxis
          dataKey="date"
          hide={!showAxes}
          tick={{ fill: colors.inkMuted, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: colors.lineStrong }}
          minTickGap={40}
        />
        <YAxis
          hide={!showAxes}
          width={56}
          tick={{ fill: colors.inkMuted, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
          tickFormatter={(v) => formatCurrency(v, { compact: true })}
        />
        <Tooltip
          cursor={{ stroke: colors.lineStrong, strokeWidth: 1 }}
          content={({ active, label, payload }) => (
            <ChartTooltip
              active={active}
              label={label as string}
              rows={
                payload?.length
                  ? [{ label: 'Price', value: payload[0].value as number, color: stroke }]
                  : []
              }
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#area-${gid})`}
          activeDot={{ r: 4, fill: stroke, stroke: colors.base, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PriceAreaChart;
