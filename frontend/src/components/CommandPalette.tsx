import {
  FC,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CornerDownLeft,
  LayoutDashboard,
  LineChart,
  type LucideIcon,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useSearch } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../lib/useDebounce';
import { formatCurrency } from '../lib/format';
import { cn } from '../lib/cn';

interface NavCommand {
  label: string;
  to: string;
  hint: string;
  keywords: string;
  icon: LucideIcon;
  auth?: boolean;
}

const NAV_COMMANDS: NavCommand[] = [
  { label: 'Dashboard', to: '/', hint: 'Your daily read', keywords: 'home overview', icon: LayoutDashboard, auth: true },
  { label: 'Markets', to: '/markets', hint: 'Trending & movers', keywords: 'stocks search trending compare versus', icon: LineChart },
  { label: 'Portfolio', to: '/portfolio', hint: 'Holdings & P/L', keywords: 'holdings allocation compare', icon: Wallet, auth: true },
  { label: 'Insights', to: '/insights', hint: 'Ask the data', keywords: 'ai ask question', icon: Sparkles },
  { label: 'Settings', to: '/settings', hint: 'Account & watchlist', keywords: 'account watchlist profile', icon: SettingsIcon, auth: true },
];

type Item =
  | { kind: 'nav'; nav: NavCommand }
  | { kind: 'asset'; symbol: string; name: string; price: number; changePercent: number };

/**
 * Global command palette (⌘K / Ctrl+K). Searches assets and jumps to pages.
 * Follows the combobox/listbox pattern: focus stays on the input, arrow keys
 * move a virtual selection, Enter opens, Escape closes. Opened app-wide either
 * by the shortcut or a `command-palette:open` window event (the TopNav button).
 */
export const CommandPalette: FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const debounced = useDebounce(query.trim(), 200);
  const search = useSearch(open ? debounced : '');

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
    restoreFocusRef.current?.focus?.();
  }, []);

  // Global shortcut + external open event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => {
          if (!o) restoreFocusRef.current = document.activeElement as HTMLElement;
          return !o;
        });
      }
    };
    const onOpen = () => {
      restoreFocusRef.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('command-palette:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('command-palette:open', onOpen);
    };
  }, []);

  // Focus the input on open; lock background scroll.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = '';
    };
  }, [open]);

  const q = debounced.toLowerCase();
  const available = useMemo(() => (user ? NAV_COMMANDS : NAV_COMMANDS.filter((c) => !c.auth)), [user]);
  const navMatches = useMemo(
    () => (q ? available.filter((c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q)) : available),
    [q, available]
  );
  const items: Item[] = useMemo(
    () => [
      ...navMatches.map((nav) => ({ kind: 'nav' as const, nav })),
      ...(search.data?.results ?? []).map((a) => ({
        kind: 'asset' as const,
        symbol: a.symbol,
        name: a.name,
        price: a.price,
        changePercent: a.changePercent,
      })),
    ],
    [navMatches, search.data]
  );

  // Keep the active index within bounds as results change.
  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, items.length - 1)));
  }, [items.length]);

  // Scroll the active option into view.
  useEffect(() => {
    if (open) document.getElementById(`cmdk-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const select = useCallback(
    (item: Item | undefined) => {
      if (!item) return;
      close();
      navigate(item.kind === 'nav' ? item.nav.to : `/markets/${item.symbol}`);
    },
    [close, navigate]
  );

  const onInputKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (items.length ? (i + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(items[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      // Only the input is interactive — keep focus trapped inside the dialog.
      e.preventDefault();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="absolute inset-0 animate-fade-in bg-ink/20 backdrop-blur-sm" onClick={close} aria-hidden />
      <div className="relative w-full max-w-xl animate-rise overflow-hidden rounded-2xl border border-line bg-elevated shadow-pop">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={17} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search assets or jump to a page…"
            aria-label="Search assets or navigate"
            aria-controls="cmdk-list"
            aria-activedescendant={items.length ? `cmdk-opt-${active}` : undefined}
            className="w-full bg-transparent py-3.5 text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-line bg-base px-1.5 py-0.5 font-mono text-2xs text-ink-muted sm:block">
            ESC
          </kbd>
        </div>

        <ul id="cmdk-list" role="listbox" aria-label="Results" className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-ink-muted">
              {search.isLoading ? 'Searching…' : `No matches for “${query}”.`}
            </li>
          )}
          {items.map((item, i) => (
            <li
              key={item.kind === 'nav' ? `nav-${item.nav.to}` : `asset-${item.symbol}`}
              id={`cmdk-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => select(item)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5',
                i === active ? 'bg-accent-soft' : ''
              )}
            >
              {item.kind === 'nav' ? (
                <>
                  <item.nav.icon size={16} className="shrink-0 text-ink-muted" />
                  <span className="text-sm font-medium text-ink">{item.nav.label}</span>
                  <span className="ml-auto text-xs text-ink-muted">{item.nav.hint}</span>
                </>
              ) : (
                <>
                  <TrendingUp size={16} className="shrink-0 text-ink-muted" />
                  <span className="font-mono text-sm font-semibold text-ink">{item.symbol}</span>
                  <span className="min-w-0 truncate text-xs text-ink-muted">{item.name}</span>
                  <span className="ml-auto font-mono text-sm text-ink tabular">{formatCurrency(item.price)}</span>
                  <span
                    className={cn(
                      'w-16 text-right font-mono text-xs tabular',
                      item.changePercent >= 0 ? 'text-pos' : 'text-neg'
                    )}
                  >
                    {item.changePercent >= 0 ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-2xs text-ink-muted">
          <span className="flex items-center gap-1">
            <CornerDownLeft size={12} /> select
          </span>
          <span>↑↓ navigate</span>
          <span className="ml-auto">Assets via snapshot search</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
