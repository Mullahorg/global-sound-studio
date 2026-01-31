import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. Please try again or return to the homepage.
            </p>
            
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Development Error</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-muted-foreground mt-2 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};
