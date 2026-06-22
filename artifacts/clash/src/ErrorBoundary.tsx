import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : String(err);
    return { hasError: true, message };
  }

  componentDidCatch(err: unknown, info: { componentStack: string }) {
    console.error("[Clash] Unhandled render error:", err, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        fontFamily: "'Inter',sans-serif",
        color: "#fff",
        textAlign: "center",
        gap: "20px",
      }}>
        <div style={{ fontSize: "40px" }}>⚡</div>
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: "32px",
          letterSpacing: "3px",
          color: "#ef4444",
        }}>Something went wrong</div>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", maxWidth: "400px", lineHeight: "1.6" }}>
          The arena hit an unexpected error. Your debate history is safe.
        </div>
        {this.state.message && (
          <div style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            fontFamily: "monospace",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "12px 16px",
            maxWidth: "480px",
            wordBreak: "break-all",
          }}>
            {this.state.message}
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: "13px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            padding: "12px 28px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: "8px",
            color: "#ef4444",
            cursor: "pointer",
          }}
        >
          Reload Arena
        </button>
      </div>
    );
  }
}
