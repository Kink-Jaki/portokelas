import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { AnimatedRule, Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { MemberDirectoryCard } from '@/components/domain/MemberDirectoryCard';
import { useLandingMembers } from '@/hooks/usePublic';
import { getLandingOrderSeed, orderLandingMembers } from '../lib/member-order';
import { LeafSprig, Sparkle } from './ornaments';

/** Jumlah card anggota yang tampil di landing. */
const LANDING_MEMBER_LIMIT = 8;

/* ------------------------------ Ikon kecil ------------------------------ */

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/* --------------------------- Ornamen latar ------------------------------ */

function StructureOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {/* Bentuk organik forest sangat transparan di kanan atas */}
      <span className="absolute -right-28 -top-20 h-72 w-72 rounded-[58%_42%_47%_53%/46%_56%_44%_54%] bg-forest/[0.06]" />

      {/* Lingkaran maroon lembut kiri bawah */}
      <span className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-maroon/[0.05]" />

      {/* Ranting botanical kiri bawah */}
      <LeafSprig className="absolute -bottom-8 -left-8 hidden h-36 w-36 -rotate-6 text-forest opacity-25 sm:block" />

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

      {/* Jembatan ke section Memories — menjulur melewati batas section agar
          dua section tampak bertaut, bukan terpotong garis lurus. */}
      <LeafSprig className="absolute -bottom-16 right-[10%] h-28 w-28 rotate-[24deg] text-maroon opacity-30 sm:-bottom-20 sm:h-36 sm:w-36" />
      <svg
        viewBox="0 0 400 120"
        fill="none"
        className="absolute -bottom-14 left-[6%] hidden h-24 w-72 text-sage opacity-60 sm:block"
      >
        <path
          d="M4 108C92 92 168 76 236 40 292 10 352 8 396 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="5 9"
        />
      </svg>
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
          <span>Direktori Anggota</span>
        </p>

        <h2 className="mt-6 font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[3rem] lg:text-[3.5rem]">
          <span className="text-maroon">Anggota</span> <span className="text-forest">Craftly</span>
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
    <div className="flex h-full flex-col rounded-2xl border border-line bg-elevated p-2 min-[360px]:p-2.5 min-[390px]:p-3 sm:p-6">
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
  );
}

function ClassMemberSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 min-[360px]:gap-2.5 min-[390px]:gap-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <ClassMemberSkeleton key={index} />
      ))}
    </div>
  );
}

/* -------------------------------- Section ------------------------------- */

export function StructureSection() {
  const { data, isLoading, isError, error, refetch } = useLandingMembers();
  const members = useMemo(() => data?.items ?? [], [data?.items]);

  /* Seed per sesi: card terisi diutamakan, sisanya diacak secara stabil. */
  const seed = useMemo(() => getLandingOrderSeed(), []);
  const orderedMembers = useMemo(
    () => orderLandingMembers(members, seed).slice(0, LANDING_MEMBER_LIMIT),
    [members, seed],
  );

  return (
    <section
      id="anggota"
      className="section-members relative isolate overflow-visible"
    >
      <StructureOrnaments />

      <div className="container-page section-pad relative z-10">
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
          ) : orderedMembers.length === 0 ? (
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
            <Stagger className="grid auto-rows-fr grid-cols-2 gap-2 min-[360px]:gap-2.5 min-[390px]:gap-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
              {orderedMembers.map((member, index) => (
                <StaggerItem key={member.id} className="h-full">
                  <MemberDirectoryCard member={member} index={index + 1} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </section>
  );
}