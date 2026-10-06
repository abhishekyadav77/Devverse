import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = 'http://localhost:5000';

// Forward API and SEO endpoints to Express (used by both `dev` and `preview`)
const proxy = {
  '/api': { target: API, changeOrigin: true },
  '/sitemap.xml': { target: API, changeOrigin: true },
  '/robots.txt': { target: API, changeOrigin: true },
  '/seo': { target: API, changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks cache well between deploys. The heavy editor code stays in the
        // lazy-loaded "write" chunk, so readers never download it.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
});