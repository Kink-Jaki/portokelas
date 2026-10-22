import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { projectInteractionApi } from '@/lib/project-interaction.api';
import { queryKeys } from '@/lib/query-client';
import type { ProjectComment, ProjectCommentUser } from '@/types/api';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  projectId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  initialPage?: number;
  limit?: number;
}

export function CommentList({ projectId, currentUserId, isAdmin = false, initialPage = 1, limit = 20 }: CommentListProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialPage);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.projectComments(projectId, page, limit),
    queryFn: () => projectInteractionApi.getComments(projectId, page, limit),
    enabled: !!projectId,
  });

  const comments = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? 0;

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      queryClient.prefetchQuery({
        queryKey: queryKeys.projectComments(projectId, newPage, limit),
        queryFn: () => projectInteractionApi.getComments(projectId, newPage, limit),
      });
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted">
        Gagal memuat komentar.{' '}
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.projectComments(projectId, page, limit) })}
          className="text-primary hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (comments.length === 0 && page === 1) {
    return (
      <div className="text-center py-8 text-muted">
        Belum ada komentar. Jadilah yang pertama memberikan feedback!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment as ProjectComment & { user: ProjectCommentUser }}
            isOwner={comment.userId === currentUserId}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Navigasi halaman komentar">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-bg text-muted hover:text-fg hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex min-w-[3rem] items-center justify-center text-sm font-medium">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-bg text-muted hover:text-fg hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            aria-label="Halaman selanjutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}

      {total > 0 && (
        <p className="text-center text-xs text-muted">
          Total {total} komentar
        </p>
      )}
    </div>
  );
}