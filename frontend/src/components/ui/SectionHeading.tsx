import { FC, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SectionHeadingProps {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const SectionHeading: FC<SectionHeadingProps> = ({
  title,
  eyebrow,
  description,
  action,
  className,
}) => (
  <div className={cn('mb-5 flex items-end justify-between gap-4', className)}>
    <div>
      {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      {description && (
        <p className="mt-1 max-w-xl text-sm text-ink-secondary">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default SectionHeading;
