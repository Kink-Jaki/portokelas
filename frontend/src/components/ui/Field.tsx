import { cn } from '@/lib/utils';
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

const fieldClasses =
  'w-full rounded-sm border border-line bg-bg px-3.5 py-2.5 text-sm text-fg ' +
  'placeholder:text-muted/70 transition-colors duration-200 ' +
  'focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-line-strong ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const labelClasses = 'block text-xs font-medium uppercase tracking-[0.16em] text-muted';

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (id: string) => ReactNode;
};

export function FieldShell({ label, hint, error, required, children }: FieldShellProps) {
  const id = useId();
  return (
    <div className="space-y-2">
      {label ? (
        <label className={labelClasses} htmlFor={id}>
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </label>
      ) : null}
      {children(id)}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  /** Elemen opsional di sisi kanan input (mis. tombol lihat password). */
  trailing?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, required, trailing, ...props },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required}>
      {(id) => {
        const field = (
          <input
            ref={ref}
            id={id}
            required={required}
            aria-invalid={error ? true : undefined}
            className={cn(
              fieldClasses,
              error && 'border-danger',
              trailing ? 'pr-11' : undefined,
              className,
            )}
            {...props}
          />
        );

        if (!trailing) return field;

        return (
          <div className="relative">
            {field}
            <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>
          </div>
        );
      }}
    </FieldShell>
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, required, rows = 4, ...props },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required}>
      {(id) => (
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            fieldClasses,
            'resize-y leading-relaxed',
            error && 'border-danger',
            className,
          )}
          {...props}
        />
      )}
    </FieldShell>
  );
});

type SelectOption = { value: string; label: string };

export type SelectProps = Omit<InputHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  onValueChange?: (value: string) => void;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, className, required, onValueChange, ...props },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required}>
      {(id) => (
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onValueChange?.(event.target.value)}
          className={cn(fieldClasses, 'appearance-none pr-9', error && 'border-danger', className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
});
