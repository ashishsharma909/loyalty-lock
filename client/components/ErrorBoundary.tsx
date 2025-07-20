import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            {/* Animated background effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center space-y-6">
              {/* Error icon with glow effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-red-500 to-orange-500 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  System Malfunction Detected
                </h1>
                <p className="text-gray-400 text-sm">
                  The neural networks have encountered an unexpected anomaly
                </p>
              </div>

              {/* Error details (only in development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-black/50 rounded-lg p-4 text-left">
                  <p className="text-red-400 text-xs font-mono mb-2">
                    Debug Information:
                  </p>
                  <p className="text-red-300 text-xs font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRefresh}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <RefreshCw className="w-4 h-4 group-hover:animate-spin" />
                  Recalibrate System
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-white/20 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Return to Base
                </button>
              </div>

              {/* Additional help text */}
              <p className="text-xs text-gray-500">
                If the problem persists, the quantum matrix may need manual
                intervention
              </p>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
