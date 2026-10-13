import { motion } from 'framer-motion';
import { useDeferredValue, useEffect, useState } from 'react';

import { MemberCardGrid } from '@/components/domain/MemberCard';
import { CardSkeletonGrid } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { buttonClasses } from '@/components/ui/Button';
import { AnimatedRule } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
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
    <div className="container-page py-16 lg:py-20">
      <motion.header variants={fadeUp} initial="hidden" animate="show">
        <SectionHeader
          as="h1"
          index="0"
          eyebrow="Direktori"
          title="Kreator"
          description="Hanya kreator yang sudah dikurasi yang ditampilkan di sini. Klik kartu untuk membuka portofolio pribadi beserta project-nya."
        />
      </motion.header>

      <AnimatedRule className="mt-10" />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            aria-hidden
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Cari nama atau headline…"
            aria-label="Cari kreator"
            className="w-full rounded-sm border border-line bg-bg py-2.5 pl-10 pr-9 text-sm placeholder:text-muted/70 transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
          {isFetching ? 'Memuat…' : `${meta?.total ?? 0} kreator`}
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
              title={search ? 'Tidak ada kreator yang cocok' : 'Belum ada kreator'}
              description={
                search
                  ? `Tidak ditemukan kreator dengan kata kunci “${search}”.`
                  : 'Direktori akan terisi setelah kreator pertama bergabung.'
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
