import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCreateTeacher, useDeleteTeacher, useSaveAbout, useUpdateTeacher } from '@/hooks/useApi';
import { useAbout, useTeachers } from '@/hooks/usePublic';
import { ApiError, assetUrl } from '@/lib/api';
import { initials } from '@/lib/utils';
import type { Teacher } from '@/types/api';

function readError(error: unknown) {
  if (error instanceof ApiError) return { message: error.message, fields: error.fieldErrors };
  return {
    message: error instanceof Error ? error.message : 'Terjadi kesalahan. Coba lagi.',
    fields: {} as Record<string, string>,
  };
}

const fileInputClasses =
  'block w-full text-xs text-muted file:mr-3 file:rounded-sm file:border file:border-line ' +
  'file:bg-bg file:px-3 file:py-2 file:text-xs file:font-medium file:text-fg ' +
  'hover:file:border-line-strong';

/* ------------------------------ Section Tentang ------------------------------ */

function AboutEditor() {
  const { data, isLoading } = useAbout();
  const about = data?.about ?? null;
  const saveAbout = useSaveAbout();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!about) return;
    setTitle(about.title ?? '');
    setDescription(about.description);
    setFile(null);
    setRemoveImage(false);
  }, [about]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const currentImage =
    previewUrl ?? (removeImage ? null : assetUrl(about?.imageUrl) ?? null);
  const error = saveAbout.isError ? readError(saveAbout.error) : null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await saveAbout.mutateAsync({
        title,
        description,
        image: file,
        removeImage: !file && removeImage,
      });
      setFile(null);
      setRemoveImage(false);
    } catch {
      // Error sudah ditampilkan lewat toast.
    }
  };

  return (
    <section className="space-y-6 border border-line p-6">
      <header className="space-y-2">
        <p className="eyebrow">Section Tentang</p>
        <h2 className="font-display text-2xl">Deskripsi singkat &amp; foto</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Tampil tepat setelah hero: foto di kiri, deskripsi singkat kelas di kanan.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_17rem]">
          <div className="space-y-4">
            <Input
              label="Judul"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="cth. Satu kelas, satu etalase karya."
              error={error?.fields.title}
              maxLength={120}
            />
            <Textarea
              label="Deskripsi singkat"
              required
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Jelaskan kelas ini dalam beberapa kalimat…"
              error={error?.fields.description}
              hint="Maksimal 2000 karakter."
              maxLength={2000}
            />
          </div>

          <div className="space-y-3">
            <p className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">Foto</p>
            <div className="aspect-[4/3] overflow-hidden border border-line bg-subtle">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="Pratinjau foto Tentang"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-center text-xs text-muted">
                  Belum ada foto
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={fileInputClasses}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setRemoveImage(false);
              }}
            />

            {about?.imageUrl && !removeImage && !file ? (
              <button
                type="button"
                onClick={() => setRemoveImage(true)}
                className="text-xs text-danger underline underline-offset-4"
              >
                Hapus foto saat ini
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
            <Button type="submit" variant="primary" size="sm" isLoading={saveAbout.isPending}>
              Simpan Tentang
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

/* ------------------------------ Wali kelas ------------------------------ */

function TeacherRow({
  teacher,
  onEdit,
  onDelete,
}: {
  teacher: Teacher;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photo = assetUrl(teacher.photoUrl);

  return (
    <article className="flex flex-col gap-4 border border-line p-4 sm:flex-row sm:items-center sm:gap-5">
      <div className="h-16 w-16 shrink-0 overflow-hidden border border-line bg-subtle">
        {photo ? (
          <img src={photo} alt={`Foto ${teacher.name}`} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center font-mono text-sm text-muted">
            {initials(teacher.name)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-lg">{teacher.name}</h3>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
            urutan {teacher.sortOrder}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
          {teacher.description}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Ubah
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          Hapus
        </Button>
      </div>
    </article>
  );
}

function TeacherEditor() {
  const { data, isLoading } = useTeachers();
  const teachers = data?.teachers ?? [];

  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const emptyForm = { name: '', description: '', sortOrder: '0' };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Teacher | null>(null);

  const editing = teachers.find((teacher) => teacher.id === editingId) ?? null;
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setRemovePhoto(false);
  };

  const startEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setForm({
      name: teacher.name,
      description: teacher.description,
      sortOrder: String(teacher.sortOrder),
    });
    setFile(null);
    setRemovePhoto(false);
  };

  const mutation = editingId ? updateTeacher : createTeacher;
  const error = mutation.isError ? readError(mutation.error) : null;
  const currentPhoto =
    previewUrl ?? (removePhoto ? null : assetUrl(editing?.photoUrl) ?? null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload = {
      name: form.name,
      description: form.description,
      sortOrder: Number(form.sortOrder) || 0,
      photo: file,
      removePhoto: !file && removePhoto,
    };

    try {
      if (editingId) await updateTeacher.mutateAsync({ id: editingId, payload });
      else await createTeacher.mutateAsync(payload);

      resetForm();
    } catch {
      // Error sudah ditampilkan lewat toast.
    }
  };

  return (
    <section className="space-y-6 border border-line p-6">
      <header className="space-y-2">
        <p className="eyebrow">Section Wali Kelas</p>
        <h2 className="font-display text-2xl">Carousel wali kelas</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Setiap entri punya satu foto, nama, dan deskripsi. Saat pengunjung menggeser carousel,
          nama serta deskripsi ikut berganti mengikuti foto aktif.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama wali kelas"
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="cth. Budi Santoso, S.Pd."
              error={error?.fields.name}
              maxLength={120}
            />
            <Textarea
              label="Deskripsi"
              required
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Perkenalan singkat wali kelas…"
              error={error?.fields.description}
              hint="Maksimal 1000 karakter."
              maxLength={1000}
            />
            <Input
              label="Urutan tampil"
              type="number"
              min={0}
              max={999}
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({ ...current, sortOrder: event.target.value }))
              }
              hint="Angka kecil tampil lebih dulu di carousel."
              error={error?.fields.sortOrder}
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={mutation.isPending}
                disabled={!form.name.trim() || !form.description.trim()}
              >
                {editingId ? 'Simpan perubahan' : 'Tambah wali kelas'}
              </Button>
              {editingId ? (
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                  Batal
                </Button>
              ) : null}
            </div>
          </form>

          <div className="space-y-3 border-t border-line pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
                {editingId ? 'Foto untuk wali kelas terpilih' : 'Foto wali kelas (opsional)'}
              </p>
              {editingId && editing?.photoUrl && !removePhoto && !file ? (
                <button
                  type="button"
                  onClick={() => setRemovePhoto(true)}
                  className="text-xs text-danger underline underline-offset-4"
                >
                  Hapus foto lama
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden border border-line bg-subtle">
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Pratinjau foto wali kelas"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-muted">
                    Tanpa foto
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={fileInputClasses}
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setRemovePhoto(false);
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Daftar wali kelas ({teachers.length})
          </p>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : teachers.length === 0 ? (
            <div className="border border-line p-4 text-sm leading-relaxed text-muted">
              Belum ada wali kelas. Isi form di kiri untuk menambahkan entri pertama.
            </div>
          ) : (
            <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {teachers.map((teacher) => (
                <TeacherRow
                  key={teacher.id}
                  teacher={teacher}
                  onEdit={() => startEdit(teacher)}
                  onDelete={() => setPendingDelete(teacher)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteTeacher.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
        isLoading={deleteTeacher.isPending}
        title="Hapus wali kelas?"
        description={`Entri “${pendingDelete?.name ?? ''}” akan dihapus dari carousel landing page.`}
        confirmLabel="Hapus"
      />
    </section>
  );
}

export function ContentPanel() {
  return (
    <div className="space-y-8">
      <AboutEditor />
      <TeacherEditor />
    </div>
  );
}
