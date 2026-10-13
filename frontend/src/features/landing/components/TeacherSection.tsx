import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { useTeachers } from '@/hooks/usePublic';
import { assetUrl } from '@/lib/api';
import { initials } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Data turunan                                                              */
/*  Model wali kelas di backend hanya memuat name, description, photoUrl, dan  */
/*  sortOrder. Label kelas, jabatan, dan kutipan diturunkan dari urutan agar   */
/*  data backend tetap utuh. Ganti daftar di bawah bila struktur data berubah. */
/* -------------------------------------------------------------------------- */

const CLASS_LABELS = ['Kelas 10', 'Kelas 11', 'Kelas 12'];
const ROLE_LABELS = ['Wali Kelas X', 'Wali Kelas XI', 'Wali Kelas XII'];
const QUOTES = [
  'Langkah kecil hari ini adalah awal dari kesuksesan besar nanti.',
  'Jangan berhenti belajar, karena masa depan dimulai dari sekarang.',
  'Percayalah pada proses, karena setiap usaha tidak akan mengkhianati hasil.',
];

const resolveClassLabel = (index: number) => CLASS_LABELS[index] ?? `Kelompok ${index + 1}`;
const resolveRole = (index: number) => ROLE_LABELS[index] ?? 'Wali Kelas';
const resolveQuote = (index: number) =>
  QUOTES[index] ?? 'Setiap proses belajar adalah langkah menuju masa depan yang lebih baik.';

/* ---------------------------------- Ikon ---------------------------------- */

function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v4.5c0 1.4 2.7 3 6 3s6-1.6 6-3V12" />
    </svg>
  );
}

function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 3c4.8 2.1 7.8 5.9 7.8 10.6 0 4-3.2 7.4-7.8 7.4s-7.8-3.4-7.8-7.4C4.2 8.9 7.2 5.1 12 3Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M12 6.2v13" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 11 8.6 8.4M12 15l3.4-2.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M9.6 5.5C6.4 7.1 4.8 9.6 4.8 13v5.5h5.4V13H7.6c.2-1.9 1.3-3.2 3.2-3.9L9.6 5.5Zm9.6 0c-3.2 1.6-4.8 4.1-4.8 7.5v5.5h5.4V13h-2.6c.2-1.9 1.3-3.2 3.2-3.9l-1.2-3.6Z" />
    </svg>
  );
}

/** Ranting botanical line-art — garis tipis, dipakai sebagai ornamen latar. */
function BotanicalBranch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 108 C 46 92, 78 70, 102 34" strokeWidth="1.4" />
      <g strokeWidth="1.1">
        <g transform="translate(26 94) rotate(-38)">
          <path d="M0 0c-8 9-6 24 0 32 6-8 8-23 0-32Z" />
          <path d="M0 4v26" />
        </g>
        <g transform="translate(48 78) rotate(24)">
          <path d="M0 0c-7 8-5 21 0 28 5-7 7-20 0-28Z" />
          <path d="M0 3v23" />
        </g>
        <g transform="translate(66 58) rotate(-30)">
          <path d="M0 0c-7 8-5 21 0 28 5-7 7-20 0-28Z" />
          <path d="M0 3v23" />
        </g>
        <g transform="translate(84 42) rotate(18)">
          <path d="M0 0c-5 6-4 16 0 21 4-5 5-15 0-21Z" />
          <path d="M0 2v17" />
        </g>
        <g transform="translate(98 28) rotate(-12)">
          <path d="M0 0c-4 5-3 13 0 17 3-4 4-12 0-17Z" />
          <path d="M0 2v13" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------ Ornamen latar ------------------------------ */

