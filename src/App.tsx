import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './Landing';
import PageTransition from './components/shared/PageTransition';
import BrandLoader from './components/shared/BrandLoader';

const lazyRetry = <T extends { default: React.ComponentType<unknown> }>(
  factory: () => Promise<T>
) =>
  lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(msg)) {
        try {
          if (sessionStorage.getItem('blobbed_chunk_reload') !== '1') {
            sessionStorage.setItem('blobbed_chunk_reload', '1');
            window.location.reload();
            // hang until reload
            return new Promise(() => {}) as Promise<T>;
          }
        } catch {
          window.location.reload();
          return new Promise(() => {}) as Promise<T>;
        }
      }
      throw err;
    }
  });

const GatePage = lazyRetry(() => import('./pages/GatePage'));
const DrivePage = lazyRetry(() => import('./pages/DrivePage'));
const ViewPage = lazyRetry(() => import('./pages/ViewPage'));
const DownloadPage = lazyRetry(() => import('./pages/DownloadPage'));
const LegacyPagesRedirect = lazyRetry(() => import('./pages/LegacyPagesRedirect'));


const FATAL_RELOAD_BUTTON_CLASS =
  'cursor-pointer appearance-none rounded-full border border-[#f0f0f0] bg-[#f0f0f0] px-[1.05rem] py-[0.55rem] text-[0.8125rem] font-medium text-[#0a0a0a] transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none';

function RouteFallback() {
  const loc = useLocation();
  if (loc.pathname.startsWith('/drive')) {
    return (
      <BrandLoader
        label="Opening library"
        hint="Almost there"
      />
    );
  }
  if (loc.pathname.startsWith('/gate')) {
    return <BrandLoader label="Opening gate" hint="Wallet connect next" />;
  }
  if (loc.pathname.startsWith('/view')) {
    return <BrandLoader label="Opening share" hint="Decrypts in your browser" />;
  }
  return <BrandLoader label="Loading" />;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { err: string | null }
> {
  state = { err: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (/Failed to fetch dynamically imported module|Loading chunk/i.test(msg)) {
      try {
        if (sessionStorage.getItem('blobbed_chunk_reload') !== '1') {
          sessionStorage.setItem('blobbed_chunk_reload', '1');
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
    return { err: msg };
  }

  render() {
    if (this.state.err) {
      return (
        <div className="grid min-h-[100vh] place-items-center bg-[#0a0a0a] p-6 text-white">
          <div className="w-full max-w-md">
            <h1 className="mb-3 text-[1.15rem] font-medium">App failed to load</h1>
            <pre className="mb-4 whitespace-pre-wrap text-[0.8125rem] leading-[1.45] text-[#e8a0a0]">{this.state.err}</pre>
            <p className="mb-4 text-[0.8125rem] leading-[1.45] text-[#8a8a8a]">
              Often a stale tab after deploy. Hard refresh (Ctrl+Shift+R) fixes it.
            </p>
            <button
              type="button"
              className={FATAL_RELOAD_BUTTON_CLASS}
              onClick={() => {
                try {
                  sessionStorage.removeItem('blobbed_chunk_reload');
                } catch {
                  /* */
                }
                window.location.assign('/');
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
