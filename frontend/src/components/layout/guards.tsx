import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/Skeleton';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="container-page py-20">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-3 w-96" />
        <Skeleton className="mt-10 h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

/** Wajib login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}

/** Khusus admin. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <AuthGate>
      {user?.role === 'admin' ? (
        <>{children}</>
      ) : (
        <div className="container-page py-20">
          <div className="mx-auto max-w-2xl border border-line">
            <EmptyState
              title="Akses ditolak"
              description="Hanya admin yang dapat membuka halaman ini."
              action={
                <a href="/" className={buttonClasses('outline')}>
                  Kembali ke beranda
                </a>
              }
            />
          </div>
        </div>
      )}
    </AuthGate>
  );
}

/** Sudah login → arahkan sesuai peran. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <>{children}</>;

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}
