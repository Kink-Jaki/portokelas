import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { projectInteractionApi } from '@/lib/project-interaction.api';
import { queryKeys } from '@/lib/query-client';

interface CommentFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function CommentForm({ projectId, onSuccess }: CommentFormProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { mutate: createComment } = useMutation({
    mutationFn: (content: string) => projectInteractionApi.createComment(projectId, content),
    onMutate: async () => {
      setSubmitting(true);
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: queryKeys.projectComments(projectId, 1, 20) });
      onSuccess?.();
    },
    onError: () => {
      // Error handled by react-query error boundary
    },
    onSettled: () => {
      setSubmitting(false);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting) return;
    createComment(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tulis komentar atau feedback..."
        rows={3}
        className="w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/70 resize-none focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong transition-colors duration-200"
        maxLength={2000}
        disabled={submitting}
        aria-label="Komentar"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted/70">
          {content.length}/2000
        </span>
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          <span>{submitting ? 'Mengirim...' : 'Kirim'}</span>
        </button>
      </div>
    </form>
  );
}