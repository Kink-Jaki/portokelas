import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { toast } from 'sonner';

import { api, ApiError } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type { LoginPayload, MemberProfile } from '@/types/api';

type AuthContextValue = {
  user: MemberProfile | null;
  isLoading: boolean;
  error: ApiError | null;
  login: (payload: LoginPayload) => Promise<MemberProfile>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const data = await api.get<{ user: MemberProfile | null }>('/auth/me');
      return data.user;
    },
    staleTime: 60_000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post<{ user: MemberProfile }>('/auth/login', payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.me, data.user);
      toast.success(`Selamat datang kembali, ${data.user.name}!`);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Gagal masuk. Coba lagi.';
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post<{ message: string }>('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.me, null);
      queryClient.removeQueries({ queryKey: ['me'] });
      queryClient.removeQueries({ queryKey: ['admin'] });
      toast.success('Anda sudah keluar.');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Gagal keluar. Coba lagi.';
      toast.error(message);
    },
  });

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await loginMutation.mutateAsync(payload);
      return data.user;
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.me });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      isLoading: meQuery.isLoading,
      error: meQuery.error instanceof ApiError ? meQuery.error : null,
      login,
      logout,
      refresh,
    }),
    [meQuery.data, meQuery.isLoading, meQuery.error, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return context;
}
