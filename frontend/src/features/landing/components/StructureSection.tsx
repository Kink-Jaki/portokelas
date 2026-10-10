import { Link, useNavigate } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { DevBadge } from '@/components/ui/Badge';
import { AnimatedRule, Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMembers } from '@/hooks/usePublic';
import type { PublicUser } from '@/types/api';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function SocialButton({
  label,
  href,
  icon,
}: {
  label: string;
  href: string | null;
  icon: React.ReactNode;
}) {
  if (!href) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label={`${label} tidak tersedia`}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-8 cursor-not-allowed items-center gap-2 rounded-sm border border-line px-3 text-xs text-muted opacity-40"
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(event) => event.stopPropagation()}
      className="inline-flex h-8 items-center gap-2 rounded-sm border border-line px-3 text-xs text-muted transition-colors duration-200 hover:border-line-strong hover:text-fg"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

type SocialLink = {
  key: string;
  label: string;
  href: string | null;
  icon: React.ReactElement;
};

function MemberCard({ member, dark = false }: { member: PublicUser; dark?: boolean }) {
  const navigate = useNavigate();

  const socials: SocialLink[] = [
    { key: 'instagram', label: 'Instagram', href: member.instagramUrl, icon: <InstagramIcon /> },
    { key: 'github', label: 'GitHub', href: member.githubUrl, icon: <GitHubIcon /> },
  ];

  return (
    <StaggerItem className="h-full">
      <div
        onClick={() => navigate(`/m/${member.slug}`)}
        className={`group flex h-full cursor-pointer flex-col border border-line bg-bg p-5 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)] sm:p-6 ${dark ? 'card-black' : ''}`}
      >
        <Avatar
          name={member.name}
          src={member.avatarUrl}
          size="lg"
          muted
          className="transition-all duration-500 group-hover:grayscale-0 group-hover:border-line-strong"
        />

        <div className="mt-5 min-w-0 flex-1">
          <Link
            to={`/m/${member.slug}`}
            onClick={(event) => event.stopPropagation()}
            className="flex items-center gap-2"
          >
            <h3 className="truncate font-display text-lg leading-snug transition-colors duration-200 group-hover:text-fg">
              {member.name}
            </h3>
            {member.role === 'admin' ? <DevBadge /> : null}
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
          {socials.map((social) => (
            <SocialButton
              key={social.key}
              label={social.label}
              href={social.href}
              icon={social.icon}
            />
          ))}
        </div>
      </div>
    </StaggerItem>
  );
}

export function StructureSection() {
  const { data, isLoading, isError, error, refetch } = useMembers('', 1);
  const members = data?.items ?? [];

  return (
    <section className="section-light border-b border-line" id="anggota">
      <div className="container-page py-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Struktur Organisasi Kelas</p>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl">Anggota Kelas</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
                Klik kartu untuk membuka portofolio anggota. Tombol Instagram dan GitHub langsung
                menuju media sosial masing-masing.
              </p>
            </div>
            <Link to="/members" className={buttonClasses('ghost', 'sm')}>
              Lihat semua
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Link>
          </div>
        </Reveal>

        <AnimatedRule className="mt-8" />

        <div className="mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-5 border border-line p-6">
                  <Skeleton className="h-20 w-20 shrink-0" />
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
            <div className="border border-line">
              <EmptyState
                title="Belum ada anggota"
                description="Daftar anggota akan tampil setelah admin menyetujui pendaftaran pertama."
                action={
                  <Link to="/login" className={buttonClasses('primary', 'sm')}>
                    Masuk
                  </Link>
                }
              />
            </div>
          ) : (
            <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member, index) => {
                const dark = (Math.floor(index / 4) + (index % 4)) % 2 === 1;
                return <MemberCard key={member.id} member={member} dark={dark} />;
              })}
            </Stagger>
          )}
        </div>
      </div>
    </section>
  );
}
