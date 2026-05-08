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
        // Granüler manual chunk'lar — her kritik bağımlılık kendi bucket'ında
        manualChunks: (id) => {
          // 1. Çekirdek Yapılar (React, Navigasyon, Temel Animasyonlar)
          // Bunlar birbirine sıkı bağlıdır (createContext hatasını önlemek için bir arada tutulmalıdır)
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/framer-motion/') ||
            id.includes('src/components/Sidebar') ||
            id.includes('src/components/AppHeader') ||
            id.includes('src/services/rbac') ||
            id.includes('src/hooks/useRBAC') ||
            id.includes('src/store/') ||
            id.includes('src/utils/') ||
            id.includes('src/constants/')
          ) {
            return 'index';
          }

          // 2. Ağır Özellik Modülleri (Lazy yüklendiği için ayrılmaları performanslıdır)
          if (id.includes('src/components/ReadingStudio')) return 'studio-reading';
          if (id.includes('src/components/MathStudio')) return 'studio-math';
          if (id.includes('src/components/ActivityStudio')) return 'studio-activity';
          if (id.includes('src/components/InfographicStudio')) return 'studio-infographic';
          if (id.includes('src/components/SuperStudio')) return 'studio-super';
          if (id.includes('src/components/Screening')) return 'studio-screening';
          if (id.includes('src/components/Profile')) return 'profile-settings';
          if (id.includes('src/components/Admin')) return 'admin-v2';
          if (id.includes('src/components/Student')) return 'student-v2';

          // 3. Çok ağır servisler ve dış kütüphaneler
          if (id.includes('src/services/generators')) return 'generators-ai';
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
          if (id.includes('firebase')) return 'vendor-firebase';
          
          // 4. Geri kalan vendor kütüphaneleri
          if (id.includes('node_modules')) {
             return 'vendor-common';
          }
        },
      },
    },
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
};

export default defineConfig(config);
