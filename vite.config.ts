// @ts-nocheck
import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
const config: UserConfig & { test?: any } = {
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor_firebase';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor_react';
            if (id.includes('@radix-ui') || id.includes('lucide-react')) return 'vendor_ui';
            if (id.includes('framer-motion')) return 'vendor_framer_motion';
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('@react-pdf')) return 'vendor_pdf';
            if (id.includes('zod')) return 'vendor_zod';
            if (id.includes('@dnd-kit')) return 'vendor_dnd';
            return 'vendor_core'; // Rest of the typical node_modules 
          }
        }
      },
    },
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
};

export default defineConfig(config);
