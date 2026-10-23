# Craftly

Platform portofolio untuk anggota: anggota mendaftar, menunggu kurasi admin,
lalu mempublikasikan profil dan projectnya. Admin mengkurasi anggota dan project.

- **Frontend** — React 18 + TypeScript + Vite, React Router, TanStack Query, Tailwind CSS v4, Framer Motion.
- **Backend** — Hono + Drizzle ORM + PostgreSQL. Dijalankan di **Cloudflare Workers** (produksi) atau Bun (pengembangan lokal). Autentikasi cookie JWT.
- **Upload** — gambar: **Workers KV** (produksi, atau R2 bila binding diaktifkan) / penyimpanan lokal saat dev (JPG/PNG/WEBP, maks 2 MB) dengan validasi magic bytes. Video kenangan: unggah **langsung dari browser ke Cloudflare R2** via presigned POST (MP4/WEBM, maks 1 menit & 50 MB), tanpa melewati server.

## Fitur

| Area | Kemampuan |
| --- | --- |
| Publik | Landing, daftar anggota, portofolio anggota (`/m/:slug`), detail project, statistik, pencarian |
| Anggota | Registrasi, login, dashboard profil + project, upload avatar/cover/galeri |
| Admin | Login admin, kurasi anggota, moderasi sembunyikan/hapus project, daftar seluruh anggota & project |
| Keamanan | Argon2id, JWT httpOnly cookie, rate limit login/registrasi, validasi Zod di frontend + backend, proteksi path traversal, RBAC `member`/`admin` |

> **Catatan tampilan:** seluruh route aktif di `frontend/src/main.tsx` — landing (`/`), direktori
> anggota (`/members`), portofolio anggota (`/m/:slug`), detail project, login/registrasi, dashboard,
> dan admin. Desain memakai arah *modern editorial*: kertas hangat, serif display (Fraunces), aksen
> vermilion tunggal, aturan/nomor section, dan grid bergaris rambut. Backend, database, dan API tetap
> utuh.

## Alur Status Anggota

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

- [Bun](https://bun.sh) 1.1+ (backend dev lokal + tooling).
- PostgreSQL 14+ lokal **atau** proyek Supabase/Neon.
- Untuk deploy: akun **Cloudflare** (Workers + R2 + Hyperdrive) — lihat bagian Deployment.
- Node.js hanya diperlukan bila ingin memakai `npm`/`npx` sebagai pengganti Bun.

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
| `DATABASE_URL` | ya | Connection string PostgreSQL/Neon. Neon → **Connection string** di Neon Console (sertakan `?sslmode=require`). |
| `DATABASE_SSL` | tidak | `true` untuk Neon/production, `false` untuk PostgreSQL lokal. |
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
| `bun run start` | Jalankan backend mode production (Bun) |
| `bun run --cwd backend cf:dev` | Jalankan backend di runtime Cloudflare Workers secara lokal |
| `bun run --cwd backend cf:deploy` | Deploy backend ke Cloudflare Workers |
| `bun run lint` / `bun run lint:fix` | ESLint |
| `bun run format` | Prettier |
| `bun run typecheck` | TypeScript check seluruh workspace |
| `bun run db:migrate` | Terapkan migrasi Drizzle |
| `bun run db:generate` | Buat migrasi baru setelah mengubah `schema.ts` |
| `bun run db:push` | Sinkronkan skema tanpa file migrasi (prototipe) |
| `bun run db:studio` | Drizzle Studio |
| `bun run seed:class` | Hapus semua akun lalu buat 31 akun anggota contoh (login pakai NIS) |
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
| `POST` | `/api/upload/video-url` | Admin — buat presigned POST R2 |
| `POST` | `/api/admin/memories/video/complete` | Admin — simpan URL video kenangan |

Kode error: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404),
`CONFLICT` (409), `VALIDATION_ERROR` (422), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500).

## Upload

