'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { api } from '@/lib/api-client';
import { createLogger } from '@/lib/logger';

const log = createLogger('AuthProvider');

interface AuthContextValue {
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isReady: false,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, logout: clearAuth, isAuthenticated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // ── Hydrate session on mount ──────────────
  useEffect(() => {
    const hydrate = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        log.info('Hydrate', 'No token found, redirecting to login');
        setIsReady(true);
        router.replace('/login');
        return;
      }

      try {
        log.debug('Hydrate', 'Validating token via /auth/me');
        const res = await api.get<{
          data: { id: string; email: string; roles: string[] };
        }>('/auth/me');
        setUser(res.data);
        log.info('Hydrate', `Session restored for ${res.data.email}`, {
          roles: res.data.roles,
        });
      } catch (err) {
        log.warn('Hydrate', 'Token invalid, clearing session');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        router.replace('/login');
      } finally {
        setIsReady(true);
      }
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ─────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      log.info('Login', `Attempting login for ${email}`);

      const res = await api.post<{
        data: { accessToken: string; refreshToken: string; expiresIn: number };
      }>('/auth/login', { email, password });

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      // Fetch user profile
      const me = await api.get<{
        data: { id: string; email: string; roles: string[] };
      }>('/auth/me');
      setUser(me.data);

      log.info('Login', `Login successful for ${me.data.email}`);
      router.push('/dashboard');
    },
    [setUser, router],
  );

  // ── Logout ────────────────────────────────
  const logout = useCallback(async () => {
    log.info('Logout', 'Logging out');
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Logout API failure is non-critical
      log.warn('Logout', 'Server logout failed, clearing local state');
    }
    clearAuth();
  }, [clearAuth]);

  // ── Loading state ─────────────────────────
  if (!isReady) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid var(--border-primary)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto var(--space-4)',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ isReady, login, logout }}>{children}</AuthContext.Provider>;
}
