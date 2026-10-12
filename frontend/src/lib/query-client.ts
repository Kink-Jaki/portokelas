import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Jangan ulangi request untuk error klien (4xx).
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});

export const queryKeys = {
  me: ['auth', 'me'] as const,
  stats: ['public', 'stats'] as const,
  about: ['public', 'about'] as const,
  teachers: ['public', 'teachers'] as const,
  members: (search: string, page: number) => ['public', 'members', { search, page }] as const,
  member: (slug: string) => ['public', 'member', slug] as const,
  memberProjects: (slug: string) => ['public', 'member', slug, 'projects'] as const,
  project: (idOrSlug: string) => ['public', 'project', idOrSlug] as const,
  myProjects: ['me', 'projects'] as const,
  publicMemories: ['public', 'memories'] as const,
  myMemories: ['me', 'memories'] as const,
  adminMemories: ['admin', 'memories'] as const,
  adminUsers: (search: string, page: number) => ['admin', 'users', { search, page }] as const,
  adminProjects: (search: string, hidden: string | undefined, page: number) =>
    ['admin', 'projects', { search, hidden, page }] as const,
};
