import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import { ProfilePanel } from './ProfilePanel';
import { ProjectsPanel } from './ProjectsPanel';
import { MemoriesPanel } from './MemoriesPanel';
import { PersonalizePanel } from './PersonalizePanel';
import { AnimatedRule } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { fadeUp } from '@/lib/motion';
import { useAuth } from '@/providers/AuthProvider';

type Tab = 'profile' | 'projects' | 'memories' | 'personalize';

const TABS: ReadonlyArray<Tab> = ['profile', 'projects', 'memories', 'personalize'];

function parseTab(value: string | null): Tab {
  return TABS.includes(value as Tab) ? (value as Tab) : 'profile';
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => parseTab(searchParams.get('tab')));

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profil' },
    { id: 'projects', label: 'Project' },
    { id: 'memories', label: 'Kenangan' },
    { id: 'personalize', label: 'Personalisasi' },
  ];

  const selectTab = (next: Tab) => {
    setTab(next);
    setSearchParams(next === 'profile' ? {} : { tab: next }, { replace: true });
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <motion.header
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="w-full min-w-0 sm:max-w-2xl"
      >
        <p className="eyebrow">Dashboard anggota</p>
        <h1 className="mt-3 max-w-full break-words font-display text-[clamp(2rem,7vw,3rem)] leading-[1.15] sm:mt-4 sm:leading-tight">
          Halo, {user?.name.split(' ')[0]}.
        </h1>
        <p className="mt-3 w-full max-w-[45rem] text-sm leading-relaxed text-muted sm:mt-4">
          Kelola profil publik dan project Anda di sini. Perubahan langsung tayang di portofolio
          publik setelah disimpan.
        </p>
      </motion.header>

      <AnimatedRule className="mt-8 sm:mt-10" />

      <div className="mt-6 flex min-w-0 flex-col gap-4 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Section dashboard"
          className="grid w-full min-w-0 max-w-full grid-cols-2 gap-px border border-line bg-line min-[480px]:inline-flex min-[480px]:w-auto min-[480px]:max-w-none min-[480px]:gap-0 min-[480px]:bg-transparent"
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
              className={`relative flex min-w-0 items-center justify-center whitespace-normal bg-bg px-5 py-2.5 text-center text-sm transition-colors duration-200 min-[480px]:bg-transparent ${
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

        <div className="grid w-full min-w-0 grid-cols-2 gap-3 max-[340px]:grid-cols-1 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          {user?.slug ? (
            <Link
              to={`/m/${user.slug}`}
              className={buttonClasses('outline', 'sm', 'w-full sm:w-auto')}
            >
              Lihat portofolio
            </Link>
          ) : null}
          <button
            type="button"
            className={buttonClasses('ghost', 'sm', 'w-full sm:w-auto')}
            onClick={() => void logout().then(() => navigate('/', { replace: true }))}
          >
            Keluar
          </button>
        </div>
      </div>

      <div
        className="mt-8 sm:mt-10"
        role="tabpanel"
        id={`dashboard-panel-${tab}`}
        aria-labelledby={`dashboard-tab-${tab}`}
      >
        {tab === 'profile' ? (
          <ProfilePanel />
        ) : tab === 'projects' ? (
          <ProjectsPanel />
        ) : tab === 'memories' ? (
          <MemoriesPanel />
        ) : (
          <PersonalizePanel />
        )}
      </div>
    </div>
  );
}
