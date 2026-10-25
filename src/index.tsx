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
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes("'Backfill Indexes' eylemi için birincil kiralama alınamadı")) {
      return;
    }
    originalError.apply(console, args as []);
  };

  // Modern Chunk Loading Retry Strategy (Vercel deployment chunk invalidation protection)
  const reloadOnChunkError = (errorMessage: string) => {
    const lower = (errorMessage || '').toLowerCase();
    if (
      lower.includes('failed to fetch dynamically imported module') ||
      lower.includes('importing a module script failed') ||
      lower.includes('error loading dynamically imported module') ||
      lower.includes('dinamik olarak içe aktarılan modül alınamadı') ||
      lower.includes('modül betiği yüklenemedi') ||
      lower.includes('expected a javascript-or-wasm module script') ||
      lower.includes('"text/html" mime') ||
      lower.includes('mime type') ||
      lower.includes('loading chunk') ||
      lower.includes('failed to load resource')
    ) {
      const storageKey = 'bdmind_chunk_reload_count';
      const timeKey = 'bdmind_chunk_reload_time';
      const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
      const lastTime = parseInt(sessionStorage.getItem(timeKey) || '0', 10);
      const now = Date.now();

      // 15 saniyeden eskiyse sayacı sıfırla, aksi halde en fazla 2 kez yenile
      const isFresh = now - lastTime < 15000;
      const count = isFresh ? lastReload : 0;

      if (count < 2) {
        sessionStorage.setItem(storageKey, (count + 1).toString());
        sessionStorage.setItem(timeKey, now.toString());
        window.location.reload();
      }
    }
  };

  // Vite'ın resmi dinamik chunk yükleme hatası eventi
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnChunkError('failed to fetch dynamically imported module');
  });

  window.addEventListener('error', (event) => {
    const message = event?.message || event?.error?.message || '';
    reloadOnChunkError(String(message));
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason as { message?: string } | undefined;
    const msg = reason?.message || String(reason || '');
    if (msg.includes("Birincil kiralama alınamadı") || msg.includes('Backfill Indexes')) {
      event.preventDefault();
      return;
    }
    reloadOnChunkError(msg);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new AppError("Uygulamanın bağlanacağı kök öğe bulunamadı", 'INTERNAL_ERROR', 500);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
