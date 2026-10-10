import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';
import { buttonClasses } from '@/components/ui/Button';
import { MobileSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'relative text-sm transition-colors duration-200 hover:text-fg',
    isActive ? 'text-fg' : 'text-muted',
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn('group flex items-baseline gap-2', className)}
      aria-label="Satu Kelas"
    >
      <span className="font-display text-xl leading-none tracking-tight">Satu</span>
      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-muted transition-colors group-hover:text-fg">
        Kelas
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { user, isLoading } = useAuth();

  return (
    <header className="section-dark sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <Logo />
        </div>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigasi utama">
          <NavLink to="/members" className={navClass}>
            Anggota
          </NavLink>
          {user ? (
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          ) : null}
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-sm bg-subtle" />
          ) : user ? (
            <Link
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className={buttonClasses('outline', 'sm', 'hidden sm:inline-flex')}
            >
              {user.name.split(' ')[0]}
            </Link>
          ) : (
            <>
              <Link to="/login" className={buttonClasses('ghost', 'sm', 'hidden sm:inline-flex')}>
                Masuk
              </Link>
              <Link to="/login" className={buttonClasses('primary', 'sm')}>
                Masuk
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-display text-lg">Satu Kelas</p>
          <p className="text-xs text-muted">
            Kumpulan portofolio anggota kelas. Dibangun oleh dan untuk anggota.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-xs text-muted sm:items-end">
          <div className="flex gap-5">
            <Link to="/members" className="transition-colors hover:text-fg">
              Direktori Anggota
            </Link>
            <Link to="/login" className="transition-colors hover:text-fg">
              Masuk
            </Link>
          </div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em]">
            © {new Date().getFullYear()} · Satu Kelas
          </p>
        </div>
      </div>
    </footer>
  );
}