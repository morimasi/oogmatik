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
          // Stüdyolar — En büyük özellik modülleri (Lazy yüklendiği için ayrı chunk güvenli)
          if (id.includes('/components/ReadingStudio/')) return 'studio-reading';
          if (id.includes('/components/MathStudio/')) return 'studio-math';
          if (id.includes('/components/ActivityStudio/')) return 'studio-activity';
          if (id.includes('/components/InfographicStudio/')) return 'studio-infographic';
          if (id.includes('/components/SuperStudio/')) return 'studio-super';
          if (id.includes('/components/Screening/')) return 'studio-screening';

          // Merkezi Yönetim & Navigasyon (Orkestrasyon Katmanı)
          // Sidebar, Admin, Student modülleri arasındaki yoğun ilişkiler nedeniyle tek chunk
          if (id.includes('/components/Sidebar') || 
              id.includes('/components/AppHeader') ||
              id.includes('/components/AdminDashboard/') || 
              id.includes('/components/Admin/') || 
              id.includes('/components/Student/') ||
              id.includes('/services/rbac') ||
              id.includes('/services/aiStudentService')) {
            return 'management-platform';
          }
          
          // Ortak Servisler & AI Çekirdeği
          if (id.includes('/services/geminiClient') || 
              id.includes('/services/worksheetService') ||
              id.includes('/services/curriculumService')) {
            return 'core-services';
          }
          
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
