import React from 'react'
import ReactDOM from 'react-dom/client'

// Expose API base for shared Puck blocks that fetch dynamic content
;(window as any).__PUCK_API_BASE__ = import.meta.env.VITE_API_URL || '/api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
