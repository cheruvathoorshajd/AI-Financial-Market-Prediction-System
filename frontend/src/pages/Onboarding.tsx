import { FC, ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Command,
  Database,
  Eye,
  GitCompareArrows,
  type LucideIcon,
  Palette,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import BrandLink from '../components/layout/BrandLink';
import { useAuth } from '../context/AuthContext';
import { useTransition } from '../context/TransitionContext';
import { DEMO_EMAIL, DEMO_PASSWORD, armDemoTour } from '../lib/demo';
import { getErrorMessage } from '../lib/errors';
import { cn } from '../lib/cn';
import './Onboarding.css';

type Dir = 'up' | 'down' | 'neutral';
const dirColor = (d: Dir) => (d === 'up' ? 'bg-pos' : d === 'down' ? 'bg-neg' : 'bg-ink-muted');

const HERO_SIGNALS: Array<{ label: string; value: string; dir: Dir }> = [
  { label: '20-day momentum', value: '+14.6%', dir: 'up' },
  { label: 'Price vs 50-day', value: '+7.0%', dir: 'up' },
  { label: 'RSI (14)', value: '61', dir: 'neutral' },
  { label: 'Annualised vol', value: '35%', dir: 'neutral' },
  { label: 'Range position', value: '88%', dir: 'up' },
  { label: 'Signal agreement', value: '3 / 3', dir: 'up' },
];

const STATS: Array<{ k: string; v: string; accent?: boolean }> = [
  { k: '0', v: 'buy / sell / hold recommendations — it explains, it never tells you to act', accent: true },
  { k: '0', v: 'fabricated accuracy scores — no invented “87% confident”' },
  { k: '100%', v: 'of quotes labelled live or snapshot — never hidden' },
  { k: '3', v: 'kinds of intelligence, each labelled as exactly what it is' },
];

const FEATURES: Array<{ n: string; icon: LucideIcon; title: string; desc: string }> = [
  { n: '01', icon: Eye, title: 'The transparency panel', desc: 'The signature surface — what it looked at, how it reasoned, how sure it honestly is, and what it can’t say, with “not advice” as first-class copy.' },
  { n: '02', icon: Database, title: 'Honest by source', desc: 'Live Alpha Vantage quotes when the quota allows, a labelled snapshot when it doesn’t. Every number carries live / snapshot / mixed.' },
  { n: '03', icon: Command, title: 'Command palette', desc: 'Press ⌘K anywhere to search any asset or jump to any page — an accessible, keyboard-first way around the whole product.' },
  { n: '04', icon: GitCompareArrows, title: 'Compare assets', desc: 'Put two or three side by side — their price shape, the same labelled signals, and an honest reading of each.' },
  { n: '05', icon: Wallet, title: 'Editable portfolio', desc: 'Per-user holdings with correct P/L over cost basis, sector allocation, and calm sparklines. The demo comes seeded.' },
  { n: '06', icon: Sparkles, title: 'Grounded LLM assistant', desc: 'When a key is set, the reading is written by an LLM — strictly from the computed numbers. It never invents data, and never advises.' },
];

const PIPELINE: Array<{ n: string; title: string; desc: string }> = [
  { n: '01', title: 'Quote', desc: 'Alpha Vantage (live) or labelled snapshot' },
  { n: '02', title: 'History', desc: 'Deterministic 6-month series' },
  { n: '03', title: 'Signals', desc: 'NumPy — momentum · MA · RSI · vol · range' },
  { n: '04', title: 'Confidence', desc: 'Qualitative signal agreement' },
  { n: '05', title: 'Reading', desc: 'Grounded LLM, or heuristic fallback' },
  { n: '06', title: 'Transparency', desc: 'What it looked at · limits · not advice' },
];

const LAYERS: Array<{ tag: string; icon: LucideIcon; title: string; desc: string }> = [
  { tag: 'Heuristic', icon: Activity, title: 'Transparent signals', desc: 'Momentum, moving averages, RSI, volatility and range — plain NumPy arithmetic over real price history. Labelled as heuristics, never dressed up as a model.' },
  { tag: 'LLM', icon: Sparkles, title: 'Grounded narrative', desc: 'With a key set, an LLM (Claude, or a free Groq / Gemini model) writes the plain-English reading — strictly from those numbers. It explains; it never says buy, sell, or hold.' },
  { tag: 'Fallback', icon: ShieldCheck, title: 'Honest when offline', desc: 'No key, or an API hiccup? It degrades to a deterministic reading from the same signals — labelled “Signals reading” — and tells you so. Nothing is ever faked.' },
];

const FIELD: string[] = [
  'Gamified, trade-pushing, red-and-green anxiety engines built for engagement.',
  '“Strong Buy / Hold / Sell” oracles that dress a threshold up as a confident verdict.',
  'Fabricated confidence — a heuristic reported as “87% accurate” with no basis.',
  'Black-box “AI” — a label with no visible reasoning and no admission of limits.',
  'Hidden provenance — stale or synthetic numbers shown as if they were live.',
];

const FF: string[] = [
  'Built for understanding, not transacting — the AI explains what’s moving and why.',
  'A transparency panel that shows what it looked at, how it reasoned, and what it can’t say.',
  'Honest confidence — a qualitative signal-agreement level with its rationale, not a fake %.',
  'Every quote tagged live or snapshot; the scarce live budget is spent where you’re looking.',
  'Muted, colour-vision-safe semantics — direction carried by an arrow and a sign, not hue alone.',
];

const TECH: string[] = [
  'React 18', 'TypeScript (strict)', 'Tailwind', 'Recharts', 'React Query',
  'FastAPI', 'SQLAlchemy', 'Pydantic', 'NumPy', 'Anthropic / Groq / Gemini', 'Alpha Vantage',
];

const SectionLabel: FC<{ num: string; children: ReactNode }> = ({ num, children }) => (
  <div className="eyebrow reveal mb-6 flex items-center gap-2.5">
    <span className="text-ink-muted/50">({num})</span>
    <span>{children}</span>
  </div>
);

/** The signature transparency card, shown statically as the hero's proof-of-work. */
const TransparencyPreview: FC = () => (
  <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
    <div className="absolute inset-y-0 left-0 w-1 bg-accent/70" aria-hidden />
    <div className="p-6 pl-7">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-accent">
          <Sparkles size={12} /> AI reading
        </span>
        <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-accent">
          moderate confidence
        </span>
        <span className="ml-auto inline-flex items-center rounded-full border border-warn/25 bg-warn/10 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-warn">
          Snapshot
        </span>
      </div>
      <h3 className="font-display text-xl font-medium leading-snug text-ink">NVDA is rising over the period</h3>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-secondary">
        Momentum is firmly positive and price trades well above its 50-day average; volatility is
        elevated, so the move is real but not quiet.
      </p>
      <div className="eyebrow mb-2.5 mt-5">What it looked at</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {HERO_SIGNALS.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-base px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-2xs text-ink-secondary">{s.label}</span>
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dirColor(s.dir))} />
            </div>
            <div className="mt-0.5 font-mono text-sm text-ink tabular">{s.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-muted">
        An explanation to aid understanding — not financial advice.
      </p>
    </div>
  </div>
);

const Section: FC<{ id?: string; children: ReactNode; className?: string }> = ({ id, children, className }) => (
  <section id={id} className={cn('border-t border-line', className)}>
    <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">{children}</div>
  </section>
);

/** The landing / front door — the app's light "Patina" identity, with the depth of a real marketing page. */
const Onboarding: FC = () => {
  const { login } = useAuth();
  const { wipe } = useTransition();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startDemo = async () => {
    setLoading(true);
    setErr(null);
    try {
      await wipe(async () => {
        await login(DEMO_EMAIL, DEMO_PASSWORD);
        armDemoTour();
        navigate(from, { replace: true });
      });
    } catch (e) {
      setErr(getErrorMessage(e, 'Could not start the demo — is the backend running?'));
      setLoading(false);
    }
  };

  // Scroll reveal.
  useEffect(() => {
    const targets = document.querySelectorAll('.ff-land .reveal');
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((t) => t.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const delay = (i: number) => `delay-${(i % 6) + 1}`;

  return (
    <div className="ff-land min-h-screen bg-base text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-base/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <BrandLink />
          <nav className="flex items-center gap-4 sm:gap-5">
            <a href="#inside" className="hidden text-sm text-ink-secondary transition-colors hover:text-ink md:block">What’s inside</a>
            <a href="#how" className="hidden text-sm text-ink-secondary transition-colors hover:text-ink sm:block">How it works</a>
            <Link to="/login" state={{ from }} className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink">Sign in</Link>
            <button
              onClick={startDemo}
              disabled={loading}
              className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-[#F7F8F5] transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? 'Loading…' : 'Live demo'}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-accent-radial" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <div className="eyebrow reveal mb-5 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Fluxus Fisci · the flow of the treasury
            </div>
            <h1 className="reveal delay-1 text-balance font-display text-4xl font-medium leading-[1.06] tracking-tight text-ink sm:text-5xl xl:text-6xl">
              Read the market the way you’d read a good book.
            </h1>
            <p className="reveal delay-2 mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-secondary">
              A calm, literate companion for <span className="text-ink">understanding</span> the
              market — not a dopamine engine built to make you trade. The AI shows its work, cites the
              numbers, and is honest when it doesn’t know.
            </p>

            <div className="reveal delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={startDemo}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-[#F7F8F5] shadow-[0_8px_20px_-10px_rgba(47,111,99,0.55)] transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {loading ? 'Starting…' : 'Explore the live demo'} <ArrowRight size={17} />
              </button>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong px-6 py-3 font-semibold text-ink transition-colors hover:border-ink-muted"
              >
                How it works
              </a>
            </div>
            {err && <p className="reveal mt-3 text-sm text-neg" role="alert">{err}</p>}

            <div className="reveal delay-4 mt-8 flex flex-wrap items-center gap-2">
              {['Transparent heuristics', 'Grounded LLM', 'Honest fallback'].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-2xs font-medium uppercase tracking-[0.08em] text-ink-secondary"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="reveal delay-2">
            <TransparencyPreview />
          </div>
        </div>
      </section>

      {/* (00) Problem */}
      <Section id="problem" className="bg-surface/40">
        <SectionLabel num="00">The problem</SectionLabel>
        <blockquote className="reveal delay-1 max-w-3xl text-balance font-display text-2xl font-medium leading-snug tracking-tight text-ink sm:text-3xl">
          Most finance apps are built to make you trade — and to overstate what they actually know.
        </blockquote>
        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.v} className={cn('reveal border-t pt-4', s.accent ? 'border-accent' : 'border-line', delay(i))}>
              <div className={cn('font-display text-4xl font-medium leading-none tracking-tight sm:text-5xl', s.accent ? 'text-accent' : 'text-ink')}>
                {s.k}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{s.v}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* (01) What's inside */}
      <Section id="inside">
        <SectionLabel num="01">What makes it different</SectionLabel>
        <h2 className="reveal delay-1 max-w-2xl text-balance font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Built to be understood — by you, and about itself.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.n} className={cn('card group reveal p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop', delay(i))}>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-base text-accent transition-colors group-hover:border-accent/30 group-hover:bg-accent/10">
                  <f.icon size={20} />
                </div>
                <span className="font-mono text-2xs text-ink-muted/70">{f.n}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-medium text-ink">{f.title}</h3>
              <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* (02) How it works */}
      <Section id="how" className="bg-surface/40">
        <SectionLabel num="02">How it works</SectionLabel>
        <p className="reveal delay-1 max-w-2xl text-balance font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          Six stages, from a raw quote to an honest, sourced reading.
        </p>

        {/* dot track */}
        <div className="reveal delay-2 mt-10 hidden max-w-4xl items-center md:flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-1 items-center">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', i === 0 ? 'bg-gold' : 'bg-line-strong')} />
              <span className="mx-3 h-px flex-1 bg-line-strong" />
            </div>
          ))}
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {PIPELINE.map((p, i) => (
            <div key={p.n} className={cn('reveal', delay(i))}>
              <div className="font-mono text-xs tracking-[0.12em] text-accent">{p.n}</div>
              <div className="mt-2 text-sm font-semibold text-ink">{p.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-ink-muted">{p.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* (03) The honest part */}
      <Section id="honest">
        <SectionLabel num="03">The honest part</SectionLabel>
        <h2 className="reveal delay-1 max-w-2xl text-balance font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Three kinds of intelligence — each labelled as exactly what it is.
        </h2>
        <p className="reveal delay-1 mt-3 max-w-2xl text-pretty leading-relaxed text-ink-secondary">
          No fabricated accuracy scores. No “Strong Buy”. No trained model pretending to predict
          prices. Just transparent signals, an optional grounded explanation, and honesty about the
          limits.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {LAYERS.map((l, i) => (
            <div key={l.tag} className={cn('card reveal p-6', delay(i))}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                  <l.icon size={17} />
                </div>
                <span className="font-mono text-2xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{l.tag}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-medium text-ink">{l.title}</h3>
              <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-secondary">{l.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* (04) vs. the market */}
      <Section id="market" className="bg-surface/40">
        <SectionLabel num="04">vs. the market</SectionLabel>
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="reveal border-t-2 border-neg pt-5">
            <div className="eyebrow mb-4 text-neg">The field</div>
            <ul>
              {FIELD.map((t) => (
                <li key={t} className="flex items-start gap-3 border-t border-line py-3.5 first:border-t-0">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neg" />
                  <p className="text-[15px] leading-relaxed text-ink">{t}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal delay-1 border-t-2 border-accent pt-5">
            <div className="eyebrow mb-4 text-accent">Fluxus Fisci</div>
            <ul>
              {FF.map((t) => (
                <li key={t} className="flex items-start gap-3 border-t border-line py-3.5 first:border-t-0">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <p className="text-[15px] leading-relaxed text-ink">{t}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* (05) Under the hood + CTA */}
      <Section id="product">
        <SectionLabel num="05">Under the hood</SectionLabel>
        <div className="reveal delay-1 flex flex-wrap gap-2">
          {TECH.map((t) => (
            <span key={t} className="rounded-md border border-line bg-base px-2.5 py-1 font-mono text-2xs text-ink-secondary">
              {t}
            </span>
          ))}
        </div>

        <div className="reveal delay-1 relative mt-12 overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 text-center shadow-card sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-accent-radial opacity-70" aria-hidden />
          <div className="relative mx-auto max-w-xl">
            <h2 className="text-balance font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Start reading the market, calmly.
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-ink-secondary">
              The demo account comes with a sample portfolio and a seeded watchlist. No sign-up
              needed.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={startDemo}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-[#F7F8F5] shadow-[0_8px_20px_-10px_rgba(47,111,99,0.55)] transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {loading ? 'Starting…' : 'Explore the live demo'} <ArrowRight size={17} />
              </button>
              <Link
                to="/register"
                state={{ from }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong px-6 py-3 font-semibold text-ink transition-colors hover:border-ink-muted"
              >
                Create your account
              </Link>
            </div>
            {err && <p className="mt-3 text-sm text-neg" role="alert">{err}</p>}
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-line/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <BrandLink size={22} />
            <Link to="/design-system" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-all hover:gap-2">
              <Palette size={15} /> Design system
            </Link>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-ink-muted">
            For understanding, not recommendations. Nothing here is financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
