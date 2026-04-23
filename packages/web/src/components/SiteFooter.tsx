import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { getSiteSettings, getMediaUrl } from '../lib/api'
import { defaultFooter } from '@livskompass/shared'

interface SiteFooterProps {
  onSearchOpen?: () => void
}

export function SiteFooter({ onSearchOpen }: SiteFooterProps) {
  const { data: siteData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  })

  const footerConfig = siteData?.footer || defaultFooter

  return (
    <footer className="bg-stone-950 text-white" role="contentinfo">
      <div
        className="mx-auto"
        style={{
          maxWidth: 'var(--width-content)',
          paddingInline: 'var(--container-px)',
          paddingTop: 'var(--section-md)',
          paddingBottom: 'var(--section-sm)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          <div>
            {footerConfig.logoUrl ? (
              <img
                src={getMediaUrl(footerConfig.logoUrl)}
                alt={footerConfig.companyName}
                className="h-8 w-auto mb-4 brightness-0 invert"
              />
            ) : (
              <span className="font-display text-h4 text-white block mb-4">{footerConfig.companyName}</span>
            )}
            <p className="text-faint leading-relaxed font-normal">
              {footerConfig.tagline}
            </p>
          </div>
          <div>
            <h3 className="text-h4 mb-4">{footerConfig.contactHeading || 'Kontakt'}</h3>
            <p className="text-faint leading-relaxed font-normal">
              {footerConfig.contact.email}<br />
              {footerConfig.contact.phone}
            </p>
          </div>
          {footerConfig.columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-h4 mb-4">{col.heading}</h3>
              <ul className="space-y-2" aria-label={col.heading}>
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.href === '#search' && onSearchOpen ? (
                      <button
                        type="button"
                        onClick={onSearchOpen}
                        className="text-faint hover:text-white transition-colors duration-200 font-normal flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-faint hover:text-white transition-colors duration-200 font-normal"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {footerConfig.showSearch && onSearchOpen && (
          <div className="mt-8">
            <button
              type="button"
              onClick={onSearchOpen}
              className="inline-flex items-center gap-2 text-faint hover:text-white transition-colors duration-200 font-normal text-body-sm"
            >
              <Search className="w-4 h-4" />
              Sök på sidan
            </button>
          </div>
        )}
        <div className="mt-12 pt-8 border-t border-stone-800 text-center text-muted text-caption">
          <p>{footerConfig.copyright.replace('{year}', String(new Date().getFullYear()))}</p>
        </div>
      </div>
    </footer>
  )
}
