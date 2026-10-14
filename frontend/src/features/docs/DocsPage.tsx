import { Link } from 'react-router-dom';

import { CardSandboxPlayground } from '@/features/docs/CardSandboxPlayground';

export default function DocsPage() {
  return (
      <div className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-ivory to-ivory-alt/40">
        <div className="container-page py-12 lg:py-16">
          <header className="mb-12 text-center">
            <p className="eyebrow inline-flex items-center rounded-full border border-line bg-ivory px-3 py-1 shadow-sm">
              Dokumentasi
            </p>
            <h1 className="mt-4 text-4xl font-display tracking-tight lg:text-5xl xl:text-6xl">
              Panduan Penggunaan <span className="text-burgundy">Craftly</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              Panduan lengkap cara menggunakan platform untuk mendaftar, mengelola project, mengatur profil, hingga
              menambahkan Spotify Embed dengan contoh nyata.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/members"
                className="rounded-sm bg-forest px-5 py-2 text-sm font-medium text-ivory shadow-sm transition hover:bg-burgundy"
              >
                Jelajahi Direktori
              </Link>
              <Link
                to="/dashboard"
                className="rounded-sm border border-line bg-ivory px-5 py-2 text-sm font-medium transition hover:border-burgundy hover:text-burgundy"
              >
                Buka Dashboard
              </Link>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <nav className="sticky top-28 rounded-xl border border-line bg-ivory p-6 shadow-sm">
                <p className="text-sm font-semibold text-forest">Daftar Isi</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a
                      href="#pendahuluan"
                      className="rounded-md px-2 py-1.5 text-muted transition hover:bg-ivory-alt hover:text-forest"
                    >
                      Pendahuluan
                    </a>
                  </li>
                  <li>
                    <a
                      href="#menambah-project"
                      className="rounded-md px-2 py-1.5 text-muted transition hover:bg-ivory-alt hover:text-forest"
                    >
                      Cara Menambah Project
                    </a>
                  </li>
                  <li>
                    <a
                      href="#spotify-embed"
                      className="rounded-md px-2 py-1.5 text-muted transition hover:bg-ivory-alt hover:text-forest"
                    >
                      Spotify Embed + Contoh
                    </a>
                  </li>
                  <li>
                    <a
                      href="#display-fitur"
                      className="rounded-md px-2 py-1.5 text-muted transition hover:bg-ivory-alt hover:text-forest"
                    >
                      Display Fitur
                    </a>
                  </li>
                  <li>
                    <a
                      href="#kartu-kustom"
                      className="rounded-md px-2 py-1.5 text-muted transition hover:bg-ivory-alt hover:text-forest"
                    >
                      Kartu Kustom
                    </a>
                  </li>
                </ul>
              </nav>
            </aside>

            <div className="space-y-10 lg:col-span-9">
              <section id="pendahuluan" className="rounded-xl border border-line bg-ivory p-8 shadow-sm">
                <h2 className="text-2xl font-display text-forest">Pendahuluan</h2>
                <p className="mt-4 leading-relaxed text-muted">
                  Platform ini memudahkan kreator untuk membagikan portofolio karya mereka secara terstruktur dan
                  menarik. Melalui halaman Dokumentasi ini, kamu bisa belajar cara mengelola project, mengatur profil,
                  hingga menampilkan elemen interaktif seperti Spotify Embed.
                </p>
              </section>

              <section id="menambah-project" className="rounded-xl border border-line bg-ivory p-8 shadow-sm">
                <h2 className="text-2xl font-display text-forest">Cara Menambah Project</h2>
                <p className="mt-4 leading-relaxed text-muted">
                  Untuk menambahkan project baru ke portofoliomu, ikuti langkah-langkah berikut:
                </p>

                <ol className="mt-6 space-y-4 text-muted">
                  <li className="leading-relaxed">
                    <span className="font-medium text-forest">1. Masuk ke Dashboard</span> – Login terlebih dahulu,
                    lalu buka halaman <Link to="/dashboard" className="text-burgundy underline">
                      Dashboard
                    </Link>
                    .
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-medium text-forest">2. Buka tab Projects</span> – Pada sidebar/dashboard,
                    pilih menu <strong>Projects</strong> untuk melihat daftar project-mu.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-medium text-forest">3. Tambah Project Baru</span> – Klik tombol{' '}
                    <strong>+ Tambah Project</strong>, lalu isi form yang tersedia (Judul, Deskripsi, Tech Stack,
                    Tautan Live/Repo, Thumbnail, dll.)
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-medium text-forest">4. Simpan</span> – Tekan tombol Simpan. Project-mu akan
                    langsung tampil di halaman portofoliomu dan bisa dilihat oleh kreator lainnya.
                  </li>
                </ol>

                <div className="mt-6 rounded-md border border-line bg-ivory-alt/60 p-4 text-sm text-muted">
                  <strong>Tips:</strong> Gunakan deskripsi yang singkat dan jelas, serta tambahkan screenshot/thumbnail
                  agar project-mu terlihat lebih menarik.
                </div>
              </section>

              <section id="spotify-embed" className="rounded-xl border border-line bg-ivory p-8 shadow-sm">
                <h2 className="text-2xl font-display text-forest">Spotify Embed + Contoh</h2>
                <p className="mt-4 leading-relaxed text-muted">
                  Kamu bisa menambahkan Spotify Embed ke dalam deskripsi atau media project untuk menampilkan lagu/playlist
                  secara langsung.
                </p>

                <h3 className="mt-6 text-lg font-semibold text-forest">Cara Mendapatkan Spotify Embed</h3>
                <ol className="mt-4 space-y-3 text-muted">
                  <li className="leading-relaxed">
                    1. Buka lagu/album/playlist di <a
                      href="https://open.spotify.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-burgundy underline"
                    >
                      Spotify Web
                    </a>
                    .
                  </li>
                  <li className="leading-relaxed">
                    2. Klik tombol <strong>...</strong> (More) &gt; <strong>Share</strong> &gt;{' '}
                    <strong>Embed Track/Playlist</strong>.
                  </li>
                  <li className="leading-relaxed">
                    3. Spotify akan menampilkan kode iframe. Kamu bisa copy kode tersebut, atau copy link-nya.
                  </li>
                  <li className="leading-relaxed">4. Tempelkan ke bagian deskripsi project-mu.</li>
                </ol>

                <h3 className="mt-8 text-lg font-semibold text-forest">Contoh Kode Embed</h3>
                <pre className="mt-4 overflow-x-auto rounded-md border border-line bg-forest/95 p-4 text-sm text-ivory">
                  <code>{`<iframe
  style="border-radius:12px"
  src="https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC?utm_source=generator"
  width="100%"
  height="152"
  frameBorder="0"
  allowfullscreen=""
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
></iframe>`}</code>
                </pre>

                <h3 className="mt-8 text-lg font-semibold text-forest">Tips Penggunaan</h3>
                <ul className="mt-4 space-y-2 text-muted">
                  <li className="leading-relaxed">• Gunakan <code>width="100%"</code> agar embed bisa menyesuaikan lebar container.</li>
                  <li className="leading-relaxed">• Untuk track biasa, tinggi <code>152px</code> sudah cukup pas.</li>
                  <li className="leading-relaxed">• Untuk playlist/album, bisa naikkan tinggi (contoh <code>352px</code> atau <code>420px</code>).</li>
                  <li className="leading-relaxed">• Pastikan link yang dipakai adalah link <strong>embed</strong> (mengandung <code>/embed/</code>), bukan link biasa.</li>
                </ul>
              </section>

              <section id="display-fitur" className="rounded-xl border border-line bg-ivory p-8 shadow-sm">
                <h2 className="text-2xl font-display text-forest">Display Fitur</h2>
                <p className="mt-4 leading-relaxed text-muted">
                  Beberapa fitur tampilan (display) yang bisa kamu manfaatkan untuk mempercantik portofoliomu:
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-forest">Tech Stack</h3>
                    <p className="mt-2 leading-relaxed text-muted">
                      Tambahkan daftar teknologi yang dipakai di project-mu (React, TypeScript, Tailwind, dll.). Tech
                      stack ini akan ditampilkan sebagai badge pada kartu project dan halaman detail project.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-forest">Thumbnail & Screenshot</h3>
                    <p className="mt-2 leading-relaxed text-muted">
                      Unggah thumbnail utama agar project-mu mudah dikenali di direktori. Kamu juga bisa menambahkan
                      screenshot tambahan untuk memperlihatkan tampilan aplikasi secara lengkap.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-forest">Link Project</h3>
                    <p className="mt-2 leading-relaxed text-muted">
                      Bisa menambahkan <strong>Live Demo</strong> (link website yang bisa dicoba) dan{' '}
                      <strong>Repository</strong> (GitHub/GitLab) agar orang lain bisa melihat source code atau mencoba
                      langsung karyamu.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-forest">Kolaborator</h3>
                    <p className="mt-2 leading-relaxed text-muted">
                      Jika project-mu dikerjakan bersama tim, kamu bisa menambahkan kolaborator pada project tersebut.
                      Mereka akan ikut tampil di halaman detail project.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-md border border-line bg-ivory-alt/60 p-4 text-sm text-muted">
                  <strong>Catatan:</strong> Selalu pastikan link yang kamu tambahkan bisa diakses publik (khususnya
                  live demo) agar bisa dilihat semua orang.
                </div>
              </section>

              <section id="kartu-kustom" className="rounded-xl border border-line bg-ivory p-8 shadow-sm">
                <h2 className="text-2xl font-display text-forest">Kartu Direktori Kustom</h2>
                <p className="mt-4 leading-relaxed text-muted">
                  Ubah tampilan kartu yang muncul di direktori anggota dengan HTML &amp; CSS milikmu sendiri. Sandbox
                  di bawah memakai template kartu dashboard: sunting kode lalu lihat pratinjaunya secara langsung.
                </p>
                <div className="mt-6">
                  <CardSandboxPlayground />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
  );
}

