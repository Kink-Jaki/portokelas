import { motion } from 'framer-motion';
import { useState } from 'react';

import { buttonClasses } from '@/components/ui/Button';
import { fadeUp, stagger, staggerItem } from '@/lib/motion';
import { pingServer } from '@/lib/api';
import { developerContact } from '@/lib/site';

export function ErrorPage({ code = '500', message }: { code?: number | string; message?: string }) {
  const [checking, setChecking] = useState(false);
  const [stillDown, setStillDown] = useState(false);

  const description =
    message ??
    'Server sedang tidak dapat dihubungi atau terjadi gangguan tak terduga. Coba muat ulang beberapa saat lagi.';

  const handleReload = async () => {
    if (checking) return;
    setChecking(true);
    setStillDown(false);
    const alive = await pingServer();
    if (alive) {
      window.location.href = '/';
      return;
    }
    setChecking(false);
    setStillDown(true);
  };

  return (
    <div className="container-page py-24">
      <motion.div variants={stagger(0.1)} initial="hidden" animate="show" className="max-w-2xl">
        <motion.p
          variants={staggerItem}
          className="font-mono text-[4rem] leading-none sm:text-[6rem]"
        >
          {code}
        </motion.p>
        <motion.div variants={fadeUp} className="mt-6 space-y-4">
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">
            Maaf, sepertinya sedang ada masalah.
          </h1>
          <p className="text-sm leading-relaxed text-muted">{description}</p>
          <p className="text-sm leading-relaxed text-muted">
            Kode error: <span className="font-mono text-fg">{code}</span>
          </p>

          <div className="space-y-2 pt-2">
            <p className="eyebrow">Hubungi developer :</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a
                href={developerContact.github}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-fg"
              >
                GitHub
              </a>
              <a
                href={developerContact.instagram}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-fg"
              >
                Instagram
              </a>
              <a
                href={developerContact.website}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-fg"
              >
                Website
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReload}
              disabled={checking}
              className={buttonClasses('primary')}
            >
              {checking ? 'Mencoba...' : 'Muat ulang'}
            </button>
            <a href="/" className={buttonClasses('outline')}>
              Kembali ke beranda
            </a>
          </div>
          {stillDown ? (
            <p className="text-sm text-danger">
              Server masih belum bisa dijangkau. Coba lagi beberapa saat lagi.
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ErrorPage;
