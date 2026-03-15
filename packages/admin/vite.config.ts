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
      '/media/': {
        target: process.env.API_TARGET || 'https://livskompass-api.livskompass-config.workers.dev',
        changeOrigin: true,
        rewrite: (path: string) => path,
      },
    },
    fs: {
      allow: ['.', '../../packages/shared'],
    },
  },
  optimizeDeps: {
    exclude: ['@livskompass/shared'],
  },
  resolve: {
    alias: {
      '@livskompass/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || (id.includes('/react/') && !id.includes('react-router'))) {
              return 'vendor-react'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            if (id.includes('@tiptap') || id.includes('prosemirror') || id.includes('@tiptap/pm')) {
              return 'vendor-tiptap'
            }
            if (id.includes('@puckeditor')) {
              return 'vendor-puck'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
          }
        },
      },
    },
  },
})
