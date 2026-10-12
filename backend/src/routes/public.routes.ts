import { Hono } from 'hono';
import { AppError } from '../lib/errors.js';
import { ok } from '../lib/http.js';
import { zQuery } from '../lib/validate.js';
import {
  getAbout,
  getMemberBySlug,
  getPublicStats,
  listMemoriesRandom,
  listMembers,
  listProjectsByMemberSlug,
  getProjectAuthor,
  getPublicProject,
  listTeachers,
  resolveSpotifyEmbed,
} from '../services/index.js';
import { memberQuerySchema } from '../validators/user.js';

/** Endpoint publik — data anggota & konten yang tampil di landing page. */
export const publicRoutes = new Hono()
  .get('/stats', async (c) => {
    const stats = await getPublicStats();
    return c.json(ok(stats));
  })
  .get('/about', async (c) => {
    const about = await getAbout();
    return c.json(ok({ about }));
  })
  .get('/teachers', async (c) => {
    const teachers = await listTeachers();
    return c.json(ok({ teachers }));
  })
  .get('/memories', async (c) => {
    const memories = await listMemoriesRandom();
    return c.json(ok({ memories }));
  })
  .get('/members', zQuery(memberQuerySchema), async (c) => {
    const members = await listMembers(c.req.valid('query'));
    return c.json(ok(members));
  })
  .get('/members/:slug', async (c) => {
    const member = await getMemberBySlug(c.req.param('slug'));
    if (!member) {
      throw AppError.notFound('Portofolio anggota tidak ditemukan.');
    }
    const spotify = member.spotifyUrl ? await resolveSpotifyEmbed(member.spotifyUrl) : null;
    return c.json(ok({ member: spotify ? { ...member, spotify } : member }));
  })
  .get('/members/:slug/projects', async (c) => {
    const slug = c.req.param('slug');
    const member = await getMemberBySlug(slug);
    if (!member) {
      throw AppError.notFound('Portofolio anggota tidak ditemukan.');
    }
    const projects = await listProjectsByMemberSlug(slug);
    return c.json(ok({ projects }));
  })
  .get('/projects/:idOrSlug', async (c) => {
    const project = await getPublicProject(c.req.param('idOrSlug'));
    if (!project) throw AppError.notFound('Project tidak ditemukan atau sedang disembunyikan.');
    const author = await getProjectAuthor(project.id);
    return c.json(ok({ project, author }));
  });
