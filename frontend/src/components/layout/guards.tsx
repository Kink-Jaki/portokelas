import type { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/Skeleton';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { UserStatus } from '@/types/api';

function LogoutLink() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={buttonClasses('outline')}
      onClick={() => {
        void logout().then(() => navigate('/login', { replace: true }));
      }}
    >
      Keluar
    </button>
  );
}

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

/** Wajib login (status apa pun). */
export function RequireAuth({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}

const statusCopy: Record<UserStatus, { title: string; description: string }> = {
  pending: {
    title: 'Menunggu konfirmasi admin',
    description:
      'Pendaftaran Anda sudah kami terima dan sedang ditinjau admin. Portofolio Anda tampil publik setelah disetujui.',
  },
  rejected: {
    title: 'Pendaftaran ditolak',
    description:
      'Pendaftaran Anda tidak disetujui. Silakan hubungi admin kelas bila ada yang perlu diperbaiki.',
  },
  suspended: {
    title: 'Akun dinonaktifkan',
    description:
      'Akun Anda dinonaktifkan oleh admin. Hubungi admin kelas untuk mengaktifkan kembali.',
  },
  approved: {
    title: 'Akses tidak tersedia',
    description: 'Akun Anda tidak dapat mengakses halaman ini.',
  },
};

/** Wajib login DAN berstatus approved. */
export function RequireApproved({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const status = (user?.status ?? 'approved') as UserStatus;
  const copy = statusCopy[status];

  return (
    <AuthGate>
      {user && user.status !== 'approved' ? (
        <div className="container-page py-20">
          <div className="mx-auto max-w-2xl border border-line">
            <EmptyState
              title={copy.title}
              description={
                user.status === 'rejected' && user.rejectionReason
                  ? `${copy.description} Alasan: ${user.rejectionReason}`
                  : copy.description
              }
              action={<LogoutLink />}
            />
          </div>
        </div>
      ) : (
        children
      )}
    </AuthGate>
  );
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
              description="Hanya admin kelas yang dapat membuka halaman ini."
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

/** Sudah login → arahkan sesuai peran/status. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <>{children}</>;

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.status === 'pending') return <Navigate to="/pending" replace />;
  if (user.status !== 'approved') return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
}
