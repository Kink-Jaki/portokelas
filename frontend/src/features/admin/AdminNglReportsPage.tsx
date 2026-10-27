import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminNglReports, useUpdateNglReportStatus } from '@/hooks/useNgl';
import { fadeUp } from '@/lib/motion';
import { formatDateTime } from '@/lib/utils';
import type { NglReportStatus } from '@/types/api';
import { NGL_REPORT_REASONS, NGL_REPORT_STATUS_LABEL } from '@/features/ngl/constants';

function statusClass(status: NglReportStatus): string {
  if (status === 'resolved') return 'border-fg text-fg';
  if (status === 'dismissed') return 'border-line-strong text-muted';
  return 'border-danger text-danger';
}

export default function AdminNglReportsPage() {
  const reportsQuery = useAdminNglReports();
  const update = useUpdateNglReportStatus();

  const reports = reportsQuery.data?.reports ?? [];

  return (
    <div className="container-page py-14">
      <motion.header variants={fadeUp} initial="hidden" animate="show" className="max-w-2xl">
        <Link
          to="/admin"
          className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg"
        >
          ← Kembali ke panel admin
        </Link>
        <p className="eyebrow mt-6">Craftly NGL</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Laporan pesan.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Tinjau laporan dari anggota. Pesan yang dilaporkan oleh tiga orang berbeda otomatis
          disembunyikan dari kotak.
        </p>
      </motion.header>

      <div className="mt-10 space-y-3">
        {reportsQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2 border border-line p-5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : reportsQuery.isError ? (
          <div className="border border-line">
            <EmptyState
              title="Gagal memuat laporan"
              description={reportsQuery.error?.message}
              action={
                <Button variant="outline" onClick={() => void reportsQuery.refetch()}>
                  Coba lagi
                </Button>
              }
            />
          </div>
        ) : reports.length === 0 ? (
          <div className="border border-line">
            <EmptyState
              title="Belum ada laporan"
              description="Tidak ada laporan yang perlu ditinjau."
            />
          </div>
        ) : (
          reports.map((report) => {
            const reasonLabel =
              NGL_REPORT_REASONS.find((item) => item.value === report.reason)?.label ??
              report.reason;
            const isPending = update.isPending && update.variables?.id === report.id;

            return (
              <article key={report.id} className="border border-line p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`border px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] ${statusClass(
                          report.status,
                        )}`}
                      >
                        {NGL_REPORT_STATUS_LABEL[report.status] ?? report.status}
                      </span>
                      <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                        {reasonLabel} · {report.reporterCount} pelapor
                      </span>
                    </div>

                    <p className="break-words text-sm leading-relaxed text-fg">
                      {report.message?.content ?? (
                        <span className="text-muted">(pesan berisi lampiran)</span>
                      )}
                    </p>

                    {report.note ? (
                      <p className="border-l-2 border-line pl-3 text-sm italic text-muted">
                        “{report.note}”
                      </p>
                    ) : null}

                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                      {formatDateTime(report.createdAt)}
                      {report.message?.isHidden ? ' · pesan disembunyikan' : ''}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isPending}
                      disabled={report.status === 'resolved'}
                      onClick={() => update.mutate({ id: report.id, status: 'resolved' })}
                    >
                      Selesai
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={report.status === 'dismissed'}
                      onClick={() => update.mutate({ id: report.id, status: 'dismissed' })}
                    >
                      Abaikan
                    </Button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="mt-10">
        <Link to="/admin" className={buttonClasses('outline', 'sm')}>
          Kembali ke panel admin
        </Link>
      </div>
    </div>
  );
}
