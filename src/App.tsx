import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';

/** Lazy route chunks — landing stays light; app pages load on demand */
const GatePage = lazy(() => import('./pages/GatePage'));
const DrivePage = lazy(() => import('./pages/DrivePage'));
const ViewPage = lazy(() => import('./pages/ViewPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));
const LegacyPagesRedirect = lazy(() => import('./pages/LegacyPagesRedirect'));

function RouteFallback() {
  return (
    <div
      className="gate-page"
      style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}
    >
      <p className="gate-sub" style={{ margin: 0 }}>
        Loading…
      </p>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { err: string | null }
> {
  state = { err: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return {
      err: error instanceof Error ? error.message : String(error),
    };
  }

  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <h1 style={{ fontSize: 20, marginBottom: 12 }}>App failed to load</h1>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                color: '#f88',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {this.state.err}
            </pre>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #444',
                background: '#111',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Reload home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/gate" element={<GatePage />} />
          <Route path="/drive" element={<DrivePage />} />
          <Route path="/app" element={<Navigate to="/gate" replace />} />
          <Route path="/view" element={<ViewPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/pages/*" element={<LegacyPagesRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
