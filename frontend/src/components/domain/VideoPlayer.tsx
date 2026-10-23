import { assetUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

type VideoPlayerProps = {
  src: string | null | undefined;
  poster?: string | null;
  className?: string;
  label?: string;
};

/** Pemutar video standar untuk kenangan (HTML5, tanpa library tambahan). */
export function VideoPlayer({
  src,
  poster,
  className,
  label = 'Video kenangan',
}: VideoPlayerProps) {
  const resolved = assetUrl(src);
  if (!resolved) return null;

  return (
    <video
      src={resolved}
      poster={assetUrl(poster) ?? undefined}
      controls
      playsInline
      preload="metadata"
      aria-label={label}
      className={cn('h-full w-full bg-black object-contain', className)}
    />
  );
}
