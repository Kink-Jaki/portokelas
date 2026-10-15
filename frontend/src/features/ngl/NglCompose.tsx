import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { useSubmitNglMessage } from '@/hooks/useNgl';
import { convertImageToWebp, isSupportedImage } from '@/lib/image';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { NGL_HONEYPOT_FIELD, NGL_IMAGE_MAX_MB, NGL_TEXT_MAX } from './constants';

const inputClass =
  'w-full rounded-sm border border-line bg-ivory px-3.5 py-2.5 text-sm text-fg ' +
  'placeholder:text-muted transition-colors duration-200 focus:border-burgundy focus:outline-none ' +
  'focus:ring-1 focus:ring-burgundy/25';

const labelClass =
  'block text-xs font-medium uppercase tracking-[0.16em] text-muted';

export function NglCompose() {
  const submit = useSubmitNglMessage();
  const [content, setContent] = useState('');
  const [spotify, setSpotify] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      className="flex flex-col gap-5 border border-line bg-ivory-warm p-6 shadow-[0_30px_60px_-52px_rgba(25,61,50,0.6)] sm:p-8"
    >
      <div className="space-y-1">
        <p className="eyebrow">Pesan anonim</p>
        <h2 className="font-display text-2xl text-forest">Tulis sesuatu</h2>
        <p className="text-sm leading-relaxed text-muted">
          Nama dan identitasmu tidak akan terlihat. Boleh berupa teks, tautan Spotify, atau foto.
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

      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value.slice(0, NGL_TEXT_MAX))}
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
