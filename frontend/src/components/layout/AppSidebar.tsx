import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge, DevBadge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

type IconProps = { className?: string };

function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className={className} aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 20a5.5 5.5 0 0 1 11 0M16 11a3 3 0 1 0 0-6M17 14.5a5.5 5.5 0 0 1 3.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconUser({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconPortfolio({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className={className} aria-hidden>
      <path
        d="M4 7.5A1.5 1.5 0 0 1 5.5 6h4l1.5 2h7.5A1.5 1.5 0 0 1 20 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconGrid({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className={className} aria-hidden>
      <rect x="4" y="4" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="4" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="13" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconShield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className={className} aria-hidden>
      <path
        d="M12 4l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V7l7-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconLogout({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className={className} aria-hidden>
      <path
        d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M10 12h10m0 0-3-3m3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path
        d={collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

type NavItem = {
  key: string;
  to: string;
  label: string;
  icon: (props: IconProps) => ReactNode;
  end?: boolean;
};

const itemClass = (collapsed: boolean) =>
  ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center border-l-2 text-sm transition-colors duration-200',
      collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
      isActive
        ? 'border-fg bg-bg text-fg'
        : 'border-transparent text-muted hover:border-line-strong hover:bg-bg hover:text-fg',
    );

function SidebarNav({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const items: NavItem[] = [
    { key: 'home', to: '/', label: 'Beranda', icon: IconHome, end: true },
    { key: 'members', to: '/members', label: 'Kreator', icon: IconUsers },
  ];

  if (user) {
    items.push({ key: 'profile', to: '/profile', label: 'Profil', icon: IconUser });
  }
  if (user?.role === 'admin') {
    items.push({ key: 'admin', to: '/admin', label: 'Panel admin', icon: IconShield });
  } else if (user) {
    if (user.slug) {
      items.push({
        key: 'porto',
        to: `/m/${user.slug}`,
        label: 'My Porto',
        icon: IconPortfolio,
      });
    }
    items.push({
      key: 'dashboard',
      to: '/dashboard',
      label: 'Dashboard',
      icon: IconGrid,
      end: true,
    });
  }

  const linkClass = itemClass(collapsed);

  const renderLink = (item: NavItem) => (
    <NavLink
      key={item.key}
      to={item.to}
      end={item.end}
      className={linkClass}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
    >
      <item.icon />
      {collapsed ? null : item.label}
    </NavLink>
  );

  return (
    <div className="flex h-full flex-col justify-between gap-8">
      <div className="space-y-8">
        <div>
          {collapsed ? null : (
            <p className="px-3 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-muted">
              Jelajahi
            </p>
          )}
          <nav
            className={cn('space-y-0.5', collapsed ? 'mt-0' : 'mt-3')}
            aria-label="Navigasi sidebar"
          >
            {items.slice(0, 2).map(renderLink)}
          </nav>
        </div>

        {items.length > 2 ? (
          <div>
            {collapsed ? null : (
              <p className="px-3 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-muted">
                Akun saya
              </p>
            )}
            <nav
              className={cn('space-y-0.5', collapsed ? 'mt-0' : 'mt-3')}
              aria-label="Menu akun"
            >
              {items.slice(2).map(renderLink)}
            </nav>
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        {user ? (
          collapsed ? (
            <div
              className="flex justify-center border border-line bg-bg p-3"
              title={`${user.name} · ${user.email}`}
            >
              <Avatar name={user.name} src={user.avatarUrl} size="md" muted />
            </div>
          ) : (
            <div className="border border-line bg-bg p-4">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} src={user.avatarUrl} size="md" muted />
                <div className="min-w-0">
                  <p className="truncate text-sm">{user.name}</p>
                  <p className="truncate font-mono text-[0.625rem] text-muted">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <RoleBadge role={user.role} />
                {user.role === 'admin' ? <DevBadge /> : null}
              </div>
            </div>
          )
        ) : null}

        {user ? (
          <button
            type="button"
            title={collapsed ? 'Keluar' : undefined}
            aria-label={collapsed ? 'Keluar' : undefined}
            className={cn(
              buttonClasses('outline', 'sm'),
              collapsed ? 'w-full justify-center px-0' : 'w-full justify-center',
            )}
            onClick={() => {
              onNavigate?.();
              void logout().then(() => navigate('/', { replace: true }));
            }}
          >
            <IconLogout />
            {collapsed ? null : 'Keluar'}
          </button>
        ) : isLoading ? (
          <div className="h-9 w-full animate-pulse rounded-sm bg-bg" />
        ) : (
          <div className="grid gap-2">
            <Link
              to="/login"
              className={cn(buttonClasses('primary', 'sm'), 'justify-center')}
              onClick={onNavigate}
            >
              {collapsed ? <IconUser /> : 'Masuk'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/** Rail sidebar fixed di kiri layar — hanya tampil setelah login. */
export function AppSidebar({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside
      className={cn(
        'section-dark fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-subtle transition-[width] duration-300 ease-out lg:block',
        collapsed ? 'w-[4.75rem]' : 'w-64',
      )}
      aria-label="Sidebar aplikasi"
    >
      <div className="flex h-full flex-col">
        <div
          className={cn(
            'flex items-center border-b border-line',
            collapsed ? 'justify-center px-2 py-4' : 'justify-end px-5 py-4',
          )}
        >
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
            aria-expanded={!collapsed}
            className="grid h-9 w-9 place-items-center border border-line text-muted transition-colors duration-200 hover:border-line-strong hover:text-fg"
          >
            <CollapseIcon collapsed={collapsed} />
          </button>
        </div>
        <div
          className={cn(
            'h-full overflow-y-auto py-7',
            collapsed ? 'px-2' : 'px-5',
          )}
        >
          <SidebarNav collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}

/** Drawer navigasi untuk layar kecil, dipanggil dari header — hanya setelah login. */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;
  if (typeof document === 'undefined') return null;

  return (
    <>
      <button
        type="button"
        className={cn(buttonClasses('ghost', 'icon'), 'lg:hidden')}
        aria-label="Buka navigasi"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {createPortal(
        <AnimatePresence>
          {open ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                className="absolute inset-0 bg-fg/45 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Navigasi"
                className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col border-r border-line bg-subtle"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <span className="font-display text-base">Navigasi</span>
                  <button
                    type="button"
                    className={buttonClasses('ghost', 'icon')}
                    aria-label="Tutup navigasi"
                    onClick={() => setOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-6">
                  <SidebarNav onNavigate={() => setOpen(false)} />
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
