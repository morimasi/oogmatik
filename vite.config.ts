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
        manualChunks(id: string) {
          // Stüdyolar — En büyük src bileşenleri (daha granüler)
          // NOT: Circular dependency'leri önlemek için her studio ayrı chunk
          if (id.includes('/components/ActivityStudio') || id.includes('/components/InfographicStudio')) {
            // Her studio'yu ayrı chunk'a böl
            if (id.includes('ActivityStudio')) return 'studio-activity';
            if (id.includes('ReadingStudio')) return 'studio-reading';
            if (id.includes('MathStudio')) return 'studio-math';
            if (id.includes('InfographicStudio')) return 'studio-infographic';
          }
          // Admin Paneli
          if (id.includes('/components/Admin')) return 'admin-panel';
          // Öğrenci Modülleri
          if (id.includes('/components/Student/')) return 'student-modules';
          
          // Lucide — Simgeler (Çok fazla ikon var)
          if (id.includes('/node_modules/lucide-react/')) return 'vendor-lucide';
          // Grafikler & Infographics
          if (id.includes('/node_modules/@antv/')) return 'vendor-antv';
          // 3D & Oyun Motorları — Çok büyük paketler
          if (id.includes('/node_modules/three/')) return 'vendor-three';
          if (id.includes('/node_modules/pixi.js/')) return 'vendor-pixi';
          // Firebase
          if (id.includes('/node_modules/firebase/') || id.includes('/node_modules/@firebase/')) return 'vendor-firebase';
          
          // Diğer ağır node_modules
          if (id.includes('/node_modules/')) {
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('@react-pdf')) return 'vendor-export';
            if (id.includes('framer-motion') || id.includes('@radix-ui') || id.includes('@dnd-kit')) return 'vendor-ui';
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
