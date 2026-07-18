import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './Landing';
import PageTransition from './components/PageTransition';
import BrandLoader from './components/BrandLoader';

const GatePage = lazy(() => import('./pages/GatePage'));
const DrivePage = lazy(() => import('./pages/DrivePage'));
const ViewPage = lazy(() => import('./pages/ViewPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));
const LegacyPagesRedirect = lazy(() => import('./pages/LegacyPagesRedirect'));

function RouteFallback() {
  const loc = useLocation();
  const label =
    loc.pathname.startsWith('/drive')
      ? 'Opening library'
      : loc.pathname.startsWith('/gate')
        ? 'Opening gate'
        : loc.pathname.startsWith('/view')
          ? 'Opening share'
          : 'Loading';
  return <BrandLoader label={label} />;
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
        <div className="app-fatal">
          <div className="app-fatal-card">
            <h1 className="app-fatal-title">App failed to load</h1>
            <pre className="app-fatal-pre">{this.state.err}</pre>
            <button
              type="button"
              className="app-modal-btn app-modal-btn-primary"
              onClick={() => window.location.assign('/')}
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

function AppRoutes() {
  const location = useLocation();
  return (
    <PageTransition>
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
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
    </PageTransition>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
