import React from 'react';

// ─── Error Boundary ───────────────────────────────────────────────────────────
interface ErrorBoundaryState { 
  hasError: boolean; 
  error: Error | null 
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary capturado:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-8">
          <div className="bg-surface-container-low rounded-2xl border border-tertiary/20 p-8 max-w-lg w-full text-center">
            <p className="text-tertiary font-bold text-lg mb-2">Algo deu errado</p>
            <p className="text-on-surface-variant text-sm mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2 bg-secondary text-on-secondary rounded-xl font-bold text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
