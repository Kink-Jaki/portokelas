import { Toaster as SonnerToaster } from 'sonner';

/** Toaster global dari sonner. */
export function AppToaster() {
  return (
    <SonnerToaster
      theme="light"
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
