import { useQuery } from '@tanstack/react-query';

import { api, buildQuery } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type { About, Paginated, Project, PublicStats, PublicUser, Teacher } from '@/types/api';

export function usePublicStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => api.get<PublicStats>('/stats'),
    staleTime: 60_000,
  });
}

export function useAbout() {
  return useQuery({
    queryKey: queryKeys.about,
    queryFn: () => api.get<{ about: About | null }>('/about'),
    staleTime: 60_000,
  });
}

export function useTeachers() {
  return useQuery({
    queryKey: queryKeys.teachers,
    queryFn: () => api.get<{ teachers: Teacher[] }>('/teachers'),
    staleTime: 60_000,
  });
}

export function useMembers(search: string, page: number) {
  return useQuery({
    queryKey: queryKeys.members(search, page),
    queryFn: () =>
      api.get<Paginated<PublicUser>>(`/members${buildQuery({ search, page, limit: 12 })}`),
    placeholderData: (previous) => previous,
  });
}

export function useMember(slug: string) {
  return useQuery({
    queryKey: queryKeys.member(slug),
    queryFn: () => api.get<{ member: PublicUser }>(`/members/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useMemberProjects(slug: string) {
  return useQuery({
    queryKey: queryKeys.memberProjects(slug),
    queryFn: () => api.get<{ projects: Project[] }>(`/members/${slug}/projects`),
    enabled: Boolean(slug),
  });
}

export function useProject(idOrSlug: string) {
  return useQuery({
    queryKey: queryKeys.project(idOrSlug),
    queryFn: () =>
      api.get<{
        project: Project;
        author: Pick<PublicUser, 'id' | 'name' | 'slug' | 'avatarUrl' | 'headline'> | null;
      }>(`/projects/${idOrSlug}`),
    enabled: Boolean(idOrSlug),
  });
}
