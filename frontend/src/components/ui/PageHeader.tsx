import { FC, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/** The editorial page masthead: display title in the serif voice, calm sub. */
export const PageHeader: FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
  className,
}) => (
  <header
    className={cn(
      'mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
      className
    )}
  >
    <div className="min-w-0">
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <h1 className="text-balance font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2.5 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-secondary">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </header>
);

export default PageHeader;
