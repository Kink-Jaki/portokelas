export type UserRole = 'member' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type PublicUser = {
  id: string;
  name: string;
  alias: string | null;
  role: UserRole;
  slug: string;
  spotifyUrl: string | null;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  cvUrl: string | null;
  createdAt: string;
};

export type MemberProfile = PublicUser & {
  email: string;
  nim: string | null;
  role: UserRole;
  status: UserStatus;
  rejectionReason: string | null;
  updatedAt: string;
};

export type ProjectImage = {
  id: string;
  projectId: string;
  imageUrl: string;
  sortOrder: number;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  coverImageUrl: string | null;
  techStack: string[];
  demoUrl: string | null;
  repoUrl: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProjectImage[];
};

export type ProjectWithAuthor = Project & {
  author: Pick<PublicUser, 'id' | 'name' | 'role' | 'slug' | 'avatarUrl' | 'headline'> | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type PublicStats = {
  members: number;
  projects: number;
};

/** Konten statis section "Tentang" di halaman landing. */
export type About = {
  id: string;
  title: string | null;
  description: string;
  imageUrl: string | null;
  updatedAt: string;
};

/** Satu entri wali kelas pada carousel landing. */
export type Teacher = {
  id: string;
  name: string;
  description: string;
  photoUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type UserStatusSummary = Record<
  'all' | 'pending' | 'approved' | 'rejected' | 'suspended',
  number
>;

/** Bentuk respons seragam dari backend. */
export type ApiSuccess<T> = { success: true; data: T; error: null };
export type ApiFailure = {
  success: false;
  data: null;
  error: { code: string; message: string; details?: unknown };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/* ----------------------------- Input payload ----------------------------- */

export type LoginPayload = {
  identity: string;
  password: string;
};

export type ProfilePayload = {
  name?: string;
  alias?: string | null;
  spotifyUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  cvUrl?: string | null;
};

export type ProjectPayload = {
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  techStack: string[];
  demoUrl?: string | null;
  repoUrl?: string | null;
  coverImageUrl?: string | null;
};

export type ProjectPatchPayload = Partial<ProjectPayload>;

/** Update profil + role oleh admin (PATCH /admin/users/:id). */
export type AdminUpdateUserPayload = ProfilePayload & { role?: UserRole };

export type ValidationIssue = { path: string; message: string };

/** Info embed lagu Spotify yang disediakan backend pada halaman member. */
export type SpotifyEmbed = {
  embedUrl: string;
  title: string | null;
  artistName: string | null;
  thumbnailUrl: string | null;
};

export type MemberWithSpotify = PublicUser & { spotify?: SpotifyEmbed | null };
