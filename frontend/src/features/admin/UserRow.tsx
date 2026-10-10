import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Field';
import { StatusBadge, RoleBadge, DevBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useUpdateUserStatus } from '@/hooks/useApi';
import { formatDateTime } from '@/lib/utils';
import type { MemberProfile, UserStatus } from '@/types/api';
import { AdminUserDialog } from './AdminUserDialog';

type ReasonDialogState = {
  open: boolean;
  user: MemberProfile | null;
  nextStatus: UserStatus;
};

export function UserRow({ user }: { user: MemberProfile }) {
  const updateStatus = useUpdateUserStatus();
  const [reasonDialog, setReasonDialog] = useState<ReasonDialogState>({
    open: false,
    user: null,
    nextStatus: 'rejected',
  });
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!reasonDialog.open) {
      setReason('');
      setReasonError(null);
    }
  }, [reasonDialog.open]);

  const act = (status: UserStatus, message?: string) =>
    updateStatus.mutate({ id: user.id, status, reason: message });

  const openReject = () => setReasonDialog({ open: true, user, nextStatus: 'rejected' });

  const submitReason = () => {
    if (!reasonDialog.user) return;
    if (reason.trim().length === 0) {
      setReasonError('Alasan wajib diisi.');
      return;
    }
    act(reasonDialog.nextStatus, reason.trim());
    setReasonDialog({ open: false, user: null, nextStatus: 'rejected' });
  };

  return (
    <>
      <tr className="border-b border-line align-top">
        <td className="px-4 py-4">
          <div className="flex items-start gap-3">
            <Avatar name={user.name} src={user.avatarUrl} size="sm" muted />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 truncate text-sm font-medium">
                {user.name}
                {user.role === 'admin' ? <DevBadge /> : null}
              </p>
              <p className="truncate font-mono text-[0.6875rem] text-muted">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <StatusBadge status={user.status} />
          <div className="mt-2">
            <RoleBadge role={user.role} />
          </div>
          {user.rejectionReason ? (
            <p className="mt-2 max-w-xs text-xs text-muted">Alasan: {user.rejectionReason}</p>
          ) : null}
        </td>
        <td className="hidden whitespace-nowrap px-4 py-4 font-mono text-[0.6875rem] text-muted md:table-cell">
          {formatDateTime(user.createdAt)}
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>

            {user.role === 'member' && user.status !== 'approved' ? (
              <Button
                size="sm"
                isLoading={updateStatus.isPending && updateStatus.variables?.id === user.id}
                onClick={() => act('approved')}
              >
                Setujui
              </Button>
            ) : null}

            {user.role === 'member' && user.status === 'pending' ? (
              <Button variant="outline" size="sm" onClick={openReject}>
                Tolak
              </Button>
            ) : null}

            {user.role === 'member' && user.status === 'approved' ? (
              <Button
                variant="outline"
                size="sm"
                isLoading={updateStatus.isPending && updateStatus.variables?.id === user.id}
                onClick={() => act('suspended')}
              >
                Nonaktifkan
              </Button>
            ) : null}

            {user.role === 'member' &&
            (user.status === 'suspended' || user.status === 'rejected') ? (
              <Button
                variant="outline"
                size="sm"
                isLoading={updateStatus.isPending && updateStatus.variables?.id === user.id}
                onClick={() => act('approved')}
              >
                Aktifkan
              </Button>
            ) : null}
          </div>
        </td>
      </tr>

      <Modal
        open={reasonDialog.open}
        onClose={() => setReasonDialog({ open: false, user: null, nextStatus: 'rejected' })}
        title="Tolak pendaftaran"
        description={`Alasan yang Anda tulis akan ditampilkan ke ${reasonDialog.user?.name ?? 'anggota'}.`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setReasonDialog({ open: false, user: null, nextStatus: 'rejected' })}
            >
              Batal
            </Button>
            <Button variant="danger" onClick={submitReason}>
              Tolak pendaftaran
            </Button>
          </>
        }
      >
        <Textarea
          label="Alasan penolakan"
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={reasonError ?? undefined}
          placeholder="Contoh: Data pendaftar tidak sesuai."
        />
      </Modal>

      <AdminUserDialog open={editOpen} user={user} onClose={() => setEditOpen(false)} />
    </>
  );
}
