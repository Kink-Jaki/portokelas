import { api } from './api';
import type { Paginated, ProjectComment, ProjectLike, ProjectCommentUser, ProjectLikeUser } from '@/types/api';

export const projectInteractionApi = {
  // LIKES
  toggleLike: (projectId: string) =>
    api.post<{ liked: boolean; count: number }>(`/projects/${projectId}/like`),

  getLikes: (projectId: string) =>
    api.get<{ likes: (ProjectLike & { user: ProjectLikeUser })[] }>(`/projects/${projectId}/likes`),

  // COMMENTS
  getComments: (projectId: string, page = 1, limit = 20) =>
    api.get<Paginated<ProjectComment & { user: ProjectCommentUser }>>(
      `/projects/${projectId}/comments?page=${page}&limit=${limit}`,
    ),

  createComment: (projectId: string, content: string) =>
    api.post<{ comment: ProjectComment & { user: ProjectCommentUser } }>(`/projects/${projectId}/comments`, { content }),

  updateComment: (commentId: string, content: string) =>
    api.patch<{ comment: ProjectComment & { user: ProjectCommentUser } }>(`/comments/${commentId}`, { content }),

  deleteComment: (commentId: string) =>
    api.delete<{ deleted: true }>(`/comments/${commentId}`),

  // ADMIN
  hideComment: (commentId: string, hidden: boolean) =>
    api.patch<{ comment: ProjectComment }>(`/comments/${commentId}/hide`, { hidden }),
};