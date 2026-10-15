import { Modal } from '@/components/ui/Modal';
import { Button, buttonClasses } from '@/components/ui/Button';
import { developerContact } from '@/lib/site';

const developerLinks = [
  { label: 'GitHub', href: developerContact.github },
  { label: 'Instagram', href: developerContact.instagram },
  { label: 'Website', href: developerContact.website },
];

/**
 * Popup informasi tahap pengembangan yang tampil saat pertama kali membuka
 * halaman landing. Menampilkan catatan bahwa web masih dikembangkan sekaligus
 * tautan untuk menghubungi developer.
 */
export function DevNoticeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Web Masih dalam Pengembangan"
      description="Terima kasih sudah berkunjung ke portofolio kelas kami."
      footer={
        <Button variant="burgundy" onClick={onClose}>
          Mengerti
        </Button>
      }
    >
      <div className="space-y-5 text-sm leading-relaxed text-muted">
        <p>
          Situs ini sedang dalam tahap pengembangan. Sebagian konten, fitur, dan tampilan dapat
          mengalami perubahan atau belum sepenuhnya optimal. Kami memohon maaf atas
          ketidaknyamanan yang ditimbulkan.
        </p>
        <div className="space-y-2 border-t border-line pt-4">
          <p className="eyebrow">Hubungi developer :</p>
          <div className="flex flex-wrap gap-2">
            {developerLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={buttonClasses('outline', 'sm')}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
