import { useAuth } from '../context/AuthContext';

/** Demo account seeded by the backend (see backend/init_db.py). */
export const DEMO_EMAIL = 'demo@fluxusfisci.app';
export const DEMO_PASSWORD = 'demo1234';
export const DEMO_NAME = 'Ada Lovelace';

const TOUR_KEY = 'ff:demoTour';

/** True when the signed-in session is the shared, read-only demo account. */
export function useIsDemo(): boolean {
  const { user } = useAuth();
  return !!user && user.email === DEMO_EMAIL;
}

/** Arm the guided tour to show once, right after "Live demo" starts. */
export function armDemoTour(): void {
  try {
    sessionStorage.setItem(TOUR_KEY, '1');
  } catch {
    /* storage unavailable — the tour simply won't auto-open */
  }
}

/** Consume the tour flag: returns true at most once per armed demo start. */
export function takeDemoTour(): boolean {
  try {
    if (sessionStorage.getItem(TOUR_KEY) === '1') {
      sessionStorage.removeItem(TOUR_KEY);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