function TeacherOrnaments() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Lingkaran sage kiri atas (dipertahankan) */}
      <span className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-sage-tint" />

      {/* Lingkaran besar kanan atas — sebagian di luar batas section */}
      <span className="absolute -right-32 -top-28 hidden h-96 w-96 rounded-full bg-pine/[0.07] sm:block" />

      {/* Bentuk organik maroon sangat transparan di kanan bawah */}
      <span className="absolute -bottom-24 -right-20 h-80 w-80 rounded-[58%_42%_47%_53%/46%_56%_44%_54%] bg-maroon/5" />

      {/* Ranting botanical kiri bawah */}
      <BotanicalBranch className="absolute -bottom-10 -left-10 hidden h-40 w-40 -rotate-6 text-sage opacity-25 sm:block" />

      {/* Ranting botanical kanan atas — rotasi dan ukuran berbeda */}
      <BotanicalBranch className="absolute -right-8 -top-8 hidden h-36 w-36 rotate-180 text-sage opacity-20 lg:block" />

      {/* Garis lengkung maroon di kanan bawah */}
      <svg
        viewBox="0 0 220 220"
        fill="none"
        className="absolute -bottom-8 -right-14 hidden h-52 w-52 text-maroon opacity-45 lg:block"
      >
        <path
          d="M8 150 C 72 166, 148 158, 212 92"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M6 202 C 96 212, 178 186, 216 124"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      {/* Aksen emas tipis — sejajar area sudut */}
      <svg
        viewBox="0 0 160 120"
        fill="none"
        className="absolute -right-4 top-10 hidden h-20 w-28 text-gold opacity-60 lg:block"
      >
        <path
          d="M8 74 C 52 62, 110 60, 152 42"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        className="absolute -bottom-10 -right-28 hidden h-20 w-24 text-gold opacity-50 lg:block"
      >
        <path
          d="M6 108 C 44 110, 86 100, 112 76"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      {/* Titik dekoratif kecil berwarna emas di sekitar judul (desktop) */}
      <span className="absolute left-[6%] top-40 hidden h-1 w-1 rounded-full bg-gold/80 lg:block" />
      <span className="absolute left-[13%] top-64 hidden h-1 w-1 rounded-full bg-gold/70 lg:block" />
      <span className="absolute right-[8%] top-36 hidden h-1 w-1 rounded-full bg-gold/80 lg:block" />
      <span className="absolute right-[14%] top-56 hidden h-1 w-1 rounded-full bg-gold/70 lg:block" />
    </div>
  );
}

/* -------------------------------- Header ---------------------------------- */

function TeacherHeader() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="flex items-center justify-center gap-4">
        <span aria-hidden className="h-px w-8 bg-line-strong sm:w-12" />
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.32em] text-pine sm:text-xs">
          Meet Our
        </span>
        <span aria-hidden className="h-px w-8 bg-line-strong sm:w-12" />
      </p>

      <h2 className="mt-5 font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.02em] text-pine-deep sm:text-5xl lg:text-[3.25rem]">
        Wali Kelas
      </h2>

      <p className="mx-auto mt-5 max-w-xl text-[0.9375rem] leading-[1.7] text-moss sm:text-base">
        Dengan bimbingan dan perhatian dari wali kelas, setiap langkah kalian menuju masa depan akan
        lebih terarah.
      </p>

      <div className="mt-7 flex items-center justify-center gap-3 text-maroon">
        <span aria-hidden className="h-px w-10 bg-maroon/40 sm:w-14" />
        <LeafMark className="h-4 w-4" />
        <span aria-hidden className="h-px w-10 bg-maroon/40 sm:w-14" />
      </div>
    </div>
  );
}

/* ------------------------------- Kartu guru ------------------------------- */

type TeacherCardProps = {
  classLabel: string;
  teacherName: string;
  role: string;
  photoUrl: string | null;
  description: string;
  quote: string;
};

/**
 * Satu komponen untuk semua wali kelas. Ketiga kartu memakai struktur yang
 * identik sehingga tinggi, ukuran foto, badge, nama, jabatan, deskripsi, dan
 * kutipan selalu sejajar — perbedaan hanya pada isi data.
 */
