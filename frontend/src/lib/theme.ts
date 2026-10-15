import type { CSSProperties } from 'react';

import type { MemberTheme, MemberThemePreset } from '@/types/api';

/** Kumpulan token warna yang bisa ditimpa lewat CSS variable. */
type ThemeVars = Record<`--${string}`, string>;

type PresetDefinition = {
  id: MemberThemePreset;
  label: string;
  /** Pratinjau singkat untuk tombol pemilih preset. */
  swatch: [string, string, string];
  vars: ThemeVars;
};

function vars(input: {
  bg: string;
  subtle: string;
  elevated: string;
  fg: string;
  muted: string;
  line: string;
  lineStrong: string;
  invertBg: string;
  invertFg: string;
  accent: string;
  accentFg: string;
  forest: string;
  maroon: string;
  ivory: string;
  ivoryAlt: string;
  ivoryWarm: string;
}): ThemeVars {
  return {
    '--bg': input.bg,
    '--bg-subtle': input.subtle,
    '--bg-elevated': input.elevated,
    '--fg': input.fg,
    '--fg-muted': input.muted,
    '--line': input.line,
    '--line-strong': input.lineStrong,
    '--invert-bg': input.invertBg,
    '--invert-fg': input.invertFg,
    '--accent': input.accent,
    '--accent-fg': input.accentFg,
    '--forest': input.forest,
    '--maroon': input.maroon,
    '--ivory': input.ivory,
    '--ivory-alt': input.ivoryAlt,
    '--ivory-warm': input.ivoryWarm,
  };
}

