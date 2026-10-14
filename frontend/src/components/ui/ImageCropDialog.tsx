import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { cropImageToWebp, type CropRect } from '@/lib/image';
import { Button } from './Button';
import { Modal } from './Modal';

const VIEWPORT = 288;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

type ImageMeta = { width: number; height: number; baseScale: number };

type ImageCropDialogProps = {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onConfirm: (file: File) => void;
  outputSize?: number;
  quality?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Dialog potong gambar persegi dengan geser (pan) dan zoom sebelum diunggah. */
export function ImageCropDialog({
  open,
  file,
  onCancel,
  onConfirm,
  outputSize = 512,
  quality = 0.9,
}: ImageCropDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const display = useMemo(() => {
    if (!meta) return { width: 0, height: 0 };
    const factor = meta.baseScale * zoom;
    return { width: meta.width * factor, height: meta.height * factor };
  }, [meta, zoom]);

  const clampOffset = useCallback(
    (x: number, y: number, width: number, height: number) => ({
      x: clamp(x, VIEWPORT - width, 0),
      y: clamp(y, VIEWPORT - height, 0),
    }),
    [],
  );

  useEffect(() => {
    if (!open || !file) {
      setPreviewUrl(null);
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMeta(null);
    setError(null);
    setZoom(MIN_ZOOM);

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) return;
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (!width || !height) {
        setError('Gagal membaca dimensi gambar.');
        return;
      }
      const baseScale = Math.max(VIEWPORT / width, VIEWPORT / height);
      setMeta({ width, height, baseScale });
      setOffset({ x: (VIEWPORT - width * baseScale) / 2, y: (VIEWPORT - height * baseScale) / 2 });
    };
    image.onerror = () => {
      if (active) setError('Gagal memuat gambar.');
    };
    image.src = url;

    return () => {
      active = false;
      URL.revokeObjectURL(url);
    };
  }, [open, file]);

  const handleZoom = (next: number) => {
    if (!meta) return;
    setZoom(next);
    setOffset((previous) => {
      const oldW = meta.width * meta.baseScale * zoom;
      const oldH = meta.height * meta.baseScale * zoom;
      const newW = meta.width * meta.baseScale * next;
      const newH = meta.height * meta.baseScale * next;
      const centerX = (VIEWPORT / 2 - previous.x) / oldW;
      const centerY = (VIEWPORT / 2 - previous.y) / oldH;
      return clampOffset(VIEWPORT / 2 - centerX * newW, VIEWPORT / 2 - centerY * newH, newW, newH);
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!meta) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const next = clampOffset(
      drag.originX + (event.clientX - drag.startX),
      drag.originY + (event.clientY - drag.startY),
      display.width,
      display.height,
    );
    setOffset(next);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const handleConfirm = async () => {
    if (!file || !meta) return;
    setBusy(true);
    setError(null);
    try {
      const factor = meta.baseScale * zoom;
      const crop: CropRect = {
        x: -offset.x / factor,
        y: -offset.y / factor,
        width: VIEWPORT / factor,
        height: VIEWPORT / factor,
      };
      const cropped = await cropImageToWebp(file, crop, { outputSize, quality });
      onConfirm(cropped);
    } catch {
      setError('Gagal memotong gambar. Coba pilih foto lain.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Atur foto profil"
      description="Geser untuk memposisikan, atur zoom, lalu simpan. Foto otomatis dikonversi ke WEBP."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Batal
          </Button>
          <Button onClick={handleConfirm} isLoading={busy} disabled={!meta || !!error}>
            Simpan foto
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div
          role="img"
          aria-label="Area potong foto"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className="relative touch-none select-none overflow-hidden rounded-sm border border-line bg-subtle cursor-grab active:cursor-grabbing"
          style={{ width: VIEWPORT, height: VIEWPORT }}
        >
          {previewUrl && meta ? (
            <img
              src={previewUrl}
              alt="Pratinjau foto profil"
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{
                left: offset.x,
                top: offset.y,
                width: display.width,
                height: display.height,
              }}
            />
          ) : null}

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 left-1/3 w-px bg-bg/60" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-bg/60" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-bg/60" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-bg/60" />
            <div className="absolute inset-0 ring-1 ring-inset ring-bg/40" />
          </div>

          {!meta && !error ? (
            <div className="absolute inset-0 grid place-items-center text-xs text-muted">
              Memuat gambar…
            </div>
          ) : null}
        </div>

        <div className="w-full space-y-2">
          <label className="flex items-center justify-between text-xs text-muted">
            <span>Zoom</span>
            <span className="font-mono">{zoom.toFixed(1)}×</span>
          </label>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(event) => handleZoom(Number(event.target.value))}
            disabled={!meta}
            className="w-full accent-invert"
            aria-label="Zoom foto"
          />
        </div>

        {error ? (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
