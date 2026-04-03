import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
  },
  // SPA fallback for client-side routing
  appType: 'spa',
});
