import { Link } from 'react-router-dom';

import { AnimatedRule, Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMembers } from '@/hooks/usePublic';
import { ClassMemberCard } from './ClassMemberCard';

/* ------------------------------ Ikon kecil ------------------------------ */

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 1.5l2.3 8.2L22.5 12l-8.2 2.3L12 22.5l-2.3-8.2L1.5 12l8.2-2.3z" />
    </svg>
  );
}

/** Ranting botanical line-art — ornamen ringan di sudut section. */
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

/* --------------------------- Ornamen latar ------------------------------ */

function StructureOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Bentuk organik forest sangat transparan di kanan atas */}
      <span className="absolute -right-28 -top-20 h-72 w-72 rounded-[58%_42%_47%_53%/46%_56%_44%_54%] bg-forest/[0.06]" />

      {/* Lingkaran maroon lembut kiri bawah */}
      <span className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-maroon/[0.05]" />

      {/* Ranting botanical kiri bawah */}
      <BotanicalBranch className="absolute -bottom-8 -left-8 hidden h-36 w-36 -rotate-6 text-forest opacity-20 sm:block" />

      {/* Garis lengkung maroon tipis kanan bawah */}
      <svg
        viewBox="0 0 220 220"
        fill="none"
        className="absolute -bottom-6 -right-10 hidden h-44 w-44 text-maroon opacity-40 lg:block"
      >
        <path
          d="M8 150 C 72 166, 148 158, 212 92"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M6 202 C 96 212, 178 186, 216 124"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      <span className="absolute left-[4%] top-24 hidden h-3 w-3 text-forest/40 lg:block">
        <Sparkle />
      </span>
      <span className="absolute right-[6%] top-40 hidden h-3.5 w-3.5 text-maroon/45 lg:block">
        <Sparkle />
      </span>
    </div>
  );
}

/* ------------------------------- Header --------------------------------- */

function StructureHeader() {
  return (
    <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-10">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-forest sm:text-xs">
          <span className="tnum font-medium text-maroon">03</span>
          <span aria-hidden className="h-px w-10 bg-maroon/50" />
          <span>Struktur Organisasi Kelas</span>
        </p>

        <h2 className="mt-6 font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[3rem] lg:text-[3.5rem]">
          <span className="text-maroon">Anggota</span> <span className="text-forest">Kelas</span>
        </h2>

        <p className="mt-5 max-w-xl text-[0.9375rem] leading-[1.7] text-muted sm:text-base">
          Kenali orang-orang di balik karya dan kolaborasi kelas kami. Mereka adalah bagian penting
          dari perjalanan ini.
        </p>
      </div>

      <div className="shrink-0 self-start md:self-auto md:pb-2">
        <Link
          to="/members"
          className="group/link relative inline-flex items-center gap-2 text-[0.9375rem] font-medium text-forest transition-colors duration-200 hover:text-maroon"
        >
          <span className="relative">
            Lihat semua
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-maroon transition-transform duration-300 ease-out group-hover/link:scale-x-100 group-focus-visible/link:scale-x-100"
            />
          </span>
          <span className="text-maroon transition-transform duration-300 ease-out group-hover/link:translate-x-1 motion-reduce:transform-none">
            <ArrowIcon />
          </span>
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------ Skeleton -------------------------------- */

function ClassMemberSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-elevated p-5 sm:p-6">
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="mt-6 h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-1/3" />
      <Skeleton className="mt-5 h-3 w-full" />
      <Skeleton className="mt-2.5 h-3 w-4/5" />
      <Skeleton className="mt-2.5 h-3 w-3/5" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-[42px] w-full" />
        <Skeleton className="h-[42px] w-full" />
      </div>
    </div>
  );
}

function ClassMemberSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <ClassMemberSkeleton key={index} />
      ))}
    </div>
  );
}

/* -------------------------------- Section ------------------------------- */

export function StructureSection() {
  const { data, isLoading, isError, error, refetch } = useMembers('', 1);
  const members = data?.items ?? [];

  return (
    <section
      id="anggota"
      className="section-members paper relative isolate overflow-hidden border-b border-line"
    >
      <StructureOrnaments />

      <div className="container-page relative z-10 py-20 lg:py-28">
        <Reveal>
          <StructureHeader />
        </Reveal>

        <AnimatedRule className="mt-10 bg-line-strong/60" />

        <div className="mt-10 lg:mt-12">
          {isLoading ? (
            <ClassMemberSkeletonGrid />
          ) : isError ? (
            <div className="rounded-2xl border border-line bg-elevated">
              <EmptyState
                title="Gagal memuat anggota"
                description={error?.message}
                action={
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className={buttonClasses('outline', 'sm')}
                  >
                    Coba lagi
                  </button>
                }
              />
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-2xl border border-line bg-elevated">
              <EmptyState
                title="Belum ada anggota"
                description="Daftar anggota akan tampil setelah anggota pertama bergabung."
                action={
                  <Link to="/login" className={buttonClasses('primary', 'sm')}>
                    Masuk
                  </Link>
                }
              />
            </div>
          ) : (
            <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {members.slice(0, 8).map((member, index) => (
                <StaggerItem key={member.id} className="h-full">
                  <ClassMemberCard member={member} index={index + 1} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </section>
  );
}