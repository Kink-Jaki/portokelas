import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useSubmitNglMessage, useMembersForMention } from '@/hooks/useNgl';
import { convertImageToWebp, isSupportedImage } from '@/lib/image';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { NGL_HONEYPOT_FIELD, NGL_IMAGE_MAX_MB, NGL_TEXT_MAX } from './constants';

const inputClass =
  'w-full rounded-sm border border-line bg-ivory px-3.5 py-2.5 text-sm text-fg ' +
  'placeholder:text-muted transition-colors duration-200 focus:border-burgundy focus:outline-none ' +
  'focus:ring-1 focus:ring-burgundy/25';

const labelClass = 'block text-xs font-medium uppercase tracking-[0.16em] text-muted';

type Member = {
  id: string;
  name: string;
  alias: string | null;
  slug: string;
  avatarUrl: string | null;
};

export function NglCompose() {
  const submit = useSubmitNglMessage();
  const { data: membersData } = useMembersForMention();
  const members: Member[] = (membersData?.members ?? []) as Member[];
  const [content, setContent] = useState('');
  const [spotify, setSpotify] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);
  const lastAtPosition = useRef<number>(-1);

  const filteredMembers = members
    .filter(
      (m) =>
        m.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        (m.alias && m.alias.toLowerCase().includes(mentionQuery.toLowerCase())),
    )
    .slice(0, 8);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const reset = () => {
    setContent('');
    setSpotify('');
    setImage(null);
    setError(null);
    setHoneypot('');
    setShowMentions(false);
    setMentionQuery('');
    setMentionIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!isSupportedImage(file)) {
      setError('Format foto harus JPG, PNG, atau WEBP.');
      return;
    }
    if (file.size > NGL_IMAGE_MAX_MB * 1024 * 1024) {
      setError(`Ukuran foto maksimal ${NGL_IMAGE_MAX_MB}MB.`);
      return;
    }
    setError(null);
    setImage(file);
  };

  const handleTextChange = (value: string) => {
    const trimmed = value.slice(0, NGL_TEXT_MAX);
    setContent(trimmed);

    const cursorPos = textareaRef.current?.selectionStart ?? trimmed.length;
    const textBeforeCursor = trimmed.slice(0, cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBeforeCursor.charAt(lastAt - 1)))) {
      const query = textBeforeCursor.slice(lastAt + 1);
      if (!/\s/.test(query)) {
        lastAtPosition.current = lastAt;
        setMentionQuery(query);
        setShowMentions(true);
        setMentionIndex(0);
        return;
      }
    }
    setShowMentions(false);
    lastAtPosition.current = -1;
  };

  const selectMention = (member: Member) => {
    const atPos = lastAtPosition.current;
    if (atPos === -1) return;

    const beforeAt = content.slice(0, atPos);
    const afterCursor = content.slice(textareaRef.current?.selectionStart ?? content.length);
    const displayName = member.alias || member.name;
    const mentionText = `@${displayName} `;

    const newContent = beforeAt + mentionText + afterCursor;
    setContent(newContent.slice(0, NGL_TEXT_MAX));
    setShowMentions(false);
    setMentionQuery('');
    lastAtPosition.current = -1;

    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = atPos + mentionText.length;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions || filteredMembers.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setMentionIndex((prev) => (prev + 1) % filteredMembers.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setMentionIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      const selectedMember = filteredMembers[mentionIndex];
      if (selectedMember) selectMention(selectedMember);
    } else if (event.key === 'Escape') {
      setShowMentions(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    const trimmedSpotify = spotify.trim();

    if (!trimmedContent && !trimmedSpotify && !image) {
      setError('Isi minimal salah satu: pesan, tautan Spotify, atau foto.');
      return;
    }
    if (trimmedContent.length > NGL_TEXT_MAX) {
      setError(`Pesan maksimal ${NGL_TEXT_MAX} karakter.`);
      return;
    }

    setError(null);
    try {
      const prepared = image
        ? await convertImageToWebp(image, { maxSize: 1600, quality: 0.82 })
        : null;
      await submit.mutateAsync({
        content: trimmedContent || undefined,
        spotify: trimmedSpotify || undefined,
        image: prepared,
        website: honeypot || undefined,
      });
      reset();
      setSent(true);
    } catch {
      // Pesan kesalahan sudah ditampilkan lewat toast.
    }
  };

  if (sent) {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex min-h-[24rem] flex-col items-center justify-center border border-line bg-ivory-warm px-8 py-16 text-center"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full border border-burgundy/30 text-burgundy">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden>
            <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
        <h3 className="mt-6 font-display text-2xl text-forest">Pesan terkirim!</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Terima kasih sudah berbagi. Pesanmu masuk ke kotak secara anonim — pengirimnya tidak
          tercatat.
        </p>
        <Button type="button" variant="forest" className="mt-8" onClick={() => setSent(false)}>
          Kirim pesan lain
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col gap-5 border border-line bg-ivory-warm p-6 shadow-[0_30px_60px_-52px_rgba(25,61,50,0.6)] sm:p-8"
    >
      <div className="space-y-1">
        <p className="eyebrow">Pesan anonim</p>
        <h2 className="font-display text-2xl text-forest">Tulis sesuatu</h2>
        <p className="text-sm leading-relaxed text-muted">
          Nama dan identitasmu tidak akan terlihat. Boleh berupa teks, tautan Spotify, atau foto.
          Ketik @ untuk tag temen! 💫
        </p>
      </div>

      {/* Honeypot anti-bot — sengaja disembunyikan dari pengguna. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="ngl-website">Website</label>
        <input
          id="ngl-website"
          name={NGL_HONEYPOT_FIELD}
          type="text"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="relative space-y-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => handleTextChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={4}
          maxLength={NGL_TEXT_MAX}
          placeholder="Tulis pesan… (opsional bila ada lampiran)"
          aria-label="Pesan"
          className={cn(inputClass, 'resize-y leading-relaxed')}
        />
        <div className="flex justify-between text-[0.6875rem] text-muted">
          <span>Opsional jika ada tautan atau foto</span>
          <span className="font-mono">
            {content.length}/{NGL_TEXT_MAX}
          </span>
        </div>

        {/* Mention dropdown */}
        <AnimatePresence>
          {showMentions && filteredMembers.length > 0 && (
            <motion.div
              ref={mentionRef}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-full left-0 right-0 mb-2 z-50"
            >
              <div className="rounded-xl border border-line bg-ivory-warm shadow-[0_20px_40px_-20px_rgba(25,61,50,0.5)] overflow-hidden">
                <div className="px-3 py-2 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-muted border-b border-line">
                  Tag temen (@{mentionQuery})
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredMembers.map((member, index) => {
                    if (!member) return null;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => selectMention(member)}
                        onMouseEnter={() => setMentionIndex(index)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                          index === mentionIndex
                            ? 'bg-burgundy/10 text-forest'
                            : 'text-muted hover:bg-subtle hover:text-fg',
                        )}
                      >
                        <Avatar
                          name={member.name}
                          src={member.avatarUrl ?? undefined}
                          size="sm"
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{member.name}</p>
                          {member.alias && (
                            <p className="text-[0.625rem] text-muted truncate">@{member.alias}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {filteredMembers.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-muted">
                    Tidak ada anggota yang cocok
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="ngl-spotify">
          Tautan Spotify (opsional)
        </label>
        <input
          id="ngl-spotify"
          type="url"
          value={spotify}
          onChange={(event) => setSpotify(event.target.value)}
          placeholder="https://open.spotify.com/…"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="ngl-image">
          Foto (opsional, maks {NGL_IMAGE_MAX_MB}MB)
        </label>
        <input
          id="ngl-image"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="block w-full cursor-pointer text-sm text-muted file:mr-4 file:rounded-sm file:border file:border-line-strong file:bg-ivory file:px-4 file:py-2 file:text-sm file:text-fg file:transition-colors hover:file:border-burgundy"
        />
        {preview ? (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={preview}
              alt="Pratinjau foto"
              className="h-16 w-16 border border-line object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-xs text-muted underline transition-colors hover:text-burgundy"
            >
              Hapus foto
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="burgundy" isLoading={submit.isPending}>
        Kirim anonim
      </Button>

      <p className="text-center text-[0.6875rem] leading-relaxed text-muted">
        Dengan mengirim, kamu menyetujui pesan ditinjau oleh admin. Jangan kirim ujaran kebencian.
      </p>
    </form>
  );
}