- Field avatar: `avatar` (form field). Field gambar project: `images` (boleh berkali-kali sekaligus).
- Format dan MIME diverifikasi lewat magic bytes, bukan sekadar ekstensi/header. Maksimal 2 MB per file.
- Nama file diganti UUID acak dan path disimpan relatif (`/uploads/projects/<uuid>.png`) sehingga mudah dipindah server.
- Mengganti avatar/cover atau menghapus project otomatis menghapus file lama (di Workers KV saat produksi, di disk saat dev lokal). R2 juga didukung bila binding `UPLOADS_BUCKET` dipakai.

### Video kenangan — upload langsung ke R2

Alur (khusus admin, satu video aktif di landing):

1. Frontend memvalidasi tipe (MP4/WEBM), ukuran (maks 50 MB), dan durasi (maks 1 menit).
2. `POST /api/upload/video-url` membuat presigned POST dengan key `videos/<uuid>.<ext>`, masa berlaku **5 menit**, dan policy `content-length-range` 1–50 MB.
3. Browser mengunggah file langsung ke R2 memakai `XMLHttpRequest` (progress bar), lalu `POST /api/admin/memories/video/complete` menyimpan public URL ke tabel `memory_videos`.
4. Backend hanya menerima URL yang berasal dari `R2_PUBLIC_URL` milik kita dan berpola `videos/<uuid>.(mp4|webm)`; video lama otomatis dihapus dari R2 saat diganti/dihapus.

> Catatan: `createPresignedPost` menghasilkan policy **POST multipart**, bukan PUT. Ini yang membuat batas 50 MB benar-benar ditegakkan di sisi R2, bukan hanya di frontend.

Environment yang dibutuhkan:

| Variabel | Keterangan |
| --- | --- |
| `R2_ACCOUNT_ID` | Account ID Cloudflare. |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Token S3 API R2 (Object Read & Write). Set via `wrangler secret put`. |
| `R2_BUCKET` | Nama bucket video. |
| `R2_PUBLIC_URL` | Custom domain bucket atau URL publik `r2.dev`, tanpa `/` di akhir. |

Contoh CORS bucket ada di `backend/r2-cors.json` (izinkan `POST`/`PUT` dan header `Content-Type` dari origin frontend). Terapkan lewat Dashboard R2 → bucket → Settings → CORS Policy, atau:

```bash
bunx wrangler r2 bucket cors set <NAMA_BUCKET> --file backend/r2-cors.json
```

**Menghubungkan custom domain ke bucket:** Dashboard Cloudflare → R2 → bucket → Settings → Custom Domains → Connect Domain, masukkan subdomain (mis. `cdn.portokelas.com`), lalu ikuti petunjuk DNS. Setelah aktif, set `R2_PUBLIC_URL=https://cdn.portokelas.com` dan pastikan domain dapat diakses publik lewat HTTPS agar `<video>` bisa memutar file.

## Alur Branch, CI & Rilis

- **Kerja di `dev`, rilis ke `main`.** Jangan commit fitur baru langsung ke `main`.
  Kalau kedua branch dikerjakan paralel, tampilan bisa beda (kasus nyata: fitur NGL
  dikomit langsung di `main`, sedangkan `dev` masih dari commit lama sehingga menu
  NGL tidak ada di sidebar `dev`). Setelah merge, kedua branch wajib menunjuk commit
  yang sama — cek dengan `git rev-parse main dev`.
- **Selalu `git pull` sebelum build/deploy.** Build dari commit lama menghasilkan
  `dist/` yang tampilannya tertinggal.
- **CI (`.github/workflows/ci.yml`)** jalan di setiap push/PR ke `main` dan `dev`:
  lint → typecheck → build → **verifikasi menu NGL ada di bundle** → verifikasi
  `_headers` → upload `dist` → deploy Cloudflare Pages. Supaya deploy-nya aktif, set
  secret `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` di GitHub → Settings →
  Secrets and variables → Actions; kalau belum di-set, CI tetap memvalidasi build
  dan melewati deploy.
- **Anti index.html basi**: `frontend/public/_headers` memaksa `index.html` selalu
  revalidasi (`max-age=0, must-revalidate`) dan aset ber-hash di-cache 1 tahun.
  Tanpa ini browser bisa menyajikan bundle lama setelah deploy (hard-refresh
  `Ctrl+Shift+R` tetap disarankan sekali).
