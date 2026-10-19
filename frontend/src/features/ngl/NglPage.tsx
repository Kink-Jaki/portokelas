import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useNglSettings } from '@/hooks/useNgl';
import { useAuth } from '@/providers/AuthProvider';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { NglCompose } from './NglCompose';
import { NglDisabled } from './NglDisabled';

export default function NglPage() {
  const settings = useNglSettings();
  const { user } = useAuth();

  return (
    <div className="page-landing landing-canvas">
      <div className="container-wide section-pad">
        <motion.header
          variants={stagger(0.1, 0.05)}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          <motion.p variants={staggerItem} className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span aria-hidden className="h-px w-8 shrink-0 bg-burgundy sm:w-10" />
            <span className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-forest-soft sm:text-xs sm:tracking-[0.3em]">
              Craftly · Fitur Anonim
            </span>
          </motion.p>

          <motion.h1
            variants={staggerItem}
            className="mt-6 max-w-[32rem] font-display text-[clamp(2.35rem,7.5vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-forest"
          >
            Craftly NGL<span className="text-burgundy">.</span>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.65] text-forest-soft"
          >
            Kirim pesan anonim. Not Gonna Lie by Craftly.
          </motion.p>
        </motion.header>

        <div className="mt-12">
          {settings.isLoading ? (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <Skeleton className="h-[28rem] w-full" />
              <Skeleton className="h-[30rem] w-full" />
            </div>
          ) : settings.isError ? (
            <div className="border border-line bg-ivory">
              <EmptyState
                title="Gagal memuat fitur NGL"
                description={settings.error?.message}
                action={
                  <Button variant="outline" onClick={() => void settings.refetch()}>
                    Coba lagi
                  </Button>
                }
              />
            </div>
          ) : !settings.data?.enabled ? (
            <NglDisabled />
          ) : (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className={cn(
                'grid items-start gap-10',
                !user && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]',
              )}
            >
              <NglCompose />

              {!user ? (
                <div className="border border-line bg-ivory p-6">
                  <p className="eyebrow">Cara kerja</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                    <li className="flex gap-3">
                      <span className="font-mono text-burgundy">01</span>
                      Tulis pesan anonim — identitasmu tidak disimpan.
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-burgundy">02</span>
                      Pesan muncul di kotak untuk dibaca anggota.
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-burgundy">03</span>
                      Pesan tidak pantas bisa dilaporkan dan disembunyikan.
                    </li>
                  </ul>
                </div>
              ) : null}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
