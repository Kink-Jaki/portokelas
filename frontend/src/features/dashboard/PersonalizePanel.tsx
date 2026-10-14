import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Field';
import { MemberCustomHtml } from '@/components/ui/MemberCustomHtml';
import { useUpdateProfile } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import {
  CUSTOM_HTML_EXAMPLE,
  DEFAULT_THEME,
  THEME_PRESETS,
  resolveTheme,
  sanitizeCustomHtml,
  themeToCssVars,
} from '@/lib/theme';
import { useAuth } from '@/providers/AuthProvider';
import type { MemberTheme, MemberThemePreset } from '@/types/api';

type ColorKey = 'accent' | 'bg' | 'surface' | 'fg';

const COLOR_LABELS: Record<ColorKey, { label: string; hint: string; presetVar: `--${string}` }> = {
  accent: { label: 'Warna aksen', hint: 'Tombol, tautan, dan sorotan.', presetVar: '--accent' },
  bg: { label: 'Latar halaman', hint: 'Warna dasar portofolio.', presetVar: '--bg' },
  surface: { label: 'Permukaan card', hint: 'Latar kartu dan panel.', presetVar: '--bg-elevated' },
  fg: { label: 'Warna teks', hint: 'Teks utama pada portofolio.', presetVar: '--fg' },
};

type ThemeDraft = {
  preset: MemberThemePreset;
  accent: string;
  bg: string;
  surface: string;
  fg: string;
  customHtml: string;
};

const EMPTY_DRAFT: ThemeDraft = {
  preset: 'editorial',
  accent: '',
  bg: '',
  surface: '',
  fg: '',
  customHtml: '',
};

function draftFromUser(theme: MemberTheme | null, customHtml: string | null): ThemeDraft {
  return {
    preset: theme?.preset ?? 'editorial',
    accent: theme?.accent ?? '',
    bg: theme?.bg ?? '',
    surface: theme?.surface ?? '',
    fg: theme?.fg ?? '',
    customHtml: customHtml ?? '',
  };
}

function toTheme(draft: ThemeDraft): MemberTheme {
  return {
    preset: draft.preset,
    ...(draft.accent ? { accent: draft.accent } : {}),
    ...(draft.bg ? { bg: draft.bg } : {}),
    ...(draft.surface ? { surface: draft.surface } : {}),
    ...(draft.fg ? { fg: draft.fg } : {}),
  };
}

function ColorField({
  label,
  hint,
  value,
  presetValue,
  onChange,
  onClear,
}: {
  label: string;
  hint: string;
  value: string;
  presetValue: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const current = value || presetValue;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
          {label}
        </label>
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted transition-colors hover:text-fg"
          >
            Reset
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded-sm border border-line"
          style={{ backgroundColor: current }}
        >
          <input
            type="color"
            aria-label={label}
            value={current}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </span>
        <input
          type="text"
          value={value}
          placeholder={presetValue}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value.trim())}
          className="w-full rounded-sm border border-line bg-bg px-3 py-2 font-mono text-xs uppercase text-fg placeholder:text-muted/70 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong"
        />
      </div>
      <p className="text-xs text-muted">{hint}</p>
    </div>
  );
}

