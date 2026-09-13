import { AppError } from './utils/AppError';
// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/tailwind.css';
import './styles/theme-tokens.css';
import './styles/theme-premium.css';
import './styles/theme-oled.css';
import './styles/theme-print.css';

// Firebase Firestore "Failed to obtain primary lease for action 'Backfill Indexes'" uyarısı
// Birden fazla tab açıkken veya tab yenilenirken oluşan bilinen bir SDK uyarısıdır.
// Fonksiyonelliği etkilemez; sadece konsolda gürültü yaratır. Bastırılıyor.
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes("Failed to obtain primary lease for action 'Backfill Indexes'")) {
      return;
    }
    originalError.apply(console, args as []);
  };

  // Modern Chunk Loading Retry Strategy (Vercel deployment chunk invalidation protection)
  const reloadOnChunkError = (errorMessage: string) => {
    if (
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('Failed to load module script') ||
      errorMessage.includes('Expected a JavaScript-or-Wasm module script') ||
      errorMessage.includes('MIME type of "text/html"')
    ) {
      const storageKey = 'bdmind_chunk_reload_count';
      const reloadCount = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
      if (reloadCount < 2) {
        sessionStorage.setItem(storageKey, (reloadCount + 1).toString());
        window.location.reload();
      }
    }
  };

  window.addEventListener('error', (event) => {
    const message = event?.message || event?.error?.message || '';
    reloadOnChunkError(String(message));
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason as { message?: string } | undefined;
    const msg = reason?.message || String(reason || '');
    if (msg.includes("Failed to obtain primary lease") || msg.includes('Backfill Indexes')) {
      event.preventDefault();
      return;
    }
    reloadOnChunkError(msg);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new AppError("Could not find root element to mount to", 'INTERNAL_ERROR', 500);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
