import { useState } from 'react';
import { motion } from 'framer-motion';

import { ContentPanel } from './ContentPanel';
import { AdminMemoriesPanel } from './AdminMemoriesPanel';
import { AdminNglPanel } from './AdminNglPanel';
import { ProjectModerationList } from './ProjectModeration';
import { UserRow } from './UserRow';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { AnimatedRule } from '@/components/ui/Reveal';
import { useAdminUsers } from '@/hooks/useApi';
import { fadeUp } from '@/lib/motion';
import { useAuth } from '@/providers/AuthProvider';

type Tab = 'users' | 'projects' | 'content' | 'memories' | 'ngl';

function UserManagement() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const usersQuery = useAdminUsers(search, page);

  const users = usersQuery.data?.items ?? [];
  const meta = usersQuery.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Cari nama, email, atau NIM…"
          aria-label="Cari anggota"
          className="w-full min-w-0 rounded-sm border border-line bg-bg py-2.5 pl-3.5 pr-3 text-sm placeholder:text-muted/70 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong md:max-w-xs"
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
          className="flex flex-wrap items-center justify-between gap-3"
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
  const [tab, setTab] = useState<Tab>('projects');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'projects', label: 'Moderasi project' },
    { id: 'users', label: 'Anggota' },
    { id: 'content', label: 'Landing page' },
    { id: 'memories', label: 'Kenangan' },
    { id: 'ngl', label: 'NGL' },
  ];

  return (
    <div className="container-page py-14">
      <motion.header
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="w-full min-w-0 max-w-2xl"
      >
        <p className="eyebrow">Panel admin</p>
        <h1 className="mt-4 break-words font-display text-[clamp(2rem,7vw,3rem)] leading-[1.15]">
          Moderasi Craftly.
        </h1>
        <p className="mt-4 max-w-full text-sm leading-relaxed text-muted">
          Kelola anggota dan perannya, moderasi project yang tayang, serta kelola konten landing
          page.
        </p>
      </motion.header>

      <AnimatedRule className="mt-10" />

      {/* Desktop: satu baris. Mobile (<540px): grid dua kolom agar tidak overflow. */}
      <div
        className="mt-8 grid w-full min-w-0 max-w-full grid-cols-2 gap-px border border-line bg-line min-[540px]:inline-flex min-[540px]:w-auto min-[540px]:max-w-none min-[540px]:gap-0 min-[540px]:bg-transparent"
        role="tablist"
        aria-label="Section admin"
      >
        {tabs.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            id={`admin-tab-${item.id}`}
            aria-controls={`admin-panel-${item.id}`}
            aria-selected={tab === item.id}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            className={`relative flex min-w-0 items-center justify-center whitespace-normal bg-bg px-5 py-3 text-center text-sm transition-colors duration-200 min-[540px]:min-w-max min-[540px]:bg-transparent min-[540px]:py-2.5 ${
              index === tabs.length - 1 ? 'col-span-2 min-[540px]:col-span-1' : ''
            } ${tab === item.id ? 'text-invert-fg' : 'text-muted hover:text-fg'}`}
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
        <p className="mt-6 break-all font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
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
        ) : tab === 'content' ? (
          <ContentPanel />
        ) : tab === 'memories' ? (
          <AdminMemoriesPanel />
        ) : (
          <AdminNglPanel />
        )}
      </div>
    </div>
  );
}
