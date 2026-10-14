export type UserRole = 'member' | 'admin';

/** Preset tema tampilan card & portofolio anggota. */
export type MemberThemePreset =
  'editorial' | 'midnight' | 'forest' | 'burgundy' | 'mono' | 'ocean' | 'sunset' | 'sakura';

/** Kustomisasi tampilan card & portofolio anggota. */
export type MemberTheme = {
  preset: MemberThemePreset;
  accent?: string;
  bg?: string;
  surface?: string;
  fg?: string;
};

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
  theme: MemberTheme | null;
  cardHtml: string | null;
  createdAt: string;
};

export type MemberProfile = PublicUser & {
  email: string;
  nim: string | null;
  role: UserRole;
  updatedAt: string;
};

export type Memory = {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
};

export type MemoryAuthor = Pick<
  PublicUser,
  'id' | 'name' | 'alias' | 'slug' | 'avatarUrl' | 'role'
>;

export type MemoryWithAuthor = Memory & { author: MemoryAuthor | null };

export type ProjectImage = {
  id: string;
  projectId: string;
  imageUrl: string;
  sortOrder: number;
};

/** Anggota yang ikut mengerjakan sebuah project (tanpa kredensial). */
export type CollaboratorUser = Pick<
  PublicUser,
  'id' | 'name' | 'alias' | 'slug' | 'avatarUrl' | 'headline' | 'role'
>;

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
  collaborators: CollaboratorUser[];
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

/** Gambar kolase hero di halaman landing (tiga slot, opsional). */
export type Hero = {
  id: string;
  image1Url: string | null;
  image2Url: string | null;
  image3Url: string | null;
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
  theme?: MemberTheme | null;
  cardHtml?: string | null;
};

export type ProjectPayload = {
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  techStack: string[];
  demoUrl?: string | null;
  repoUrl?: string | null;
  coverImageUrl?: string | null;
  collaboratorIds?: string[];
};

export type ProjectPatchPayload = Partial<ProjectPayload>;

/** Update profil + role oleh admin (PATCH /admin/users/:id). */
export type AdminUpdateUserPayload = ProfilePayload & { role?: UserRole };

export type UpdateEmailPayload = {
  email: string;
  password: string;
};

export type UpdatePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ValidationIssue = { path: string; message: string };

export type SpotifyEntityType = 'track' | 'playlist' | 'album' | 'artist' | 'episode' | 'show';

/** Info embed Spotify (lagu, playlist, album, artis, atau episode) dari backend. */
export type SpotifyEmbed = {
  type?: SpotifyEntityType;
  embedUrl: string;
  title: string | null;
  artistName: string | null;
  thumbnailUrl: string | null;
};

export type MemberWithSpotify = PublicUser & { spotify?: SpotifyEmbed | null };
