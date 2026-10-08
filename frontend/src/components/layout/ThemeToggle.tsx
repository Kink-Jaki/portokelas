import { motion } from 'framer-motion';

import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={isDark ? 'Mode terang' : 'Mode gelap'}
      className={cn(
        'relative grid h-10 w-10 place-items-center rounded-sm border border-line',
        'transition-colors duration-200 hover:border-line-strong hover:bg-subtle',
        className,
      )}
    >
      <motion.span
        key={theme}
        initial={{ opacity: 0, rotate: -35, scale: 0.8 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="grid place-items-center"
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
            <path
              d="M20 14.2A8.2 8.2 0 019.8 4a8.5 8.5 0 1010.2 10.2z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </motion.span>
    </button>
  );
}
