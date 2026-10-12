import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { RoleBadge, DevBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateTime } from '@/lib/utils';
import type { MemberProfile } from '@/types/api';
import { AdminUserDialog } from './AdminUserDialog';

export function UserRow({ user }: { user: MemberProfile }) {
  const [editOpen, setEditOpen] = useState(false);

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
          </div>
        </td>
      </tr>

      <AdminUserDialog open={editOpen} user={user} onClose={() => setEditOpen(false)} />
    </>
  );
}
