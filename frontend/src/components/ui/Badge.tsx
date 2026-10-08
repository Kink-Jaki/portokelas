import { cn } from '@/lib/utils';
import { userStatusLabel, userRoleLabel } from '@/lib/utils';
import type { UserStatus } from '@/types/api';

type Tone = 'neutral' | 'outline' | 'danger' | 'success';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-invert text-invert-fg border-invert',
  outline: 'border-line-strong text-muted',
  danger: 'border-danger text-danger',
  success: 'border-success text-success',
};

export type BadgeProps = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

export function Badge({ children, tone = 'outline', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5',
        'font-mono text-[0.6875rem] uppercase tracking-[0.14em]',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const tone: Tone =
    status === 'approved'
      ? 'success'
      : status === 'rejected' || status === 'suspended'
        ? 'danger'
        : 'outline';

  return (
    <Badge tone={tone}>
      <span
        aria-hidden
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'approved'
            ? 'bg-success'
            : status === 'rejected' || status === 'suspended'
              ? 'bg-danger'
              : 'bg-muted',
        )}
      />
      {userStatusLabel[status] ?? status}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: 'member' | 'admin' }) {
  return (
    <Badge tone={role === 'admin' ? 'neutral' : 'outline'}>{userRoleLabel[role] ?? role}</Badge>
  );
}
