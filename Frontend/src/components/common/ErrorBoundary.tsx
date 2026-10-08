import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Unhandled application error", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-vault-background p-6 text-vault-on-background">
        <div className="w-full max-w-lg rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-vault-border-base pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-vault-error-container">
              <AlertTriangle className="h-5 w-5 text-vault-error" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-vault-text-primary">
                Something went wrong
              </h1>
              <p className="text-sm text-vault-text-muted">We couldn’t load this part of the app.</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-vault-text-secondary">
            Try again, or reload the app if the problem continues.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-md border border-vault-border-base bg-vault-surface-container-lowest p-3 font-mono text-xs text-vault-error">
              {this.state.error.message}
              {this.state.error.stack && `\n\n${this.state.error.stack}`}
            </pre>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex items-center gap-2 rounded-md bg-vault-primary px-4 py-2.5 text-sm font-semibold text-vault-on-primary transition hover:bg-vault-ochre-hover"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md border border-vault-border-interactive px-4 py-2.5 text-sm text-vault-text-secondary transition hover:text-vault-text-primary"
            >
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
