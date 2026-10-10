import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api, ApiError, buildQuery } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type {
  About,
  AdminUpdateUserPayload,
  MemberProfile,
  Paginated,
  Project,
  ProjectImage,
  ProjectPatchPayload,
  ProjectPayload,
  ProfilePayload,
  PublicUser,
  Teacher,
  UserRole,
  UserStatus,
  UserStatusSummary,
} from '@/types/api';

/* ------------------------------ Profil ------------------------------ */

function toastApiError(error: unknown, fallback: string) {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : fallback;
  toast.error(message);
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfilePayload) =>
      api.patch<{ user: MemberProfile }>('/me/profile', payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.me, data.user);
      if (data.user.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.member(data.user.slug) });
        queryClient.invalidateQueries({ queryKey: queryKeys.members('', 1) });
      }
      toast.success('Profil berhasil disimpan.');
    },
    onError: (error) => toastApiError(error, 'Gagal menyimpan profil.'),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('avatar', file);
      return api.post<{ user: MemberProfile }>('/me/avatar', form);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.me, data.user);
      if (data.user.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.member(data.user.slug) });
        queryClient.invalidateQueries({ queryKey: queryKeys.members('', 1) });
      }
      toast.success('Foto profil diperbarui.');
    },
    onError: (error) => toastApiError(error, 'Gagal mengunggah foto profil.'),
  });
}

/* ------------------------------ Project ----------------------------- */

export function useMyProjects() {
  return useQuery({
    queryKey: queryKeys.myProjects,
    queryFn: () => api.get<{ projects: Project[] }>('/me/projects'),
  });
}

function invalidateProjectCaches(queryClient: ReturnType<typeof useQueryClient>, slug?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.myProjects });
  queryClient.invalidateQueries({ queryKey: ['public'] });
  void slug;
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectPayload) =>
      api.post<{ project: Project }>('/me/projects', payload),
    onSuccess: () => {
      invalidateProjectCaches(queryClient);
      toast.success('Project berhasil dibuat.');
    },
    onError: (error) => toastApiError(error, 'Gagal membuat project.'),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectPatchPayload }) =>
      api.patch<{ project: Project }>(`/me/projects/${id}`, payload),
    onSuccess: () => {
      invalidateProjectCaches(queryClient);
      toast.success('Project berhasil diperbarui.');
    },
    onError: (error) => toastApiError(error, 'Gagal memperbarui project.'),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string; deleted: boolean }>(`/me/projects/${id}`),
    onSuccess: () => {
      invalidateProjectCaches(queryClient);
      toast.success('Project dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus project.'),
  });
}

export function useUploadProjectImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, files }: { projectId: string; files: File[] }) => {
      const form = new FormData();
      for (const file of files) form.append('images', file);
      return api.post<{ images: ProjectImage[] }>(`/me/projects/${projectId}/images`, form);
    },
    onSuccess: () => {
      invalidateProjectCaches(queryClient);
      toast.success('Gambar berhasil ditambahkan.');
    },
    onError: (error) => toastApiError(error, 'Gagal mengunggah gambar.'),
  });
}

export function useDeleteProjectImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, imageId }: { projectId: string; imageId: string }) =>
      api.delete<{ id: string; deleted: boolean }>(`/me/projects/${projectId}/images/${imageId}`),
    onSuccess: () => {
      invalidateProjectCaches(queryClient);
      toast.success('Gambar dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus gambar.'),
  });
}

export function useUploadProjectCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, file }: { projectId: string; file: File }) => {
      const form = new FormData();
      form.append('images', file);
      const uploaded = await api.post<{ images: ProjectImage[] }>(
        `/me/projects/${projectId}/images`,
        form,
      );
      const image = uploaded.images[0];
      if (!image) throw new Error('Gagal mengunggah cover.');
      const updated = await api.patch<{ project: Project }>(`/me/projects/${projectId}`, {
        coverImageUrl: image.imageUrl,
      });
      // Galeri tetap menyimpan gambar cover (dipakai sebagai fallback).
      return updated;
    },
    onSuccess: () => {
      invalidateProjectCaches(queryClient);
      toast.success('Cover project diperbarui.');
    },
    onError: (error) => toastApiError(error, 'Gagal mengunggah cover.'),
  });
}

/* ------------------------------- Admin ------------------------------ */

export function useAdminUsers(status: string, search: string, page: number) {
  return useQuery({
    queryKey: queryKeys.adminUsers(status, search, page),
    queryFn: () =>
      api.get<Paginated<MemberProfile>>(
        `/admin/users${buildQuery({ status: status === 'all' ? undefined : status, search, page, limit: 12 })}`,
      ),
    placeholderData: (previous) => previous,
  });
}

