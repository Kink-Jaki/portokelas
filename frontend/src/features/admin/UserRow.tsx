import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { RoleBadge, DevBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useAdminDeleteUser } from '@/hooks/useApi';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import type { MemberProfile } from '@/types/api';
import { AdminUserDialog } from './AdminUserDialog';

export function UserRow({ user }: { user: MemberProfile }) {
  const { user: currentUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const deleteUser = useAdminDeleteUser();

  const isSelf = currentUser?.id === user.id;

  return (
    <>
      <tr className="border-b border-line align-top">
        <td className="px-4 py-4">
          <div className="flex items-start gap-3">
            <Avatar name={user.name} src={user.avatarUrl} size="sm" muted />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="min-w-0 truncate text-sm font-medium">{user.name}</span>
                {user.role === 'admin' ? (
                  <span className="shrink-0">
                    <DevBadge />
                  </span>
                ) : null}
              </div>
              <p className="truncate font-mono text-[0.6875rem] text-muted">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <RoleBadge role={user.role} />
        </td>
        <td className="hidden whitespace-nowrap px-4 py-4 font-mono text-[0.6875rem] text-muted md:table-cell">
          {formatDateTime(user.createdAt)}
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isSelf}
              title={isSelf ? 'Anda tidak dapat menghapus akun sendiri' : undefined}
              onClick={() => setPendingDelete(true)}
            >
              Hapus
            </Button>
          </div>
        </td>
      </tr>

      <AdminUserDialog open={editOpen} user={user} onClose={() => setEditOpen(false)} />

      <ConfirmDialog
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={() => deleteUser.mutate(user.id, { onSuccess: () => setPendingDelete(false) })}
        isLoading={deleteUser.isPending}
        title="Hapus anggota?"
        description={`Akun ${user.name} beserta seluruh project dan kenangannya akan dihapus permanen.`}
        confirmLabel="Hapus permanen"
      />
    </>
  );
}
