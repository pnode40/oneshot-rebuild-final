import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  base: '/',
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
    host: 'localhost',
  }
})
