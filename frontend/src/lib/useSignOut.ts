import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransition } from '../context/TransitionContext';

/**
 * Sign out behind the verdigris wipe, with a "Signed out" confirmation splash
 * (checkmark) instead of a quote: cover → clear session + go to the landing →
 * reveal. Shared by every sign-out control (top nav, mobile menu, settings).
 */
export function useSignOut(): () => void {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { wipe } = useTransition();

  return useCallback(() => {
    void wipe(
      () => {
        logout();
        navigate('/onboarding', { replace: true });
      },
      { message: { title: 'Signed out', sub: 'See you soon.' } }
    );
  }, [wipe, logout, navigate]);
}
