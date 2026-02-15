import type { Config, Data } from "@puckeditor/core"
import React from "react"

// Puck configuration for Livskompass CMS page builder.
// Tier 1 blocks use extracted component files for reuse on the public frontend.
// Tier 2+ blocks use inline render functions until they are promoted.

// Empty Puck data structure for initializing new pages
export const emptyPuckData: Data = {
  content: [],
  root: { props: {} },
  zones: {},
}

// ── Shared helpers for dynamic blocks that fetch data from the API ──

function getApiBase(): string {
  return (typeof window !== "undefined" && (window as any).__PUCK_API_BASE__) || "/api"
}

function getMediaBase(): string {
  return getApiBase().replace(/\/api$/, "")
}

function resolveMediaUrl(url: string): string {
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `${getMediaBase()}${url}`
}

function useFetchJson<T>(endpoint: string): { data: T | null; loading: boolean } {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(!!endpoint)
  React.useEffect(() => {
    if (!endpoint) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    fetch(`${getApiBase()}${endpoint}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setData(d as T); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [endpoint])
  return { data, loading }
}

// ── Static site chrome that matches the production layout ──
// Used inside Puck preview so the editor looks exactly like the live site.
// On the public site, the real Layout component provides the header/footer,
// but puck:isEditing class on body lets us detect context.

const navLinks = [
  { name: "ACT", href: "/act" },
  { name: "Utbildningar", href: "/utbildningar" },
  { name: "Material", href: "/material" },
  { name: "Mindfulness", href: "/mindfulness" },
  { name: "Forskning", href: "/forskning-pa-metoden" },
  { name: "Om Fredrik", href: "/om-fredrik-livheim" },
  { name: "Kontakt", href: "/kontakt" },
  { name: "Nyheter", href: "/nyhet" },
]

function SiteHeader() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary-600">Livskompass</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} className="text-gray-600 hover:text-primary-600 transition-colors whitespace-nowrap text-sm">
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Livskompass</h3>
            <p className="text-gray-400">ACT och mindfulness utbildningar med Fredrik Livheim</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <p className="text-gray-400">Fredrik Livheim<br />livheim@gmail.com<br />070-694 03 64</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Länkar</h3>
            <ul className="space-y-2">
              {navLinks.slice(0, 5).map((item) => (
                <li key={item.name}><a href={item.href} className="text-gray-400 hover:text-white transition-colors">{item.name}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Livskompass. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  )
}

export const puckConfig: Config = {
  root: {
    render: ({ children }: { children: React.ReactNode }) => {
      // Detect if we're inside the Puck editor iframe
      const isEditor = typeof window !== "undefined" && window.frameElement !== null
      return (
        <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
          {isEditor && <SiteHeader />}
          <main className="flex-1">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {children}
            </div>
          </main>
          {isEditor && <SiteFooter />}
        </div>
      )
    },
  },
  categories: {
    layout: {
      title: "Layout",
      components: ["Columns", "SeparatorBlock"],
    },
    content: {
      title: "Content",
      components: ["Hero", "RichText", "ImageBlock", "Accordion"],
    },
    marketing: {
      title: "Marketing",
      components: ["CTABanner", "CardGrid", "Testimonial", "ButtonGroup"],
    },
    media: {
      title: "Media",
      components: ["ImageGallery", "VideoEmbed"],
    },
    dynamic: {
      title: "Dynamic Content",
      components: ["PostGrid", "PageCards", "NavigationMenu"],
    },
    advanced: {
      title: "Advanced",
      components: ["ContactFormBlock"],
    },
  },
  components: {
    // ============ LAYOUT ============

    SeparatorBlock: {
      label: "Separator",
      defaultProps: {
        variant: "line",
        spacing: "medium",
        lineColor: "light",
        maxWidth: "full",
      },
      fields: {
        variant: {
          type: "select",
          options: [
            { label: "Line", value: "line" },
            { label: "Dots", value: "dots" },
            { label: "Space only", value: "space-only" },
          ],
        },
        spacing: {
          type: "select",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
            { label: "Extra large", value: "extra-large" },
          ],
        },
        lineColor: {
          type: "select",
          options: [
            { label: "Light", value: "light" },
            { label: "Medium", value: "medium" },
            { label: "Dark", value: "dark" },
          ],
        },
        maxWidth: {
          type: "select",
          options: [
            { label: "Narrow", value: "narrow" },
            { label: "Medium", value: "medium" },
            { label: "Full width", value: "full" },
          ],
        },
      },
      render: ({ variant, spacing, lineColor, maxWidth }) => {
        const spacingMap = { small: "py-4", medium: "py-8", large: "py-16", "extra-large": "py-24" }
        const widthMap = { narrow: "max-w-md", medium: "max-w-2xl", full: "max-w-full" }
        const colorMap = { light: "border-gray-200", medium: "border-gray-300", dark: "border-gray-500" }

        return (
          <div className={`${spacingMap[spacing as keyof typeof spacingMap] || "py-8"} mx-auto ${widthMap[maxWidth as keyof typeof widthMap] || "max-w-full"}`}>
            {variant === "line" && (
              <hr className={`border-t ${colorMap[lineColor as keyof typeof colorMap] || "border-gray-200"}`} />
            )}
            {variant === "dots" && (
              <div className="flex justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              </div>
            )}
          </div>
        )
      },
    },

    // ============ CONTENT ============

    Hero: {
      label: "Hero",
      defaultProps: {
        heading: "Rubrik här",
        subheading: "Underrubrik här",
        variant: "gradient",
        backgroundColor: "primary",
        backgroundImage: "",
        textAlignment: "center",
        ctaPrimaryText: "",
        ctaPrimaryLink: "",
        ctaSecondaryText: "",
        ctaSecondaryLink: "",
        fullHeight: "auto",
      },
      fields: {
        heading: { type: "text" },
        subheading: { type: "textarea" },
        variant: {
          type: "select",
          options: [
            { label: "Gradient", value: "gradient" },
            { label: "Image", value: "image" },
            { label: "Solid", value: "solid" },
          ],
        },
        backgroundColor: {
          type: "select",
          options: [
            { label: "Primary (blue)", value: "primary" },
            { label: "Dark", value: "dark" },
            { label: "Light", value: "light" },
          ],
        },
        backgroundImage: { type: "text" },
        textAlignment: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        ctaPrimaryText: { type: "text" },
        ctaPrimaryLink: { type: "text" },
        ctaSecondaryText: { type: "text" },
        ctaSecondaryLink: { type: "text" },
        fullHeight: {
          type: "radio",
          options: [
            { label: "Full viewport", value: "full-viewport" },
            { label: "Auto", value: "auto" },
          ],
        },
      },
      // Render function will be replaced with the actual Hero block component
      render: ({ heading, subheading, variant: _variant, textAlignment, ctaPrimaryText, ctaPrimaryLink, ctaSecondaryText, ctaSecondaryLink, fullHeight }) => {
        const alignClass = textAlignment === "left" ? "text-left" : textAlignment === "right" ? "text-right" : "text-center"
        const heightClass = fullHeight === "full-viewport" ? "min-h-screen" : "py-24 md:py-32"

        return (
          <section className={`relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white ${heightClass}`}>
            <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${alignClass}`}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{heading}</h1>
              {subheading && (
                <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto leading-relaxed">{subheading}</p>
              )}
              {(ctaPrimaryText || ctaSecondaryText) && (
                <div className={`flex flex-col sm:flex-row gap-4 ${textAlignment === "center" ? "justify-center" : textAlignment === "right" ? "justify-end" : "justify-start"}`}>
                  {ctaPrimaryText && (
                    <a href={ctaPrimaryLink || "#"} className="inline-flex items-center justify-center h-12 px-8 bg-white text-primary-700 hover:bg-primary-50 font-semibold text-base rounded-lg transition-colors">
                      {ctaPrimaryText}
                    </a>
                  )}
                  {ctaSecondaryText && (
                    <a href={ctaSecondaryLink || "#"} className="inline-flex items-center justify-center h-12 px-8 border-2 border-white/80 text-white hover:bg-white/10 bg-transparent font-semibold text-base rounded-lg transition-colors">
                      {ctaSecondaryText}
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )
      },
    },

    RichText: {
      label: "Rich Text",
      defaultProps: {
        content: "<p>Write your content here...</p>",
        maxWidth: "medium",
      },
      fields: {
        content: { type: "textarea" },
        maxWidth: {
          type: "select",
          options: [
            { label: "Narrow (65ch)", value: "narrow" },
            { label: "Medium (80ch)", value: "medium" },
            { label: "Full width", value: "full" },
          ],
        },
      },
      render: ({ content, maxWidth }) => {
        const widthMap = { narrow: "max-w-[65ch]", medium: "max-w-[80ch]", full: "max-w-none" }
        return (
          <div
            className={`prose prose-lg mx-auto ${widthMap[maxWidth as keyof typeof widthMap] || "max-w-[80ch]"} prose-headings:tracking-tight prose-a:text-primary-600`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )
      },
    },

    ImageBlock: {
      label: "Image",
      defaultProps: {
        src: "",
        alt: "",
        caption: "",
        size: "full",
        alignment: "center",
        rounded: "small",
        link: "",
      },
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
        caption: { type: "text" },
        size: {
          type: "select",
          options: [
            { label: "Small (50%)", value: "small" },
            { label: "Medium (75%)", value: "medium" },
            { label: "Full width", value: "full" },
          ],
        },
        alignment: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        rounded: {
          type: "radio",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "small" },
            { label: "Large", value: "large" },
          ],
        },
        link: { type: "text" },
      },
      render: ({ src, alt, caption, size, alignment, rounded, link }) => {
        const sizeMap = { small: "max-w-[50%]", medium: "max-w-[75%]", full: "max-w-full" }
        const alignMap = { left: "mr-auto", center: "mx-auto", right: "ml-auto" }
        const roundedMap = { none: "rounded-none", small: "rounded-lg", large: "rounded-2xl" }

        const img = (
          <figure className={`${sizeMap[size as keyof typeof sizeMap] || "max-w-full"} ${alignMap[alignment as keyof typeof alignMap] || "mx-auto"}`}>
            {src ? (
              <img
                src={src}
                alt={alt || ""}
                className={`w-full h-auto ${roundedMap[rounded as keyof typeof roundedMap] || "rounded-lg"}`}
              />
            ) : (
              <div className={`w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 ${roundedMap[rounded as keyof typeof roundedMap] || "rounded-lg"}`}>
                Select an image
              </div>
            )}
            {caption && (
              <figcaption className="text-sm text-gray-500 mt-2 text-center">{caption}</figcaption>
            )}
          </figure>
        )

        if (link) {
          return <a href={link}>{img}</a>
        }
        return img
      },
    },

    // ============ MARKETING ============

    CTABanner: {
      label: "CTA Banner",
      defaultProps: {
        heading: "Redo att börja?",
        description: "Boka din plats på nästa utbildning",
        buttonText: "Boka nu",
        buttonLink: "/utbildningar",
        variant: "primary",
        backgroundColor: "primary",
        alignment: "center",
        fullWidth: true,
      },
      fields: {
        heading: { type: "text" },
        description: { type: "textarea" },
        buttonText: { type: "text" },
        buttonLink: { type: "text" },
        variant: {
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
          ],
        },
        backgroundColor: {
          type: "select",
          options: [
            { label: "Primary (blue)", value: "primary" },
            { label: "Dark", value: "dark" },
            { label: "Light", value: "light" },
          ],
        },
        alignment: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
          ],
        },
        fullWidth: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      render: ({ heading, description, buttonText, buttonLink, backgroundColor, alignment }) => {
        const bgMap = {
          primary: "bg-primary-600 text-white",
          dark: "bg-gray-900 text-white",
          light: "bg-gray-50 text-gray-900",
        }
        const alignClass = alignment === "center" ? "text-center" : "text-left"

        return (
          <section className={`py-16 px-8 rounded-xl ${bgMap[backgroundColor as keyof typeof bgMap] || bgMap.primary}`}>
            <div className={`max-w-3xl mx-auto ${alignClass}`}>
              <h2 className="text-3xl font-bold mb-4">{heading}</h2>
              {description && <p className="text-lg mb-8 opacity-90">{description}</p>}
              {buttonText && (
                <a
                  href={buttonLink || "#"}
                  className="inline-flex items-center justify-center h-12 px-8 bg-white text-primary-700 hover:bg-primary-50 font-semibold text-base rounded-lg transition-colors"
                >
                  {buttonText}
                </a>
              )}
            </div>
          </section>
        )
      },
    },

    ButtonGroup: {
      label: "Buttons",
      defaultProps: {
        buttons: [{ text: "Primär knapp", link: "/", variant: "primary" }],
        alignment: "center",
        direction: "horizontal",
        size: "medium",
      },
      fields: {
        buttons: {
          type: "array",
          arrayFields: {
            text: { type: "text" },
            link: { type: "text" },
            variant: {
              type: "select",
              options: [
                { label: "Primary", value: "primary" },
                { label: "Secondary", value: "secondary" },
                { label: "Outline", value: "outline" },
              ],
            },
          },
        },
        alignment: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        direction: {
          type: "radio",
          options: [
            { label: "Horizontal", value: "horizontal" },
            { label: "Vertical", value: "vertical" },
          ],
        },
        size: {
          type: "select",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
        },
      },
      render: ({ buttons, alignment, direction, size }) => {
        const alignMap = { left: "justify-start", center: "justify-center", right: "justify-end" }
        const dirMap = { horizontal: "flex-row", vertical: "flex-col" }
        const sizeMap = { small: "h-9 px-4 text-sm", medium: "h-10 px-6", large: "h-12 px-8 text-base" }
        const variantMap = {
          primary: "bg-primary-600 text-white hover:bg-primary-700",
          secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
          outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
        }

        return (
          <div className={`flex flex-wrap gap-3 ${alignMap[alignment as keyof typeof alignMap] || "justify-center"} ${dirMap[direction as keyof typeof dirMap] || "flex-row"}`}>
            {(buttons as Array<{ text: string; link: string; variant: string }>)?.map((btn, i) => (
              <a
                key={i}
                href={btn.link || "#"}
                className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors ${sizeMap[size as keyof typeof sizeMap] || sizeMap.medium} ${variantMap[btn.variant as keyof typeof variantMap] || variantMap.primary}`}
              >
                {btn.text}
              </a>
            ))}
          </div>
        )
      },
    },

    // Placeholder entries for blocks that will be implemented by block-designer.
    // Each has minimal config so the Puck editor recognizes them.

    Accordion: {
      label: "Accordion / FAQ",
      defaultProps: {
        heading: "",
        items: [{ question: "Question here", answer: "Answer here" }],
        defaultOpen: "none",
        style: "bordered",
      },
      fields: {
        heading: { type: "text" },
        items: {
          type: "array",
          arrayFields: {
            question: { type: "text" },
            answer: { type: "textarea" },
          },
        },
        defaultOpen: {
          type: "select",
          options: [
            { label: "None", value: "none" },
            { label: "First", value: "first" },
            { label: "All", value: "all" },
          ],
        },
        style: {
          type: "select",
          options: [
            { label: "Default", value: "default" },
            { label: "Bordered", value: "bordered" },
            { label: "Minimal", value: "minimal" },
          ],
        },
      },
      render: ({ heading, items, defaultOpen }) => {
        return (
          <div className="space-y-4">
            {heading && <h2 className="text-2xl font-bold text-gray-900 mb-6">{heading}</h2>}
            <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
              {(items as Array<{ question: string; answer: string }>)?.map((item, i) => (
                <details key={i} open={defaultOpen === "all" || (defaultOpen === "first" && i === 0)} className="group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
                    {item.question}
                    <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-gray-600">{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        )
      },
    },

    CardGrid: {
      label: "Card Grid",
      defaultProps: {
        heading: "",
        subheading: "",
        source: "manual",
        maxItems: 3,
        columns: 3,
        parentSlug: "",
        manualCards: [],
        showBadge: false,
        cardStyle: "default",
      },
      fields: {
        heading: { type: "text" },
        subheading: { type: "text" },
        source: {
          type: "select",
          options: [
            { label: "Manual cards", value: "manual" },
            { label: "Latest posts", value: "posts" },
            { label: "Pages (by parent)", value: "pages" },
            { label: "Courses", value: "courses" },
            { label: "Products", value: "products" },
          ],
        },
        parentSlug: { type: "text" },
        maxItems: { type: "number" },
        columns: {
          type: "select",
          options: [
            { label: "2 columns", value: 2 },
            { label: "3 columns", value: 3 },
            { label: "4 columns", value: 4 },
          ],
        },
        manualCards: {
          type: "array",
          arrayFields: {
            title: { type: "text" },
            description: { type: "textarea" },
            image: { type: "text" },
            link: { type: "text" },
            badge: { type: "text" },
          },
        },
        showBadge: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        cardStyle: {
          type: "select",
          options: [
            { label: "Default", value: "default" },
            { label: "Bordered", value: "bordered" },
            { label: "Shadow", value: "shadow" },
          ],
        },
      },
      render: ({ heading, subheading, columns, source, maxItems, manualCards, parentSlug }) => {
        const colMap = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }
        const limit = (maxItems as number) || 6

        // Fetch dynamic data when source is not manual
        const postsResult = useFetchJson<{ posts: Array<{ slug: string; title: string; excerpt: string; featured_image: string | null; published_at: string }> }>(
          source === "posts" ? `/posts?limit=${limit}` : ""
        )
        const pagesResult = useFetchJson<{ page: { title: string }; children: Array<{ slug: string; title: string; meta_description: string }> }>(
          source === "pages" && parentSlug ? `/pages/${parentSlug}` : ""
        )

        // Build cards array from the selected source
        let cards: Array<{ title: string; description: string; image: string; link: string; badge: string }> = []
        if (source === "posts" && postsResult.data?.posts) {
          cards = postsResult.data.posts.slice(0, limit).map((p) => ({
            title: p.title,
            description: p.excerpt || "",
            image: p.featured_image ? resolveMediaUrl(p.featured_image) : "",
            link: `/nyhet/${p.slug}`,
            badge: p.published_at ? new Date(p.published_at).toLocaleDateString("sv-SE") : "",
          }))
        } else if (source === "pages" && pagesResult.data?.children) {
          cards = pagesResult.data.children.slice(0, limit).map((p) => ({
            title: p.title,
            description: p.meta_description || "",
            image: "",
            link: `/${p.slug}`,
            badge: "",
          }))
        } else if (source === "manual") {
          cards = (manualCards as typeof cards) || []
        }

        const loading = (source === "posts" && postsResult.loading) || (source === "pages" && pagesResult.loading)

        return (
          <div>
            {heading && (
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h2>
                {subheading && <p className="text-gray-500 text-lg">{subheading}</p>}
              </div>
            )}
            {loading ? (
              <div className={`grid grid-cols-1 ${colMap[columns as keyof typeof colMap] || colMap[3]} gap-6`}>
                {Array.from({ length: limit > 3 ? 3 : limit }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-100" />
                    <div className="p-6 space-y-3">
                      <div className="h-5 bg-gray-100 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${colMap[columns as keyof typeof colMap] || colMap[3]} gap-6`}>
                {cards.map((card, i) => (
                  <a key={i} href={card.link || "#"} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow block group">
                    {card.image && (
                      <div className="aspect-video overflow-hidden">
                        <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-6">
                      {card.badge && <span className="text-xs text-gray-400 mb-1 block">{card.badge}</span>}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{card.title}</h3>
                      {card.description && <p className="text-sm text-gray-500 line-clamp-2">{card.description}</p>}
                    </div>
                  </a>
                ))}
                {cards.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    {source === "manual" ? "Add cards via settings" : source === "pages" ? "Set a parent slug to load child pages" : `No ${source} found`}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      },
    },

    Testimonial: {
      label: "Testimonial",
      defaultProps: {
        quote: "Ett fantastiskt citat här...",
        author: "",
        role: "",
        avatar: "",
        style: "card",
      },
      fields: {
        quote: { type: "textarea" },
        author: { type: "text" },
        role: { type: "text" },
        avatar: { type: "text" },
        style: {
          type: "select",
          options: [
            { label: "Card", value: "card" },
            { label: "Minimal", value: "minimal" },
            { label: "Featured", value: "featured" },
          ],
        },
      },
      render: ({ quote, author, role, style }) => {
        if (style === "minimal") {
          return (
            <blockquote className="border-l-4 border-primary-500 pl-6 py-2">
              <p className="text-lg italic text-gray-700">{quote}</p>
              {author && <footer className="mt-3 text-sm text-gray-500">— {author}{role && `, ${role}`}</footer>}
            </blockquote>
          )
        }
        return (
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
            <p className="text-lg text-gray-700 italic mb-4">"{quote}"</p>
            {author && (
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium text-gray-900">{author}</div>
                  {role && <div className="text-sm text-gray-500">{role}</div>}
                </div>
              </div>
            )}
          </div>
        )
      },
    },

    // ============ MEDIA ============

    VideoEmbed: {
      label: "Video",
      defaultProps: {
        url: "",
        aspectRatio: "16:9",
        caption: "",
      },
      fields: {
        url: { type: "text" },
        aspectRatio: {
          type: "select",
          options: [
            { label: "16:9", value: "16:9" },
            { label: "4:3", value: "4:3" },
            { label: "1:1", value: "1:1" },
          ],
        },
        caption: { type: "text" },
      },
      render: ({ url, aspectRatio, caption }) => {
        const ratioMap = { "16:9": "aspect-video", "4:3": "aspect-[4/3]", "1:1": "aspect-square" }
        // Extract YouTube/Vimeo embed URL
        let embedUrl = url
        if (url?.includes("youtube.com/watch")) {
          const videoId = new URL(url).searchParams.get("v")
          if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`
        } else if (url?.includes("youtu.be/")) {
          const videoId = url.split("youtu.be/")[1]?.split("?")[0]
          if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`
        } else if (url?.includes("vimeo.com/")) {
          const videoId = url.split("vimeo.com/")[1]?.split("?")[0]
          if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`
        }

        return (
          <figure>
            {embedUrl ? (
              <div className={`${ratioMap[aspectRatio as keyof typeof ratioMap] || "aspect-video"} w-full rounded-lg overflow-hidden bg-gray-100`}>
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={caption || "Video"}
                />
              </div>
            ) : (
              <div className={`${ratioMap[aspectRatio as keyof typeof ratioMap] || "aspect-video"} w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400`}>
                Paste a video URL
              </div>
            )}
            {caption && <figcaption className="text-sm text-gray-500 mt-2 text-center">{caption}</figcaption>}
          </figure>
        )
      },
    },

    ImageGallery: {
      label: "Image Gallery",
      defaultProps: {
        images: [],
        columns: 3,
        gap: "medium",
        aspectRatio: "landscape",
      },
      fields: {
        images: {
          type: "array",
          arrayFields: {
            src: { type: "text" },
            alt: { type: "text" },
            caption: { type: "text" },
          },
        },
        columns: {
          type: "select",
          options: [
            { label: "2 columns", value: 2 },
            { label: "3 columns", value: 3 },
            { label: "4 columns", value: 4 },
          ],
        },
        gap: {
          type: "select",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
        },
        aspectRatio: {
          type: "select",
          options: [
            { label: "Square", value: "square" },
            { label: "Landscape", value: "landscape" },
            { label: "Portrait", value: "portrait" },
            { label: "Auto", value: "auto" },
          ],
        },
      },
      render: ({ images, columns, gap, aspectRatio }) => {
        const colMap = { 2: "grid-cols-2", 3: "grid-cols-2 lg:grid-cols-3", 4: "grid-cols-2 lg:grid-cols-4" }
        const gapMap = { small: "gap-2", medium: "gap-4", large: "gap-6" }
        const ratioMap = { square: "aspect-square", landscape: "aspect-video", portrait: "aspect-[3/4]", auto: "" }

        return (
          <div className={`grid ${colMap[columns as keyof typeof colMap] || colMap[3]} ${gapMap[gap as keyof typeof gapMap] || gapMap.medium}`}>
            {(images as Array<{ src: string; alt: string; caption: string }>)?.map((img, i) => (
              <figure key={i} className="overflow-hidden rounded-lg">
                <img
                  src={img.src}
                  alt={img.alt || ""}
                  className={`w-full object-cover ${ratioMap[aspectRatio as keyof typeof ratioMap] || ""}`}
                />
                {img.caption && <figcaption className="text-xs text-gray-500 mt-1">{img.caption}</figcaption>}
              </figure>
            ))}
            {(!images || (images as Array<unknown>).length === 0) && (
              <div className="col-span-full text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                Add images via settings
              </div>
            )}
          </div>
        )
      },
    },

    // ============ ADVANCED ============

    ContactFormBlock: {
      label: "Contact Form",
      defaultProps: {
        heading: "Kontakta oss",
        description: "Har du frågor? Hör av dig så återkommer vi så snart vi kan.",
        showPhone: true,
        showSubject: true,
      },
      fields: {
        heading: { type: "text" },
        description: { type: "textarea" },
        showPhone: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        showSubject: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      render: ({ heading, description, showPhone, showSubject }) => {
        return (
          <div className="max-w-2xl mx-auto">
            {heading && <h2 className="text-2xl font-bold text-gray-900 mb-2">{heading}</h2>}
            {description && <p className="text-gray-500 mb-6">{description}</p>}
            <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Namn *</label>
                  <div className="h-10 rounded-lg border border-gray-300 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-post *</label>
                  <div className="h-10 rounded-lg border border-gray-300 bg-white" />
                </div>
              </div>
              {showPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <div className="h-10 rounded-lg border border-gray-300 bg-white" />
                </div>
              )}
              {showSubject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ämne</label>
                  <div className="h-10 rounded-lg border border-gray-300 bg-white" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meddelande *</label>
                <div className="h-32 rounded-lg border border-gray-300 bg-white" />
              </div>
              <div className="h-10 w-32 rounded-lg bg-primary-600" />
            </div>
          </div>
        )
      },
    },

    // ============ DYNAMIC CONTENT ============

    PostGrid: {
      label: "Post Grid",
      defaultProps: {
        heading: "",
        subheading: "",
        count: 3,
        columns: 3,
        showImage: true,
        showExcerpt: true,
        showDate: true,
        cardStyle: "default",
      },
      fields: {
        heading: { type: "text" },
        subheading: { type: "text" },
        count: { type: "number", min: 1, max: 12 },
        columns: {
          type: "select",
          options: [
            { label: "2 columns", value: 2 },
            { label: "3 columns", value: 3 },
            { label: "4 columns", value: 4 },
          ],
        },
        showImage: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        showExcerpt: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        showDate: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        cardStyle: {
          type: "select",
          options: [
            { label: "Default", value: "default" },
            { label: "Minimal", value: "minimal" },
            { label: "Featured", value: "featured" },
          ],
        },
      },
      render: ({ heading, subheading, count, columns, showImage, showExcerpt, showDate }) => {
        const limit = (count as number) || 3
        const { data, loading } = useFetchJson<{ posts: Array<{ slug: string; title: string; excerpt: string; featured_image: string | null; published_at: string }> }>(`/posts?limit=${limit}`)
        const colMap = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }
        const posts = data?.posts || []

        return (
          <div>
            {(heading || subheading) && (
              <div className="mb-8">
                {heading && <h2 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h2>}
                {subheading && <p className="text-lg text-gray-500">{subheading}</p>}
              </div>
            )}
            {loading ? (
              <div className={`grid grid-cols-1 ${colMap[columns as keyof typeof colMap] || colMap[3]} gap-6`}>
                {Array.from({ length: limit > 3 ? 3 : limit }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
                    {showImage && <div className="aspect-video bg-gray-100" />}
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-5 bg-gray-100 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className={`grid grid-cols-1 ${colMap[columns as keyof typeof colMap] || colMap[3]} gap-6`}>
                {posts.map((post) => (
                  <a key={post.slug} href={`/nyhet/${post.slug}`} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all group block">
                    {showImage && post.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img src={resolveMediaUrl(post.featured_image)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-5">
                      {showDate && post.published_at && (
                        <span className="text-xs font-medium text-gray-400 mb-1 block">
                          {new Date(post.published_at).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">{post.title}</h3>
                      {showExcerpt && post.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                No posts found
              </div>
            )}
          </div>
        )
      },
    },

    PageCards: {
      label: "Page Cards",
      defaultProps: {
        heading: "",
        parentSlug: "",
        manualPages: [],
        columns: 3,
        showDescription: true,
        style: "card",
      },
      fields: {
        heading: { type: "text" },
        parentSlug: { type: "text" },
        manualPages: {
          type: "array",
          arrayFields: {
            title: { type: "text" },
            description: { type: "text" },
            slug: { type: "text" },
            icon: { type: "text" },
          },
        },
        columns: {
          type: "select",
          options: [
            { label: "2 columns", value: 2 },
            { label: "3 columns", value: 3 },
            { label: "4 columns", value: 4 },
          ],
        },
        showDescription: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        style: {
          type: "select",
          options: [
            { label: "Card", value: "card" },
            { label: "List", value: "list" },
            { label: "Minimal", value: "minimal" },
          ],
        },
      },
      render: ({ heading, parentSlug, manualPages, columns, showDescription, style }) => {
        const { data, loading } = useFetchJson<{ page: { title: string }; children: Array<{ slug: string; title: string; meta_description: string }> }>(
          parentSlug ? `/pages/${parentSlug}` : ""
        )

        const manual = manualPages as Array<{ title: string; description: string; slug: string; icon: string }> || []
        const pages = parentSlug && data?.children
          ? data.children.map((p) => ({ title: p.title, description: p.meta_description || "", slug: p.slug, icon: "" }))
          : manual

        const colMap = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }

        if (loading && parentSlug) {
          return (
            <div className={`grid grid-cols-1 ${colMap[columns as keyof typeof colMap] || colMap[3]} gap-4`}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl border border-gray-200 bg-white animate-pulse" />
              ))}
            </div>
          )
        }

        if (style === "list") {
          return (
            <div>
              {heading && <h2 className="text-2xl font-bold text-gray-900 mb-4">{heading}</h2>}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {pages.map((page, i) => (
                  <a key={i} href={`/${page.slug}`} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors group">
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{page.title}</h3>
                      {showDescription && page.description && <p className="text-sm text-gray-500 mt-0.5">{page.description}</p>}
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>
                ))}
              </div>
            </div>
          )
        }

        if (style === "minimal") {
          return (
            <div>
              {heading && <h2 className="text-2xl font-bold text-gray-900 mb-4">{heading}</h2>}
              <div className="flex flex-wrap gap-3">
                {pages.map((page, i) => (
                  <a key={i} href={`/${page.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-colors">
                    {page.title}
                  </a>
                ))}
              </div>
            </div>
          )
        }

        return (
          <div>
            {heading && <h2 className="text-2xl font-bold text-gray-900 mb-6">{heading}</h2>}
            <div className={`grid grid-cols-1 ${colMap[columns as keyof typeof colMap] || colMap[3]} gap-4`}>
              {pages.map((page, i) => (
                <a key={i} href={`/${page.slug}`} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-primary-200 transition-all group block">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">{page.title}</h3>
                  {showDescription && page.description && <p className="text-sm text-gray-500 line-clamp-2">{page.description}</p>}
                </a>
              ))}
              {pages.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  {parentSlug ? "No child pages found" : "Add pages manually or set a parent slug"}
                </div>
              )}
            </div>
          </div>
        )
      },
    },

    NavigationMenu: {
      label: "Navigation Menu",
      defaultProps: {
        items: [{ label: "Home", link: "/" }],
        layout: "horizontal",
        style: "pills",
        alignment: "center",
      },
      fields: {
        items: {
          type: "array",
          arrayFields: {
            label: { type: "text" },
            link: { type: "text" },
          },
        },
        layout: {
          type: "radio",
          options: [
            { label: "Horizontal", value: "horizontal" },
            { label: "Vertical", value: "vertical" },
          ],
        },
        style: {
          type: "select",
          options: [
            { label: "Pills", value: "pills" },
            { label: "Underline", value: "underline" },
            { label: "Buttons", value: "buttons" },
            { label: "Minimal", value: "minimal" },
          ],
        },
        alignment: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      render: ({ items, layout, style, alignment }) => {
        const menuItems = items as Array<{ label: string; link: string }> || []
        const alignMap = { left: "justify-start", center: "justify-center", right: "justify-end" }
        const isVertical = layout === "vertical"

        const styleMap: Record<string, string> = {
          pills: "px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium text-sm transition-colors",
          underline: "px-3 py-2 border-b-2 border-transparent hover:border-primary-500 text-gray-700 hover:text-primary-600 font-medium text-sm transition-colors",
          buttons: "px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 font-medium text-sm transition-colors",
          minimal: "px-2 py-1 text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors",
        }

        return (
          <nav>
            <div className={`flex ${isVertical ? "flex-col gap-1" : `flex-wrap gap-2 ${alignMap[alignment as keyof typeof alignMap] || "justify-center"}`}`}>
              {menuItems.map((item, i) => (
                <a key={i} href={item.link || "#"} className={styleMap[style as string] || styleMap.pills}>
                  {item.label}
                </a>
              ))}
              {menuItems.length === 0 && (
                <span className="text-gray-400 text-sm">Add menu items via settings</span>
              )}
            </div>
          </nav>
        )
      },
    },

    Columns: {
      label: "Columns",
      defaultProps: {
        layout: "50-50",
        gap: "medium",
        verticalAlignment: "top",
        stackOnMobile: true,
      },
      fields: {
        layout: {
          type: "select",
          options: [
            { label: "50/50", value: "50-50" },
            { label: "33/33/33", value: "33-33-33" },
            { label: "66/33", value: "66-33" },
            { label: "33/66", value: "33-66" },
          ],
        },
        gap: {
          type: "select",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
        },
        verticalAlignment: {
          type: "select",
          options: [
            { label: "Top", value: "top" },
            { label: "Center", value: "center" },
            { label: "Bottom", value: "bottom" },
          ],
        },
        stackOnMobile: {
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      render: ({ layout, gap, verticalAlignment }) => {
        const gapMap = { small: "gap-4", medium: "gap-8", large: "gap-12" }
        const alignMap = { top: "items-start", center: "items-center", bottom: "items-end" }
        const layoutMap: Record<string, string> = {
          "50-50": "grid-cols-1 md:grid-cols-2",
          "33-33-33": "grid-cols-1 md:grid-cols-3",
          "66-33": "grid-cols-1 md:grid-cols-[2fr_1fr]",
          "33-66": "grid-cols-1 md:grid-cols-[1fr_2fr]",
        }

        const colCount = (layout as string)?.includes("33-33-33") ? 3 : 2

        return (
          <div className={`grid ${layoutMap[layout as string] || layoutMap["50-50"]} ${gapMap[gap as keyof typeof gapMap] || gapMap.medium} ${alignMap[verticalAlignment as keyof typeof alignMap] || alignMap.top}`}>
            {Array.from({ length: colCount }).map((_, i) => (
              <div key={i} className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center text-gray-400 text-sm">
                Column {i + 1} — drop blocks here
              </div>
            ))}
          </div>
        )
      },
    },
  },
}
