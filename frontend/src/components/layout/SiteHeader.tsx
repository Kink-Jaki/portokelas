import { Link } from 'react-router-dom';

import { buttonClasses } from '@/components/ui/Button';
import { MobileSidebar } from './AppSidebar';
import { developerContact } from '@/lib/site';
import { cn } from '@/lib/utils';

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      className={cn('group flex items-center gap-3', className)}
      aria-label="Satu Kelas — beranda"
    >
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center border border-line-strong bg-invert font-display text-sm leading-none text-invert-fg transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg"
      >
        SK
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg tracking-tight">Satu Kelas</span>
        {!compact ? (
          <span className="mt-1 hidden font-mono text-[0.5625rem] uppercase tracking-[0.24em] text-muted sm:block">
            Portofolio Anggota
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/**
 * Header atas sengaja dikosongkan dari navigasi — seluruh navigasi kini
 * berada di sidebar (AppSidebar). Hanya menyisakan brand + pemicu drawer
 * untuk layar kecil.
 */
export function SiteHeader() {
  return (
    <header className="section-dark sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-3 lg:h-[4.75rem]">
        <MobileSidebar />
        <Logo />
      </div>
    </header>
  );
}

const footerNav = [
  { label: 'Beranda', to: '/' },
  { label: 'Direktori anggota', to: '/members' },
  { label: 'Masuk', to: '/login' },
];

const developerLinks = [
  { label: 'GitHub', href: developerContact.github },
  { label: 'Instagram', href: developerContact.instagram },
  { label: 'Website', href: developerContact.website },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="section-dark relative overflow-hidden border-t border-line">
      <div className="container-page relative z-10 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
              Kumpulan portofolio anggota kelas dalam satu etalase publik. Dibangun oleh dan untuk
              anggota — setiap karya punya halamannya sendiri.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/members" className={buttonClasses('primary', 'sm')}>
                Jelajahi direktori
              </Link>
              <Link to="/login" className={buttonClasses('outline', 'sm')}>
                Masuk
              </Link>
            </div>
          </div>

          <nav className="lg:col-span-3 lg:col-start-7" aria-label="Navigasi footer">
            <p className="eyebrow">Jelajahi</p>
            <ul className="mt-5 space-y-3">
              {footerNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="link-underline text-sm text-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="eyebrow">Kontak developer</p>
            <ul className="mt-5 space-y-3">
              {developerLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden>
                      <path
                        d="M8 16L16 8M9 8h7v7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
            © {year} · Satu Kelas
          </p>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
            Direktori publik · tanpa login
          </p>
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none absolute -bottom-4 left-0 select-none whitespace-nowrap font-display text-[clamp(4rem,17vw,13rem)] leading-[0.8] tracking-[-0.04em] text-fg/5"
      >
        Satu Kelas
      </p>
    </footer>
  );
}
