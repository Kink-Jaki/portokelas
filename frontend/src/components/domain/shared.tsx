import { assetUrl } from '@/lib/api';
import { cn, truncate } from '@/lib/utils';
import type { MemberProfile, Project, ProjectImage } from '@/types/api';

export type SocialKey = 'github' | 'linkedin' | 'instagram' | 'website';

export const socialMeta: Record<SocialKey, { label: string; href: keyof MemberProfile }> = {
  github: { label: 'GitHub', href: 'githubUrl' },
  linkedin: { label: 'LinkedIn', href: 'linkedinUrl' },
  instagram: { label: 'Instagram', href: 'instagramUrl' },
  website: { label: 'Website', href: 'websiteUrl' },
};

export function SocialLinks({
  profile,
  className,
  size = 'md',
}: {
  profile: Partial<MemberProfile>;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const entries = (Object.keys(socialMeta) as SocialKey[])
    .map((key) => ({ key, url: profile[socialMeta[key].href] as string | null }))
    .filter((entry): entry is { key: SocialKey; url: string } => Boolean(entry.url));

  if (entries.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {entries.map(({ key, url }) => (
        <li key={key}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={cn(
              'inline-flex items-center gap-2 rounded-sm border border-line px-3 transition-colors duration-200',
              'text-muted hover:border-line-strong hover:text-fg',
              size === 'sm' ? 'h-8 text-xs' : 'h-9 text-[0.8125rem]',
            )}
          >
            {socialMeta[key].label}
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden>
              <path d="M8 16L16 8M9 8h7v7" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TechStack({ items, className }: { items: string[]; className?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {items.map((item) => (
        <li
          key={item}
          className="rounded-sm border border-line px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ProjectCover({
  project,
  className,
  alt,
}: {
  project: Pick<Project, 'coverImageUrl' | 'title'> & { images?: ProjectImage[] };
  className?: string;
  alt?: string;
}) {
  const cover = assetUrl(project.coverImageUrl);
  const firstImage = project.images?.[0]?.imageUrl;
  const source = cover ?? assetUrl(firstImage);

  if (source) {
    return (
      <img
        src={source}
        alt={alt ?? project.title}
        loading="lazy"
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn('grid h-full w-full place-items-center bg-subtle text-muted', className)}
    >
      <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
        <path d="M10 14h28v20H10z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M10 30l8-8 7 6 6-5 7 7" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

export function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">
      {children}
    </span>
  );
}

export function ClampText({ text, lines = 2 }: { text: string; lines?: 2 | 3 }) {
  return (
    <p
      className={cn(
        'text-sm leading-relaxed text-muted',
        lines === 2 ? 'line-clamp-2' : 'line-clamp-3',
      )}
    >
      {truncate(text, 220)}
    </p>
  );
}
