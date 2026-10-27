import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { DevBadge } from '@/components/ui/Badge';
import { Stagger } from '@/components/ui/Reveal';
import { staggerItem } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { PublicUser } from '@/types/api';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function SocialChip({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: ReactNode;
}) {
  const base =
    'inline-flex items-center gap-1.5 border border-line px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] transition-colors duration-200';

  if (!href) {
    return (
      <span
        aria-disabled="true"
        aria-label={`${label} tidak tersedia`}
        className={cn(base, 'cursor-not-allowed text-muted opacity-40')}
      >
        {children}
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(event) => event.stopPropagation()}
      className={cn(base, 'text-muted hover:border-fg hover:text-fg')}
    >
      {children}
      {label}
    </a>
  );
}

export function MemberCard({ member, index }: { member: PublicUser; index?: number }) {
  const displayName = member.alias || member.name;

  return (
    <motion.div variants={staggerItem} className="h-full">
      <Link
        to={`/m/${member.slug}`}
        className="group relative flex h-full flex-col bg-bg p-6 transition-colors duration-300 hover:bg-subtle sm:p-7"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-editorial group-hover:scale-x-100"
        />

        <div className="flex items-start justify-between gap-4">
          <Avatar
            name={member.name}
            src={member.avatarUrl}
            size="lg"
            muted
            className="transition-all duration-500 group-hover:border-line-strong group-hover:grayscale-0"
          />
          {index !== undefined ? (
            <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted transition-colors duration-300 group-hover:text-accent">
              {String(index).padStart(2, '0')}
            </span>
          ) : null}
        </div>

        <div className="mt-7 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-xl leading-snug">{displayName}</h3>
            {member.role === 'admin' ? <DevBadge /> : null}
          </div>
          {member.alias ? (
            <p className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
              {member.name}
            </p>
          ) : null}
          <p className="mt-3 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-muted">
            {member.headline || 'Belum menambahkan headline.'}
          </p>
        </div>

        <div
          className="mt-auto flex flex-wrap gap-2 pt-6"
          onClick={(event) => event.stopPropagation()}
        >
          <SocialChip href={member.githubUrl} label="GitHub">
            <GitHubIcon />
          </SocialChip>
          <SocialChip href={member.instagramUrl} label="Instagram">
            <InstagramIcon />
          </SocialChip>
        </div>
      </Link>
    </motion.div>
  );
}

export function MemberCardGrid({
  members,
  columns = 3,
}: {
  members: PublicUser[];
  columns?: 2 | 3 | 4;
}) {
  const cols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <Stagger
      className={cn('grid grid-cols-1 gap-px overflow-hidden border border-line bg-line', cols)}
    >
      {members.map((member, index) => (
        <MemberCard key={member.id} member={member} index={index + 1} />
      ))}
    </Stagger>
  );
}
