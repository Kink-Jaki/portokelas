import { motion } from 'framer-motion';
import { useDeferredValue, useEffect, useState } from 'react';

import { MemberCardGrid } from '@/components/domain/MemberCard';
import { CardSkeletonGrid } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { buttonClasses } from '@/components/ui/Button';
import { AnimatedRule } from '@/components/ui/Reveal';
import { useMembers } from '@/hooks/usePublic';
import { fadeUp } from '@/lib/motion';

export default function MembersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(searchInput);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(deferredSearch.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [deferredSearch]);

  const { data, isLoading, isError, error, refetch, isFetching } = useMembers(search, page);
  const members = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="container-page py-16">
      <motion.header variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
        <p className="eyebrow">Direktori</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">Anggota kelas</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Hanya anggota yang sudah disetujui admin yang ditampilkan di sini. Klik nama untuk membuka
          portofolio pribadi beserta project-nya.
        </p>
      </motion.header>

      <AnimatedRule className="mt-10" />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Cari nama atau headline…"
            aria-label="Cari anggota"
            className="w-full rounded-sm border border-line bg-bg py-2.5 pl-3.5 pr-9 text-sm placeholder:text-muted/70 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Bersihkan pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-fg"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          ) : null}
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {isFetching ? 'Memuat…' : `${meta?.total ?? 0} anggota`}
        </p>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <CardSkeletonGrid count={6} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : members.length === 0 ? (
          <div className="border border-line">
            <EmptyState
              title={search ? 'Tidak ada anggota yang cocok' : 'Belum ada anggota'}
              description={
                search
                  ? `Tidak ditemukan anggota dengan kata kunci “${search}”.`
                  : 'Direktori akan terisi setelah admin menyetujui pendaftar pertama.'
              }
              action={
                search ? (
                  <button
                    type="button"
                    className={buttonClasses('outline')}
                    onClick={() => setSearchInput('')}
                  >
                    Reset pencarian
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <MemberCardGrid members={members} />
        )}
      </div>

      {meta && meta.totalPages > 1 ? (
        <nav
          className="mt-10 flex items-center justify-between gap-4"
          aria-label="Navigasi halaman"
        >
          <button
            type="button"
            className={buttonClasses('outline', 'sm')}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={meta.page <= 1}
          >
            Sebelumnya
          </button>
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            Halaman {meta.page} / {meta.totalPages}
          </span>
          <button
            type="button"
            className={buttonClasses('outline', 'sm')}
            onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
            disabled={meta.page >= meta.totalPages}
          >
            Berikutnya
          </button>
        </nav>
      ) : null}
    </div>
  );
}
