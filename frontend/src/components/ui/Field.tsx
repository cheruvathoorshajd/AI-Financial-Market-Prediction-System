import { FC, InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

/** Labelled text input in the Patina style. Label is always tied to the input. */
export const Field: FC<FieldProps> = ({ label, hint, id, name, className, ...rest }) => {
  const inputId = id || name;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={cn(
          'w-full rounded-xl border border-line bg-elevated px-3.5 py-2.5 text-ink transition-colors placeholder:text-ink-muted focus:border-accent focus-visible:outline-none',
          className
        )}
        {...rest}
      />
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
};

export default Field;
