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

export const puckConfig: Config = {
  root: {
    render: ({ children }: { children: React.ReactNode }) => (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>
    ),
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
            { label: "Courses", value: "courses" },
            { label: "Products", value: "products" },
          ],
        },
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
      render: ({ heading, subheading, columns, manualCards }) => {
        const colMap = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }
        return (
          <div>
            {heading && (
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h2>
                {subheading && <p className="text-gray-500 text-lg">{subheading}</p>}
              </div>
            )}
            <div className={`grid grid-cols-1 ${colMap[columns as keyof typeof colMap] || colMap[3]} gap-6`}>
              {(manualCards as Array<{ title: string; description: string; image: string; link: string; badge: string }>)?.map((card, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {card.image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                    {card.description && <p className="text-sm text-gray-500">{card.description}</p>}
                  </div>
                </div>
              ))}
              {(!manualCards || (manualCards as Array<unknown>).length === 0) && (
                <div className="col-span-full text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  Add cards via settings
                </div>
              )}
            </div>
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
