import { FC, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'neutral' | 'accent' | 'pos' | 'neg' | 'warn' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'bg-raised text-ink-secondary border-line',
  accent: 'bg-accent/12 text-accent border-accent/25',
  pos: 'bg-pos/12 text-pos border-pos/25',
  neg: 'bg-neg/12 text-neg border-neg/25',
  warn: 'bg-warn/12 text-warn border-warn/25',
  info: 'bg-series-1/12 text-series-1 border-series-1/25',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}

export const Badge: FC<BadgeProps> = ({ children, tone = 'neutral', className, icon }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-[0.06em]',
      tones[tone],
      className
    )}
  >
    {icon}
    {children}
  </span>
);

export default Badge;
