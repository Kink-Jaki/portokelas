import { Link } from 'react-router-dom';

import { Reveal, AnimatedRule } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { buttonClasses } from '@/components/ui/Button';
import { usePublicStats } from '@/hooks/usePublic';

function StatBlock({ value, label }: { value: number | undefined; label: string }) {
  return (
    <div className="flex h-full flex-col justify-between gap-6 bg-bg p-8">
      <p className="font-display text-5xl tabular-nums leading-none sm:text-6xl">
        {value === undefined ? '—' : value.toLocaleString('id-ID')}
      </p>
      <p className="eyebrow">{label}</p>
    </div>
  );
}

export function StatsSection() {
  const { data, isLoading } = usePublicStats();

  return (
    <section id="statistik" className="section-dark border-b border-line">
      <div className="container-page py-20 lg:py-28">
        <Reveal>
          <SectionHeader
            index="04"
            eyebrow="Statistik"
            title="Craftly dalam angka"
            description="Direktori publik memutakhirkan jumlah anggota dan project yang tayang secara otomatis — tanpa perlu hitung manual."
          />
        </Reveal>

        <AnimatedRule className="mt-10" />

        <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <Reveal>
            <StatBlock value={isLoading ? undefined : data?.members} label="Anggota" />
          </Reveal>
          <Reveal delay={0.08}>
            <StatBlock value={isLoading ? undefined : data?.projects} label="Project tayang" />
          </Reveal>
          <Reveal delay={0.16} className="sm:col-span-2">
            <div className="flex h-full flex-col justify-between gap-8 bg-bg p-8">
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Semua anggota tampil di direktori publik. Project yang disembunyikan moderator tidak
                ikut tayang.
              </p>
              <Link to="/login" className={buttonClasses('outline', 'sm', 'self-start')}>
                Masuk
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
