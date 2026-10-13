import { Link } from 'react-router-dom';

import { MemberCard } from '@/components/domain/MemberCard';
import { AnimatedRule, Reveal, Stagger } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMembers } from '@/hooks/usePublic';

export function StructureSection() {
  const { data, isLoading, isError, error, refetch } = useMembers('', 1);
  const members = data?.items ?? [];

  return (
    <section id="kreator" className="section-light paper border-b border-line">
      <div className="container-page py-20 lg:py-28">
        <Reveal>
          <SectionHeader
            index="03"
            eyebrow="Direktori Kreator"
            title="Kreator"
            description="Klik kartu untuk membuka portofolio kreator. Tombol Instagram dan GitHub langsung menuju media sosial masing-masing."
            action={
              <Link to="/members" className={buttonClasses('ghost', 'sm')}>
                Lihat semua
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </Link>
            }
          />
        </Reveal>

        <AnimatedRule className="mt-10" />

        <div className="mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-6 bg-bg p-7">
                  <Skeleton className="h-20 w-20" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="border border-line">
              <EmptyState
                title="Gagal memuat kreator"
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
            <div className="border border-line">
              <EmptyState
                title="Belum ada kreator"
                description="Daftar kreator akan tampil setelah kreator pertama bergabung."
                action={
                  <Link to="/login" className={buttonClasses('primary', 'sm')}>
                    Masuk
                  </Link>
                }
              />
            </div>
          ) : (
            <Stagger className="grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index + 1} />
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </section>
  );
}
