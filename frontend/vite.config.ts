// @ts-nocheck
// Ignorar erros de tipo devido a conflitos de node_modules no Docker

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: false,
    hmr: {
      host: 'localhost',
      port: 8080,
    },
    proxy: {
      // Proxy para API Django no backend:8000
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxy:', req.method, req.url, '->', 'http://backend:8000' + proxyReq.path);
          });
        },
      },
      '/api-token-auth': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api-auth': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
