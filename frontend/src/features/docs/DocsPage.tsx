import { Link } from 'react-router-dom';

import { SiteFooter, SiteHeader } from '@/components/layout/SiteHeader';

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-ivory to-ivory-alt/40">
        <div className="container-page py-12 lg:py-16">
          <header className="mb-12 text-center">
            <p className="eyebrow inline-flex items-center rounded-full border border-line bg-ivory px-3 py-1 shadow-sm">
              Dokumentasi
            </p>
            <h1 className="mt-4 text-4xl font-display tracking-tight lg:text-5xl xl:text-6xl">
              Panduan Penggunaan <span className="text-burgundy">Satu Kelas</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              Panduan lengkap cara menggunakan platform untuk mendaftar, mengelola project, mengatur profil, hingga menambahkan Spotify Embed dengan contoh nyata.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/members" className="rounded-sm bg-forest px-5 py-2 text-sm font-medium text-ivory shadow-sm transition hover:bg-burgundy">
                Jelajahi Direktori
              </Link>
              <Link to="/dashboard" className="rounded-sm border border-line bg-ivory px-5 py-2 text-sm font-medium transition hover:border-burgundy hover:text-burgundy">
                Buka Dashboard
              </Link>
              <div className="grid gap-8 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <nav className="sticky top-28 rounded-xl border border-line bg-ivory p-6 shadow-sm">
                <p className="text-sm font-semibold text-forest">Daftar Isi</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li><a href="#pendahuluan" className="rounded-md px-2 py-1.5 text-muted hover:bg-ivory-alt hover:text-forest">Pendahuluan</a></li>
                  <li><a href="#menambah-project" className="rounded-md px-2 py-1.5 text-muted hover:bg-ivory-alt hover:text-forest">Cara Menambah Project</a></li>
                  <li><a href="#spotify-embed" className="rounded-md px-2 py-1.5 text-muted hover:bg-ivory-alt hover:text-forest">Spotify Embed + Contoh</a></li>
                  <li><a href="#display-fitur" className="rounded-md px-2 py-1.5 text-muted hover:bg-ivory-alt hover:text-forest">Display Fitur</a></li>
                </ul>
              </nav>
            </aside>
            <div className="lg:col-span-9 space-y-10">
              <section id="pendahuluan" className="rounded-xl border border-line bg-ivory p-8 shadow-sm">
                <h2 className="text-2xl font-display">Pendahuluan</h2>
                <p className="mt-4 text-muted">Platform ini memudahkan anggota kelas untuk membagikan portofolio karya mereka secara terstruktur dan menarik.</p>
              </section>
            </div>
          </div>
        </div>
          </header>
          <div className="grid gap-8 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <nav className="sticky top-28 rounded-xl border border-line bg-ivory p-6 shadow-sm">
                <p className="text-sm font-semibold text-forest">Daftar Isi</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li><a href="#pendahuluan" className="rounded-md px-2 py-1.5 text-muted hover:bg-ivory-alt hover:text-forest">Pendahuluan</a></li>
                  <li><a href="#menambah-project" className="rounded-md px-2 py-1.5 text-muted hover:bg-ivory-alt hover:text-forest">Cara Menambah Project</a></li>
                  <li><a href="#spotify-embed" className="rounded-md px-2 py-1.5 text-muted hover:bg-ivory-alt hover:text-forest">Spotify Embed + Contoh</a></li>
                  <li><a href="#display-fitur" className="rounded-md px-2 py-1.5 text-muted hover:bg-ivory-alt hover:text-forest">Display Fitur</a></li>
                </ul>
              </nav>
            </aside>
            <div className="lg:col-span-9 space-y-10">
              <section id="pendahuluan" className="rounded-xl border border-line bg-ivory p-8 shadow-sm">
                <h2 className="text-2xl font-display">Pendahuluan</h2>
                <p className="mt-4 text-muted">Platform ini memudahkan anggota kelas untuk membagikan portofolio karya mereka secara terstruktur dan menarik.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

