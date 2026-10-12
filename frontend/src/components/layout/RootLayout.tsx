import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { SiteFooter, SiteHeader } from './SiteHeader';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { pageVariants } from '@/lib/motion';

/** Kembalikan posisi scroll ke atas saat route berubah (kecuali kembali). */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}

const SIDEBAR_KEY = 'sk:sidebar-collapsed';

export function RootLayout() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_KEY) === '1';
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
      } catch {
        /* abaikan bila storage tidak tersedia */
      }
      return next;
    });
  }, []);

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col transition-[padding] duration-300 ease-out',
        user && (sidebarCollapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-64'),
      )}
    >
      <ScrollToTop />
      {user ? <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} /> : null}
      <SiteHeader />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={reduceMotion ? undefined : pageVariants}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </div>
  );
}
