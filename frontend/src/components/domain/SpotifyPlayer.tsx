import type { SpotifyEmbed, SpotifyEntityType } from '@/types/api';

/** Pastikan parameter autoplay selalu ada agar langsung berputar saat masuk halaman. */
function withAutoplay(embedUrl: string): string {
  const url = new URL(embedUrl);
  url.searchParams.set('autoplay', 'true');
  return url.toString();
}

/** Tinggi embed sesuai jenis entity Spotify (lagu ringkas, playlist/album penuh). */
function embedHeight(type: SpotifyEntityType | undefined): number {
  switch (type) {
    case 'track':
      return 80;
    case 'episode':
      return 232;
    default:
      return 352;
  }
}

/**
 * Pemutar Spotify memakai embed resmi (iframe open.spotify.com/embed).
 * Lagu memakai mode ultra-compact (80px), sedangkan playlist/album/artis
 * memakai tampilan penuh dengan daftar trek.
 */
export function SpotifyPlayer({ spotify }: { spotify: SpotifyEmbed }) {
  const height = embedHeight(spotify.type);

  return (
    <div className="w-full">
      <iframe
        src={withAutoplay(spotify.embedUrl)}
        title={spotify.title ? `Spotify — ${spotify.title}` : 'Pemutar Spotify'}
        height={height}
        loading="eager"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full rounded-sm border-0 bg-black"
        style={{ height }}
      />
    </div>
  );
}
