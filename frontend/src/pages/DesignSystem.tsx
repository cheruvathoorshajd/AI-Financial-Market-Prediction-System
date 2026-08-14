import { FC, ReactNode } from 'react';
import PageHeader from '../components/ui/PageHeader';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Delta from '../components/ui/Delta';
import Meter from '../components/ui/Meter';
import StatTile from '../components/ui/StatTile';
import Sparkline from '../components/ui/Sparkline';
import DataSourceBadge from '../components/ui/DataSourceBadge';
import { formatCurrency } from '../lib/format';
import { seriesColors } from '../lib/tokens';

const SERIES_NAMES = ['Verdigris', 'Gold', 'Slate', 'Clay', 'Aubergine', 'Rose'];

const swatches: Array<{ name: string; token: string; className: string; ring?: boolean }> = [
  { name: 'base', token: '#F4F5F2', className: 'bg-base', ring: true },
  { name: 'surface', token: '#FBFBF9', className: 'bg-surface', ring: true },
  { name: 'raised', token: '#ECEEE8', className: 'bg-raised' },
  { name: 'ink', token: '#1C2B2A', className: 'bg-ink' },
  { name: 'accent · verdigris', token: '#2F6F63', className: 'bg-accent' },
  { name: 'pos', token: '#2F6F63', className: 'bg-pos' },
  { name: 'neg · clay', token: '#A84C33', className: 'bg-neg' },
  { name: 'warn', token: '#8F6B1C', className: 'bg-warn' },
  { name: 'gold', token: '#B08D3C', className: 'bg-gold' },
];

const Block: FC<{ title: string; eyebrow: string; children: ReactNode }> = ({
  title,
  eyebrow,
  children,
}) => (
  <section className="mb-12">
    <SectionHeading eyebrow={eyebrow} title={title} />
    {children}
  </section>
);

const sample = [12, 13, 12.4, 14, 13.6, 15, 16.2, 15.4, 17, 18.1, 17.6, 19];

const DesignSystem: FC = () => (
  <div className="animate-fade-in">
    <PageHeader
      eyebrow="Design system"
      title="The Patina system"
      description="One coherent language — a light, instrument-like palette, a literate type pairing, and a bespoke data-viz vocabulary. This page is the single source of truth."
    />

    <Block eyebrow="Foundation" title="Colour">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {swatches.map((s) => (
          <div key={s.name} className="card p-3">
            <div
              className={`mb-2.5 h-14 w-full rounded-lg ${s.className} ${
                s.ring ? 'ring-1 ring-inset ring-line' : ''
              }`}
            />
            <div className="text-sm font-medium text-ink">{s.name}</div>
            <div className="font-mono text-2xs text-ink-muted">{s.token}</div>
          </div>
        ))}
      </div>
    </Block>

    <Block eyebrow="Foundation" title="Type">
      <div className="card space-y-5 p-6">
        <div>
          <div className="eyebrow mb-1">Display · Fraunces</div>
          <p className="font-display text-4xl font-medium tracking-tight text-ink">
            The flow of the treasury
          </p>
        </div>
        <div>
          <div className="eyebrow mb-1">Body · IBM Plex Sans</div>
          <p className="max-w-xl text-[15px] leading-relaxed text-ink-secondary">
            Calm, literate, and honest. Built for understanding rather than
            transacting — dense where it matters, quiet everywhere else.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-1">Figures · IBM Plex Mono (tabular)</div>
          <p className="font-mono text-2xl text-ink tabular">
            1,204.38 &nbsp; +0.82% &nbsp; 231.48
          </p>
        </div>
      </div>
    </Block>

    <Block eyebrow="Primitives" title="Components">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="secondary">Secondary</Button>
            <Button size="sm" variant="outline">Outline</Button>
            <Button size="sm" variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Accent</Badge>
            <Badge tone="pos">Positive</Badge>
            <Badge tone="neg">Negative</Badge>
            <Badge tone="warn">Warn</Badge>
            <DataSourceBadge source="live" />
            <DataSourceBadge source="snapshot" />
          </div>
          <div className="flex items-center gap-4">
            <Delta value={1.24} pill />
            <Delta value={-0.83} pill />
            <Sparkline data={sample} width={120} height={32} />
          </div>
          <Meter value={72} label="Signal strength" valueLabel="72" />
        </div>
        <StatTile
          label="Portfolio value"
          value={formatCurrency(48213.55)}
          delta={0.82}
          hint="today"
        />
      </div>
    </Block>

    <Block eyebrow="Data viz" title="The chart palette">
      <div className="card p-6">
        <p className="mb-5 max-w-xl text-pretty text-sm leading-relaxed text-ink-secondary">
          Six categorical series, assigned in fixed order and never cycled.
          Validated on the white chart surface for contrast and colour-vision
          separation — identity is always carried by a labelled legend, never by
          hue alone.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {seriesColors.map((c, i) => (
            <div key={c} className="flex items-center gap-2">
              <span className="h-4 w-4 shrink-0 rounded-sm" style={{ background: c }} />
              <div className="min-w-0">
                <div className="truncate text-sm text-ink">{SERIES_NAMES[i]}</div>
                <div className="font-mono text-2xs text-ink-muted">{c}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Block>
  </div>
);

export default DesignSystem;
