import { Button } from './Button';
import { EmptyState } from './EmptyState';
import type { ApiError } from '@/lib/api';
import type { ReactNode } from 'react';

export function ErrorState({
  error,
  onRetry,
  title = 'Gagal memuat data',
  compact = false,
}: {
  error: ApiError | Error | null;
  onRetry?: () => void;
  title?: string;
  compact?: boolean;
}) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'Terjadi kesalahan yang tidak diketahui.';

  if (compact) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 border border-danger/40 bg-danger/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="font-medium text-fg">{title}</p>
          <p className="text-muted">{message}</p>
        </div>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="border border-line p-8">
      <EmptyState
        title={title}
        description={message}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              Coba lagi
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

export function AsyncBoundary({
  isLoading,
  error,
  onRetry,
  skeleton,
  children,
}: {
  isLoading: boolean;
  error: ApiError | Error | null;
  onRetry?: () => void;
  skeleton: ReactNode;
  children: ReactNode;
}) {
  if (isLoading) return <>{skeleton}</>;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  return <>{children}</>;
}
