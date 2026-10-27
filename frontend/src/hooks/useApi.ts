import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api, ApiError, buildQuery } from '@/lib/api';
import { convertImageToWebp } from '@/lib/image';
import { queryKeys } from '@/lib/query-client';
import type {
  About,
  AdminUpdateUserPayload,
  Hero,
  MemberProfile,
  Memory,
  MemoryVideo,
  MemoryWithAuthor,
  Paginated,
  Project,
  ProjectImage,
  ProjectPatchPayload,
  ProjectPayload,
  ProfilePayload,
  PublicUser,
  Teacher,
  UpdateEmailPayload,
  UpdatePasswordPayload,
} from '@/types/api';

/* ------------------------------ Profil ------------------------------ */

function toastApiError(error: unknown, fallback: string) {
  const message =
    error instanceof ApiError ? error.message : error instanceof Error ? error.message : fallback;
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
        queryClient.invalidateQueries({ queryKey: queryKeys.membersAll });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.membersAll });
      }
      toast.success('Foto profil diperbarui.');
    },
    onError: (error) => toastApiError(error, 'Gagal mengunggah foto profil.'),
  });
}

export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEmailPayload) =>
      api.patch<{ user: MemberProfile }>('/me/email', payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.me, data.user);
      toast.success('Email berhasil diperbarui.');
    },
    onError: (error) => toastApiError(error, 'Gagal memperbarui email.'),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) =>
      api.patch<{ updated: boolean }>('/me/password', payload),
    onSuccess: () => {
      toast.success('Password berhasil diperbarui.');
    },
    onError: (error) => toastApiError(error, 'Gagal memperbarui password.'),
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
    mutationFn: async ({ projectId, files }: { projectId: string; files: File[] }) => {
      const form = new FormData();
      for (const file of files) form.append('images', await convertImageToWebp(file));
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
      form.append('images', await convertImageToWebp(file));
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

/* ------------------------------ Kenangan ---------------------------- */

export function useMyMemories() {
  return useQuery({
    queryKey: queryKeys.myMemories,
    queryFn: () => api.get<{ memories: Memory[] }>('/me/memories'),
  });
}

export function useUploadMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ image, caption }: { image: File; caption?: string }) => {
      const form = new FormData();
      form.append('image', await convertImageToWebp(image));
      if (caption && caption.trim()) form.append('caption', caption.trim());
      return api.post<{ memory: Memory }>('/me/memories', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myMemories });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicMemories });
      toast.success('Kenangan berhasil diunggah.');
    },
    onError: (error) => toastApiError(error, 'Gagal mengunggah kenangan.'),
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string; deleted: boolean }>(`/me/memories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myMemories });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicMemories });
      toast.success('Kenangan dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus kenangan.'),
  });
}

export function useAdminMemories() {
  return useQuery({
    queryKey: queryKeys.adminMemories,
    queryFn: () => api.get<{ memories: MemoryWithAuthor[] }>('/admin/memories'),
  });
}

export function useAdminDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ id: string; deleted: boolean }>(`/admin/memories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminMemories });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicMemories });
      toast.success('Kenangan dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus kenangan.'),
  });
}

export function useAdminMemoryVideo() {
  return useQuery({
    queryKey: queryKeys.adminMemoryVideo,
    queryFn: () => api.get<{ video: MemoryVideo | null }>('/admin/memories/video'),
  });
}

export function useUploadMemoryVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ video, caption }: { video: File; caption?: string }) => {
      const form = new FormData();
      form.append('video', video);
      if (caption && caption.trim()) form.append('caption', caption.trim());
      return api.post<{ video: MemoryVideo }>('/admin/memories/video', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminMemoryVideo });
      queryClient.invalidateQueries({ queryKey: queryKeys.memoryVideo });
      toast.success('Video kenangan berhasil diunggah.');
    },
    onError: (error) => toastApiError(error, 'Gagal mengunggah video kenangan.'),
  });
}

export function useDeleteMemoryVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<{ id: string; deleted: boolean }>('/admin/memories/video'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminMemoryVideo });
      queryClient.invalidateQueries({ queryKey: queryKeys.memoryVideo });
      toast.success('Video kenangan dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus video kenangan.'),
  });
}

/* ------------------------------- Admin ------------------------------ */

export function useAdminUsers(search: string, page: number) {
  return useQuery({
    queryKey: queryKeys.adminUsers(search, page),
    queryFn: () =>
      api.get<Paginated<MemberProfile>>(`/admin/users${buildQuery({ search, page, limit: 12 })}`),
    placeholderData: (previous) => previous,
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

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string; deleted: boolean }>(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['public'] });
      toast.success('Anggota dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus anggota.'),
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

export type HeroPayload = {
  image1?: File | null;
  image2?: File | null;
  image3?: File | null;
  removeImage1?: boolean;
  removeImage2?: boolean;
  removeImage3?: boolean;
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

function toHeroForm(payload: HeroPayload): FormData {
  const form = new FormData();
  if (payload.image1) form.append('image1', payload.image1);
  if (payload.image2) form.append('image2', payload.image2);
  if (payload.image3) form.append('image3', payload.image3);
  if (payload.removeImage1) form.append('removeImage1', 'true');
  if (payload.removeImage2) form.append('removeImage2', 'true');
  if (payload.removeImage3) form.append('removeImage3', 'true');
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
    mutationFn: async (payload: AboutPayload) => {
      const image = payload.image
        ? await convertImageToWebp(payload.image, { maxSize: 1920 })
        : null;
      return api.patch<{ about: About }>('/admin/about', toAboutForm({ ...payload, image }));
    },
    onSuccess: () => {
      invalidateContent(queryClient);
      toast.success('Konten Tentang berhasil disimpan.');
    },
    onError: (error) => toastApiError(error, 'Gagal menyimpan konten Tentang.'),
  });
}

export function useSaveHero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: HeroPayload) => {
      const [image1, image2, image3] = await Promise.all([
        payload.image1 ? convertImageToWebp(payload.image1, { maxSize: 1920 }) : null,
        payload.image2 ? convertImageToWebp(payload.image2, { maxSize: 1920 }) : null,
        payload.image3 ? convertImageToWebp(payload.image3, { maxSize: 1920 }) : null,
      ]);
      return api.patch<{ hero: Hero }>(
        '/admin/hero',
        toHeroForm({ ...payload, image1, image2, image3 }),
      );
    },
    onSuccess: () => {
      invalidateContent(queryClient);
      toast.success('Gambar hero berhasil disimpan.');
    },
    onError: (error) => toastApiError(error, 'Gagal menyimpan gambar hero.'),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TeacherPayload) => {
      const photo = payload.photo ? await convertImageToWebp(payload.photo) : null;
      return api.post<{ teacher: Teacher }>(
        '/admin/teachers',
        toTeacherForm({ ...payload, photo }),
      );
    },
    onSuccess: () => {
      invalidateContent(queryClient);
      toast.success('Wali Kelas berhasil ditambahkan.');
    },
    onError: (error) => toastApiError(error, 'Gagal menambahkan wali kelas.'),
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: TeacherPayload }) => {
      const photo = payload.photo ? await convertImageToWebp(payload.photo) : null;
      return api.patch<{ teacher: Teacher }>(
        `/admin/teachers/${id}`,
        toTeacherForm({ ...payload, photo }),
      );
    },
    onSuccess: () => {
      invalidateContent(queryClient);
      toast.success('Wali Kelas berhasil diperbarui.');
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
      toast.success('Wali Kelas dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus wali kelas.'),
  });
}
