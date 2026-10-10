import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
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

export function RootLayout() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();

  return (
    <div className={cn('flex min-h-screen flex-col', user && 'lg:pl-64')}>
      <ScrollToTop />
      {user ? <AppSidebar /> : null}
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
