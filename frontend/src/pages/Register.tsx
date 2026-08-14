import { FC, FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTransition } from '../context/TransitionContext';
import { getErrorMessage } from '../lib/errors';

const Register: FC = () => {
  const { register, login } = useAuth();
  const { wipe } = useTransition();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords don’t match.');
      return;
    }

    setLoading(true);
    try {
      await wipe(async () => {
        await register({
          email: cleanEmail,
          username: username.trim() || cleanEmail.split('@')[0],
          password,
          full_name: fullName.trim() || undefined,
        });
        await login(cleanEmail, password);
        navigate(from, { replace: true });
      });
    } catch (err) {
      setError(getErrorMessage(err, 'We couldn’t create your account. Try a different email.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="A quiet place to read the markets."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="font-medium text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-neg/25 bg-neg/5 px-3.5 py-2.5 text-sm text-neg"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Name + username share a row; email full width; passwords share a row. */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Full name"
            name="fullName"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Field
            label="Username"
            name="username"
            autoComplete="username"
            placeholder="optional"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
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
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="8+ characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Field
            label="Confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat it"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <Button type="submit" block disabled={loading}>
          {loading ? 'Creating your account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-3 text-center text-xs leading-relaxed text-ink-muted">
        For understanding, not recommendations. Nothing here is financial advice.
      </p>
    </AuthLayout>
  );
};

export default Register;
