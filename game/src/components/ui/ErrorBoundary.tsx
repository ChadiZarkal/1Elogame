'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] text-white">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Oups, une erreur est survenue</h2>
              <p className="text-neutral-400">Rechargez la page pour continuer.</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="rounded-lg bg-red-600 px-6 py-2 font-medium hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
