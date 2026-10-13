import { cn } from '@/lib/utils';
import { userRoleLabel } from '@/lib/utils';

type Tone = 'neutral' | 'outline' | 'danger' | 'success' | 'warning';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-invert text-invert-fg border-invert',
  outline: 'border-line-strong text-muted',
  danger: 'border-danger text-danger',
  success: 'border-success text-success',
  warning: 'border-accent bg-accent-soft text-accent',
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

export function RoleBadge({ role }: { role: 'member' | 'admin' }) {
  return (
    <Badge tone={role === 'admin' ? 'neutral' : 'outline'}>{userRoleLabel[role] ?? role}</Badge>
  );
}

/** Badge "Dev" beraksen untuk kreator berrole admin. */
export function DevBadge() {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border border-accent px-2.5 py-0.5',
        'font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-accent',
        'transition-colors duration-200 hover:bg-accent hover:text-accent-fg',
      )}
    >
      Dev
    </span>
  );
}
