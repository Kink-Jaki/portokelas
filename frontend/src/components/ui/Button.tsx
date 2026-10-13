import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant =
  | 'primary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'subtle'
  | 'burgundy'
  | 'forest';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const baseClasses =
  'group relative inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-tight ' +
  'transition-[background-color,color,border-color,opacity,transform] duration-200 ease-editorial ' +
  'disabled:cursor-not-allowed disabled:opacity-50 select-none active:translate-y-px';

const variantClasses: Record<Variant, string> = {
  primary:
    'border border-invert bg-invert text-invert-fg hover:border-accent hover:bg-accent hover:text-accent-fg',
  outline: 'border border-line-strong text-fg hover:border-fg hover:bg-subtle',
  ghost: 'text-fg hover:bg-subtle',
  danger: 'border border-danger text-danger hover:bg-danger hover:text-bg',
  subtle: 'bg-subtle text-fg border border-line hover:border-line-strong',
  burgundy:
    'border border-burgundy bg-burgundy text-ivory-warm shadow-[0_18px_32px_-22px_rgba(122,36,53,0.75)] hover:border-burgundy-dark hover:bg-burgundy-dark hover:text-ivory-warm',
  forest:
    'border border-forest-soft bg-transparent text-forest hover:border-forest hover:bg-ivory-alt',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
  icon: 'h-10 w-10',
};

/** Kelas tombol untuk elemen non-button (mis. react-router `Link`). */
export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', extra?: string) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], extra);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {isLoading ? (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent"
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});
