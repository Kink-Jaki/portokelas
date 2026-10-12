export type SpotifyEntityType = 'track' | 'playlist' | 'album' | 'artist' | 'episode' | 'show';

export type SpotifyEmbedInfo = {
  type: SpotifyEntityType;
  embedUrl: string;
  title: string | null;
  artistName: string | null;
  thumbnailUrl: string | null;
};

type SpotifyEntity = {
  name?: string;
  title?: string;
  subtitle?: string;
  artists?: { name?: string }[];
  owner?: { displayName?: string; name?: string };
  visualIdentity?: { image?: { url?: string; maxHeight?: number }[] };
  images?: { url?: string; height?: number | null }[];
  coverArt?: { sources?: { url?: string; width?: number; height?: number }[] };
};

type SpotifyOembed = {
  title: string | null;
  artistName: string | null;
  thumbnailUrl: string | null;
};

const cache = new Map<string, SpotifyEmbedInfo | null>();

const ENTITY_TYPES: readonly SpotifyEntityType[] = [
  'track',
  'playlist',
  'album',
  'artist',
  'episode',
  'show',
];

/**
 * Ambil jenis entity + ID dari URL/URI Spotify, tanpa mengecek ke jaringan.
 * Mendukung lagu, playlist, album, artis, episode podcast, dan show.
 */
export function parseSpotifyEntity(
  url: string,
): { type: SpotifyEntityType; id: string } | null {
  const trimmed = url.trim();

  const uriMatch = new RegExp(
    `^spotify:(${ENTITY_TYPES.join('|')}):([A-Za-z0-9]+)$`,
    'i',
  ).exec(trimmed);
  if (uriMatch?.[1] && uriMatch[2]) {
    return { type: uriMatch[1].toLowerCase() as SpotifyEntityType, id: uriMatch[2] };
  }

  const clean = trimmed.split(/[?#]/)[0] ?? '';
  const match = new RegExp(`/(${ENTITY_TYPES.join('|')})/([A-Za-z0-9]+)`, 'i').exec(clean);
  if (!match?.[1] || !match[2]) return null;
  return { type: match[1].toLowerCase() as SpotifyEntityType, id: match[2] };
}

/** URL embed yang bisa dipakai di iframe (dengan autoplay). */
export function buildSpotifyEmbedUrl(url: string): string | null {
  const entity = parseSpotifyEntity(url);
  return entity
    ? `https://open.spotify.com/embed/${entity.type}/${entity.id}?autoplay=true&theme=0&utm_source=oembed`
    : null;
}

async function fetchWithTimeout(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function looksLikeEntity(record: Record<string, unknown>): boolean {
  const hasName = typeof record.name === 'string' || typeof record.title === 'string';
  const hasMedia =
    'visualIdentity' in record || 'images' in record || 'coverArt' in record;
  const hasAuthor = 'artists' in record || 'owner' in record;
  return hasName && (hasMedia || hasAuthor);
}

/** Cari entity di JSON yang ditanam di halaman embed (tanpa API key). */
function extractEntity(html: string): SpotifyEntity | null {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match?.[1]) return null;

  try {
    const data = JSON.parse(match[1]) as {
      props?: { pageProps?: { state?: { data?: { entity?: SpotifyEntity } } } };
    };
    const direct = data.props?.pageProps?.state?.data?.entity;
    if (direct) return direct;
    return findEntity(data, 0);
  } catch {
    return null;
  }
}

function findEntity(value: unknown, depth: number): SpotifyEntity | null {
  if (depth > 8 || !value || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findEntity(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (looksLikeEntity(record)) {
    return record as unknown as SpotifyEntity;
  }
  for (const child of Object.values(record)) {
    const found = findEntity(child, depth + 1);
    if (found) return found;
  }
  return null;
}

function entityAuthor(entity: SpotifyEntity | null): string | null {
  if (!entity) return null;
  const artists = entity.artists?.map((artist) => artist.name).filter(Boolean).join(', ');
  if (artists) return artists;
  return entity.owner?.displayName ?? entity.owner?.name ?? entity.subtitle ?? null;
}

function entityThumbnail(entity: SpotifyEntity | null): string | null {
  if (!entity) return null;

  const visuals = entity.visualIdentity?.image ?? [];
  const visual = visuals.find((image) => (image.maxHeight ?? 0) >= 300) ?? visuals[0];
  if (visual?.url) return visual.url;

  const cover = entity.coverArt?.sources?.[0];
  if (cover?.url) return cover.url;

  const images = entity.images ?? [];
  const image = images.find((item) => (item.height ?? 0) >= 300) ?? images[0];
  return image?.url ?? null;
}

/** Fallback: metadata ringkas lewat oEmbed Spotify. */
async function fetchOembed(url: string): Promise<SpotifyOembed | null> {
  const response = await fetchWithTimeout(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
  );
  if (!response?.ok) return null;

  try {
    const data = (await response.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    return {
      title: data.title ?? null,
      artistName: data.author_name ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Resolusi judul, nama pembuat, dan sampul dari halaman embed Spotify.
 * Beri cache per URL — metadata tidak berubah.
 */
export async function resolveSpotifyEmbed(url: string): Promise<SpotifyEmbedInfo | null> {
  const entity = parseSpotifyEntity(url);
  const embedUrl = buildSpotifyEmbedUrl(url);
  if (!entity || !embedUrl) return null;

  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  let info: SpotifyEmbedInfo | null = null;

  const response = await fetchWithTimeout(
    `https://open.spotify.com/embed/${entity.type}/${entity.id}`,
  );
  if (response?.ok) {
    const data = extractEntity(await response.text());
    info = {
      type: entity.type,
      embedUrl,
      title: data?.name ?? data?.title ?? null,
      artistName: entityAuthor(data),
      thumbnailUrl: entityThumbnail(data),
    };
  }

  if (!info) {
    const fallback = await fetchOembed(url);
    info = fallback
      ? { ...fallback, type: entity.type, embedUrl }
      : { type: entity.type, embedUrl, title: null, artistName: null, thumbnailUrl: null };
  }

  cache.set(url, info);
  return info;
}
