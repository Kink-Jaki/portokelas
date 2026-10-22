import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { projectInteractionApi } from '@/lib/project-interaction.api';
import { queryKeys } from '@/lib/query-client';
import type { ProjectComment } from '@/types/api';

interface CommentItemProps {
  comment: ProjectComment & { user: ProjectCommentUser };
  isOwner: boolean;
  isAdmin: boolean;
}

interface ProjectCommentUser {
  id: string;
  name: string;
  alias: string | null;
  slug: string;
  avatarUrl: string | null;
  headline: string | null;
  role: 'member' | 'admin';
  createdAt: string;
}

function formatDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: id });
  } catch {
    return '';
  }
}

export function CommentItem({ comment, isOwner, isAdmin }: CommentItemProps) {
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const { mutate: updateComment } = useMutation({
    mutationFn: () => projectInteractionApi.updateComment(comment.id, editContent),
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.projectComments(comment.projectId, 1, 20) });
    },
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: () => projectInteractionApi.deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectComments(comment.projectId, 1, 20) });
    },
  });

  const handleDelete = () => {
    if (window.confirm('Hapus komentar ini? Tindakan ini tidak dapat dibatalkan.')) {
      deleteComment();
    }
    setShowMenu(false);
  };

  const handleUpdate = () => {
    if (editContent.trim() && editContent !== comment.content) {
      updateComment();
    } else {
      setEditing(false);
      setEditContent(comment.content);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditContent(comment.content);
  };

  return (
    <article className="group relative flex gap-3 pb-4 last:pb-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
        {comment.user.avatarUrl ? (
          <img
            src={comment.user.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-sm font-medium text-muted-foreground">
            {comment.user.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-fg">{comment.user.name}</span>
          {comment.user.alias && (
            <span className="text-sm text-muted">@{comment.user.alias}</span>
          )}
          <time className="text-xs text-muted" dateTime={comment.createdAt}>
            {formatDate(comment.createdAt)}
          </time>
        </div>
        {editing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong resize-none"
            rows={3}
            maxLength={2000}
            autoFocus
          />
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-sm text-fg">{comment.content}</p>
        )}
        {editing && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleUpdate}
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              Simpan
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-xs font-medium text-muted hover:text-muted-foreground"
            >
              Batal
            </button>
          </div>
        )}
        {(isOwner || isAdmin) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="mt-1 flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-fg hover:bg-muted transition-colors duration-200"
              aria-label="Opsi komentar"
              aria-expanded={showMenu}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 z-10 mt-1 rounded-lg border border-line bg-popover p-1 shadow-lg">
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setEditing(true);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-fg hover:bg-muted"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-destructive hover:bg-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </>
                )}
                {isAdmin && !isOwner && (
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-destructive hover:bg-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus (Admin)
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}