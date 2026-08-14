import { FC, ReactNode } from 'react';
import BrandLink from './BrandLink';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared chrome for the sign-in / register surfaces — calm, centred, on paper.
 * Sized to fit a single viewport (so it doesn't scroll on a normal window), but
 * it will scroll rather than clip if a window is genuinely too short to show the
 * form — content is never hidden.
 */
export const AuthLayout: FC<AuthLayoutProps> = ({ title, subtitle, children, footer }) => (
  <main className="relative flex min-h-screen flex-col bg-base">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-accent-radial" aria-hidden />

    <header className="relative mx-auto flex w-full max-w-5xl shrink-0 items-center justify-between px-6 py-5">
      <BrandLink />
    </header>

    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-balance font-display text-3xl font-medium tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-pretty text-[15px] leading-relaxed text-ink-secondary">
            {subtitle}
          </p>
        )}
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-7">
          {children}
        </div>
        {footer && <div className="mt-5 text-center text-sm text-ink-secondary">{footer}</div>}
      </div>
    </div>
  </main>
);

export default AuthLayout;
