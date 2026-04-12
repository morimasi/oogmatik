import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
    'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
    'process.env.FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID),
    'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
    'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
      process.env.FIREBASE_MESSAGING_SENDER_ID
    ),
    'process.env.FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID),
  },
  build: {
    // Bundle boyutu bütçesi — 1500 kB'yi geçen chunk'lar CI'da uyarı verir.
    // 1000 kB hedef; geçici 1500 kB tolerans (ileriki sprint'lerde code-split artar).
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Granüler manual chunk'lar — her kritik bağımlılık kendi bucket'ında
        manualChunks(id: string) {
          // Firebase — runtime'da yüklenen büyük paket
          if (id.includes('/node_modules/firebase/') || id.includes('/node_modules/@firebase/')) return 'vendor-firebase';
          // React ekosistemi — en çok kullanılan temel
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          )
            return 'vendor-react';
          // Animasyon & UI kütüphaneleri — ikincil öncelik
          if (
            id.includes('/node_modules/framer-motion/') ||
            id.includes('/node_modules/@dnd-kit/') ||
            id.includes('/node_modules/@radix-ui/')
          )
            return 'vendor-ui';
          // PDF & Export — lazy-loadable (büyük)
          if (
            id.includes('/node_modules/jspdf/') ||
            id.includes('/node_modules/html2canvas/') ||
            id.includes('/node_modules/@react-pdf/')
          )
            return 'vendor-export';
        },
      },
    },
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
});
