import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { staggerItem } from '@/lib/motion';
import type { PublicUser } from '@/types/api';

export function MemberCard({ member }: { member: PublicUser }) {
  return (
    <motion.div variants={staggerItem} className="h-full">
      <Link
        to={`/m/${member.slug}`}
        className="group flex h-full flex-col justify-between border border-line bg-bg p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-start justify-between gap-4">
          <Avatar
            name={member.name}
            src={member.avatarUrl}
            size="lg"
            muted
            className="transition-all duration-500 group-hover:grayscale-0 group-hover:border-line-strong"
          />
          <span
            aria-hidden
            className="mt-1 -translate-x-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M5 19L19 5M9 5h10v10" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
        </div>

         <div className="mt-8 space-y-2">
           <h3 className="font-display text-xl leading-snug">{member.name}</h3>
           <p className="line-clamp-2 min-h-[2.75rem] pt-2 text-sm leading-relaxed text-muted">
             {member.headline || 'Belum menambahkan headline.'}
           </p>
         </div>

         <div className="mt-4 flex flex-wrap gap-2">
           {member.githubUrl ? (
             <a
               href={member.githubUrl}
               target="_blank"
               rel="noopener noreferrer"
               onClick={(e) => e.stopPropagation()}
               className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-line-strong hover:text-fg"
               aria-label={`${member.name}'s GitHub`}
             >
               <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                 <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
               </svg>
               GitHub
             </a>
           ) : (
             <button
               type="button"
               disabled
               aria-disabled="true"
               onClick={(e) => e.stopPropagation()}
               className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 py-1 text-xs text-muted opacity-40"
               aria-label={`${member.name}'s GitHub tidak tersedia`}
             >
               <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                 <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
               </svg>
               GitHub
             </button>
           )}
           {member.instagramUrl ? (
             <a
               href={member.instagramUrl}
               target="_blank"
               rel="noopener noreferrer"
               onClick={(e) => e.stopPropagation()}
               className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-line-strong hover:text-fg"
               aria-label={`${member.name}'s Instagram`}
             >
               <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
               </svg>
               Instagram
             </a>
           ) : (
             <button
               type="button"
               disabled
               aria-disabled="true"
               onClick={(e) => e.stopPropagation()}
               className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 py-1 text-xs text-muted opacity-40"
               aria-label={`${member.name}'s Instagram tidak tersedia`}
             >
               <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
                 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
               </svg>
               Instagram
             </button>
           )}
         </div>
       </Link>
     </motion.div>
   );
 }

export function MemberCardGrid({ members }: { members: PublicUser[] }) {
  return (
    <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}
