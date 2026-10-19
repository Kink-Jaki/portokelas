import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api, ApiError, buildQuery } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type {
  AdminNglMessage,
  AdminNglReport,
  NglInbox,
  NglReportStatus,
  NglSettings,
  NglSubmitPayload,
} from '@/types/api';

function toastApiError(error: unknown, fallback: string) {
  const message = error instanceof ApiError ? error.message : fallback;
  toast.error(message);
}

const INBOX_LIMIT = 12;

/* ------------------------------ Pengaturan ------------------------------ */

export function useNglSettings() {
  return useQuery({
    queryKey: queryKeys.nglSettings,
    queryFn: () => api.get<NglSettings>('/settings/ngl'),
    staleTime: 60_000,
  });
}

export function useToggleNglEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      api.patch<NglSettings>('/admin/settings/ngl', { enabled }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.nglSettings, data);
      toast.success(data.enabled ? 'Fitur NGL diaktifkan.' : 'Fitur NGL dinonaktifkan.');
    },
    onError: (error) => toastApiError(error, 'Gagal mengubah status fitur NGL.'),
  });
}

/* -------------------------------- Kiriman -------------------------------- */

export function useSubmitNglMessage() {
  return useMutation({
    mutationFn: async (payload: NglSubmitPayload) => {
      const form = new FormData();
      if (payload.content?.trim()) form.append('content', payload.content.trim());
      if (payload.spotify?.trim()) form.append('spotify', payload.spotify.trim());
      if (payload.image) form.append('image', payload.image);
      if (payload.website) form.append('website', payload.website);
      return api.post<{ received: boolean; message: { id: string } }>('/ngl', form);
    },
    onError: (error) => toastApiError(error, 'Gagal mengirim pesan. Coba lagi.'),
  });
}

/* --------------------------------- Kotak --------------------------------- */

export function useNglInbox(page: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.nglInbox(page),
    queryFn: () =>
      api.get<NglInbox>(`/ngl/messages${buildQuery({ page, limit: INBOX_LIMIT })}`),
    placeholderData: (previous) => previous,
    enabled,
  });
}

export function useMarkNglRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ id: string; read: boolean }>(`/ngl/messages/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngl', 'messages'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.nglUnread });
    },
  });
}

/** Kembalikan pesan ke status belum dibaca. */
export function useMarkNglUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ id: string; read: boolean }>(`/ngl/messages/${id}/unread`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngl', 'messages'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.nglUnread });
    },
    onError: (error) => toastApiError(error, 'Gagal menandai pesan.'),
  });
}

/**
 * Jumlah pesan belum dibaca untuk badge sidebar "Kotak NGL".
 * Fitur nonaktif (503) atau belum login dianggap tanpa badge — tanpa retry.
 */
export function useNglUnreadCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.nglUnread,
    queryFn: () => api.get<{ count: number }>('/ngl/messages/unread-count'),
    enabled,
    staleTime: 15_000,
    refetchInterval: 60_000,
    retry: false,
  });
}

export function useReportNglMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
      note,
    }: {
      id: string;
      reason: string;
      note?: string | null;
    }) =>
      api.post<{ id: string; reported: boolean; reportCount: number; hidden: boolean }>(
        `/ngl/messages/${id}/report`,
        { reason, note: note ?? undefined },
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ngl', 'messages'] });
      toast.success(
        data.hidden
          ? 'Laporan terkirim. Pesan ini otomatis disembunyikan.'
          : 'Laporan terkirim. Terima kasih.',
      );
    },
    onError: (error) => toastApiError(error, 'Gagal mengirim laporan.'),
  });
}

/* --------------------------------- Admin --------------------------------- */

export function useAdminNglMessages(page: number) {
  return useQuery({
    queryKey: queryKeys.adminNglMessages(page),
    queryFn: () =>
      api.get<{ items: AdminNglMessage[]; meta: NglInbox['meta'] }>(
        `/admin/ngl/messages${buildQuery({ page, limit: 24 })}`,
      ),
    placeholderData: (previous) => previous,
  });
}

export function useAdminDeleteNglMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ id: string; deleted: boolean }>(`/admin/ngl/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ngl'] });
      queryClient.invalidateQueries({ queryKey: ['ngl', 'messages'] });
      toast.success('Pesan NGL dihapus.');
    },
    onError: (error) => toastApiError(error, 'Gagal menghapus pesan.'),
  });
}

export function useAdminNglReports() {
  return useQuery({
    queryKey: queryKeys.adminNglReports,
    queryFn: () => api.get<{ reports: AdminNglReport[] }>('/admin/ngl/reports'),
  });
}

export function useUpdateNglReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: NglReportStatus }) =>
      api.patch<{ id: string; status: NglReportStatus }>(`/admin/ngl/reports/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminNglReports });
      toast.success('Status laporan diperbarui.');
    },
    onError: (error) => toastApiError(error, 'Gagal memperbarui status laporan.'),
  });
}
