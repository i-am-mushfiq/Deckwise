import { Component } from 'react';

/**
 * Top-level error boundary — catches any uncaught render error so the user
 * sees a recovery screen instead of a blank white page.
 *
 * Intentionally uses zero imports from theme.js / audio.js / lucide-react so
 * it stays functional even if those modules are part of the crash.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Deckwise] Uncaught render error:', error);
    console.error('[Deckwise] Component stack:', info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const { error } = this.state;

    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#1a1209',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', textAlign: 'center',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        color: '#ffffff',
      }}>
        {/* Icon — plain CSS circle with exclamation mark */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '3px solid #f59e0b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 900, color: '#f59e0b',
          marginBottom: 24, flexShrink: 0,
          letterSpacing: 0,
        }}>!</div>

        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
          Something went wrong
        </div>

        <div style={{ fontSize: 14, color: '#888888', marginBottom: 24, maxWidth: 420, lineHeight: 1.65 }}>
          An unexpected error occurred. Your library data is safe in localStorage — this is a display bug.
        </div>

        {error?.message && (
          <pre style={{
            background: '#ffffff0d', border: '1px solid #ffffff1a',
            borderRadius: 6, padding: '10px 16px',
            fontSize: 12, color: '#aaaaaa', lineHeight: 1.6,
            maxWidth: 480, width: '100%', overflowX: 'auto',
            marginBottom: 28, textAlign: 'left',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {error.message}
          </pre>
        )}

        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#f59e0b', color: '#1a1209',
            border: 'none', borderRadius: 500,
            padding: '13px 36px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.05em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          Reload app
        </button>
      </div>
    );
  }
}
