import { ClassMemberCard } from '@/features/landing/components/ClassMemberCard';
import { MemberCustomHtml } from '@/components/ui/MemberCustomHtml';
import { fillCardTemplate } from '@/lib/card-template';
import type { PublicUser } from '@/types/api';

/**
 * Kartu anggota untuk direktori (landing & halaman members).
 * Bila anggota menempel HTML kartu di dashboard (tab Personalize),
 * template itu yang dirender (token {{...}} sudah diisi data anggota).
 * Bila kosong, kartu standar yang dipakai — tanpa hardcode ID apa pun.
 */
export function MemberDirectoryCard({ member, index }: { member: PublicUser; index?: number }) {
  const custom = member.cardHtml?.trim();

  if (custom) {
    return (
      <div className="h-full">
        <MemberCustomHtml
          html={fillCardTemplate(custom, member)}
          theme={member.theme}
          title={`Kartu kustom ${member.alias || member.name}`}
        />
      </div>
    );
  }

  return <ClassMemberCard member={member} index={index} />;
}
