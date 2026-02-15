import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    fs: {
      allow: ['.', '../../packages/shared'],
    },
  },
  optimizeDeps: {
    include: ['@livskompass/shared'],
  },
  resolve: {
    alias: {
      '@livskompass/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    outDir: 'dist',
  },
})
