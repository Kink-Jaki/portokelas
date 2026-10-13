# Craftly

Platform portofolio untuk kreator: kreator mendaftar, menunggu kurasi admin,
lalu mempublikasikan profil dan projectnya. Admin mengkurasi kreator dan project.

- **Frontend** — React 18 + TypeScript + Vite, React Router, TanStack Query, Tailwind CSS v4, Framer Motion.
- **Backend** — Bun + Hono + Drizzle ORM + PostgreSQL, autentikasi cookie JWT (argon2id).
- **Upload** — penyimpanan lokal (JPG/PNG/WEBP, maks 2 MB) dengan validasi magic bytes.

## Fitur

| Area | Kemampuan |
| --- | --- |
| Publik | Landing, daftar kreator, portofolio kreator (`/m/:slug`), detail project, statistik, pencarian |
| Kreator | Registrasi, login, dashboard profil + project, upload avatar/cover/galeri |
| Admin | Login admin, kurasi kreator, moderasi sembunyikan/hapus project, daftar seluruh kreator & project |
| Keamanan | Argon2id, JWT httpOnly cookie, rate limit login/registrasi, validasi Zod di frontend + backend, proteksi path traversal, RBAC `member`/`admin` |

> **Catatan tampilan:** seluruh route aktif di `frontend/src/main.tsx` — landing (`/`), direktori
> kreator (`/members`), portofolio kreator (`/m/:slug`), detail project, login/registrasi, dashboard,
> dan admin. Desain memakai arah *modern editorial*: kertas hangat, serif display (Fraunces), aksen
> vermilion tunggal, aturan/nomor section, dan grid bergaris rambut. Backend, database, dan API tetap
> utuh.

## Alur Status Kreator

```
registrasi ──► pending ──(admin setujui)──► approved ──(admin suspend)──► suspended
                    │                                             ▲
                    └──(admin tolak + alasan)──► rejected ────────┘
```

- `pending`: bisa login, tetapi seluruh endpoint `/api/me/*` memblokir aksi (403).
- `approved`: akses penuh dashboard dan tampil di halaman publik.
- `rejected` / `suspended`: tidak bisa login, pesan error memuat alasan penolakan.

Endpoint publik hanya menampilkan akun **role `member` dengan status `approved`**.

## Prasyarat

