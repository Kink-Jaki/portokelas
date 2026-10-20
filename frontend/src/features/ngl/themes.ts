/**
 * Preset gradient + tipografi untuk kartu "NGL by Craftly".
 * Warna dipilih dari hash id pesan agar konsisten per pesan, tapi bervariasi
 * antar kartu. Semua preset memakai teks kontras tinggi (WCAG AA untuk teks
 * besar/bold) dan disertai scrim lembut supaya pesan panjang tetap terbaca.
 */

export type NglTheme = {
  id: string;
  /** Latar penuh kartu. */
  gradient: string;
  /** Warna teks utama (kontras terhadap gradient). */
  ink: string;
  /** Kartu gelap? menentukan warna chip, scrim, dan tombol primer. */
  isDark: boolean;
};

export type NglDecor = {
  scrim: string;
  chipBg: string;
  chipInk: string;
  chipBorder: string;
  decor: string;
  glow: string;
  textShadow: string;
  shadow: string;
};

export const NGL_THEMES: NglTheme[] = [
  {
    id: 'peach',
    gradient: 'linear-gradient(135deg, #FFE29F 0%, #FFA99F 48%, #FF7E9D 100%)',
    ink: '#3A0B1E',
    isDark: false,
  },
  {
    id: 'sunset',
    gradient: 'linear-gradient(135deg, #FFD3A5 0%, #FF9A62 50%, #FF5F6D 100%)',
    ink: '#3A1206',
    isDark: false,
  },
  {
    id: 'lime',
    gradient: 'linear-gradient(135deg, #E6FB9E 0%, #A8E063 52%, #46C17A 100%)',
    ink: '#12320C',
    isDark: false,
  },
  {
    id: 'mint',
    gradient: 'linear-gradient(135deg, #C7F9CC 0%, #7EE8A2 50%, #52C79A 100%)',
    ink: '#073B2A',
    isDark: false,
  },
  {
    id: 'grape',
    gradient: 'linear-gradient(135deg, #8E2DE2 0%, #6411CB 52%, #4A00E0 100%)',
    ink: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'ocean',
    gradient: 'linear-gradient(135deg, #0B84C2 0%, #1D4ED8 52%, #312E81 100%)',
    ink: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'berry',
    gradient: 'linear-gradient(135deg, #FF3CAC 0%, #784BA0 52%, #2B86C5 100%)',
    ink: '#FFFFFF',
    isDark: true,
  },
  {
    id: 'midnight',
    gradient: 'linear-gradient(135deg, #3A2E5C 0%, #241F45 55%, #12102B 100%)',
    ink: '#FFFFFF',
    isDark: true,
  },
];

/** Hash deterministik (djb2 sederhana) — id sama selalu dapat tema sama. */
function hashString(value: string): number {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return Math.abs(hash);
}

export function nglThemeFor(id: string): NglTheme {
  return NGL_THEMES[hashString(id) % NGL_THEMES.length] ?? NGL_THEMES[0]!;
}

/** Turunan warna (chip, scrim, glow) dari sebuah tema. */
export function nglDecorFor(theme: NglTheme): NglDecor {
  if (theme.isDark) {
    return {
      scrim: 'radial-gradient(120% 90% at 50% 44%, rgba(6,4,20,0.42) 0%, rgba(6,4,20,0) 74%)',
      chipBg: 'rgba(255,255,255,0.16)',
      chipInk: '#FFFFFF',
      chipBorder: 'rgba(255,255,255,0.34)',
      decor: 'rgba(255,255,255,0.22)',
      glow: 'rgba(255,255,255,0.28)',
      textShadow: '0 2px 24px rgba(6,4,20,0.45)',
      shadow: '0 26px 60px -26px rgba(20,10,40,0.7)',
    };
  }
  return {
    scrim:
      'radial-gradient(120% 90% at 50% 44%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 74%)',
    chipBg: 'rgba(255,255,255,0.6)',
    chipInk: '#2A1220',
    chipBorder: 'rgba(255,255,255,0.75)',
    decor: 'rgba(42,18,32,0.16)',
    glow: 'rgba(255,255,255,0.6)',
    textShadow: '0 2px 20px rgba(255,255,255,0.45)',
    shadow: '0 26px 60px -28px rgba(120,50,70,0.5)',
  };
}

/**
 * Ukuran font pesan untuk kartu di grid — memakai `cqw` (container query)
 * agar menyusut/membesar mengikuti lebar kartu dan tetap rapi saat teks panjang.
 */
export function nglCardFontSize(text: string | null): string {
  const length = (text ?? '').trim().length;
  if (length <= 70) return 'clamp(0.95rem, 8.5cqw, 1.85rem)';
  if (length <= 150) return 'clamp(0.85rem, 7cqw, 1.5rem)';
  if (length <= 260) return 'clamp(0.75rem, 5.8cqw, 1.25rem)';
  return 'clamp(0.6875rem, 4.6cqw, 1rem)';
}

/** Ukuran font pesan untuk template share (px, kanvas 9:16 berukuran tetap). */
export function nglShareFontSize(text: string | null): number {
  const length = (text ?? '').trim().length;
  if (length <= 60) return 56;
  if (length <= 140) return 44;
  if (length <= 240) return 36;
  return 28;
}

/** Ubah URL embed Spotify menjadi URL halaman biasa (tanpa /embed). */
export function spotifyWebUrl(embedUrl: string): string {
  return embedUrl.replace('/embed/', '/').replace('/embed', '');
}
