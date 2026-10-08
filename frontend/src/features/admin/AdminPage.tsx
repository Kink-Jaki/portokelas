import { useState } from 'react';
import { motion } from 'framer-motion';

import { ContentPanel } from './ContentPanel';
import { ProjectModerationList } from './ProjectModeration';
import { UserRow } from './UserRow';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { AnimatedRule } from '@/components/ui/Reveal';
import { useAdminUsers, useAdminUsersSummary } from '@/hooks/useApi';
import { fadeUp } from '@/lib/motion';
import { useAuth } from '@/providers/AuthProvider';

type Tab = 'users' | 'projects' | 'content';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: 'pending', label: 'Menunggu' },
  { id: 'approved', label: 'Disetujui' },
  { id: 'rejected', label: 'Ditolak' },
  { id: 'suspended', label: 'Dinonaktifkan' },
  { id: 'all', label: 'Semua' },
];

function UserManagement() {
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const summaryQuery = useAdminUsersSummary();
  const usersQuery = useAdminUsers(status, search, page);

  const users = usersQuery.data?.items ?? [];
  const meta = usersQuery.data?.meta;
  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const count = summary?.[filter.id];
            const active = status === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => {
                  setStatus(filter.id);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs transition-colors duration-200 ${
                  active
                    ? 'border-invert bg-invert text-invert-fg'
                    : 'border-line text-muted hover:border-line-strong hover:text-fg'
                }`}
              >
                {filter.label}
                {count !== undefined ? (
                  <span className="font-mono text-[0.6875rem] tabular-nums opacity-80">
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Cari nama, email, atau NIM…"
          aria-label="Cari anggota"
          className="w-full rounded-sm border border-line bg-bg py-2.5 pl-3.5 pr-3 text-sm placeholder:text-muted/70 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong lg:max-w-xs"
        />
      </div>

      {usersQuery.isLoading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : usersQuery.isError ? (
        <div className="border border-line">
          <EmptyState
            title="Gagal memuat data anggota"
            description={usersQuery.error?.message}
            action={
              <Button variant="outline" onClick={() => void usersQuery.refetch()}>
                Coba lagi
              </Button>
            }
          />
        </div>
      ) : users.length === 0 ? (
        <div className="border border-line">
          <EmptyState title="Tidak ada anggota" description="Belum ada anggota pada filter ini." />
        </div>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[46rem] border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-3 text-left font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                  Anggota
                </th>
                <th className="px-4 py-3 text-left font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted md:table-cell">
                  Terdaftar
                </th>
                <th className="px-4 py-3 text-right font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <nav
          className="flex items-center justify-between gap-4"
          aria-label="Navigasi halaman anggota"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={meta.page <= 1}
          >
            Sebelumnya
          </Button>
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            Halaman {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
            disabled={meta.page >= meta.totalPages}
          >
            Berikutnya
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'users', label: 'Pendaftar' },
    { id: 'projects', label: 'Moderasi project' },
    { id: 'content', label: 'Konten landing' },
  ];

  return (
    <div className="container-page py-14">
      <motion.header variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
        <p className="eyebrow">Panel admin</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          Verifikasi anggota.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Setujui pendaftaran agar portofolio anggota tampil publik, tolak dengan alasan bila perlu,
          nonaktifkan akun, serta moderasi project yang tidak pantas.
        </p>
      </motion.header>

      <AnimatedRule className="mt-10" />

      <div
        className="mt-8 inline-flex border border-line"
        role="tablist"
        aria-label="Section admin"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            id={`admin-tab-${item.id}`}
            aria-controls={`admin-panel-${item.id}`}
            aria-selected={tab === item.id}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            className={`relative px-5 py-2.5 text-sm transition-colors duration-200 ${
              tab === item.id ? 'text-invert-fg' : 'text-muted hover:text-fg'
            }`}
          >
            {tab === item.id ? (
              <motion.span
                layoutId="admin-tab"
                className="absolute inset-0 bg-invert"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </div>

      {user ? (
        <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
          Masuk sebagai {user.email}
        </p>
      ) : null}

      <div
        className="mt-8"
        role="tabpanel"
        id={`admin-panel-${tab}`}
        aria-labelledby={`admin-tab-${tab}`}
      >
        {tab === 'users' ? (
          <UserManagement />
        ) : tab === 'projects' ? (
          <ProjectModerationList />
        ) : (
          <ContentPanel />
        )}
      </div>
    </div>
  );
}
