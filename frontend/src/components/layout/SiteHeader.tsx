import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';
import { buttonClasses } from '@/components/ui/Button';
import { MobileSidebar } from './AppSidebar';
import { developerContact } from '@/lib/site';
import { cn } from '@/lib/utils';

const landingSections = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Wali Kelas', href: '#wali-kelas' },
  { label: 'Anggota', href: '#anggota' },
  { label: 'Statistik', href: '#statistik' },
  { label: 'Memories', href: '#memories' },
];

/** Navigasi bagian halaman landing — dipindah dari panel indeks hero. */
function SectionNav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    const sections = landingSections
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        setActiveId(top ? top.target.id : null);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const syncIndicator = useCallback(() => {
    const nav = navRef.current;
    const el = activeId ? itemRefs.current.get(activeId) : null;

    if (!nav || !el) {
      setIndicator(null);
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicator({ left: elRect.left - navRect.left, width: elRect.width });
  }, [activeId]);

  useEffect(() => {
    syncIndicator();
    window.addEventListener('resize', syncIndicator);
    return () => window.removeEventListener('resize', syncIndicator);
  }, [syncIndicator]);

  return (
    <nav
      ref={navRef}
      className="relative hidden items-center gap-7 lg:flex"
      aria-label="Navigasi bagian halaman"
    >
      {landingSections.map((item) => {
        const isActive = activeId === item.href.slice(1);

        return (
          <a
            key={item.href}
            ref={(el) => {
              if (el) itemRefs.current.set(item.href.slice(1), el);
              else itemRefs.current.delete(item.href.slice(1));
            }}
            href={item.href}
            aria-current={isActive ? 'true' : undefined}
            className="group relative text-[0.9375rem] text-forest transition-colors duration-200 hover:text-burgundy"
          >
            {item.label}
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-burgundy transition-transform duration-300 group-hover:scale-x-100"
            />
          </a>
        );
      })}

      <span
        aria-hidden
        style={{
          transform: `translateX(${indicator?.left ?? 0}px)`,
          width: indicator?.width ?? 0,
        }}
        className={cn(
          'pointer-events-none absolute -bottom-1.5 left-0 h-px bg-burgundy transition-[transform,width,opacity] duration-300 ease-out',
          indicator ? 'opacity-100' : 'opacity-0',
        )}
      />
    </nav>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "relative text-[0.9375rem] transition-colors duration-200 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-burgundy after:content-[''] after:transition-transform after:duration-300",
    'text-forest hover:text-burgundy',
    isActive ? 'after:scale-x-100' : 'after:scale-x-0',
  );
}

export function Logo({
  className,
  compact = false,
  variant = 'default',
}: {
  className?: string;
  compact?: boolean;
  variant?: 'default' | 'editorial';
}) {
  const editorial = variant === 'editorial';

  return (
    <Link
      to="/"
      className={cn('group flex items-center gap-3', className)}
      aria-label="Satu Kelas — beranda"
    >
      <span
        aria-hidden
        className={cn(
          'grid shrink-0 place-items-center font-display leading-none transition-colors duration-300',
          editorial
            ? 'h-12 w-12 rounded-[3px] bg-forest text-lg text-ivory group-hover:bg-burgundy lg:h-14 lg:w-14 lg:text-xl'
            : 'h-9 w-9 border border-line-strong bg-invert text-sm text-invert-fg group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg',
        )}
      >
        SK
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display tracking-tight',
            editorial ? 'text-xl font-semibold text-forest lg:text-2xl' : 'text-lg',
          )}
        >
          Satu Kelas
        </span>
        {!compact ? (
          <span
            className={cn(
              'mt-1 hidden font-mono text-[0.5625rem] uppercase sm:block',
              editorial
                ? 'mt-1.5 text-[0.625rem] tracking-[0.3em] text-forest-soft'
                : 'tracking-[0.24em] text-muted',
            )}
          >
            Portofolio Anggota
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { user, isLoading } = useAuth();
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-line-warm bg-ivory/50 backdrop-blur-md">
      <div className="container-wide flex h-20 items-center justify-between gap-6 lg:h-[6.3rem]">
        <div className="flex items-center gap-3">
          <MobileSidebar sections={isLanding ? landingSections : undefined} />
          <Logo variant="editorial" />
        </div>

        <div className="flex items-center gap-8">
          {isLanding ? (
            <SectionNav />
          ) : user ? (
            <nav className="hidden items-center gap-8 md:flex" aria-label="Navigasi utama">
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
              {user.role === 'admin' ? (
                <NavLink to="/admin" className={navClass}>
                  Admin
                </NavLink>
              ) : null}
            </nav>
          ) : null}

          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-sm bg-ivory-alt" />
            ) : user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className={buttonClasses('forest', 'sm', 'hidden sm:inline-flex')}
              >
                {user.name.split(' ')[0]}
              </Link>
            ) : null}
          </div>
        </div>
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
    <footer className="section-maroon relative overflow-hidden border-t border-line">
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
