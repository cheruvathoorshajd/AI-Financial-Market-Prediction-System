import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from '../services/api';
import { queryClient } from '../lib/queries';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  full_name?: string | null;
  is_active: boolean;
  is_verified: boolean;
  risk_tolerance?: string | null;
}

export interface ProfileUpdate {
  full_name?: string;
  username?: string;
  email?: string;
  risk_tolerance?: 'low' | 'medium' | 'high';
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<AuthUser>('/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const body = new URLSearchParams();
      body.append('username', email);
      body.append('password', password);
      const { data } = await api.post('/auth/login/access-token', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      localStorage.setItem('access_token', data.access_token);
      queryClient.clear(); // drop any prior account's cached data before loading this one
      await refresh();
    },
    [refresh]
  );

  const register = useCallback(async (input: RegisterInput) => {
    await api.post('/users/', input);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    queryClient.clear(); // clear user-scoped caches (portfolio, watchlist) on sign-out
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdate) => {
    const { data: updated } = await api.put<AuthUser>('/users/me', data);
    setUser(updated);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await api.post('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
