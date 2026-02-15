import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'https://livskompass-api.livskompass-config.workers.dev',
        changeOrigin: true,
      },
      '/media': {
        target: process.env.API_TARGET || 'https://livskompass-api.livskompass-config.workers.dev',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
