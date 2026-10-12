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
            title="Kelas dalam angka"
            description="Direktori publik memutakhirkan jumlah anggota dan project yang tayang secara otomatis — tanpa perlu hitung manual."
          />
        </Reveal>

        <AnimatedRule className="mt-10" />

        <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <Reveal>
            <StatBlock value={isLoading ? undefined : data?.members} label="Anggota disetujui" />
          </Reveal>
          <Reveal delay={0.08}>
            <StatBlock value={isLoading ? undefined : data?.projects} label="Project tayang" />
          </Reveal>
          <Reveal delay={0.16} className="sm:col-span-2">
            <div className="flex h-full flex-col justify-between gap-8 bg-bg p-8">
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Hanya anggota yang sudah disetujui admin yang tampil di direktori publik. Project
                yang disembunyikan moderator tidak ikut tayang.
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

export function ClosingCta() {
  return (
    <section id="daftar" className="section-light paper border-b border-line">
      <div className="container-page py-24 lg:py-32">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="index-num">05</span>
            <span aria-hidden className="h-px w-6 bg-line-strong" />
            Khusus anggota
          </p>
          <h2 className="mt-6 max-w-4xl text-balance font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.03em]">
            Punya project yang <span className="italic text-accent">layak dipamerkan?</span>
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal delay={0.08}>
            <p className="max-w-xl text-base leading-relaxed text-muted">
              Masuk ke dashboard, lengkapi profil, lalu tambahkan project beserta gambarnya. Setelah
              tersimpan, halaman portofolio pribadimu langsung bisa dibagikan.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
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
      </div>
    </section>
  );
}
