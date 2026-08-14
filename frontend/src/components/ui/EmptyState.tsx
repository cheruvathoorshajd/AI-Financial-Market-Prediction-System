import { FC, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * An empty screen is an invitation, not a dead end. Set in the product's voice,
 * on the dotted paper ground.
 */
export const EmptyState: FC<EmptyStateProps> = ({ icon, title, body, action, className }) => (
  <div
    className={cn(
      'card flex flex-col items-center justify-center gap-3 bg-dotgrid px-6 py-16 text-center',
      className
    )}
  >
    {icon && (
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink-muted">
        {icon}
      </div>
    )}
    <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
    {body && <p className="max-w-sm text-pretty text-sm leading-relaxed text-ink-secondary">{body}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default EmptyState;
