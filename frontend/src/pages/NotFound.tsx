import { FC } from 'react';
import { Link } from 'react-router-dom';
import BrandLink from '../components/layout/BrandLink';

/** Standalone 404 — fits a single viewport; scrolls rather than clips if a window is tiny. */
const NotFound: FC = () => (
  <main className="relative flex min-h-screen flex-col bg-base">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-accent-radial" aria-hidden />

    <header className="relative mx-auto flex w-full max-w-5xl items-center px-6 py-5">
      <BrandLink />
    </header>

    <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center animate-fade-in">
      <div className="eyebrow mb-3">404</div>
      <h1 className="text-balance font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
        This page isn’t on the ledger
      </h1>
      <p className="mt-3 max-w-sm text-pretty text-ink-secondary">
        The link may be old, or the page may have moved. Let’s get you back to familiar ground.
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#F7F8F5] transition-colors hover:bg-accent-hover"
      >
        Back to the dashboard
      </Link>
    </div>
  </main>
);

export default NotFound;
