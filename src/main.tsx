import './polyfill';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './style.css';

/**
 * After a deploy, hashed lazy chunks change. Cached old entry JS may request
 * missing files (e.g. GatePage-OLDHASH.js). Reload once to pick up new index.
 */
const RELOAD_KEY = 'blobbed_chunk_reload';

function armChunkReloadRecovery() {
  const reloadOnce = () => {
    try {
      if (sessionStorage.getItem(RELOAD_KEY) === '1') return;
      sessionStorage.setItem(RELOAD_KEY, '1');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  // Vite fires this when a dynamic import / preload fails
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnce();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(
      (event.reason && (event.reason.message || event.reason)) || ''
    );
    if (
      /Failed to fetch dynamically imported module/i.test(msg) ||
      /Importing a module script failed/i.test(msg) ||
      /error loading dynamically imported module/i.test(msg)
    ) {
      event.preventDefault();
      reloadOnce();
    }
  });

  // Clear the one-shot flag after a healthy boot
  window.setTimeout(() => {
    try {
      sessionStorage.removeItem(RELOAD_KEY);
    } catch {
      /* */
    }
  }, 8000);
}

armChunkReloadRecovery();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('#root missing');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
