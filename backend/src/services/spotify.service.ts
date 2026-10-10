export type SpotifyEmbedInfo = {
  embedUrl: string;
  title: string | null;
  artistName: string | null;
  thumbnailUrl: string | null;
};

type SpotifyEntity = {
  name?: string;
  artists?: { name?: string }[];
  visualIdentity?: { image?: { url?: string; maxHeight?: number }[] };
};

const cache = new Map<string, SpotifyEmbedInfo | null>();

/** Ambil ID track dari URL Spotify, tanpa mengecek ke jaringan. */
export function parseSpotifyTrackId(url: string): string | null {
  const clean = url.split(/[?#]/)[0] ?? '';
  const match = /\/track\/([A-Za-z0-9]+)/i.exec(clean);
  return match?.[1] ?? null;
}

/** URL embed yang bisa dipakai di iframe (dengan autoplay). */
export function buildSpotifyEmbedUrl(url: string): string | null {
  const id = parseSpotifyTrackId(url);
  return id
    ? `https://open.spotify.com/embed/track/${id}?autoplay=true&theme=0&utm_source=oembed`
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

/** Cari entity track di JSON yang ditanam di halaman embed (tanpa API key). */
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
  if ('artists' in record && Array.isArray(record.artists) && 'name' in record) {
    return record as unknown as SpotifyEntity;
  }
  for (const child of Object.values(record)) {
    const found = findEntity(child, depth + 1);
    if (found) return found;
  }
  return null;
}

/** Fallback: metadata ringkas lewat oEmbed Spotify. */
async function fetchOembed(url: string): Promise<SpotifyEmbedInfo | null> {
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
      embedUrl: '',
      title: data.title ?? null,
      artistName: data.author_name ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Resolusi judul, nama penyanyi, dan sampul lagu dari halaman embed Spotify.
 * Beri cache per URL — metadata lagu tidak berubah.
 */
export async function resolveSpotifyEmbed(url: string): Promise<SpotifyEmbedInfo | null> {
  const embedUrl = buildSpotifyEmbedUrl(url);
  if (!embedUrl) return null;

  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  const id = parseSpotifyTrackId(url);
  let info: SpotifyEmbedInfo | null = null;

  const response = id ? await fetchWithTimeout(`https://open.spotify.com/embed/track/${id}`) : null;
  if (response?.ok) {
    const entity = extractEntity(await response.text());
    const images = entity?.visualIdentity?.image ?? [];
    const thumbnail =
      images.find((image) => (image.maxHeight ?? 0) >= 300) ?? images[0] ?? null;

    info = {
      embedUrl,
      title: entity?.name ?? null,
      artistName:
        entity?.artists?.map((artist) => artist.name).filter(Boolean).join(', ') || null,
      thumbnailUrl: thumbnail?.url ?? null,
    };
  }

  if (!info) {
    const fallback = await fetchOembed(url);
    info = fallback ? { ...fallback, embedUrl } : { embedUrl, title: null, artistName: null, thumbnailUrl: null };
  }

  cache.set(url, info);
  return info;
}