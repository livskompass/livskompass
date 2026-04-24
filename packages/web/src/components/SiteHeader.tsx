import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSiteSettings, getMediaUrl } from '../lib/api'
import { defaultHeader, type SiteHeaderConfig } from '@livskompass/shared'
import { SearchButton } from './SiteSearch'
import { Search } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  children?: { name: string; href: string }[]
}

function configToNavItems(config: SiteHeaderConfig): NavItem[] {
  return config.navItems.map((item) => ({
    name: item.label,
    href: item.href,
    children: item.children?.map((child) => ({ name: child.label, href: child.href })),
  }))
}

function DesktopDropdown({ item, isActive, onSearchClick }: { item: NavItem; isActive: (href: string) => boolean; onSearchClick?: () => void }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const linkActiveClass = isActive(item.href)
    ? 'font-medium opacity-100'
    : 'opacity-75 hover:opacity-100'

  if (item.href === '#search' && onSearchClick) {
    return <SearchButton onClick={onSearchClick} />
  }

  if (!item.children || item.children.length === 0) {
    return (
      <Link to={item.href} className={`font-normal transition-colors duration-200 whitespace-nowrap ${linkActiveClass}`}>
        {item.name}
      </Link>
    )
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        type="button"
        className={`inline-flex items-center gap-1 font-normal transition-colors duration-200 whitespace-nowrap ${linkActiveClass}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.name}
        <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-surface-elevated rounded-[14px] shadow-lg border border-default p-2 z-50 animate-scale-in origin-top" role="menu">
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              role="menuitem"
              className={`block px-3 py-2 text-body-sm rounded-[10px] transition-colors duration-150 ${
                isActive(child.href)
                  ? 'text-accent bg-accent-soft font-medium'
                  : 'text-brand hover:text-accent hover:bg-surface'
              }`}
              onClick={() => setOpen(false)}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/** Priority-plus overflow nav: renders as many items as fit in the available
 *  width, collapses the remainder into a "Mer ▾" dropdown. Measures natural
 *  widths once via a hidden measurement row, then recomputes visibleCount via
 *  ResizeObserver so it adapts to the pill's collapsed/expanded width. */
function PriorityNav({ items, isActive, onSearchClick }: {
  items: NavItem[]
  isActive: (href: string) => boolean
  onSearchClick?: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(items.length)
  const [itemWidths, setItemWidths] = useState<number[]>([])
  const [moreWidth, setMoreWidth] = useState(70)
  const GAP = 28 // must roughly match container gap-x

  // Measure once after mount / when items change.
  useLayoutEffect(() => {
    const node = measureRef.current
    if (!node) return
    const children = Array.from(node.querySelectorAll<HTMLElement>('[data-measure-item]'))
    if (children.length === 0) return
    const widths = children.map((el) => el.offsetWidth)
    setItemWidths(widths)
    const moreEl = node.querySelector<HTMLElement>('[data-measure-more]')
    if (moreEl) setMoreWidth(moreEl.offsetWidth)
  }, [items])

  // Observe container width and compute how many items fit.
  useEffect(() => {
    const node = containerRef.current
    if (!node || itemWidths.length === 0) return

    const compute = () => {
      const available = node.offsetWidth
      let used = 0
      let count = 0
      for (let i = 0; i < itemWidths.length; i++) {
        const addition = itemWidths[i] + (i > 0 ? GAP : 0)
        const isLast = i === itemWidths.length - 1
        // Reserve space for the overflow "Mer" button unless this is the last
        // item (if everything fits we don't need the button at all).
        const reserve = isLast ? 0 : moreWidth + GAP
        if (used + addition + reserve > available) break
        used += addition
        count = i + 1
      }
      setVisibleCount(count)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(node)
    return () => ro.disconnect()
  }, [itemWidths, moreWidth])

  const visibleItems = items.slice(0, visibleCount)
  const overflowItems = items.slice(visibleCount)

  return (
    <>
      {/* Hidden measurement row: renders each item in its natural width so we
       *  can read offsetWidth. Positioned off-screen, not interactive. */}
      <div
        ref={measureRef}
        aria-hidden
        className="flex items-center gap-x-7 pointer-events-none"
        style={{ position: 'fixed', top: -9999, left: 0, visibility: 'hidden' }}
      >
        {items.map((it) => (
          <div key={`measure-${it.href}-${it.name}`} data-measure-item>
            <DesktopDropdown item={it} isActive={isActive} onSearchClick={onSearchClick} />
          </div>
        ))}
        <div data-measure-more>
          <OverflowButton open={false} onClick={() => {}} />
        </div>
      </div>

      <div ref={containerRef} className="flex items-center gap-x-5 xl:gap-x-7 flex-1 justify-end min-w-0">
        {visibleItems.map((it) => (
          <DesktopDropdown key={it.href + it.name} item={it} isActive={isActive} onSearchClick={onSearchClick} />
        ))}
        {overflowItems.length > 0 && (
          <OverflowMenu items={overflowItems} isActive={isActive} />
        )}
      </div>
    </>
  )
}

function OverflowButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-haspopup="true"
      className={`inline-flex items-center gap-1 font-normal transition-opacity duration-200 whitespace-nowrap ${open ? 'opacity-100' : 'opacity-75 hover:opacity-100'}`}
    >
      Mer
      <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
  )
}

function OverflowMenu({ items, isActive }: { items: NavItem[]; isActive: (href: string) => boolean }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      <OverflowButton open={open} onClick={() => setOpen((v) => !v)} />
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 bg-surface-elevated rounded-[14px] shadow-lg border border-default p-2 z-50 animate-scale-in origin-top-right"
        >
          {items.map((item) => (
            item.children && item.children.length > 0 ? (
              <div key={item.href + item.name} className="pt-1 pb-0.5">
                <div className="px-3 pt-1 pb-1 text-caption uppercase tracking-wide text-faint">{item.name}</div>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    to={child.href}
                    role="menuitem"
                    className={`block px-3 py-2 text-body-sm rounded-[10px] transition-colors duration-150 ${
                      isActive(child.href)
                        ? 'text-accent bg-accent-soft font-medium'
                        : 'text-brand hover:text-accent hover:bg-surface'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.href + item.name}
                to={item.href}
                role="menuitem"
                className={`block px-3 py-2 text-body-sm rounded-[10px] transition-colors duration-150 ${
                  isActive(item.href)
                    ? 'text-accent bg-accent-soft font-medium'
                    : 'text-brand hover:text-accent hover:bg-surface'
                }`}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  )
}

function MobileDropdown({ item, isActive, onNavigate, onSearchClick }: { item: NavItem; isActive: (href: string) => boolean; onNavigate: () => void; onSearchClick?: () => void }) {
  const [expanded, setExpanded] = useState(false)

  // All items inherit text color from the themed mobile menu panel (light or
  // dark) and signal state via opacity + weight, so they read correctly on
  // both tones without hard-coded palette classes.
  const itemClass = (active: boolean) =>
    `block px-3 py-2.5 rounded-[10px] transition-opacity ${active ? 'opacity-100 font-medium' : 'opacity-80 hover:opacity-100'}`

  if (item.href === '#search' && onSearchClick) {
    return (
      <button
        type="button"
        onClick={() => { onNavigate(); onSearchClick() }}
        className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] opacity-80 hover:opacity-100 transition-opacity w-full text-left"
      >
        <Search className="w-4 h-4" />
        {item.name}
      </button>
    )
  }

  if (!item.children || item.children.length === 0) {
    return (
      <Link to={item.href} onClick={onNavigate} className={itemClass(isActive(item.href))}>
        {item.name}
      </Link>
    )
  }

  return (
    <div>
      <div className="flex items-center">
        <Link
          to={item.href}
          onClick={onNavigate}
          className={`flex-1 px-3 py-2.5 rounded-l-[10px] transition-opacity ${
            isActive(item.href) ? 'opacity-100 font-medium' : 'opacity-80 hover:opacity-100'
          }`}
        >
          {item.name}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`px-3 py-2.5 rounded-r-[10px] transition-opacity ${
            expanded ? 'opacity-100' : 'opacity-60 hover:opacity-100'
          }`}
          aria-expanded={expanded}
          aria-label={`Visa undersidor för ${item.name}`}
        >
          <svg className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div
          className="pl-4 ml-3 mt-1 mb-1"
          style={{ borderLeft: '2px solid currentColor', opacity: 0.9 }}
        >
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              onClick={onNavigate}
              className={`block px-3 py-1.5 text-body-sm rounded-[10px] transition-opacity ${
                isActive(child.href) ? 'opacity-100 font-medium' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

interface SiteHeaderProps {
  onSearchOpen: () => void
  /** When true, renders position:relative instead of absolute (for design-system isolated preview). */
  staticPosition?: boolean
}

export function SiteHeader({ onSearchOpen, staticPosition = false }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dynamicColor, setDynamicColor] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Track scroll distance so the header can morph into a floating frosted
  // pill. Low threshold (20px) — the transition starts as soon as the user
  // begins scrolling, so it feels like one continuous motion with the page
  // rather than a late snap into place.
  useEffect(() => {
    if (staticPosition) return
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [staticPosition])

  const { data: siteData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  })

  const headerConfig = siteData?.header || defaultHeader
  const navigation = configToNavItems(headerConfig)

  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const manualColor = headerConfig.navColor || 'text-forest-800'
    const isManualLight = manualColor.includes('white') || manualColor.includes('amber')

    // If the manual nav color is a dark tone there's no contrast problem —
    // skip detection and honour the manual setting.
    if (!headerConfig.dynamicNavColor && !isManualLight) {
      setDynamicColor(null)
      return
    }

    const detect = () => {
      // Find the topmost [data-nav-theme] element in document order. If it's
      // sitting where the nav overlays it (roughly the first viewport slice),
      // use its theme. Otherwise fall back to the light-page default (dark nav).
      const themedEls = document.querySelectorAll<HTMLElement>('[data-nav-theme]')
      let topTheme: string | null = null
      const navHeight = 72
      for (const el of themedEls) {
        const rect = el.getBoundingClientRect()
        // Element overlaps the nav area (top of the viewport)
        if (rect.top <= navHeight && rect.bottom > navHeight) {
          topTheme = el.getAttribute('data-nav-theme')
          break
        }
      }

      if (topTheme === 'dark') {
        // Dark section under nav → need light nav to be visible.
        setDynamicColor(isManualLight ? null : 'text-white')
      } else if (topTheme === 'light') {
        setDynamicColor(isManualLight ? 'text-forest-800' : null)
      } else {
        // No themed element under the nav → assume light background.
        // Force dark nav whenever the manual setting would be invisible.
        setDynamicColor(isManualLight ? 'text-forest-800' : null)
      }
    }

    // Run detection now, and again whenever the DOM mutates (content blocks
    // render after the initial pass) or the user scrolls past a themed section.
    detect()
    const t1 = setTimeout(detect, 50)
    const t2 = setTimeout(detect, 300)
    const t3 = setTimeout(detect, 1000)

    const onScroll = () => detect()
    window.addEventListener('scroll', onScroll, { passive: true })

    const mo = new MutationObserver(detect)
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-nav-theme'] })

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('scroll', onScroll)
      mo.disconnect()
    }
  }, [location.pathname, headerConfig.dynamicNavColor, headerConfig.navColor])

  // Keep the nav color as detected; the pill background flips tone to match
  // so contrast is always preserved (dark pill for white nav, light pill for
  // dark nav). No more forcing dark on scroll.
  const navColorClass = dynamicColor || headerConfig.navColor || 'text-forest-800'
  const isNavLight = navColorClass.includes('white') || navColorClass.includes('amber')

  const logoSizeMap = {
    xs:     'h-4 lg:h-5',
    small:  'h-6 lg:h-7',
    medium: 'h-8 lg:h-9',
    large:  'h-10 lg:h-12',
  }
  const logoSizeClass = logoSizeMap[headerConfig.logoSize || 'medium']

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  // Always `fixed top-0` (except in the isolated design-system preview),
  // so the header never leaves the viewport as the user scrolls. Previously
  // we flipped from `absolute` → `sticky` at the threshold, which made the
  // header scroll out and then pop back in as the compact pill — visible as
  // a "disappear then reappear" jump. A single position lets the state morph
  // smoothly via CSS transitions.
  const positionClass = staticPosition
    ? 'relative'
    : 'fixed top-0 left-0 right-0 z-50'

  // When scrolled OR the mobile menu is open, wrap the nav in the frosted
  // pill. Opening the mobile menu at the top of the page needs a bg, and
  // reusing the pill styling keeps everything one continuous surface.
  const compact = scrolled || mobileMenuOpen
  // Tone follows the nav text color so contrast is always maintained:
  //   - white nav → dark pill (forest-tinted)
  //   - dark nav  → light pill (stone/cream)
  // No border — it was the main source of transition glitchiness. Shadow
  // alone gives enough depth for the floating effect.
  const pillStyle: React.CSSProperties = compact
    ? {
        maxWidth: 'min(var(--width-content), 960px)',
        marginInline: 'auto',
        marginBlock: '10px',
        paddingInline: 'clamp(12px, 2vw, 20px)',
        borderRadius: '14px',
        background: isNavLight
          ? 'rgba(28,46,33,0.72)'      // dark forest, semi-transparent
          : 'rgba(250,248,243,0.78)',  // light stone/cream
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        boxShadow: isNavLight
          ? '0 8px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)'
          : '0 8px 32px rgba(28,46,33,0.10), 0 2px 6px rgba(28,46,33,0.06)',
      }
    : {
        maxWidth: 'var(--width-content)',
        marginInline: 'auto',
        paddingInline: 'var(--container-px)',
      }

  return (
    <header
      className={`${positionClass} ${navColorClass}`}
      style={{
        background: 'transparent',
        // Fade `color` in addition to bg so the nav text doesn't hard-flip
        // when detection changes its tone during the pill morph.
        transition: 'background-color 0.4s ease, color 0.35s ease',
      }}
    >
      <nav
        aria-label="Huvudnavigering"
        style={{
          ...pillStyle,
          // Only transition the properties that actually morph between states.
          // `all` was animating phantom properties and made the edge flicker.
          transition: [
            'max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            'border-radius 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            'background-color 0.35s ease',
            'box-shadow 0.5s ease',
          ].join(', '),
        }}
      >
        <div className="flex items-center justify-between gap-x-10 lg:gap-x-16 h-16 lg:h-[72px]">
          <div
            className="flex shrink-0"
            // When the mobile menu is open, nudge the logo right by 12px so
            // it lines up with the first character of the menu items below
            // (which have `px-3` for their hover-state hit area).
            style={mobileMenuOpen ? { paddingLeft: '0.75rem' } : undefined}
          >
            <Link to="/" className="flex items-center hover:opacity-75 transition-opacity shrink-0">
              {headerConfig.logoUrl ? (
                headerConfig.logoDynamic ? (
                  // Dynamic logo: render as a masked element so we can fill
                  // with the exact brand colour (white on dark nav,
                  // Forest-950 on light nav) — CSS `filter: brightness(0)`
                  // couldn't produce the forest-950 tint, only pure black.
                  <span
                    role="img"
                    aria-label={headerConfig.logoText || 'Logo'}
                    className={`${logoSizeClass} w-auto shrink-0 block aspect-[3/1] transition-colors duration-200`}
                    style={{
                      WebkitMaskImage: `url(${getMediaUrl(headerConfig.logoUrl)})`,
                      maskImage: `url(${getMediaUrl(headerConfig.logoUrl)})`,
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'left center',
                      maskPosition: 'left center',
                      backgroundColor: isNavLight ? '#ffffff' : 'rgb(var(--forest-900))',
                    }}
                  />
                ) : (
                  <img
                    src={getMediaUrl(headerConfig.logoUrl)}
                    alt={headerConfig.logoText || 'Logo'}
                    className={`${logoSizeClass} w-auto shrink-0`}
                  />
                )
              ) : (
                <span
                  className="font-display"
                  style={{ fontSize: '1.375rem', letterSpacing: '-0.01em', color: 'inherit' }}
                >
                  {headerConfig.logoText}
                </span>
              )}
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-x-5 xl:gap-x-7 flex-1 min-w-0">
            <PriorityNav items={navigation} isActive={isActive} onSearchClick={onSearchOpen} />
            {headerConfig.showSearch && <SearchButton onClick={onSearchOpen} />}
          </div>

          <div className="lg:hidden flex items-center gap-2">
            {headerConfig.showSearch && <SearchButton onClick={onSearchOpen} />}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-[10px] opacity-75 hover:opacity-100 transition-opacity"
              aria-expanded={mobileMenuOpen}
              aria-label="Visa navigeringsmeny"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="lg:hidden py-3 pb-4 animate-fade-up"
            // No own background — the parent <nav> applies the pill bg when
            // the mobile menu is open, so the menu and the top row share one
            // continuous surface at the same opacity.
          >
            {navigation.map((item) => (
              <MobileDropdown
                key={item.name}
                item={item}
                isActive={isActive}
                onNavigate={() => setMobileMenuOpen(false)}
                onSearchClick={onSearchOpen}
              />
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
