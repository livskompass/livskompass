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

      {/* key on pathname forces a full unmount of the previous page tree on
          navigation. Without it, React Router reuses component instances when
          two routes render the same component type (UniversalPage on both
          /mindfulness via the catch-all and /material via an explicit Route),
          which can leave a stale Hero from the previous page in the DOM. */}
      <main id="main-content" className="flex-1" key={location.pathname}>
        <Outlet />
      </main>

      <div className="mt-auto">
        <SiteFooter onSearchOpen={() => setSearchOpen(true)} />
      </div>

      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
