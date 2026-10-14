import { useEffect, useMemo, useRef } from 'react';

import { buildSandboxDocument } from '@/lib/theme';
import type { MemberTheme } from '@/types/api';

/**
 * Merender HTML + CSS kustom anggota di dalam iframe sandbox.
 * Script diblokir (tanpa `allow-scripts`) sehingga hanya markup & gaya yang jalan.
 * Tinggi iframe menyesuaikan konten selama origin masih bisa diakses.
 */
export function MemberCustomHtml({
  html,
  theme,
  title = 'Konten kustom anggota',
  className,
}: {
  html?: string | null;
  theme?: MemberTheme | null;
  title?: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = useMemo(
    () => (html && html.trim() ? buildSandboxDocument(html, theme) : ''),
    [html, theme],
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !srcDoc) return undefined;

    const resize = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc) return;
        const height = Math.max(
          doc.documentElement?.scrollHeight ?? 0,
          doc.body?.scrollHeight ?? 0,
        );
        if (height > 0) frame.style.height = `${height + 2}px`;
      } catch {
        /* origin tidak dapat diakses — biarkan tinggi default */
      }
    };

    let observer: ResizeObserver | undefined;

    const observe = () => {
      resize();
      try {
        const body = frame.contentDocument?.body;
        if (body && typeof ResizeObserver !== 'undefined') {
          observer?.disconnect();
          observer = new ResizeObserver(resize);
          observer.observe(body);
        }
      } catch {
        /* abaikan */
      }
    };

    frame.addEventListener('load', observe);
    observe();

    return () => {
      frame.removeEventListener('load', observe);
      observer?.disconnect();
    };
  }, [srcDoc]);

  if (!html || !html.trim()) return null;

  return (
    <iframe
      ref={frameRef}
      title={title}
      srcDoc={srcDoc}
      loading="lazy"
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      className={className ?? 'w-full border-0'}
      style={{ minHeight: '8rem' }}
    />
  );
}
