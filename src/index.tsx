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

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason as { message?: string } | undefined;
    const msg = reason?.message || String(reason || '');
    if (msg.includes("Failed to obtain primary lease") || msg.includes('Backfill Indexes')) {
      event.preventDefault();
    }
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
