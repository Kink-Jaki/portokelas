import { Component, type ErrorInfo, type ReactNode } from 'react';

import ErrorPage from '@/features/misc/ErrorPage';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/** Menangkap error render di seluruh aplikasi dan menampilkan halaman error. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary menangkap error:', error, info);
  }

  override render() {
    if (this.state.hasError) {
      return <ErrorPage code={500} />;
    }
    return this.props.children;
  }
}