export function useAdminUsersSummary() {
  return useQuery({
    queryKey: queryKeys.adminUsersSummary,
    queryFn: () => api.get<UserStatusSummary>('/admin/users/summary'),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: UserStatus; reason?: string }) =>
      api.patch<{ user: MemberProfile }>(`/admin/users/${id}/status`, { status, reason }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      queryClient.invalidateQueries({ queryKey: ['public'] });

      const messages: Partial<Record<UserStatus, string>> = {
        approved: 'Pendaftaran disetujui.',
        rejected: 'Pendaftaran ditolak.',
        suspended: 'Akun dinonaktifkan.',
      };
      toast.success(messages[variables.status] ?? 'Status anggota diperbarui.');
    },
    onError: (error) => toastApiError(error, 'Gagal memperbarui status anggota.'),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      api.patch<{ user: MemberProfile }>(`/admin/users/${id}/role`, { role }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      queryClient.invalidateQueries({ queryKey: ['public'] });

      toast.success(
        variables.role === 'admin' ? 'Anggota dijadikan admin.' : 'Admin dijadikan anggota.',
      );
    },
    onError: (error) => toastApiError(error, 'Gagal mengubah role anggota.'),
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdateUserPayload }) =>
      api.patch<{ user: MemberProfile }>(`/admin/users/${id}`, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      queryClient.invalidateQueries({ queryKey: ['public'] });

      toast.success(`Profil ${data.user.name} diperbarui.`);
    },
    onError: (error) => toastApiError(error, 'Gagal memperbarui profil anggota.'),
  });
}

export function useAdminProjects(search: string, hidden: string, page: number) {
  return useQuery({
    queryKey: queryKeys.adminProjects(search, hidden, page),
    queryFn: () =>
      api.get<Paginated<Project & { author: PublicUser | null }>>(
        `/admin/projects${buildQuery({ search, hidden: hidden === 'all' ? undefined : hidden, page, limit: 12 })}`,
      ),
    placeholderData: (previous) => previous,
  });
}

export function useToggleProjectHidden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
      api.patch<{ project: Project }>(`/admin/projects/${id}/hide`, { isHidden }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['public'] });
      toast.success(variables.isHidden ? 'Project disembunyikan.' : 'Project ditampilkan.');
    },
    onError: (error) => toastApiError(error, 'Gagal mengubah visibilitas project.'),
  });
}

export function useAdminDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ id: string; deleted: boolean }>(`/admin/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['public'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.myProjects });
      toast.success('Project dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus project.'),
  });
}

/* --------------------------- Konten landing --------------------------- */

export type AboutPayload = {
  title: string;
  description: string;
  image?: File | null;
  removeImage?: boolean;
};

export type TeacherPayload = {
  name: string;
  description: string;
  sortOrder: number;
  photo?: File | null;
  removePhoto?: boolean;
};

function toAboutForm(payload: AboutPayload): FormData {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('description', payload.description);
  if (payload.image) form.append('image', payload.image);
  if (payload.removeImage) form.append('removeImage', 'true');
  return form;
}

function toTeacherForm(payload: TeacherPayload): FormData {
  const form = new FormData();
  form.append('name', payload.name);
  form.append('description', payload.description);
  form.append('sortOrder', String(payload.sortOrder));
  if (payload.photo) form.append('photo', payload.photo);
  if (payload.removePhoto) form.append('removePhoto', 'true');
  return form;
}

function invalidateContent(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['public'] });
}

export function useSaveAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AboutPayload) =>
      api.patch<{ about: About }>('/admin/about', toAboutForm(payload)),
    onSuccess: () => {
      invalidateContent(queryClient);
      toast.success('Konten Tentang berhasil disimpan.');
    },
    onError: (error) => toastApiError(error, 'Gagal menyimpan konten Tentang.'),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TeacherPayload) =>
      api.post<{ teacher: Teacher }>('/admin/teachers', toTeacherForm(payload)),
    onSuccess: () => {
      invalidateContent(queryClient);
      toast.success('Wali kelas berhasil ditambahkan.');
    },
    onError: (error) => toastApiError(error, 'Gagal menambahkan wali kelas.'),
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TeacherPayload }) =>
      api.patch<{ teacher: Teacher }>(`/admin/teachers/${id}`, toTeacherForm(payload)),
    onSuccess: () => {
      invalidateContent(queryClient);
      toast.success('Wali kelas berhasil diperbarui.');
    },
    onError: (error) => toastApiError(error, 'Gagal memperbarui wali kelas.'),
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ id: string; deleted: boolean }>(`/admin/teachers/${id}`),
    onSuccess: () => {
      invalidateContent(queryClient);
      toast.success('Wali kelas dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus wali kelas.'),
  });
}
