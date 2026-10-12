import type { SpotifyEmbed } from '@/types/api';

/** Pastikan parameter autoplay selalu ada agar lagu langsung berputar saat masuk halaman. */
function withAutoplay(embedUrl: string): string {
  const url = new URL(embedUrl);
  url.searchParams.set('autoplay', 'true');
  return url.toString();
}

/**
 * Pemutar lagu Spotify memakai embed resmi (iframe open.spotify.com/embed)
 * dalam mode ultra-compact Spotify (height 80px) — bar hitam kecil memanjang
 * dengan kontrol playback bawaan Spotify, seperti widget musik di profil.
 */
export function SpotifyPlayer({ spotify }: { spotify: SpotifyEmbed }) {
  return (
    <div className="w-full">
      <iframe
        src={withAutoplay(spotify.embedUrl)}
        title={spotify.title ? `Spotify — ${spotify.title}` : 'Pemutar Spotify'}
        height={80}
        loading="eager"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        className="h-[80px] w-full rounded-sm border-0 bg-black"
      />
    </div>
  );
}