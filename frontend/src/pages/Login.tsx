import { FC, FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTransition } from '../context/TransitionContext';
import { getErrorMessage } from '../lib/errors';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../lib/demo';

const Login: FC = () => {
  const { login } = useAuth();
  const { wipe } = useTransition();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (e: FormEvent, creds?: { email: string; password: string }) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await wipe(async () => {
        await login(creds?.email ?? email, creds?.password ?? password);
        navigate(creds ? '/' : from, { replace: true });
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Those credentials didn’t work. Check them and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/register" state={{ from }} className="font-medium text-accent hover:text-accent-hover">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={(e) => signIn(e)} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-neg/25 bg-neg/5 px-3.5 py-2.5 text-sm text-neg"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" block disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-5 flex items-center gap-3 text-2xs uppercase tracking-[0.14em] text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={(e) => signIn(e, { email: DEMO_EMAIL, password: DEMO_PASSWORD })}
        disabled={loading}
        className="mt-5 w-full rounded-xl border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink-muted disabled:opacity-50"
      >
        Explore with the demo account
      </button>
      <p className="mt-2 text-center text-xs text-ink-muted">
        A ready-made account with a sample portfolio — no sign-up needed.
      </p>
    </AuthLayout>
  );
};

export default Login;