- **DB lokal vs migrasi**: kalau database lokal pernah disinkronkan dengan `db:push`,
  catatan migrasi di `drizzle.__drizzle_migrations` bisa tertinggal sehingga
  `db:migrate` tidak menerapkan migrasi baru. Gejala: endpoint baru error 500
  (kasus nyata: `/api/settings/ngl` dan `/api/ngl/messages` — tabel `ngl_messages`
  belum ada). Cek: jumlah baris `drizzle.__drizzle_migrations` harus sama dengan
  jumlah file `backend/drizzle/*.sql`; bila kurang, tandai migrasi lama yang sudah
  terlanjur diterapkan sebagai recorded, baru jalankan `bun run db:migrate`.
- **Verifikasi cepat setelah build**:
  ```bash
  grep -R "Kotak NGL" frontend/dist/assets/*.js   # harus ketemu
  ```

## Deployment

### Backend — Cloudflare Workers

Backend berjalan sebagai Cloudflare Worker (Hono). Database **Neon (PostgreSQL)**
diakses via **Hyperdrive** — cara yang direkomendasikan Cloudflare untuk `pg`.
Gambar unggahan disimpan di **Workers KV**, sedangkan video kenangan diunggah
langsung dari browser ke **Cloudflare R2** (butuh bucket + API token R2).

> Penting: **query caching Hyperdrive harus dimatikan** untuk aplikasi ini.
> Hyperdrive secara default men-cache hasil `SELECT` (default `max_age` 60 detik +
> `stale_while_revalidate` 15 detik) dan **tidak meng-invalidate cache itu saat
> aplikasi menulis ke database**. Akibatnya data yang baru ditambahkan/diubah/
> dihapus tidak langsung terlihat di daftar (_admin panel, dashboard anggota_,
> dst.) sampai cache kedaluwarsa — persis gejala "di production gabisa tambah/hapus
> data". Buat/ubah Hyperdrive dengan `--caching-disabled`:
> ```bash
> bunx wrangler hyperdrive update <HYPERDRIVE_CONFIG_ID> --caching-disabled
> ```
>
> Setiap request membuat pool DB sendiri (maks 1 koneksi) di dalam konteks
> `AsyncLocalStorage` dan menutupnya lewat `ctx.waitUntil` (lihat
> `backend/src/worker.ts` dan `backend/src/runtime.ts`). Workers melarang socket
> dipakai lintas request; Hyperdrive tetap melakukan connection pooling ke
> database asli, jadi membuat koneksi baru per request tetap murah.

1. **Prasyarat**: akun Cloudflare + `wrangler` (sudah ada di `devDependencies`).
   Login sekali: `bunx wrangler login`.
2. **Siapkan Neon**: buat role khusus (mis. `hyperdrive-user`) di Neon Console, lalu
   salin connection string dengan **"Connection pooling" DIMATIKAN** (host tanpa
   `-pooler`) dan sertakan `?sslmode=require`. Hyperdrive sudah punya pooling sendiri,
   jadi jangan pakai host pooled.
3. **Buat Hyperdrive** menuju Neon:
   ```bash
   bunx wrangler hyperdrive create portofolio-kelas-db \
     --connection-string="postgresql://hyperdrive-user:PASSWORD@ep-xxx.<region>.aws.neon.tech/<db>?sslmode=require" \
     --caching-disabled
   ```
   Salin `id` hasilnya ke `backend/wrangler.jsonc` (binding `HYPERDRIVE`).
4. **Buat namespace KV** untuk unggahan:
   ```bash
   bunx wrangler kv namespace create UPLOADS_KV
   ```
   Salin `id` hasilnya ke `backend/wrangler.jsonc` (binding `UPLOADS_KV`).
   (Alternatif untuk gambar: aktifkan R2 lalu ganti blok `kv_namespaces` dengan
   `r2_buckets` bertipe `UPLOADS_BUCKET`. Ini terpisah dari bucket video yang
   diakses lewat S3 API dan variabel `R2_*`.)
