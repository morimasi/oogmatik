import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
<<<<<<< HEAD

import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
=======
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    federation({
      name: 'super-production-platform',
      filename: 'remoteEntry.js',
      exposes: {
        './SuperButton': './src/modules/super-turkce/shared/ui/atoms/SuperButton.tsx',
        './SuperBadge': './src/modules/super-turkce/shared/ui/atoms/SuperBadge.tsx',
        './AIProductionService': './src/modules/super-turkce/core/ai/AIProductionService.ts',
      },
      shared: ['react', 'react-dom', 'zustand', 'framer-motion']
    })
  ],
  define: {
    // ... (rest remains same)
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
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
<<<<<<< HEAD
=======
    target: 'esnext',
    minify: false, // Vite Plugin Federation için önerilir, tercihe bağlı
    cssCodeSplit: false,
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
});
