import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores';

// ── Types ──────────────────────────────────

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface UserProfile {
  id: string;
  email: string;
  roles: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

// ── Hooks ──────────────────────────────────

/** Fetch the current authenticated user profile */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<{ data: UserProfile }>('/auth/me').then((r) => r.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
}

/** Login mutation */
export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await api.post<{ data: AuthTokens }>('/auth/login', credentials);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      // Immediately fetch user profile
      const me = await api.get<{ data: UserProfile }>('/auth/me');
      return me.data;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
    },
  });
}

/** Logout mutation */
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // Non-critical, clear local state regardless
      }
    },
    onSettled: () => {
      queryClient.clear();
      logout();
    },
  });
}
