'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D0D0D] p-6">
          <div className="text-center space-y-4 max-w-md">
            <span className="text-6xl">💥</span>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Oups, quelque chose a planté !</h1>
            <p className="text-[#A3A3A3] text-sm">
              {this.state.error?.message || 'Une erreur inattendue est survenue.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-3 bg-[#DC2626] text-white rounded-xl font-semibold hover:bg-[#EF4444] transition-colors"
            >
              🔄 Recharger la page
            </button>
            <p className="text-[#737373] text-xs mt-4">
              Si le problème persiste, essayez de vider le cache du navigateur.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
