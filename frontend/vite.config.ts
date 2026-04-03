import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // Necessário para Docker
    port: 8080,
    proxy: {
      // Rota para o Backend (Django)
      '/api': {
        target: 'http://backend:8000', // Usa o nome do serviço Docker 'backend'
        changeOrigin: true,
        secure: false,
      },
      // Rota para auth (token)
      '/api-token-auth': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      // Rota para o Iris (Trends)
      '/service/iris': {
        target: 'http://iris:8003', // Usa o nome do serviço Docker 'iris'
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/service\/iris/, ''),
        secure: false,
      },
      // Rota para o Mercurio Hub
      '/service/mercurio': {
        target: 'http://mercurio:8004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/service\/mercurio/, ''),
        secure: false,
      }
    }
  }
})