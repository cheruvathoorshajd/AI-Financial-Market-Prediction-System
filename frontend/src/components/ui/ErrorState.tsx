import { FC } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Errors say what happened and how to move forward — never a bare stack trace
 * or a vague apology. Retry is offered whenever the caller can refetch.
 */
export const ErrorState: FC<ErrorStateProps> = ({
  title = 'That didn’t load',
  message,
  onRetry,
  className,
}) => (
  <div
    className={cn(
      'card flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
      className
    )}
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neg/25 bg-neg/5 text-neg">
      <AlertTriangle size={18} />
    </div>
    <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
    <p className="max-w-sm text-pretty text-sm leading-relaxed text-ink-secondary">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink-muted"
      >
        <RotateCw size={15} /> Try again
      </button>
    )}
  </div>
);

export default ErrorState;
