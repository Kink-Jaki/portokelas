import { Toaster as SonnerToaster } from 'sonner';

import { useTheme } from '@/providers/ThemeProvider';

/** Toaster global dari sonner, mengikuti tema aktif aplikasi. */
export function AppToaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme}
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        className: 'font-sans',
        duration: 4000,
      }}
    />
  );
}