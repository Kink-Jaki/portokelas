import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { projectInteractionApi } from '@/lib/project-interaction.api';
import { queryKeys } from '@/lib/query-client';

interface LikeButtonProps {
  projectId: string;
  initialLiked: boolean;
  initialCount: number;
  className?: string;
}

export function LikeButton({ projectId, initialLiked, initialCount, className }: LikeButtonProps) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [optimistic, setOptimistic] = useState(false);

  const { mutate: toggleLike } = useMutation({
    mutationFn: () => projectInteractionApi.toggleLike(projectId),
    onMutate: async () => {
      setOptimistic(true);
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev - 1 : prev + 1));
    },
    onError: () => {
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setCount(data.count);
      queryClient.invalidateQueries({ queryKey: queryKeys.projectLikes(projectId) });
    },
    onSettled: () => {
      setOptimistic(false);
    },
  });

  return (
    <button
      type="button"
      onClick={() => toggleLike()}
      disabled={optimistic}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
        liked
          ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
          : 'text-muted hover:text-fg hover:bg-muted/30'
      } ${className ?? ''}`}
      aria-label={liked ? 'Batalkan suka' : 'Suka'}
      aria-pressed={liked}
    >
      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
