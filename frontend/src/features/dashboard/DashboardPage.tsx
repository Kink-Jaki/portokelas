import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import { ProfilePanel } from './ProfilePanel';
import { ProjectsPanel } from './ProjectsPanel';
import { MemoriesPanel } from './MemoriesPanel';
import { AnimatedRule } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { fadeUp } from '@/lib/motion';
import { useAuth } from '@/providers/AuthProvider';

type Tab = 'profile' | 'projects' | 'memories';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get('tab') === 'projects'
      ? 'projects'
      : searchParams.get('tab') === 'memories'
        ? 'memories'
        : 'profile',
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profil' },
    { id: 'projects', label: 'Project' },
    { id: 'memories', label: 'Kenangan' },
  ];

  const selectTab = (next: Tab) => {
    setTab(next);
    setSearchParams(next === 'profile' ? {} : { tab: next }, { replace: true });
  };

  return (
    <div className="container-page py-14">
      <motion.header variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
        <p className="eyebrow">Dashboard anggota</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          Halo, {user?.name.split(' ')[0]}.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Kelola profil publik dan project Anda di sini. Perubahan langsung tayang di portofolio
          publik setelah disimpan.
        </p>
      </motion.header>

      <AnimatedRule className="mt-10" />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Section dashboard"
          className="inline-flex border border-line"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              role="tab"
              type="button"
              id={`dashboard-tab-${item.id}`}
              aria-controls={`dashboard-panel-${item.id}`}
              aria-selected={tab === item.id}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => selectTab(item.id)}
              className={`relative px-5 py-2.5 text-sm transition-colors duration-200 ${
                tab === item.id ? 'text-invert-fg' : 'text-muted hover:text-fg'
              }`}
            >
              {tab === item.id ? (
                <motion.span
                  layoutId="dashboard-tab"
                  className="absolute inset-0 bg-invert"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user?.slug ? (
            <Link to={`/m/${user.slug}`} className={buttonClasses('outline', 'sm')}>
              Lihat portofolio
            </Link>
          ) : null}
          <button
            type="button"
            className={buttonClasses('ghost', 'sm')}
            onClick={() => void logout().then(() => navigate('/', { replace: true }))}
          >
            Keluar
          </button>
        </div>
      </div>

      <div
        className="mt-10"
        role="tabpanel"
        id={`dashboard-panel-${tab}`}
        aria-labelledby={`dashboard-tab-${tab}`}
      >
        {tab === 'profile' ? (
          <ProfilePanel />
        ) : tab === 'projects' ? (
          <ProjectsPanel />
        ) : (
          <MemoriesPanel />
        )}
      </div>
    </div>
  );
}
