import { motion } from 'framer-motion';
import { useDeferredValue, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { MemberDirectoryCard } from '@/components/domain/MemberDirectoryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { buttonClasses } from '@/components/ui/Button';
import { AnimatedRule, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { useMembers } from '@/hooks/usePublic';
import { fadeUp } from '@/lib/motion';
import { Skeleton } from '@/components/ui/Skeleton';

function BotanicalBranch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 108 C 46 92, 78 70, 102 34" strokeWidth="1.4" />
      <g strokeWidth="1.1">
        <g transform="translate(26 94) rotate(-38)">
          <path d="M0 0c-8 9-6 24 0 32 6-8 8-23 0-32Z" />
          <path d="M0 4v26" />
        </g>
        <g transform="translate(48 78) rotate(24)">
          <path d="M0 0c-7 8-5 21 0 28 5-7 7-20 0-28Z" />
          <path d="M0 3v23" />
        </g>
        <g transform="translate(66 58) rotate(-30)">
          <path d="M0 0c-7 8-5 21 0 28 5-7 7-20 0-28Z" />
          <path d="M0 3v23" />
        </g>
        <g transform="translate(84 42) rotate(18)">
          <path d="M0 0c-5 6-4 16 0 21 4-5 5-15 0-21Z" />
          <path d="M0 2v17" />
        </g>
        <g transform="translate(98 28) rotate(-12)">
          <path d="M0 0c-4 5-3 13 0 17 3-4 4-12 0-17Z" />
          <path d="M0 2v13" />
        </g>
      </g>
    </svg>
  );
}

function MembersOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <span className="absolute -right-24 -top-16 h-72 w-72 rounded-[58%_42%_47%_53%/46%_56%_44%_54%] bg-forest/[0.05]" />
      <span className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-maroon/[0.05]" />
      <BotanicalBranch className="absolute -bottom-8 -left-8 hidden h-32 w-32 -rotate-6 text-forest opacity-20 md:block" />
    </div>
  );
}

function MemberSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 min-[360px]:gap-2.5 min-[390px]:gap-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="flex h-full flex-col rounded-2xl border border-line bg-elevated p-2 min-[360px]:p-2.5 min-[390px]:p-3 sm:p-6">
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="mt-6 h-5 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/3" />
          <Skeleton className="mt-5 h-3 w-full" />
          <Skeleton className="mt-2.5 h-3 w-4/5" />
          <Skeleton className="mt-2.5 h-3 w-3/5" />
          <div className="mt-auto flex gap-1.5 pt-5 sm:gap-3">
            <Skeleton className="h-8 w-full sm:h-[42px]" />
            <Skeleton className="h-8 w-full sm:h-[42px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <section className="section-members paper relative isolate overflow-hidden">
      <MembersOrnaments />
      <div className="container-page relative z-10 py-16 lg:py-20">
        <motion.header variants={fadeUp} initial="hidden" animate="show">
          <div className="flex flex-col-reverse gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-forest sm:text-xs">
                <span className="tnum font-medium text-maroon">00</span>
                <span aria-hidden className="h-px w-10 bg-maroon/50" />
                <span>Direktori Anggota</span>
              </p>
              <h1 className="mt-6 font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[3rem] lg:text-[3.5rem]">
                <span className="text-maroon">Anggota</span> <span className="text-forest">Craftly</span>
              </h1>
              <p className="mt-5 max-w-xl text-[0.9375rem] leading-[1.7] text-muted sm:text-base">
                Hanya anggota yang sudah dikurasi yang ditampilkan di sini. Klik kartu untuk membuka portofolio pribadi beserta project-nya.
              </p>
            </div>

            {/* Card maroon — mobile: di atas teks; desktop: samping kanan teks */}
            <Link
              to="/"
              className="group/self inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-burgundy bg-burgundy px-4 py-2.5 text-ivory-warm shadow-[0_14px_26px_-20px_rgba(122,36,53,0.75)] transition-colors duration-200 hover:border-burgundy-dark hover:bg-burgundy-dark md:mt-2"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
                <path
                  d="M19 12H5M11 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="transition-transform duration-200 group-hover/self:-translate-x-0.5"
                />
              </svg>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em]">
                Kembali ke beranda
              </span>
            </Link>
          </div>
        </motion.header>

        <AnimatedRule className="mt-10 bg-line-strong/60" />

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
              aria-label="Cari anggota"
              className="w-full rounded-xl border border-line bg-elevated py-2.5 pl-10 pr-9 text-sm placeholder:text-muted/70 transition-colors duration-200 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/20"
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
            <MemberSkeletonGrid />
          ) : isError ? (
            <div className="rounded-2xl border border-line bg-elevated">
              <ErrorState error={error} onRetry={() => void refetch()} />
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-2xl border border-line bg-elevated">
              <EmptyState
                title={search ? 'Tidak ada anggota yang cocok' : 'Belum ada anggota'}
                description={
                  search
                    ? `Tidak ditemukan anggota dengan kata kunci “${search}”.`
                    : 'Direktori akan terisi setelah anggota pertama bergabung.'
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
            <Stagger className="grid auto-rows-fr grid-cols-2 gap-2 min-[360px]:gap-2.5 min-[390px]:gap-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
              {members.map((member, index) => (
                <StaggerItem key={member.id} className="h-full">
                  <MemberDirectoryCard member={member} index={index + 1} />
                </StaggerItem>
              ))}
            </Stagger>
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
    </section>
  );
}