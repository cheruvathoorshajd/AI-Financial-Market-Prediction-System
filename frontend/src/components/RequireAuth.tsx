import { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Gates a route behind an authenticated session, preserving the intended path. */
export const RequireAuth: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-muted">
        <span className="eyebrow">Checking your session</span>
      </div>
    );
  }

  if (!user) {
    // Send logged-out visitors to the landing (the front door), not a bare form.
    return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
