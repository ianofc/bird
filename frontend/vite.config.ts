import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    // ☢️ PROXY NUCLEAR: Redireciona chamadas para o Django
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      // ✅ ADICIONADO: O túnel para o Login funcionar!
      '/api-token-auth': { 
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/accounts': { 
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: "./src/test/setup.ts",
  },
});