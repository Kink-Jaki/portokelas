import { cn } from '@/lib/utils';
import { assetUrl } from '@/lib/api';
import { initials, truncate } from '@/lib/utils';

const sizes = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-14 w-14 text-sm',
  lg: 'h-20 w-20 text-lg',
  xl: 'h-32 w-32 text-3xl sm:h-40 sm:w-40',
};

export type AvatarProps = {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
  /** Grayscale halus — dipakai di kartu agar kontras saat hover. */
  muted?: boolean;
};

export function Avatar({ name, src, size = 'md', className, muted = false }: AvatarProps) {
  const url = assetUrl(src);

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-sm border border-line bg-subtle',
        'grid place-items-center font-mono font-medium text-muted',
        sizes[size],
        muted && 'grayscale',
        className,
      )}
    >
      {url ? (
        <img
          src={url}
          alt={`Foto profil ${name}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </div>
  );
}

export function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const visible = names.slice(0, max);
  const overflow = names.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((name, index) => (
        <div key={`${name}-${index}`} className="-ml-2 first:ml-0">
          <Avatar name={name} size="sm" muted className="ring-2 ring-bg" />
        </div>
      ))}
      {overflow > 0 ? (
        <span className="-ml-2 grid h-9 w-9 place-items-center rounded-sm border border-line bg-subtle font-mono text-[0.6875rem] text-muted ring-2 ring-bg">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export function AvatarPlaceholder({ text }: { text: string }) {
  return <span className="line-clamp-1 text-xs text-muted">{truncate(text, 80)}</span>;
}