- [Bun](https://bun.sh) 1.1+ (backend memakai runtime Bun).
- PostgreSQL 14+ lokal **atau** proyek Supabase.
- Node.js hanya diperlukan bila ingin memakai `npm` sebagai pengganti Bun.

## Setup Cepat

```bash
# 1. Install seluruh dependency workspace
bun install

# 2. Siapkan environment backend
cp backend/.env.example backend/.env      # Windows: copy backend\.env.example backend\.env
#   isi DATABASE_URL & JWT_SECRET (JWT_SECRET minimal 32 karakter)

# 3. Siapkan environment frontend (opsional untuk dev)
cp frontend/.env.example frontend/.env

# 4. Jalankan migrasi skema
bun run db:migrate

# 5. Isi data akun contoh (login pakai NIS, password default "password")
bun run seed:class
#    Opsional: buat akun admin terpisah dari nilai ADMIN_* di backend/.env
# bun run seed:admin

# 6. Jalankan backend + frontend (dua terminal)
bun run dev:backend      # http://localhost:8787
bun run dev:frontend     # http://localhost:5173
```

Atau jalankan keduanya sekaligus dari root: `bun run dev`.

### Konfigurasi `backend/.env`

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | ya | Connection string PostgreSQL/Supabase. Supabase → ambil dari **Project Settings → Database → URI**. |
| `DATABASE_SSL` | tidak | `true` untuk Supabase/production, `false` untuk PostgreSQL lokal. |
| `PORT` | tidak | Default `8787`. |
| `NODE_ENV` | tidak | Default `development`. |
| `JWT_SECRET` | ya | Minimal 32 karakter acak. Generate: `openssl rand -base64 48`. |
| `JWT_EXPIRES_IN` | tidak | Default `7d`. |
| `COOKIE_NAME` | tidak | Default `craftly_session`. |
| `CORS_ORIGIN` | tidak | Default `http://localhost:5173`, bisa dipisah koma untuk beberapa origin. |
| `UPLOAD_DIR` | tidak | Default `uploads` (relatif terhadap folder `backend`). |
| `MAX_UPLOAD_SIZE_MB` | tidak | Default `2`. |
| `PUBLIC_URL` | tidak | Origin publik backend, dipakai untuk penyusunan tautan. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | tidak | Hanya dipakai `bun run seed:admin` (akun admin opsional). Seeder utama `seed:class` tidak memerlukannya. |

### Konfigurasi `frontend/.env`

| Variabel | Keterangan |
| --- | --- |
| `VITE_API_URL` | Base URL backend. Kosongkan bila disajikan pada origin yang sama (dev server Vite sudah memproxy `/api` dan `/uploads`). |
| `VITE_API_PROXY` | Target proxy dev server. Default `http://localhost:8787`. |

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `bun run dev` | Jalankan backend + frontend bersamaan |
| `bun run dev:backend` / `bun run dev:frontend` | Jalankan masing-masing workspace |
| `bun run build` | Build production (frontend `dist/`, backend `tsc --noEmit`) |
| `bun run start` | Jalankan backend mode production |
| `bun run lint` / `bun run lint:fix` | ESLint |
| `bun run format` | Prettier |
| `bun run typecheck` | TypeScript check seluruh workspace |
| `bun run db:migrate` | Terapkan migrasi Drizzle |
| `bun run db:generate` | Buat migrasi baru setelah mengubah `schema.ts` |
| `bun run db:push` | Sinkronkan skema tanpa file migrasi (prototipe) |
| `bun run db:studio` | Drizzle Studio |
| `bun run seed:class` | Hapus semua akun lalu buat 31 akun kreator contoh (login pakai NIS) |
| `bun run seed:admin` | Buat/perbarui akun admin dari `ADMIN_*` (opsional) |

## Struktur Proyek

```
craftly/
├── backend/
│   ├── drizzle/              # hasil db:generate
│   ├── uploads/              # avatar & cover (diabaikan git)
│   └── src/
│       ├── db/               # schema, koneksi, seed admin
│       ├── lib/              # error, cookies, http, validasi
│       ├── middleware/       # auth, rate limit, error handler
│       ├── routes/           # auth, public, me, admin
│       ├── services/         # logika domain
│       └── validators/       # skema Zod
└── frontend/
    └── src/
        ├── components/       # ui, layout, domain
        ├── features/         # auth, landing, members, projects, dashboard, admin
        ├── hooks/            # useApi (query & mutation)
        ├── lib/              # api client, query client, utils
        ├── providers/        # AuthProvider, ThemeProvider
        └── types/            # tipe API
```

## Ringkasan API

Semua respons memakai bentuk `{ success, data, error }`; `error` berisi `{ code, message, details? }`.

| Metode | Endpoint | Akses |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Publik (rate limit 5/jam/IP) |
| `POST` | `/api/auth/login` | Publik (rate limit 10/15 menit/IP) |
| `POST` | `/api/auth/logout` | Sesi apa pun |
| `GET` | `/api/auth/me` | Publik (mengembalikan `user: null` bila belum login) |
| `GET` | `/api/stats` | Publik |
| `GET` | `/api/members`, `/api/members/:slug`, `/api/members/:slug/projects` | Publik |
| `GET` | `/api/projects/:idOrSlug` | Publik |
| `PATCH` | `/api/me/profile` | Anggota approved |
| `POST` | `/api/me/avatar` | Anggota approved |
| `GET` `POST` | `/api/me/projects` | Anggota approved |
| `PATCH` `DELETE` | `/api/me/projects/:id` | Pemilik project |
| `POST` | `/api/me/projects/:id/images` | Pemilik project |
| `DELETE` | `/api/me/projects/:projectId/images/:imageId` | Pemilik project |
| `GET` | `/api/admin/users`, `/api/admin/projects` | Admin |
| `PATCH` | `/api/admin/users/:id/status` | Admin (tidak bisa mengubah akun sendiri) |
| `PATCH` `DELETE` | `/api/admin/projects/:id/hide`, `/api/admin/projects/:id` | Admin |

Kode error: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404),
`CONFLICT` (409), `VALIDATION_ERROR` (422), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500).

## Upload

- Field avatar: `avatar` (form field). Field gambar project: `images` (boleh berkali-kali sekaligus).
- Format dan MIME diverifikasi lewat magic bytes, bukan sekadar ekstensi/header. Maksimal 2 MB per file.
- Nama file diganti UUID acak dan path disimpan relatif (`/uploads/projects/<uuid>.png`) sehingga mudah dipindah server.
- Mengganti avatar/cover atau menghapus project otomatis menghapus file lama di disk.

## Deployment

1. **Frontend**: `bun run build`, lalu sajikan `frontend/dist/` sebagai static site.
2. **Backend**: tidak ada proses build — Bun menjalankan TypeScript langsung. Jalankan `bun run start`
   dengan env production: `NODE_ENV=production`, `DATABASE_SSL=true`, `JWT_SECRET` acak,
   `CORS_ORIGIN` sesuai domain frontend.
3. Arahkan reverse proxy agar `/api` dan `/uploads` menuju backend, sedangkan sisanya menuju static `dist`.
4. Pastikan `frontend/dist` (atau folder upload) writable oleh proses backend untuk folder `backend/uploads`.

## Catatan Keamanan

- Password di-hash dengan argon2id (`Bun.password`), tidak pernah dikembalikan API.
- Sesi memakai JWT HS256 di cookie `HttpOnly` + `SameSite=Lax` (dan `Secure` saat `NODE_ENV=production`).
- Rate limit menyimpan hit di memori proses (cukup untuk satu instance); untuk multi-instance gunakan store eksternal.
- Upload menolak path traversal dan file yang bukan gambar sungguhan.