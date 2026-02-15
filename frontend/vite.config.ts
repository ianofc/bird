import { defineConfig } from "vitest/config"; // <--- Alterado de 'vite' para 'vitest/config'
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- ADICIONE ESTA SEÇÃO ABAIXO ---
  test: {
    globals: true,
    environment: 'jsdom', // ou 'node', dependendo do seu projeto
  },
}));