import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const baseClasses =
  'relative inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-tight ' +
  'transition-[background-color,color,border-color,opacity,transform] duration-200 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 select-none';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-invert text-invert-fg hover:opacity-90 border border-invert',
  outline: 'border border-line-strong text-fg hover:bg-subtle',
  ghost: 'text-fg hover:bg-subtle',
  danger: 'border border-danger text-danger hover:bg-danger hover:text-bg',
  subtle: 'bg-subtle text-fg border border-line hover:border-line-strong',
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
