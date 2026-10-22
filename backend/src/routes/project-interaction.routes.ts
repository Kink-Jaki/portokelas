import { Hono } from 'hono';
import { z } from 'zod';

import { AppError } from '../lib/errors.js';
import { ok, requireParam } from '../lib/http.js';
import { zJson, zQuery } from '../lib/validate.js';
import { getCurrentUser, requireAuth, type AppEnv } from '../middleware/auth.js';
import {
  createProjectComment,
  deleteProjectComment,
  hideProjectComment,
  listProjectComments,
  listProjectLikes,
  toggleProjectLike,
  updateProjectComment,
} from '../services/project.service.js';
import { commentQuerySchema, createCommentSchema, updateCommentSchema } from '../validators/comment.js';

/** Endpoint interaksi project (like, komentar) — memerlukan autentikasi. */
export const projectInteractionRoutes = new Hono<AppEnv>()
  .use('*', requireAuth)

  // LIKES
  .post('/:id/like', async (c) => {
    const user = getCurrentUser(c);
    const projectId = requireParam(c.req.param('id'), 'id');
    const result = await toggleProjectLike(projectId, user.id);
    return c.json(ok(result));
  })

  .get('/:id/likes', async (c) => {
    const projectId = requireParam(c.req.param('id'), 'id');
    const likes = await listProjectLikes(projectId);
    return c.json(ok({ likes }));
  })

  // COMMENTS
  .get('/:id/comments', zQuery(commentQuerySchema), async (c) => {
    const projectId = requireParam(c.req.param('id'), 'id');
    const { page, limit } = c.req.valid('query');
    const data = await listProjectComments(projectId, page, limit);
    return c.json(ok(data));
  })

  .post('/:id/comments', zJson(createCommentSchema), async (c) => {
    const user = getCurrentUser(c);
    const projectId = requireParam(c.req.param('id'), 'id');
    const { content } = c.req.valid('json');
    const comment = await createProjectComment(projectId, user.id, content);
    return c.json(ok({ comment }), 201);
  })

  .patch('/comments/:id', zJson(updateCommentSchema), async (c) => {
    const user = getCurrentUser(c);
    const commentId = requireParam(c.req.param('id'), 'id');
    const { content } = c.req.valid('json');
    const comment = await updateProjectComment(commentId, user.id, content);
    return c.json(ok({ comment }));
  })

  .delete('/comments/:id', async (c) => {
    const user = getCurrentUser(c);
    const commentId = requireParam(c.req.param('id'), 'id');
    const isAdmin = user.role === 'admin';
    await deleteProjectComment(commentId, user.id, isAdmin);
    return c.json(ok({ deleted: true }));
  })

  // ADMIN: hide/unhide comment
  .patch('/comments/:id/hide', zJson(z.object({ hidden: z.boolean() })), async (c) => {
    const user = getCurrentUser(c);
    if (user.role !== 'admin') throw AppError.forbidden('Hanya admin yang bisa menyembunyikan/menampilkan komentar.');

    const commentId = requireParam(c.req.param('id'), 'id');
    const { hidden } = c.req.valid('json');
    const comment = await hideProjectComment(commentId, hidden);
    return c.json(ok({ comment }));
  });