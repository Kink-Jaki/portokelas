import type { NglMessage } from '@/types/api';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

/** Bungkus teks menjadi baris-baris yang muat dalam lebar maksimum. */
function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = words[0] ?? '';
    for (let i = 1; i < words.length; i += 1) {
      const word = words[i] ?? '';
      const candidate = `${current} ${word}`;
      if (context.measureText(candidate).width > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }
  return lines;
}

/** Gambar kartu cerita (1080×1920) berisi pesan NGL. Palet editorial landing. */
export async function renderNglStory(message: NglMessage): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas tidak tersedia di peramban ini.');

  context.fillStyle = '#f7f2e8';
  context.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  context.strokeStyle = 'rgba(25,61,50,0.16)';
  context.lineWidth = 3;
  context.strokeRect(64, 64, STORY_WIDTH - 128, STORY_HEIGHT - 128);

  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';

  context.fillStyle = '#193d32';
  context.font = '600 76px Georgia, "Times New Roman", serif';
  context.fillText('Craftly NGL', 120, 250);

  context.fillStyle = '#7a2435';
  context.fillRect(122, 292, 120, 5);

  context.fillStyle = 'rgba(119,111,96,0.75)';
  context.font = '400 32px "Courier New", monospace';
  context.fillText('P E S A N   A N O N I M', 122, 352);

  const text = message.content?.trim() || '(pesan berisi lampiran)';
  context.fillStyle = '#193d32';
  context.font = '500 62px Georgia, "Times New Roman", serif';

  const maxWidth = STORY_WIDTH - 240;
  let lines = wrapText(context, text, maxWidth);
  const maxLines = 12;
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    const last = kept[maxLines - 1] ?? '';
    kept[maxLines - 1] = `${last.replace(/\s+\S*$/, '')}…`;
    lines = kept;
  }

  const lineHeight = 86;
  let cursorY = STORY_HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2;
  for (const line of lines) {
    context.fillText(line, 120, cursorY);
    cursorY += lineHeight;
  }

  context.fillStyle = 'rgba(119,111,96,0.7)';
  context.font = '400 30px "Courier New", monospace';
  context.fillText('kirim pesan anonimmu di Craftly', 122, STORY_HEIGHT - 150);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Gagal membuat gambar cerita.'))),
      'image/png',
    );
  });
}

type ShareNavigator = Navigator & {
  canShare?: (data: { files: File[] }) => boolean;
  share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
};

/**
 * Bagikan kartu cerita lewat Web Share API bila tersedia, jika tidak
 * unduh sebagai file PNG. Melempar bila pengguna membatalkan berbagi.
 */
export async function shareNglStory(blob: Blob, filename = 'craftly-ngl.png'): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });
  const navigatorWithShare = navigator as ShareNavigator;

  if (
    typeof navigatorWithShare.share === 'function' &&
    navigatorWithShare.canShare?.({ files: [file] })
  ) {
    try {
      await navigatorWithShare.share({
        files: [file],
        title: 'Craftly NGL',
        text: 'Pesan anonim untukmu',
      });
      return 'shared';
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error;
      // Lanjut ke unduhan bila berbagi gagal karena alasan lain.
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
