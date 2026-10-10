import '@/index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  isRouteErrorResponse,
  RouterProvider,
  useRouteError,
  useSearchParams,
} from 'react-router-dom';

import { RootLayout } from '@/components/layout/RootLayout';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { AppToaster } from '@/components/ui/Toaster';
import {
  RedirectIfAuthed,
  RequireAdmin,
  RequireApproved,
  RequireAuth,
} from '@/components/layout/guards';
import { AuthProvider } from '@/providers/AuthProvider';
import { setServerIssueHandler } from '@/lib/api';
import { queryClient } from '@/lib/query-client';

import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import PendingPage from '@/features/auth/PendingPage';
import MembersPage from '@/features/members/MembersPage';
import MemberPortfolioPage from '@/features/members/MemberPortfolioPage';
import ProjectDetailPage from '@/features/projects/ProjectDetailPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ProfilePage from '@/features/dashboard/ProfilePage';
import AdminPage from '@/features/admin/AdminPage';
import NotFoundPage from '@/features/misc/NotFoundPage';
import ErrorPage from '@/features/misc/ErrorPage';

const futureFlags = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

/** Error element untuk crash saat render/muat data sebuah route. */
function RouteErrorElement() {
  const error = useRouteError();
  const code = isRouteErrorResponse(error) ? error.status : 500;
  return <ErrorPage code={code} />;
}

/** Halaman error untuk rute /error?code=503 (backend mati / respons 5xx). */
function ErrorRoute() {
  const [params] = useSearchParams();
  return <ErrorPage code={params.get('code') ?? '500'} />;
}

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      errorElement: <RouteErrorElement />,
      children: [
        { path: '/', element: <LandingPage /> },
        { path: '/error', element: <ErrorRoute /> },
        {
          path: 'login',
          element: (
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          ),
        },
        { path: 'pending', element: <PendingPage /> },
        {
          path: 'profile',
          element: (
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          ),
        },
        { path: 'members', element: <MembersPage /> },
        { path: 'm/:slug', element: <MemberPortfolioPage /> },
        {
          path: 'm/:slug/:projectSlug',
          element: (
            <RequireApproved>
              <ProjectDetailPage />
            </RequireApproved>
          ),
        },
        {
          path: 'project/:projectSlug',
          element: (
            <RequireApproved>
              <ProjectDetailPage />
            </RequireApproved>
          ),
        },
        {
          path: 'dashboard',
          element: (
            <RequireApproved>
              <DashboardPage />
            </RequireApproved>
          ),
        },
        {
          path: 'admin',
          element: (
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          ),
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { future: futureFlags },
);

const container = document.getElementById('root');
if (!container) throw new Error('Elemen #root tidak ditemukan');

// Tampilkan halaman error saat backend mati / merespons 5xx.
setServerIssueHandler((status) => {
  if (window.location.pathname === '/error') return;
  void router.navigate(`/error?code=${status}`, { replace: true });
});

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} future={futureFlags} />
          <AppToaster />
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);