function TeacherCard({
  classLabel,
  teacherName,
  role,
  photoUrl,
  description,
  quote,
}: TeacherCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-[24px] border border-line bg-elevated p-6 text-center shadow-[0_28px_60px_-48px_rgba(24,63,50,0.6)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_36px_72px_-42px_rgba(24,63,50,0.5)] motion-reduce:transform-none motion-reduce:transition-none sm:p-7">
      {/* Foto portrait berbentuk arch — bingkai editorial berlapis */}
      <div className="mx-auto w-full max-w-[15rem]">
        <div className="rounded-t-full rounded-b-[22px] border border-gold/60 p-[7px]">
          <div className="rounded-t-full rounded-b-[15px] border border-line bg-cream-card p-2 shadow-[0_24px_50px_-32px_rgba(24,63,50,0.45)]">
            <div className="aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[7px] bg-subtle">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`Foto ${teacherName}`}
                  loading="lazy"
                  className="h-full w-full object-cover object-[50%_30%]"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted">
                  <span className="font-display text-5xl text-pine/60">
                    {initials(teacherName)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Badge kelas — bertumpang tindih sedikit dengan foto */}
      <div className="relative z-10 -mt-5 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pine px-4 py-1.5 text-xs font-semibold tracking-wide text-ivory-warm ring-1 ring-maroon/40">
          <CapIcon />
          {classLabel}
        </span>
      </div>

      {/* Nama & jabatan */}
      <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-pine-deep sm:text-[1.375rem]">
        {teacherName}
      </h3>
      <p className="mt-1.5 text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-maroon">
        {role}
      </p>

      {/* Deskripsi peran */}
      <p className="mt-4 text-sm leading-[1.65] text-moss">{description}</p>

      {/* Kutipan — selalu menempel di bawah agar sejajar antar kartu */}
      <div className="mt-auto pt-6">
        <blockquote className="rounded-[16px] border border-line/70 bg-subtle px-5 py-4">
          <QuoteMark className="mx-auto h-4 w-4 text-maroon" />
          <p className="mt-2 font-display text-[0.9375rem] italic leading-relaxed text-pine-deep">
            {quote}
          </p>
        </blockquote>
      </div>
    </article>
  );
}

function TeacherCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-[24px] border border-line bg-elevated p-6 sm:p-7">
      <div className="mx-auto w-full max-w-[15rem]">
        <div className="rounded-t-full rounded-b-[22px] border border-gold/60 p-[7px]">
          <div
            aria-hidden
            className="aspect-[4/5] w-full animate-pulse rounded-t-full rounded-b-[15px] bg-subtle"
          />
        </div>
      </div>
      <div aria-hidden className="mx-auto mt-4 h-6 w-24 animate-pulse rounded-full bg-subtle" />
      <div aria-hidden className="mx-auto mt-4 h-5 w-3/5 animate-pulse rounded-full bg-subtle" />
      <div aria-hidden className="mx-auto mt-2 h-3 w-2/5 animate-pulse rounded-full bg-subtle" />
      <div aria-hidden className="mt-4 h-3 w-full animate-pulse rounded-full bg-subtle" />
      <div aria-hidden className="mt-2 h-3 w-5/6 animate-pulse rounded-full bg-subtle" />
      <div aria-hidden className="mt-6 h-16 w-full animate-pulse rounded-[16px] bg-subtle" />
    </div>
  );
}

/* -------------------------------- Section --------------------------------- */

export function TeacherSection() {
  const { data, isLoading } = useTeachers();
  const teachers = data?.teachers ?? [];

  return (
    <section
      id="wali-kelas"
      className="section-teacher paper relative isolate overflow-hidden border-b border-line"
    >
      <TeacherOrnaments />

      <div className="container-page relative z-10 py-[72px] lg:py-[104px]">
        <Reveal>
          <TeacherHeader />
        </Reveal>

        <div className="mt-12 lg:mt-14">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {Array.from({ length: 3 }).map((_, index) => (
                <TeacherCardSkeleton key={index} />
              ))}
            </div>
          ) : teachers.length > 0 ? (
            <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {teachers.map((teacher, index) => (
                <StaggerItem key={teacher.id} className="h-full">
                  <TeacherCard
                    classLabel={resolveClassLabel(index)}
                    teacherName={teacher.name}
                    role={resolveRole(index)}
                    photoUrl={assetUrl(teacher.photoUrl)}
                    description={teacher.description}
                    quote={resolveQuote(index)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <div className="mx-auto max-w-md rounded-[24px] border border-line bg-elevated px-6 py-14 text-center">
              <p className="font-display text-2xl text-pine-deep">Belum ada data wali kelas</p>
              <p className="mt-3 text-sm leading-relaxed text-moss">
                Tambahkan wali kelas lewat panel admin agar profil ini tampil.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
