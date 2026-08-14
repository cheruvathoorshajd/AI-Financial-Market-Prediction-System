import { FC, FormEvent, useState } from 'react';
import { useMutation } from 'react-query';
import { Link } from 'react-router-dom';
import { ArrowUp, Sparkles } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import InsightPanel from '../components/insights/InsightPanel';
import OutlookBoard from '../components/insights/OutlookBoard';
import insightsService, {
  AskAnswer,
  InsightSignal,
} from '../services/insightsService';
import { getErrorMessage } from '../lib/errors';
import { formatPercent } from '../lib/format';
import { cn } from '../lib/cn';

const EXAMPLES = [
  'Which stock does the model rank highest?',
  'Best performing stock next quarter?',
  "What's moving today?",
  'How is AAPL trending?',
];

/** Type guard: grounding entries that are labelled signals (vs mover rows). */
const isSignal = (g: unknown): g is InsightSignal =>
  typeof g === 'object' && g !== null && 'label' in g && 'value' in g;

const Insights: FC = () => {
  const [question, setQuestion] = useState('');
  const [symbol, setSymbol] = useState('');

  const ask = useMutation<AskAnswer, unknown, { question: string; symbol?: string }>(
    (vars) => insightsService.ask(vars.question, vars.symbol)
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    ask.mutate({ question: q, symbol: symbol.trim() || undefined });
  };

  const answer = ask.data;
  const signalGrounding = answer?.grounding.filter(isSignal) ?? [];
  const moverGrounding = answer?.grounding.filter((g) => !isSignal(g)) ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Insights"
        title="Ask, and see the reasoning"
        description="See what a learned model expects, and ask about the market or an asset. Everything here is grounded in the data on screen, shows the reasoning, and is honest about what it can't say — it explains, it never tells you to buy or sell."
      />

      <div className="mb-8">
        <OutlookBoard />
      </div>

      <form onSubmit={submit} className="mb-8">
        <div className="rounded-2xl border border-line bg-surface p-2 shadow-card focus-within:border-accent">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit(e);
            }}
            rows={2}
            placeholder="e.g. what's moving in tech today?"
            aria-label="Ask a question about the market"
            className="w-full resize-none bg-transparent px-3 py-2 text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <div className="flex items-center gap-2 px-1 pb-1">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (optional)"
              aria-label="Optional ticker symbol to ground the answer"
              className="w-40 rounded-lg border border-line bg-base px-2.5 py-1.5 font-mono text-xs uppercase text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={ask.isLoading || !question.trim()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[#F7F8F5] transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {ask.isLoading ? 'Reading…' : 'Ask'} <ArrowUp size={15} />
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setQuestion(ex)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      {ask.isLoading && (
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <span className="eyebrow">Reading the data…</span>
          </div>
          <div className="skeleton mt-4 h-6 w-2/3" />
          <div className="skeleton mt-3 h-4 w-full" />
          <div className="skeleton mt-2 h-4 w-4/5" />
        </div>
      )}

      {ask.isError && (
        <ErrorState
          message={getErrorMessage(ask.error)}
          onRetry={() => {
            const q = question.trim();
            if (q) ask.mutate({ question: q, symbol: symbol.trim() || undefined });
            else ask.reset();
          }}
        />
      )}

      {!ask.isLoading && !ask.isError && !answer && (
        <EmptyState
          icon={<Sparkles size={20} />}
          title="Ask your first question"
          body="Try one of the prompts above, or type your own. Add a ticker to ground the answer in a specific asset."
        />
      )}

      {answer && !ask.isLoading && (
        <div className="space-y-4">
          <InsightPanel
            method={answer.method}
            headline={answer.headline}
            summary={answer.summary}
            reasoning={answer.reasoning}
            limits={answer.limits}
            disclaimer={answer.disclaimer}
            observations={signalGrounding.length ? signalGrounding : undefined}
          />
          {answer.rankings?.map((rank, ri) => (
            <div key={ri} className="card p-5">
              <div className="eyebrow mb-1">{rank.title}</div>
              <p className="mb-3 text-pretty text-xs leading-relaxed text-ink-muted">{rank.caption}</p>
              <ul className="divide-y divide-line">
                {rank.rows.map((row, i) => (
                  <li key={row.symbol} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5">
                    <span className="font-mono text-xs text-ink-muted tabular">{i + 1}</span>
                    <div className="min-w-0">
                      <Link
                        to={`/markets/${row.symbol}`}
                        className="font-mono text-sm font-semibold text-ink transition-colors hover:text-accent"
                      >
                        {row.symbol}
                      </Link>
                      {row.name && <div className="truncate text-xs text-ink-muted">{row.name}</div>}
                    </div>
                    <div className="text-right">
                      <div
                        className={cn(
                          'font-mono text-sm font-semibold tabular',
                          row.valuePct >= 0 ? 'text-pos' : 'text-neg'
                        )}
                      >
                        {formatPercent(row.valuePct)}
                      </div>
                      {row.note && <div className="text-2xs text-ink-muted">{row.note}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {moverGrounding.length > 0 && (
            <div className="card p-5">
              <div className="eyebrow mb-3">Grounded in today's moves</div>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {moverGrounding.map((m, i) => {
                  const mv = m as { symbol: string; changePercent: number; sector?: string | null };
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-line bg-base px-3 py-2 text-sm"
                    >
                      <span className="font-mono font-semibold text-ink">{mv.symbol}</span>
                      <span
                        className={`font-mono tabular ${
                          mv.changePercent >= 0 ? 'text-pos' : 'text-neg'
                        }`}
                      >
                        {Number.isFinite(mv.changePercent)
                          ? `${mv.changePercent >= 0 ? '+' : ''}${mv.changePercent.toFixed(2)}%`
                          : '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Insights;