export const THEME_PRESETS: PresetDefinition[] = [
  {
    id: 'editorial',
    label: 'Editorial',
    swatch: ['#f4f0e7', '#cd4520', '#17140f'],
    vars: vars({
      bg: '#f4f0e7',
      subtle: '#e9e2d3',
      elevated: '#fbf8f2',
      fg: '#17140f',
      muted: '#6d6557',
      line: '#ddd5c3',
      lineStrong: '#b9ae97',
      invertBg: '#17140f',
      invertFg: '#f6f2e7',
      accent: '#cd4520',
      accentFg: '#fbf8f2',
      forest: '#193d32',
      maroon: '#7a2435',
      ivory: '#f7f3e8',
      ivoryAlt: '#f0e9d9',
      ivoryWarm: '#fffcf4',
    }),
  },
  {
    id: 'midnight',
    label: 'Midnight',
    swatch: ['#0f1420', '#5b8cff', '#e8edf7'],
    vars: vars({
      bg: '#0f1420',
      subtle: '#161d2c',
      elevated: '#1b2436',
      fg: '#e8edf7',
      muted: '#94a0b8',
      line: '#29344a',
      lineStrong: '#3d4a66',
      invertBg: '#e8edf7',
      invertFg: '#0f1420',
      accent: '#5b8cff',
      accentFg: '#0f1420',
      forest: '#7aa2ff',
      maroon: '#8b5cf6',
      ivory: '#0f1420',
      ivoryAlt: '#161d2c',
      ivoryWarm: '#1b2436',
    }),
  },
  {
    id: 'forest',
    label: 'Forest',
    swatch: ['#f1f5f0', '#2f7d55', '#14261d'],
    vars: vars({
      bg: '#f1f5f0',
      subtle: '#e2ebe3',
      elevated: '#fbfdfb',
      fg: '#14261d',
      muted: '#5d7267',
      line: '#cfdcd2',
      lineStrong: '#a9bfaf',
      invertBg: '#1c3a2b',
      invertFg: '#f4faf6',
      accent: '#2f7d55',
      accentFg: '#f4faf6',
      forest: '#1c3a2b',
      maroon: '#7a3b2d',
      ivory: '#f4f8f3',
      ivoryAlt: '#e7efe8',
      ivoryWarm: '#fcfefc',
    }),
  },
  {
    id: 'burgundy',
    label: 'Burgundy',
    swatch: ['#f7f0f1', '#9b2c40', '#2a1418'],
    vars: vars({
      bg: '#f7f0f1',
      subtle: '#efe1e3',
      elevated: '#fdf8f8',
      fg: '#2a1418',
      muted: '#7a5c62',
      line: '#e2cdd0',
      lineStrong: '#c39aa1',
      invertBg: '#5e1b29',
      invertFg: '#fbf3f4',
      accent: '#9b2c40',
      accentFg: '#fbf3f4',
      forest: '#4a2530',
      maroon: '#7a2435',
      ivory: '#f9f2f3',
      ivoryAlt: '#f1e4e6',
      ivoryWarm: '#fdf9f9',
    }),
  },
  {
    id: 'mono',
    label: 'Mono',
    swatch: ['#f5f5f4', '#111111', '#111111'],
    vars: vars({
      bg: '#f5f5f4',
      subtle: '#e7e7e5',
      elevated: '#fdfdfc',
      fg: '#111111',
      muted: '#6b6b68',
      line: '#dcdcd9',
      lineStrong: '#b4b4b0',
      invertBg: '#111111',
      invertFg: '#f5f5f4',
      accent: '#111111',
      accentFg: '#f5f5f4',
      forest: '#333331',
      maroon: '#444442',
      ivory: '#f7f7f6',
      ivoryAlt: '#ececea',
      ivoryWarm: '#fdfdfc',
    }),
  },
  {
    id: 'ocean',
    label: 'Ocean',
    swatch: ['#eef4f7', '#0e7490', '#0d2530'],
    vars: vars({
      bg: '#eef4f7',
      subtle: '#dbe8ee',
      elevated: '#f8fcfd',
      fg: '#0d2530',
      muted: '#4f6d79',
      line: '#c8dde5',
      lineStrong: '#96bccb',
      invertBg: '#0f3a4a',
      invertFg: '#eef8fb',
      accent: '#0e7490',
      accentFg: '#f2fbfd',
      forest: '#155e75',
      maroon: '#1e6b8a',
      ivory: '#f2f8fa',
      ivoryAlt: '#e2eff3',
      ivoryWarm: '#fbfefe',
    }),
  },
  {
    id: 'sunset',
    label: 'Sunset',
    swatch: ['#fdf1e7', '#d9500f', '#3a1d0c'],
    vars: vars({
      bg: '#fdf1e7',
      subtle: '#f9e0cd',
      elevated: '#fff9f3',
      fg: '#3a1d0c',
      muted: '#8a6449',
      line: '#f0d3b8',
      lineStrong: '#dba97c',
      invertBg: '#4a1f0f',
      invertFg: '#fdf3ea',
      accent: '#d9500f',
      accentFg: '#fff6ef',
      forest: '#7a3b12',
      maroon: '#b23c1a',
      ivory: '#fdf3ea',
      ivoryAlt: '#f9e4d4',
      ivoryWarm: '#fffaf5',
    }),
  },
  {
    id: 'sakura',
    label: 'Sakura',
    swatch: ['#fdf0f5', '#d6336c', '#3a1626'],
    vars: vars({
      bg: '#fdf0f5',
      subtle: '#f8dfe9',
      elevated: '#fff9fb',
      fg: '#3a1626',
      muted: '#855f6f',
      line: '#f2d3df',
      lineStrong: '#dda8bd',
      invertBg: '#5a1f38',
      invertFg: '#fdf3f7',
      accent: '#d6336c',
      accentFg: '#fff5f8',
      forest: '#8a3b5c',
      maroon: '#a12c53',
      ivory: '#fdf2f6',
      ivoryAlt: '#f9e2ec',
      ivoryWarm: '#fffafc',
    }),
  },
];

export const DEFAULT_THEME: MemberTheme = { preset: 'editorial' };

function getPreset(id: MemberThemePreset | undefined | null): PresetDefinition {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0]!;
}

