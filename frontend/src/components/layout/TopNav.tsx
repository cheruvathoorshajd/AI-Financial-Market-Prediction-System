import { FC, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useAuth } from '../../context/AuthContext';
import { useSignOut } from '../../lib/useSignOut';
import { useIsDemo, DEMO_NAME } from '../../lib/demo';
import BrandLink from './BrandLink';

const openCommandPalette = () => window.dispatchEvent(new Event('command-palette:open'));

const navItems: Array<{ to: string; label: string; end: boolean; auth?: boolean }> = [
  { to: '/', label: 'Dashboard', end: true, auth: true },
  { to: '/markets', label: 'Markets', end: false },
  { to: '/portfolio', label: 'Portfolio', end: false, auth: true },
  { to: '/insights', label: 'Insights', end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative px-3 py-2 text-sm font-medium transition-colors rounded-lg',
    isActive ? 'text-ink' : 'text-ink-secondary hover:text-ink hover:bg-raised'
  );

export const TopNav: FC = () => {
  const { user } = useAuth();
  const isDemo = useIsDemo();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = navItems.filter((i) => !i.auth || !!user);

  const initials =
    user?.full_name
      ?.split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || user?.username?.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <BrandLink />
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-accent" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCommandPalette}
            aria-label="Search (Command or Control + K)"
            className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-ink-muted transition-colors hover:border-line-strong hover:text-ink-secondary"
          >
            <Search size={16} />
            <span className="hidden text-sm md:inline">Search</span>
            <kbd className="hidden rounded border border-line bg-base px-1.5 font-mono text-2xs md:inline">⌘K</kbd>
          </button>
          {user ? (
            <div className="hidden items-center gap-2.5 md:flex">
              {isDemo ? (
                <>
                  <Link
                    to="/settings"
                    title="You're exploring the shared demo account"
                    className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-sm font-medium text-warn transition-colors hover:bg-gold/15"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    Demo · {user.full_name || DEMO_NAME}
                  </Link>
                  <button
                    onClick={() => navigate('/register')}
                    className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-[#F7F8F5] transition-colors hover:bg-accent-hover"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-3 transition-colors hover:border-line-strong"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                    {initials}
                  </span>
                  <span className="text-sm text-ink-secondary">
                    {user.full_name || user.username}
                  </span>
                </Link>
              )}
              <button
                onClick={signOut}
                aria-label={isDemo ? 'Exit demo' : 'Sign out'}
                title={isDemo ? 'Exit demo' : 'Sign out'}
                className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-raised hover:text-ink"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => navigate('/login')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#F7F8F5] transition-colors hover:bg-accent-hover"
              >
                Get started
              </button>
            </div>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 text-ink-secondary hover:bg-raised md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-surface px-4 py-3 md:hidden">
          {isDemo && (
            <div className="mb-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 text-warn">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Demo mode
              </p>
              <p className="mt-0.5 text-xs">Exploring as {user?.full_name || DEMO_NAME}.</p>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="mt-1.5 inline-block text-sm font-semibold text-accent"
              >
                Create your own account →
              </Link>
            </div>
          )}
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium',
                  isActive ? 'bg-raised text-ink' : 'text-ink-secondary'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 border-t border-line pt-2">
            {user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-ink-secondary"
              >
                Sign out
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-accent"
              >
                Sign in
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default TopNav;
