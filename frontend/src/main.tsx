import '@/index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { RootLayout } from '@/components/layout/RootLayout';
import { AppToaster } from '@/components/ui/Toaster';
import { RedirectIfAuthed, RequireAdmin, RequireApproved } from '@/components/layout/guards';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { queryClient } from '@/lib/query-client';

import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import PendingPage from '@/features/auth/PendingPage';
import MembersPage from '@/features/members/MembersPage';
import MemberPortfolioPage from '@/features/members/MemberPortfolioPage';
import ProjectDetailPage from '@/features/projects/ProjectDetailPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import AdminPage from '@/features/admin/AdminPage';
import NotFoundPage from '@/features/misc/NotFoundPage';

const futureFlags = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { path: '/', element: <LandingPage /> },
        {
          path: 'login',
          element: (
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          ),
        },
        {
          path: 'register',
          element: (
            <RedirectIfAuthed>
              <RegisterPage />
            </RedirectIfAuthed>
          ),
        },
        { path: 'pending', element: <PendingPage /> },
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

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} future={futureFlags} />
          <AppToaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);