function clamp(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function parseHex(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1]!, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex(channels: [number, number, number]): string {
  return `#${channels.map((channel) => clamp(channel).toString(16).padStart(2, '0')).join('')}`;
}

/** Campurkan dua warna hex (0 = penuh a, 1 = penuh b). */
export function mixHex(a: string, b: string, amount = 0.5): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return a;
  return toHex([
    ca[0] + (cb[0] - ca[0]) * amount,
    ca[1] + (cb[1] - ca[1]) * amount,
    ca[2] + (cb[2] - ca[2]) * amount,
  ]);
}

/** Ubah hex menjadi rgba() dengan alpha tertentu. */
export function hexToRgba(hex: string, alpha: number): string {
  const channels = parseHex(hex);
  if (!channels) return hex;
  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
}

function luminance(hex: string): number {
  const channels = parseHex(hex);
  if (!channels) return 0;
  const [r, g, b] = channels;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Pilih warna teks kontras (terang/gelap) untuk latar tertentu. */
export function contrastOn(hex: string): string {
  return luminance(hex) > 0.6 ? '#14110c' : '#fbf8f2';
}

function isDark(hex: string): boolean {
  return luminance(hex) < 0.5;
}

/** Selesaikan tema menjadi kumpulan CSS variable siap pakai. */
export function resolveTheme(theme?: MemberTheme | null): ThemeVars {
  if (!theme) return { ...getPreset('editorial').vars };

  const resolved: ThemeVars = { ...getPreset(theme.preset).vars };

  if (theme.accent) {
    resolved['--accent'] = theme.accent;
    resolved['--accent-fg'] = contrastOn(theme.accent);
    resolved['--forest'] = theme.accent;
    resolved['--maroon'] = theme.accent;
  }

  if (theme.bg) {
    resolved['--bg'] = theme.bg;
    resolved['--ivory'] = theme.bg;
    resolved['--bg-subtle'] = isDark(theme.bg)
      ? mixHex(theme.bg, '#ffffff', 0.08)
      : mixHex(theme.bg, '#000000', 0.06);
    resolved['--bg-elevated'] =
      theme.surface ?? mixHex(theme.bg, '#ffffff', isDark(theme.bg) ? 0.1 : 0.55);
  }

  if (theme.surface) {
    resolved['--bg-elevated'] = theme.surface;
    resolved['--ivory-warm'] = theme.surface;
    resolved['--ivory-alt'] = mixHex(theme.surface, resolved['--bg']!, 0.4);
  }

  if (theme.fg) {
    resolved['--fg'] = theme.fg;
    resolved['--invert-bg'] = theme.fg;
  }

  resolved['--accent-soft'] = hexToRgba(resolved['--accent']!, 0.12);

  return resolved;
}

/** CSS variable untuk ditempel pada elemen pembungkus (mengganti palet). */
export function themeToCssVars(theme?: MemberTheme | null): CSSProperties {
  return resolveTheme(theme) as unknown as CSSProperties;
}

/** Bersihkan HTML/CSS kustom dari konstruksi berbahaya (sandbox tanpa JS). */
export function sanitizeCustomHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\s*\/?\s*(iframe|object|embed|link|meta|base|form|template)[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/\bexpression\s*\(/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Bungkus HTML anggota menjadi dokumen mandiri untuk iframe sandbox.
 * Variabel warna tema disuntikkan agar kode kustom bisa memakai `var(--accent)`
 * dan token lain tanpa perlu menulis warna hardcode.
 */
export function buildSandboxDocument(html: string, theme?: MemberTheme | null): string {
  const vars = resolveTheme(theme);
  const varDeclarations = Object.entries(vars)
    .map(([name, value]) => `${name}: ${value};`)
    .join('');

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<base target="_top" />
<style>
  :root { ${varDeclarations} }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: transparent; }
  body {
    font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    color: var(--fg);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  img, video, svg { max-width: 100%; height: auto; }
  a { color: var(--accent); }
  h1, h2, h3 { font-family: 'Fraunces', ui-serif, Georgia, serif; letter-spacing: -0.02em; }
</style>
</head>
<body>
${html}
</body>
</html>`;
}
