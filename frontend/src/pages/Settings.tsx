import { FC, FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, LogOut, Plus, Star, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../context/AuthContext';
import { useSignOut } from '../lib/useSignOut';
import { useIsDemo } from '../lib/demo';
import { useWatchlist, useWatchlistMutations } from '../lib/queries';
import { getErrorMessage } from '../lib/errors';

type Risk = 'low' | 'medium' | 'high';
type Msg = { ok: boolean; text: string } | null;

/** Shown atop a locked section in demo mode, pointing at real sign-up. */
const DemoLock: FC<{ kind: string }> = ({ kind }) => (
  <div className="mb-4 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-sm text-warn">
    <AlertCircle size={15} className="mt-0.5 shrink-0" />
    <span>
      You’re exploring the shared demo — {kind} changes are turned off so it keeps working for
      everyone.{' '}
      <Link to="/register" className="font-semibold underline underline-offset-2">
        Create your own account
      </Link>{' '}
      to edit.
    </span>
  </div>
);

const Notice: FC<{ msg: Msg }> = ({ msg }) =>
  msg ? (
    <p
      role={msg.ok ? 'status' : 'alert'}
      className={`mt-3 flex items-center gap-1.5 text-sm ${msg.ok ? 'text-pos' : 'text-neg'}`}
    >
      {msg.ok ? <Check size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
      {msg.text}
    </p>
  ) : null;

/** One settings block: title + description on the left, controls on the right. */
const Row: FC<{ title: string; desc: string; children: ReactNode }> = ({ title, desc, children }) => (
  <section className="grid gap-6 border-t border-line py-8 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,240px)_1fr]">
    <div>
      <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{desc}</p>
    </div>
    <div>{children}</div>
  </section>
);

const selectCls =
  'w-full rounded-xl border border-line bg-elevated px-3.5 py-2.5 text-sm text-ink transition-colors focus:border-accent focus-visible:outline-none';

const Settings: FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const isDemo = useIsDemo();
  const signOut = useSignOut();

  // ---- Profile ----
  const [profile, setProfile] = useState({ full_name: '', username: '', email: '', risk_tolerance: 'medium' as Risk });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<Msg>(null);

  const syncProfile = useCallback(() => {
    if (!user) return;
    setProfile({
      full_name: user.full_name ?? '',
      username: user.username,
      email: user.email,
      risk_tolerance: (user.risk_tolerance as Risk) || 'medium',
    });
  }, [user]);
  useEffect(() => {
    syncProfile();
  }, [syncProfile]);

  const dirty =
    !!user &&
    (profile.full_name !== (user.full_name ?? '') ||
      profile.username !== user.username ||
      profile.email !== user.email ||
      profile.risk_tolerance !== ((user.risk_tolerance as Risk) || 'medium'));

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    const username = profile.username.trim();
    const email = profile.email.trim();
    if (username.length < 2) {
      setProfileMsg({ ok: false, text: 'Username must be at least 2 characters.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileMsg({ ok: false, text: 'Enter a valid email address.' });
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({
        full_name: profile.full_name.trim(),
        username,
        email,
        risk_tolerance: profile.risk_tolerance,
      });
      setProfileMsg({ ok: true, text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ ok: false, text: getErrorMessage(err) });
    } finally {
      setSavingProfile(false);
    }
  };

  // ---- Password ----
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  const savePw = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!pw.current) {
      setPwMsg({ ok: false, text: 'Enter your current password.' });
      return;
    }
    if (pw.next.length < 8) {
      setPwMsg({ ok: false, text: 'New password must be at least 8 characters.' });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ ok: false, text: 'The new passwords don’t match.' });
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg({ ok: true, text: 'Password updated.' });
    } catch (err) {
      setPwMsg({ ok: false, text: getErrorMessage(err) });
    } finally {
      setSavingPw(false);
    }
  };

  // ---- Watchlist ----
  const watchlist = useWatchlist(true);
  const { add, remove } = useWatchlistMutations();
  const [symbol, setSymbol] = useState('');
  const symbols = watchlist.data ?? [];

  const submitAdd = (e: FormEvent) => {
    e.preventDefault();
    const s = symbol.trim().toUpperCase();
    if (!s) return;
    add.mutate(s, { onSuccess: () => setSymbol('') });
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <PageHeader
        eyebrow="Settings"
        title="Your account"
        description="Manage your profile, password, watchlist, and session."
      />

      {/* Profile */}
      <Row title="Profile" desc="The name and address on your account, and how you like to read risk.">
        <form onSubmit={saveProfile} className="card p-5 sm:p-6">
          {isDemo && <DemoLock kind="profile" />}
          <fieldset disabled={isDemo} className="m-0 min-w-0 border-0 p-0 disabled:opacity-60">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              name="fullName"
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={profile.full_name}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
            />
            <Field
              label="Username"
              name="username"
              autoComplete="username"
              placeholder="ada"
              value={profile.username}
              onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
            />
          </div>
          <div className="mt-4">
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="risk" className="mb-1.5 block text-sm font-medium text-ink-secondary">
              Risk tolerance
            </label>
            <select
              id="risk"
              value={profile.risk_tolerance}
              onChange={(e) => setProfile((p) => ({ ...p, risk_tolerance: e.target.value as Risk }))}
              className={selectCls}
            >
              <option value="low">Low — capital preservation</option>
              <option value="medium">Medium — balanced</option>
              <option value="high">High — growth-seeking</option>
            </select>
            <p className="mt-1 text-xs text-ink-muted">
              A preference saved to your account. The readings stay the same — they explain, they don’t tailor advice.
            </p>
          </div>

          <Notice msg={profileMsg} />

          <div className="mt-5 flex items-center gap-2">
            <Button type="submit" disabled={!dirty || savingProfile}>
              {savingProfile ? 'Saving…' : 'Save changes'}
            </Button>
            {dirty && !savingProfile && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  syncProfile();
                  setProfileMsg(null);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
          </fieldset>
        </form>
      </Row>

      {/* Security */}
      <Row title="Password" desc="Change your password. You’ll need your current one to confirm it’s you.">
        <form onSubmit={savePw} className="card p-5 sm:p-6">
          {isDemo && <DemoLock kind="password" />}
          <fieldset disabled={isDemo} className="m-0 min-w-0 border-0 p-0 disabled:opacity-60">
          <Field
            label="Current password"
            name="current"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={pw.current}
            onChange={(e) => setPw((s) => ({ ...s, current: e.target.value }))}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="New password"
              name="next"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={pw.next}
              onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))}
            />
            <Field
              label="Confirm new"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat it"
              value={pw.confirm}
              onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))}
            />
          </div>

          <Notice msg={pwMsg} />

          <div className="mt-5">
            <Button type="submit" disabled={savingPw || !pw.current || !pw.next}>
              {savingPw ? 'Updating…' : 'Update password'}
            </Button>
          </div>
          </fieldset>
        </form>
      </Row>

      {/* Watchlist */}
      <Row title="Watchlist" desc="The symbols you track — they follow you to the dashboard.">
        <div className="card p-5 sm:p-6">
          <form onSubmit={submitAdd} className="flex gap-2">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Add a ticker — e.g. TSLA"
              aria-label="Add a ticker to your watchlist"
              maxLength={12}
              className="min-w-0 flex-1 rounded-xl border border-line bg-elevated px-3.5 py-2.5 font-mono text-sm uppercase text-ink placeholder:font-sans placeholder:normal-case placeholder:text-ink-muted focus:border-accent focus-visible:outline-none"
            />
            <Button type="submit" disabled={add.isLoading || !symbol.trim()}>
              <Plus size={15} /> Add
            </Button>
          </form>
          {add.isError && (
            <p className="mt-2 text-xs text-neg" role="alert">
              {getErrorMessage(add.error)}
            </p>
          )}

          <div className="mt-5">
            {watchlist.isLoading ? (
              <div className="space-y-2" aria-hidden>
                <div className="skeleton h-10 w-full rounded-lg" />
                <div className="skeleton h-10 w-full rounded-lg" />
                <div className="skeleton h-10 w-full rounded-lg" />
              </div>
            ) : watchlist.isError ? (
              <ErrorState message={getErrorMessage(watchlist.error)} onRetry={() => watchlist.refetch()} />
            ) : symbols.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Star size={20} className="text-ink-muted" />
                <p className="text-sm text-ink-secondary">
                  Nothing tracked yet. Add a ticker above to start your watchlist.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {symbols.map((sym) => (
                  <li key={sym} className="flex items-center justify-between py-2.5">
                    <Link
                      to={`/markets/${sym}`}
                      className="font-mono text-sm font-semibold text-ink transition-colors hover:text-accent"
                    >
                      {sym}
                    </Link>
                    <button
                      onClick={() => remove.mutate(sym)}
                      disabled={remove.isLoading}
                      aria-label={`Remove ${sym} from watchlist`}
                      className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-raised hover:text-neg disabled:opacity-50"
                    >
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Row>

      {/* Account */}
      <Row title="Account" desc="Your session and account status.">
        <div className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pos/25 bg-pos/10 px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] text-pos">
              {user?.is_active ? 'Active' : 'Inactive'}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.08em] ${
                user?.is_verified
                  ? 'border-accent/25 bg-accent/10 text-accent'
                  : 'border-line-strong bg-raised text-ink-secondary'
              }`}
            >
              {user?.is_verified ? 'Email verified' : 'Email not verified'}
            </span>
          </div>
          <p className="mt-4 text-sm text-ink-secondary">
            Signed in as <span className="font-medium text-ink">{user?.email}</span>.
          </p>
          {isDemo && (
            <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-3 text-sm text-warn">
              You’re in the shared demo account.{' '}
              <Link to="/register" className="font-semibold underline underline-offset-2">
                Create your own account
              </Link>{' '}
              to keep a portfolio and watchlist that are just yours.
            </div>
          )}
          <div className="mt-5 border-t border-line pt-5">
            <Button variant="danger" onClick={signOut}>
              <LogOut size={15} /> {isDemo ? 'Exit demo' : 'Sign out'}
            </Button>
          </div>
        </div>
      </Row>
    </div>
  );
};

export default Settings;