5. **Set secret** (jangan simpan di `wrangler.jsonc`):
   ```bash
   bunx wrangler secret put JWT_SECRET
   ```
   Variabel non-rahasia (`NODE_ENV`, `CORS_ORIGIN`, `COOKIE_NAME`, dst) diatur di
   `wrangler.jsonc` pada bagian `vars`.
6. **Migrasi & seed** dijalankan dari lokal menuju Neon (set `DATABASE_URL`
   ke connection string Neon dan `DATABASE_SSL=true` di `backend/.env`; host pooled
   boleh dipakai untuk langkah ini):
   ```bash
   bun run db:migrate
   bun run seed:class
   ```
7. **Deploy**: `bun run --cwd backend cf:deploy` (atau `bunx wrangler deploy` dari `backend/`).
8. **Dev dengan runtime Workers**: simpan connection string Neon (non-pooled) di
   `backend/.env` sebagai
   `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgresql://...?sslmode=require"`,
   lalu jalankan `bun run --cwd backend cf:dev`.

> Catatan: entry Worker ada di `backend/src/worker.ts`, sedangkan `backend/src/index.ts`
> tetap dipakai untuk `bun run dev:backend` (server Bun biasa + storage lokal).

### Frontend — Cloudflare Pages

Frontend di-deploy sebagai Cloudflare Pages. Karena cookie sesi memakai
`SameSite=Lax`, halaman **tidak** memanggil Worker lintas origin; sebaliknya
`frontend/functions/` mem-proxy `/api/*` dan `/uploads/*` ke Worker sehingga semua
request bersifat same-origin (cookie tetap terkirim).

1. Buat project: `bunx wrangler pages project create portofolio-kelas --production-branch main`
   (dari folder `frontend/`).
2. Build lalu deploy:
   ```bash
   bun run --cwd frontend build
   bunx wrangler pages deploy dist --project-name portofolio-kelas --branch main
   ```
3. Biarkan `VITE_API_URL` **kosong** (default) — request memakai path relatif dan
   diproxy oleh Pages Functions.
4. Bila URL Worker berubah, perbarui konstanta `DEFAULT_API_ORIGIN` di
   `frontend/functions/api/[[path]].ts` dan `frontend/functions/uploads/[[path]].ts`
   (atau set env `API_ORIGIN` di dashboard Pages).
5. Set `CORS_ORIGIN` di `backend/wrangler.jsonc` ke origin Pages, mis.
   `https://portofolio-kelas.pages.dev`.

### Frontend — Vercel (alternatif)

Frontend bisa juga di-deploy ke Vercel. `frontend/vercel.json` sudah memuat
`rewrites` untuk mem-proxy `/api/*` dan `/uploads/*` ke Worker (same-origin, sama
seperti Pages) plus SPA fallback ke `/index.html`.

1. Import repo di Vercel, lalu set **Root Directory** = `frontend`.
2. Biarkan install/build default Vercel (preset Vite: `npm install` + `npm run build`
   → `dist`; `frontend/vercel.json` juga menetapkan `buildCommand`/`outputDirectory`).
   `frontend/package.json` mandiri sehingga tidak perlu lockfile workspace Bun.
3. Biarkan `VITE_API_URL` **kosong** — request memakai path relatif dan diproxy
   oleh `rewrites`.
4. Bila URL Worker berubah, perbarui `destination` di `frontend/vercel.json`.
5. Tambahkan domain Vercel ke `CORS_ORIGIN` di `backend/wrangler.jsonc`
   (boleh daftar dipisah koma), mis.
   `https://portofolio-kelas.pages.dev,https://portokelas.vercel.app`.

## Catatan Keamanan

- Password di-hash dengan PBKDF2-SHA256 (Web Crypto, 100.000 iterasi + salt acak), tidak pernah dikembalikan API.
- Sesi memakai JWT HS256 di cookie `HttpOnly` + `SameSite=Lax` (dan `Secure` saat `NODE_ENV=production`).
- Rate limit menyimpan hit di memori proses (cukup untuk satu instance); untuk multi-instance gunakan store eksternal.
- Upload menolak path traversal dan file yang bukan gambar sungguhan.
