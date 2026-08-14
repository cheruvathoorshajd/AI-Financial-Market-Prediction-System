import { FC } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { colors, seriesColors } from '../../lib/tokens';
import { formatCurrency } from '../../lib/format';

export interface AllocationSlice {
  name: string;
  value: number;
}

interface AllocationDonutProps {
  data: AllocationSlice[];
  /** center headline (e.g. total value). */
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}

/**
 * Allocation donut. Categorical colour assigned in fixed order (validated on
 * the light chart surface). Identity is carried by an adjacent legend with values —
 * never colour alone — which also provides the secondary encoding the CVD
 * floor requires. Slots beyond 6 should be folded into "Other" upstream.
 */
export const AllocationDonut: FC<AllocationDonutProps> = ({
  data,
  centerLabel,
  centerValue,
  size = 180,
}) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={size * 0.32}
              outerRadius={size * 0.48}
              paddingAngle={2}
              stroke={colors.surface}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={seriesColors[i % seriesColors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const pct = (((p.value as number) / total) * 100).toFixed(1);
                return (
                  <div className="rounded-lg border border-line-strong bg-elevated/95 px-3 py-2 text-xs shadow-pop">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: p.payload.fill }}
                      />
                      <span className="text-ink-secondary">{p.name}</span>
                    </div>
                    <div className="mt-1 font-semibold text-ink tabular">
                      {formatCurrency(p.value as number)} · {pct}%
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {(centerValue || centerLabel) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerLabel && <span className="eyebrow">{centerLabel}</span>}
            {centerValue && (
              <span className="mt-0.5 text-lg font-semibold text-ink tabular">
                {centerValue}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend with values — identity + secondary encoding */}
      <ul className="min-w-[160px] flex-1 space-y-2">
        {data.map((d, i) => {
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <li key={d.name} className="flex items-center gap-2.5 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: seriesColors[i % seriesColors.length] }}
              />
              <span className="text-ink-secondary">{d.name}</span>
              <span className="ml-auto font-medium text-ink tabular">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AllocationDonut;
