import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * App-wide error boundary. A render-time throw in any screen (e.g. a malformed
 * number from the API reaching `.toFixed`) would otherwise unmount the whole
 * SPA to a blank page; this catches it and offers a calm way back.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface for debugging; this is where a Sentry/LogRocket hook would go.
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <h1 className="text-lg font-medium">Something went wrong on this screen.</h1>
          <p className="max-w-sm text-sm opacity-70">
            The page hit an unexpected error. Reloading usually clears it. If it
            keeps happening, the data behind this view may be temporarily off.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
