import { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  block?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-[#F7F8F5] hover:bg-accent-hover shadow-[0_8px_20px_-10px_rgba(47,111,99,0.55)] active:scale-[0.98]',
  secondary:
    'bg-raised text-ink border border-line hover:border-line-strong hover:bg-elevated active:scale-[0.98]',
  outline:
    'border border-line text-ink hover:border-accent hover:text-accent active:scale-[0.98]',
  ghost: 'text-ink-secondary hover:text-ink hover:bg-raised',
  danger: 'bg-neg/15 text-neg border border-neg/30 hover:bg-neg/25',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-6 py-3',
};

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  block,
  className,
  children,
  ...rest
}) => (
  <button
    className={cn(base, variants[variant], sizes[size], block && 'w-full', className)}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
