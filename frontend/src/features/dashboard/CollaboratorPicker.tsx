import { useEffect, useMemo, useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMembers } from '@/hooks/usePublic';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import type { CollaboratorUser } from '@/types/api';

type CollaboratorPickerProps = {
  open: boolean;
  onClose: () => void;
  selected: CollaboratorUser[];
  onChange: (next: CollaboratorUser[]) => void;
};

export function CollaboratorPicker({ open, onClose, selected, onChange }: CollaboratorPickerProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (open) return;
    setSearch('');
    setDebounced('');
  }, [open]);

  // Dialog ini bisa terbuka di atas modal lain; tangkap Escape dulu agar
  // hanya pemilih ini yang tertutup, bukan seluruh form project.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open, onClose]);

  const { data, isLoading } = useMembers(debounced, 1);

  const members = useMemo(
    () => (data?.items ?? []).filter((member) => member.id !== user?.id),
    [data?.items, user?.id],
  );

  const selectedIds = useMemo(() => new Set(selected.map((member) => member.id)), [selected]);

  const toggle = (member: CollaboratorUser) => {
    if (selectedIds.has(member.id)) {
      onChange(selected.filter((item) => item.id !== member.id));
    } else {
      onChange([...selected, member]);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pilih kolaborator"
      description="Project akan tampil di portofolio semua anggota yang dipilih."
      size="md"
      footer={<Button onClick={onClose}>Selesai</Button>}
    >
      <div className="space-y-4">
        {selected.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {selected.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => toggle(member)}
                  className="inline-flex items-center gap-2 rounded-sm border border-line-strong bg-subtle px-2.5 py-1 text-xs text-fg transition-colors hover:text-danger"
                  aria-label={`Hapus kolaborator ${member.name}`}
                >
                  {member.alias || member.name}
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <Input
          label="Cari anggota"
          placeholder="Nama atau headline…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="max-h-80 overflow-y-auto border border-line">
          {isLoading ? (
            <ul className="divide-y divide-line">
              {Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-9 w-9" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </li>
              ))}
            </ul>
          ) : members.length === 0 ? (
            <EmptyState
              title="Tidak ada anggota"
              description={
                debounced
                  ? `Tidak ada anggota yang cocok dengan “${debounced}”.`
                  : 'Belum ada anggota lain yang bisa ditambahkan.'
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {members.map((member) => {
                const isSelected = selectedIds.has(member.id);
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      onClick={() => toggle(member)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex w-full items-center gap-3 p-3 text-left transition-colors',
                        isSelected ? 'bg-subtle' : 'hover:bg-subtle',
                      )}
                    >
                      <Avatar name={member.name} src={member.avatarUrl} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-fg">
                          {member.name}
                          {member.alias ? (
                            <span className="ml-2 text-muted">@{member.alias}</span>
                          ) : null}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {member.headline || 'Anggota kelas'}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'grid h-5 w-5 shrink-0 place-items-center rounded-sm border',
                          isSelected
                            ? 'border-fg bg-fg text-bg'
                            : 'border-line-strong text-transparent',
                        )}
                      >
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
                          <path
                            d="M5 12.5l4 4 10-10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="text-xs text-muted">
          {selected.length > 0
            ? `${selected.length} kolaborator dipilih.`
            : 'Belum ada kolaborator dipilih. Project ini menjadi project pribadi.'}
        </p>
      </div>
    </Modal>
  );
}