export function PersonalizePanel() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [draft, setDraft] = useState<ThemeDraft>(EMPTY_DRAFT);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDraft(draftFromUser(user.theme, user.customHtml));
  }, [user]);

  const presetVars = useMemo(() => resolveTheme({ preset: draft.preset }), [draft.preset]);
  const theme = useMemo(() => toTheme(draft), [draft]);
  const previewVars = useMemo(() => themeToCssVars(theme), [theme]);
  const safeHtml = useMemo(() => sanitizeCustomHtml(draft.customHtml), [draft.customHtml]);

  const isDirty = useMemo(() => {
    if (!user) return false;
    const saved = draftFromUser(user.theme, user.customHtml);
    return JSON.stringify(saved) !== JSON.stringify(draft);
  }, [draft, user]);

  const update = <K extends keyof ThemeDraft>(key: K, value: ThemeDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const onSave = async () => {
    const cleaned = sanitizeCustomHtml(draft.customHtml).trim();
    await updateProfile.mutateAsync({
      theme: toTheme(draft),
      customHtml: cleaned.length > 0 ? cleaned : null,
    });
  };

  if (!user) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <div className="border border-line p-6">
          <h2 className="font-display text-2xl">Tema</h2>
          <p className="mt-1 text-sm text-muted">
            Pilih tema dasar untuk kartu dan halaman portofoliomu, lalu sesuaikan warnanya.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {THEME_PRESETS.map((preset) => {
              const active = draft.preset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => update('preset', preset.id)}
                  aria-pressed={active}
                  className={cn(
                    'group flex flex-col gap-3 rounded-sm border p-3 text-left transition-colors duration-200',
                    active
                      ? 'border-fg bg-subtle'
                      : 'border-line hover:border-line-strong hover:bg-subtle',
                  )}
                >
                  <span className="flex overflow-hidden rounded-sm border border-line">
                    {preset.swatch.map((color, index) => (
                      <span key={index} className="h-6 flex-1" style={{ backgroundColor: color }} />
                    ))}
                  </span>
                  <span className="text-xs font-medium">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-line p-6">
          <h3 className="font-display text-xl">Warna kustom</h3>
          <p className="mt-1 text-sm text-muted">
            Biarkan kosong untuk memakai warna bawaan preset terpilih.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {(Object.keys(COLOR_LABELS) as ColorKey[]).map((key) => (
              <ColorField
                key={key}
                label={COLOR_LABELS[key].label}
                hint={COLOR_LABELS[key].hint}
                value={draft[key]}
                presetValue={presetVars[COLOR_LABELS[key].presetVar] ?? '#000000'}
                onChange={(value) => update(key, value)}
                onClear={() => update(key, '')}
              />
            ))}
          </div>
        </div>

        <div className="border border-line">
          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            aria-expanded={advancedOpen}
            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-subtle"
          >
            <span>
              <span className="block font-display text-xl">Opsi lanjutan</span>
              <span className="mt-1 block text-sm text-muted">
                Tulis HTML + CSS sendiri, dirender di sandbox tanpa JavaScript.
              </span>
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              {advancedOpen ? 'Tutup' : 'Buka'}
            </span>
          </button>

          {advancedOpen ? (
            <div className="space-y-4 border-t border-line p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  Tempel HTML dengan blok <code className="font-mono text-fg">&lt;style&gt;</code>.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => update('customHtml', CUSTOM_HTML_EXAMPLE)}
                    className="rounded-sm border border-line px-3 py-1.5 text-xs transition-colors hover:border-line-strong hover:bg-subtle"
                  >
                    Isi contoh
                  </button>
                  {draft.customHtml ? (
                    <button
                      type="button"
                      onClick={() => update('customHtml', '')}
                      className="rounded-sm border border-line px-3 py-1.5 text-xs transition-colors hover:border-line-strong hover:bg-subtle"
                    >
                      Kosongkan
                    </button>
                  ) : null}
                </div>
              </div>

              <Textarea
                label="HTML + CSS"
                rows={14}
                spellCheck={false}
                placeholder={
                  '<div class="kartu">Halo!</div>\n\n<style>\n  .kartu { padding: 2rem; color: var(--accent); }\n</style>'
                }
                value={draft.customHtml}
                onChange={(event) => update('customHtml', event.target.value)}
                className="font-mono text-xs"
              />

              <div className="space-y-2 rounded-sm border border-line bg-subtle p-4 text-xs leading-relaxed text-muted">
                <p>
                  Kode dijalankan pada iframe sandbox <strong>tanpa JavaScript</strong>. Tag{' '}
                  <code className="font-mono text-fg">&lt;script&gt;</code>, atribut{' '}
                  <code className="font-mono text-fg">onclick</code>,{' '}
                  <code className="font-mono text-fg">@import</code>, serta{' '}
                  <code className="font-mono text-fg">&lt;iframe&gt;</code> otomatis dihapus.
                </p>
                <p>
                  Pakai variabel tema agar ikut warna pilihanmu:{' '}
                  <code className="font-mono text-fg">var(--accent)</code>,{' '}
                  <code className="font-mono text-fg">var(--accent-fg)</code>,{' '}
                  <code className="font-mono text-fg">var(--bg-elevated)</code>,{' '}
                  <code className="font-mono text-fg">var(--fg)</code>,{' '}
                  <code className="font-mono text-fg">var(--fg-muted)</code>,{' '}
                  <code className="font-mono text-fg">var(--line)</code>.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <Button
            type="button"
            isLoading={updateProfile.isPending}
            disabled={!isDirty}
            onClick={onSave}
          >
            Simpan tema
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDraft({ ...EMPTY_DRAFT, preset: DEFAULT_THEME.preset })}
          >
            Reset
          </Button>
          {user.slug ? (
            <a
              href={`/m/${user.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted underline underline-offset-4 transition-colors hover:text-fg"
            >
              Lihat hasil di portofolio
            </a>
          ) : null}
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <div>
          <p className="eyebrow">Pratinjau kartu</p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line" style={previewVars}>
            <div className="bg-bg p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="h-14 w-14 rounded-full border border-line bg-subtle" />
                <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted">01</span>
              </div>
              <h3 className="mt-5 font-display text-xl">{user.alias || user.name}</h3>
              <p className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                Anggota kelas
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {user.headline || 'Belum menambahkan headline.'}
              </p>
              <div className="mt-5 flex gap-2">
                <span className="inline-flex items-center border border-line px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted">
                  GitHub
                </span>
                <span className="inline-flex items-center border border-line px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted">
                  Instagram
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
                  example-project
                </span>
                <span className="bg-invert px-2.5 py-1 text-xs text-invert-fg">Demo</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Warna yang kamu pilih juga diterapkan pada kartumu di direktori anggota.
          </p>
        </div>

        <div>
          <p className="eyebrow">Pratinjau HTML sandbox</p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-bg p-4">
            {safeHtml.trim() ? (
              <MemberCustomHtml html={safeHtml} theme={theme} title="Pratinjau konten kustom" />
            ) : (
              <p className="py-6 text-center text-xs text-muted">
                Belum ada kode. Buka Opsi lanjutan lalu klik “Isi contoh”.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
