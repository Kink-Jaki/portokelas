import { Link } from 'react-router-dom';

import { Reveal } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { usePublicStats } from '@/hooks/usePublic';

function StatBlock({ value, label }: { value: number | undefined; label: string }) {
  return (
    <div className="border-l border-line pl-5">
      <p className="font-display text-4xl tabular-nums sm:text-5xl">
        {value === undefined ? '—' : value.toLocaleString('id-ID')}
      </p>
      <p className="eyebrow mt-2">{label}</p>
    </div>
  );
}

export function StatsSection() {
  const { data, isLoading } = usePublicStats();

  return (
    <section className="section-dark border-b border-line">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal>
          <StatBlock value={isLoading ? undefined : data?.members} label="Anggota disetujui" />
        </Reveal>
        <Reveal delay={0.08}>
          <StatBlock value={isLoading ? undefined : data?.projects} label="Project tayang" />
        </Reveal>
        <Reveal delay={0.16} className="sm:col-span-2">
          <div className="flex h-full flex-col justify-between gap-6 border border-line p-6">
            <p className="max-w-md text-sm leading-relaxed text-muted">
              Hanya anggota yang sudah disetujui admin yang tampil di direktori publik. Project yang
              disembunyikan moderator tidak ikut tayang.
            </p>
            <Link to="/login" className={buttonClasses('outline', 'sm', 'self-start')}>
              Masuk
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className="section-light border-b border-line" id="daftar">
      <div className="container-page flex flex-col items-start justify-between gap-8 py-20 lg:flex-row lg:items-center">
        <Reveal>
          <p className="eyebrow">Khusus anggota</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] sm:text-5xl">
            Punya project yang layak dipamerkan?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className={buttonClasses('primary', 'lg')}>
              Masuk
            </Link>
            <Link to="/members" className={buttonClasses('outline', 'lg')}>
              Lihat anggota
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
