import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(ellipse at top, #1a0b2e 0%, #050510 60%)",
            color: "#fff",
            fontFamily: "system-ui, sans-serif",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              boxShadow: "0 0 40px rgba(139,92,246,.5), inset 0 1px 0 rgba(255,255,255,.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              fontSize: 28,
            }}
          >
            🎤
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24, maxWidth: 360 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 32px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              boxShadow: "0 8px 24px rgba(139,92,246,.4), inset 0 1px 0 rgba(255,255,255,.15)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
