import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { useReportNglMessage } from '@/hooks/useNgl';
import { ease } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { NglMessage, NglReportReason } from '@/types/api';
import { NGL_REPORT_REASONS } from './constants';

type Props = {
  message: NglMessage | null;
  onClose: () => void;
};

export function NglReportDialog({ message, onClose }: Props) {
  const report = useReportNglMessage();
  const [reason, setReason] = useState<NglReportReason>('inappropriate');
  const [note, setNote] = useState('');
  const open = Boolean(message);

  useEffect(() => {
    if (!open) {
      setReason('inappropriate');
      setNote('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  const submit = () => {
    if (!message) return;
    report.mutate({ id: message.id, reason, note: note.trim() || null }, { onSuccess: onClose });
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-forest/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Laporkan pesan"
            className="relative z-10 max-h-[92vh] w-full overflow-y-auto border border-line bg-ivory-warm sm:max-w-md"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease }}
          >
            <header className="border-b border-line px-6 py-5">
              <h2 className="font-display text-xl text-forest">Laporkan pesan</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Laporan anonim dibantu admin. Pesan yang dilaporkan 3 orang akan otomatis
                disembunyikan.
              </p>
            </header>

            <div className="space-y-5 px-6 py-5">
              <fieldset className="space-y-2">
                <legend className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Alasan
                </legend>
                {NGL_REPORT_REASONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors',
                      reason === option.value
                        ? 'border-burgundy bg-burgundy/10 text-forest'
                        : 'border-line text-muted hover:border-line-strong',
                    )}
                  >
                    <input
                      type="radio"
                      name="ngl-report-reason"
                      value={option.value}
                      checked={reason === option.value}
                      onChange={() => setReason(option.value)}
                      className="accent-burgundy"
                    />
                    {option.label}
                  </label>
                ))}
              </fieldset>

              <div className="space-y-2">
                <label
                  className="block text-xs font-medium uppercase tracking-[0.16em] text-muted"
                  htmlFor="ngl-report-note"
                >
                  Catatan (opsional)
                </label>
                <textarea
                  id="ngl-report-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value.slice(0, 200))}
                  rows={3}
                  maxLength={200}
                  placeholder="Tambahan keterangan untuk admin…"
                  className="w-full resize-y rounded-sm border border-line bg-ivory px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:border-burgundy focus:outline-none focus:ring-1 focus:ring-burgundy/25"
                />
              </div>
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={report.isPending}>
                Batal
              </Button>
              <Button type="button" variant="danger" isLoading={report.isPending} onClick={submit}>
                Kirim laporan
              </Button>
            </footer>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
