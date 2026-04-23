import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SiteSearch } from './SiteSearch'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-primary)' }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-forest-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-body-sm focus:font-medium"
      >
        Hoppa till innehåll
      </a>

      <SiteHeader onSearchOpen={() => setSearchOpen(true)} />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <div className="mt-auto">
        <SiteFooter onSearchOpen={() => setSearchOpen(true)} />
      </div>

      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
