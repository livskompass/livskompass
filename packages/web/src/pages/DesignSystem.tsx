import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { SiteSearch } from '../components/SiteSearch'
import {
  CardGrid, PostGrid, PageCards, CourseList, ProductList, CTABanner, Testimonial,
  FeatureGrid, PersonCard, PricingTable,
  Hero, Accordion, RichText, ImageBlock, ImageGallery, StatsCounter, PageHeader,
  PostHeader, CourseInfo, BookingCTA, ContactForm, BookingForm,
  NavigationMenu, ButtonGroup, Columns, Spacer, SeparatorBlock,
  AudioEmbed, VideoEmbed, FileEmbed, EmbedBlock, Price,
} from '@livskompass/shared'
// Card components available: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Separator } from '../components/ui/separator'
import { Skeleton } from '../components/ui/skeleton'
import { cn } from '../lib/utils'

type CardColor = 'white' | 'yellow' | 'mist' | 'dark'
type CTABannerBg = 'primary' | 'dark' | 'light' | 'gradient'

const cardColorSwatches: Array<{ value: CardColor; label: string; bg: string; border?: string }> = [
  { value: 'white', label: 'White', bg: 'bg-white', border: 'border border-stone-300' },
  { value: 'yellow', label: 'Yellow', bg: 'bg-amber-300' },
  { value: 'mist', label: 'Mist', bg: 'bg-mist' },
  { value: 'dark', label: 'Dark green', bg: 'bg-forest-800' },
]

const ctaBannerBgSwatches: Array<{ value: CTABannerBg; label: string; bg: string; border?: string }> = [
  { value: 'primary', label: 'Primary', bg: 'bg-forest-600' },
  { value: 'dark', label: 'Dark', bg: 'bg-stone-900' },
  { value: 'light', label: 'Light', bg: 'bg-surface-alt', border: 'border border-stone-300' },
  { value: 'gradient', label: 'Gradient', bg: '' },
]

function Swatch({ active, bg, label, border, onClick, gradient }: { active: boolean; bg: string; label: string; border?: string; onClick: () => void; gradient?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-9 h-9 rounded-full transition-all',
        bg,
        border,
        active ? 'ring-2 ring-offset-2 ring-forest-700 scale-110' : 'hover:scale-105'
      )}
      style={gradient ? { background: 'var(--gradient-hero)' } : undefined}
      aria-label={label}
      title={label}
    />
  )
}

function CardColorPicker({ value, onChange }: { value: CardColor; onChange: (c: CardColor) => void }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold text-forest-700 uppercase tracking-wider w-28">Card color</span>
      <div className="flex gap-2">
        {cardColorSwatches.map((s) => (
          <Swatch key={s.value} active={value === s.value} bg={s.bg} label={s.label} border={s.border} onClick={() => onChange(s.value)} />
        ))}
      </div>
    </div>
  )
}

function CTABannerBgPicker({ value, onChange }: { value: CTABannerBg; onChange: (c: CTABannerBg) => void }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold text-forest-700 uppercase tracking-wider w-28">Background</span>
      <div className="flex gap-2">
        {ctaBannerBgSwatches.map((s) => (
          <Swatch key={s.value} active={value === s.value} bg={s.bg} label={s.label} border={s.border} onClick={() => onChange(s.value)} gradient={s.value === 'gradient'} />
        ))}
      </div>
    </div>
  )
}

function ColumnPicker({ value, onChange, options = [2, 3, 4] }: { value: number; onChange: (n: number) => void; options?: number[] }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold text-forest-700 uppercase tracking-wider w-28">Columns</span>
      <div className="flex gap-2">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'w-9 h-9 rounded-lg font-semibold text-sm transition-all',
              value === n
                ? 'bg-forest-800 text-white ring-2 ring-offset-2 ring-forest-700'
                : 'bg-stone-100 text-forest-800 hover:bg-stone-200'
            )}
            aria-label={`${n} columns`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

type CTABannerPadding = 'small' | 'medium' | 'large'
type CTABannerWidth = 'full' | 'contained' | 'narrow'

function SegmentedPicker<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: Array<{ value: T; label: string }> }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold text-forest-700 uppercase tracking-wider w-28">{label}</span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'h-9 px-4 rounded-lg font-medium text-xs uppercase tracking-wider transition-all',
              value === o.value
                ? 'bg-forest-800 text-white ring-2 ring-offset-2 ring-forest-700'
                : 'bg-stone-100 text-forest-800 hover:bg-stone-200'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function VariantLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold text-forest-700 uppercase tracking-wider mb-3">
      {children}
    </h4>
  )
}

function VariantCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <VariantLabel>{label}</VariantLabel>
      <div>{children}</div>
    </div>
  )
}

/** Collapses block section-padding CSS vars to 0 so multiple variants fit compactly in grid cells.
    Only applied inside VariantGrid — stacked variants keep their natural production padding. */
const compactGridStyle: React.CSSProperties = {
  // @ts-expect-error CSS custom properties
  '--section-xs': '0',
  '--section-sm': '0',
  '--section-md': '0',
  '--section-lg': '0',
  '--section-xl': '0',
}

function VariantGrid({ children, cols = 3 }: { children: React.ReactNode; cols?: number }) {
  const colClass =
    cols === 2 ? 'grid-cols-1 md:grid-cols-2'
    : cols === 4 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
  return (
    <div className={cn('grid gap-8', colClass)} style={compactGridStyle}>
      {children}
    </div>
  )
}

const sampleImage1 = 'https://picsum.photos/seed/livs1/800/450'
const sampleImage2 = 'https://picsum.photos/seed/livs2/800/450'
const sampleImage3 = 'https://picsum.photos/seed/livs3/800/450'

const sampleTestimonials = [
  { quote: 'Den här utbildningen har förändrat hur jag arbetar med klienter. Otroligt givande.', author: 'Anna Lindqvist', role: 'Legitimerad psykolog', avatar: sampleImage1 },
  { quote: 'Fredrik är en fantastisk lärare. Innehållet är både djupgående och praktiskt tillämpbart.', author: 'Erik Johansson', role: 'Kurator', avatar: sampleImage2 },
  { quote: 'Bästa investeringen i min yrkesroll på flera år. Rekommenderas varmt.', author: 'Maria Karlsson', role: 'Psykoterapeut', avatar: sampleImage3 },
]

const sampleFeatureItems = [
  { icon: 'heart', title: 'Evidensbaserat', description: 'Bygger på gedigen forskning inom ACT och mindfulness.' },
  { icon: 'users', title: 'Gruppformat', description: 'Lär dig i en stödjande gemenskap med andra professionella.' },
  { icon: 'target', title: 'Praktisk tillämpning', description: 'Verktyg du kan använda direkt i ditt dagliga arbete.' },
]

const samplePricingTiers = [
  { name: 'Bas', price: '2 500', description: 'För privatpersoner', features: ['2 dagar utbildning', 'Kursmaterial', 'Certifikat'], highlighted: false, ctaText: 'Välj Bas', ctaLink: '#' },
  { name: 'Professional', price: '4 500', description: 'För yrkesverksamma', features: ['3 dagar utbildning', 'Komplett kursmaterial', 'Individuell coaching', 'Certifikat'], highlighted: true, ctaText: 'Välj Professional', ctaLink: '#' },
  { name: 'Team', price: '12 000', description: 'För hela teamet', features: ['3 dagar utbildning', 'Upp till 10 deltagare', 'Företagsanpassat', 'Uppföljning'], highlighted: false, ctaText: 'Kontakta oss', ctaLink: '#' },
]

const colors = {
  'Forest (Primary)': [
    { name: '950', var: '--forest-950', class: 'bg-forest-950' },
    { name: '900', var: '--forest-900', class: 'bg-forest-900' },
    { name: '800', var: '--forest-800', class: 'bg-forest-800', label: '#004638' },
    { name: '700', var: '--forest-700', class: 'bg-forest-700' },
    { name: '600', var: '--forest-600', class: 'bg-forest-600' },
    { name: '500', var: '--forest-500', class: 'bg-forest-500' },
    { name: '400', var: '--forest-400', class: 'bg-forest-400' },
    { name: '300', var: '--forest-300', class: 'bg-forest-300' },
    { name: '200', var: '--forest-200', class: 'bg-forest-200' },
    { name: '100', var: '--forest-100', class: 'bg-forest-100' },
    { name: '50', var: '--forest-50', class: 'bg-forest-50' },
  ],
  'Stone (Neutrals)': [
    { name: '950', var: '--stone-950', class: 'bg-stone-950', label: '#141319' },
    { name: '900', var: '--stone-900', class: 'bg-stone-900' },
    { name: '800', var: '--stone-800', class: 'bg-stone-800' },
    { name: '700', var: '--stone-700', class: 'bg-stone-700' },
    { name: '600', var: '--stone-600', class: 'bg-stone-600' },
    { name: '500', var: '--stone-500', class: 'bg-stone-500' },
    { name: '400', var: '--stone-400', class: 'bg-stone-400' },
    { name: '300', var: '--stone-300', class: 'bg-stone-300' },
    { name: '200', var: '--stone-200', class: 'bg-stone-200' },
    { name: '100', var: '--stone-100', class: 'bg-stone-100' },
    { name: '50', var: '--stone-50', class: 'bg-stone-50', label: '#FDFFFC' },
  ],
  'Amber (Accent)': [
    { name: '600', var: '--amber-600', class: 'bg-amber-600' },
    { name: '500', var: '--amber-500', class: 'bg-amber-500' },
    { name: '400', var: '--amber-400', class: 'bg-amber-400' },
    { name: '300', var: '--amber-300', class: 'bg-amber-300', label: '#FFE962' },
    { name: '200', var: '--amber-200', class: 'bg-amber-200' },
    { name: '100', var: '--amber-100', class: 'bg-amber-100' },
    { name: '50', var: '--amber-50', class: 'bg-amber-50' },
  ],
}

const surfaces = [
  { name: 'Primary', var: '--surface-primary', style: { background: 'var(--surface-primary)' } },
  { name: 'Secondary', var: '--surface-secondary', style: { background: 'var(--surface-secondary)' } },
  { name: 'Elevated', var: '--surface-elevated', style: { background: 'var(--surface-elevated)' } },
  { name: 'Hero', var: '--gradient-hero', style: { background: 'var(--gradient-hero)' } },
  { name: 'Glass', var: '--surface-glass', style: { background: 'var(--surface-glass)', backdropFilter: 'blur(16px)' } },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-h2 mb-6">{title}</h2>
      {children}
    </section>
  )
}

function TypographyRow({ tailwind, token, sample }: {
  tailwind: string
  token: string
  sample: string
  /** legacy props ignored — the utility class controls font-family/weight */
  display?: boolean
  overline?: boolean
}) {
  // Render via the actual Tailwind class so what's shown matches what
  // editors get when they apply the class. Fonts/weights come from the
  // utility's CSS rule, not hardcoded here.
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">{tailwind}</code>
        <span className="text-xs text-stone-400 font-mono">{token}</span>
      </div>
      <p className={cn('text-forest-800', tailwind)}>{sample}</p>
    </div>
  )
}

const tabs = ['Foundations', 'Patterns', 'Components'] as const
type Tab = typeof tabs[number]

export default function DesignSystem() {
  const [activeTab, setActiveTab] = useState<Tab>('Foundations')

  return (
    <div className="pt-24 pb-20" style={{ maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
      <h1 className="text-display mb-4">Design System</h1>
      <p className="text-secondary text-body-lg mb-8">Livskompass component library and visual guidelines. Source of truth for tokens, primitives, and blocks.</p>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-12 p-1 rounded-[12px] bg-forest-50 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-[10px] text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-forest-800 text-white shadow-sm'
                : 'text-forest-600 hover:text-forest-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Foundations' && <FoundationsTab />}
      {activeTab === 'Patterns' && <PatternsTab />}
      {activeTab === 'Components' && <ComponentsTab />}
    </div>
  )
}

function PatternsTab() {
  const [searchOpen, setSearchOpen] = useState(false)
  return (
    <>
      <p className="text-secondary mb-8">Persistent page chrome and primitive compositions used across every public page. Live renders — edit the source file and changes appear here automatically.</p>

      {/* Site Header — over a mock hero so transparency reads correctly */}
      <Section title="Site Header">
        <p className="text-sm text-stone-600 mb-6">Pulled from <code className="text-xs font-mono">site_settings.header</code>. Transparent over hero, with dynamic light/dark nav color, dropdowns for child pages, mobile hamburger, optional search trigger. Source: <code className="text-xs font-mono">components/SiteHeader.tsx</code>.</p>
        <div className="rounded-[16px] overflow-hidden border border-default" style={{ background: 'var(--gradient-hero)' }}>
          <SiteHeader onSearchOpen={() => setSearchOpen(true)} staticPosition />
          <div className="px-8 py-20 text-center">
            <p className="text-overline text-secondary mb-2">Hero preview area</p>
            <p className="text-h3 text-brand">The header sits transparent over the page's first section.</p>
          </div>
        </div>
        <p className="text-xs text-faint mt-3">Resize the browser below ~1024px to see the mobile hamburger + slide-down menu (Tailwind <code className="text-xs font-mono">lg:</code> breakpoint).</p>
      </Section>

      {/* Site Footer */}
      <Section title="Site Footer">
        <p className="text-sm text-stone-600 mb-6">Pulled from <code className="text-xs font-mono">site_settings.footer</code>. Three-column responsive layout: brand + tagline / contact / configurable link columns. Source: <code className="text-xs font-mono">components/SiteFooter.tsx</code>.</p>
        <div className="rounded-[16px] overflow-hidden border border-default">
          <SiteFooter onSearchOpen={() => setSearchOpen(true)} />
        </div>
      </Section>

      {/* Search overlay */}
      <Section title="Site Search">
        <p className="text-sm text-stone-600 mb-6">Full-screen search overlay. Triggered by the magnifying-glass button in the header (or here for preview). Debounced query against <code className="text-xs font-mono">/api/search</code>; results grouped by content type. Esc to close.</p>
        <Button onClick={() => setSearchOpen(true)}>Open search overlay</Button>
        <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </Section>

      {/* Card primitives (shadcn) */}
      <Section title="Card primitives (shadcn)">
        <p className="text-sm text-stone-600 mb-6">Low-level card composition. Used directly on admin/internal pages and as building blocks for richer block components. Six pieces: <code className="text-xs font-mono">Card / CardHeader / CardTitle / CardDescription / CardContent / CardFooter</code>.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VariantCell label="Full composition">
            <Card>
              <CardHeader>
                <CardTitle>ACT Gruppledarutbildning</CardTitle>
                <CardDescription>Tre dagar för terapeuter och yrkesverksamma.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-secondary">Bygger psykologisk flexibilitet med evidensbaserade ACT-tekniker. Vid behov hjälper vi dig att integrera materialet i din praktik.</p>
              </CardContent>
              <CardFooter>
                <Button variant="default" size="sm">Boka plats</Button>
                <Button variant="outline" size="sm">Läs mer</Button>
              </CardFooter>
            </Card>
          </VariantCell>
          <VariantCell label="Header + content only">
            <Card>
              <CardHeader>
                <CardTitle>Mindfulness-övningar</CardTitle>
                <CardDescription>Guidade ljudövningar att lyssna på när du behöver dem.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-secondary">Andningsövningar, kroppsskanning, medveten närvaro.</p>
              </CardContent>
            </Card>
          </VariantCell>
          <VariantCell label="Content only (no header)">
            <Card>
              <CardContent className="pt-6">
                <p className="text-body text-foreground">Den här utbildningen har förändrat hur jag arbetar med klienter.</p>
                <p className="text-caption text-muted mt-3">— Anna Lindqvist, Legitimerad psykolog</p>
              </CardContent>
            </Card>
          </VariantCell>
          <VariantCell label="Title only with footer">
            <Card>
              <CardHeader>
                <CardTitle>Snabblänkar</CardTitle>
              </CardHeader>
              <CardFooter>
                <Button variant="ghost" size="sm">Material</Button>
                <Button variant="ghost" size="sm">Forskning</Button>
                <Button variant="ghost" size="sm">Kontakt</Button>
              </CardFooter>
            </Card>
          </VariantCell>
        </div>
      </Section>
    </>
  )
}

function ComponentsTab() {
  const [cardGridColor, setCardGridColor] = useState<CardColor>('yellow')
  const [postGridColor, setPostGridColor] = useState<CardColor>('yellow')
  const [pageCardsColor, setPageCardsColor] = useState<CardColor>('yellow')
  const [courseListColor, setCourseListColor] = useState<CardColor>('yellow')
  const [productListColor, setProductListColor] = useState<CardColor>('yellow')
  const [featureGridColor, setFeatureGridColor] = useState<CardColor>('yellow')
  const [ctaBannerBg, setCtaBannerBg] = useState<CTABannerBg>('primary')

  const [cardGridCols, setCardGridCols] = useState(3)
  const [postGridCols, setPostGridCols] = useState(3)
  const [pageCardsCols, setPageCardsCols] = useState(3)
  const [courseListCols, setCourseListCols] = useState(2)
  const [productListCols, setProductListCols] = useState(3)

  const [ctaBannerPadding, setCtaBannerPadding] = useState<CTABannerPadding>('medium')
  const [ctaBannerWidth, setCtaBannerWidth] = useState<CTABannerWidth>('contained')

  return (
    <>
      {/* Buttons */}
      <Section title="Buttons">
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">Variants</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">Sizes</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">On dark background</h3>
            <div className="bg-forest-800 rounded-[16px] p-8 flex items-center gap-4 flex-wrap">
              <Button className="bg-white text-forest-800 hover:bg-stone-100">Primary (inverted)</Button>
              <Button variant="secondary">Secondary</Button>
              <Button className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-forest-800">Outline (inverted)</Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">On mist background</h3>
            <div className="rounded-[16px] p-8 flex items-center gap-4 flex-wrap" style={{ background: '#C7DDDC' }}>
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">Disabled</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <Button disabled>Primary</Button>
              <Button variant="secondary" disabled>Secondary</Button>
              <Button variant="outline" disabled>Outline</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Cards — real production block components, interactive color picker + all CMS option variants.
          Edit the blocks in packages/shared/src/blocks/ and changes reflect here + in production. */}

      <Section title="CardGrid">
        <p className="text-sm text-stone-600 mb-6">Manual card block. Badge, image, title, description. Manual source in the design system; dynamic sources (posts/courses/products) fetch live data.</p>
        <CardColorPicker value={cardGridColor} onChange={setCardGridColor} />
        <ColumnPicker value={cardGridCols} onChange={setCardGridCols} options={[2, 3, 4]} />

        <VariantGrid cols={cardGridCols}>
          <VariantCell label="Full — image + badge + description">
            <CardGrid
              heading="" subheading="" source="manual" maxItems={1} columns={1 as 3} cardStyle="default"
              cardColor={cardGridColor}
              manualCards={[{ title: 'ACT Gruppledarutbildning', description: 'En tre dagar lång utbildning för terapeuter och gruppledare.', image: sampleImage1, link: '#', badge: 'Utbildning' }]}
              fullBadgeText="Fully booked" spotsAvailableText="Spots available" emptyManualText="" emptyDynamicText=""
            />
          </VariantCell>
          <VariantCell label="No image">
            <CardGrid
              heading="" subheading="" source="manual" maxItems={1} columns={1 as 3} cardStyle="default"
              cardColor={cardGridColor}
              manualCards={[{ title: 'ACT Gruppledarutbildning', description: 'En tre dagar lång utbildning för terapeuter och gruppledare.', image: '', link: '#', badge: 'Utbildning' }]}
              fullBadgeText="Fully booked" spotsAvailableText="Spots available" emptyManualText="" emptyDynamicText=""
            />
          </VariantCell>
          <VariantCell label="No badge">
            <CardGrid
              heading="" subheading="" source="manual" maxItems={1} columns={1 as 3} cardStyle="default"
              cardColor={cardGridColor}
              manualCards={[{ title: 'ACT Gruppledarutbildning', description: 'En tre dagar lång utbildning för terapeuter och gruppledare.', image: sampleImage1, link: '#', badge: '' }]}
              fullBadgeText="Fully booked" spotsAvailableText="Spots available" emptyManualText="" emptyDynamicText=""
            />
          </VariantCell>
          <VariantCell label="Title only">
            <CardGrid
              heading="" subheading="" source="manual" maxItems={1} columns={1 as 3} cardStyle="default"
              cardColor={cardGridColor}
              manualCards={[{ title: 'ACT Gruppledarutbildning', description: '', image: '', link: '#', badge: '' }]}
              fullBadgeText="Fully booked" spotsAvailableText="Spots available" emptyManualText="" emptyDynamicText=""
            />
          </VariantCell>
          <VariantCell label="Dynamic: courses">
            <CardGrid
              heading="" subheading="" source="courses" maxItems={1} columns={1 as 3} cardStyle="default"
              cardColor={cardGridColor} manualCards={[]}
              fullBadgeText="Fully booked" spotsAvailableText="Spots available" emptyManualText="" emptyDynamicText="No courses"
            />
          </VariantCell>
          <VariantCell label="Dynamic: posts">
            <CardGrid
              heading="" subheading="" source="posts" maxItems={1} columns={1 as 3} cardStyle="default"
              cardColor={cardGridColor} manualCards={[]}
              fullBadgeText="Fully booked" spotsAvailableText="Spots available" emptyManualText="" emptyDynamicText="No posts"
            />
          </VariantCell>
          <VariantCell label="Dynamic: products">
            <CardGrid
              heading="" subheading="" source="products" maxItems={1} columns={1 as 3} cardStyle="default"
              cardColor={cardGridColor} manualCards={[]}
              fullBadgeText="Fully booked" spotsAvailableText="Spots available" emptyManualText="" emptyDynamicText="No products"
            />
          </VariantCell>
        </VariantGrid>
      </Section>

      <Section title="PostGrid">
        <p className="text-sm text-stone-600 mb-6">Dynamic grid of latest posts. Toggles: showImage, showDate, showExcerpt. Live data.</p>
        <CardColorPicker value={postGridColor} onChange={setPostGridColor} />
        <ColumnPicker value={postGridCols} onChange={setPostGridCols} options={[2, 3, 4]} />

        <VariantGrid cols={postGridCols}>
          <VariantCell label="Full — image + date + excerpt">
            <PostGrid heading="" subheading="" count={1} columns={1 as 3} showImage showExcerpt showDate emptyText="No posts in database" cardColor={postGridColor} />
          </VariantCell>
          <VariantCell label="No image">
            <PostGrid heading="" subheading="" count={1} columns={1 as 3} showImage={false} showExcerpt showDate emptyText="No posts in database" cardColor={postGridColor} />
          </VariantCell>
          <VariantCell label="No date">
            <PostGrid heading="" subheading="" count={1} columns={1 as 3} showImage showExcerpt showDate={false} emptyText="No posts in database" cardColor={postGridColor} />
          </VariantCell>
          <VariantCell label="No excerpt">
            <PostGrid heading="" subheading="" count={1} columns={1 as 3} showImage showExcerpt={false} showDate emptyText="No posts in database" cardColor={postGridColor} />
          </VariantCell>
          <VariantCell label="Title only">
            <PostGrid heading="" subheading="" count={1} columns={1 as 3} showImage={false} showExcerpt={false} showDate={false} emptyText="No posts in database" cardColor={postGridColor} />
          </VariantCell>
        </VariantGrid>
      </Section>

      <Section title="PageCards">
        <p className="text-sm text-stone-600 mb-6">Page list with three styles: card, list, minimal.</p>
        <CardColorPicker value={pageCardsColor} onChange={setPageCardsColor} />
        <ColumnPicker value={pageCardsCols} onChange={setPageCardsCols} options={[2, 3, 4]} />

        <VariantGrid cols={pageCardsCols}>
          <VariantCell label="Card — with description">
            <PageCards
              heading="" parentSlug=""
              manualPages={[{ title: '', description: '', slug: 'vad-ar-act', icon: '' }]}
              columns={1 as 3} showDescription style="card" emptyText="" emptyManualText="" cardColor={pageCardsColor}
            />
          </VariantCell>
          <VariantCell label="Card — no description">
            <PageCards
              heading="" parentSlug=""
              manualPages={[{ title: '', description: '', slug: 'vad-ar-act', icon: '' }]}
              columns={1 as 3} showDescription={false} style="card" emptyText="" emptyManualText="" cardColor={pageCardsColor}
            />
          </VariantCell>
          <VariantCell label="List — with description">
            <PageCards
              heading="" parentSlug=""
              manualPages={[
                { title: '', description: '', slug: 'vad-ar-act', icon: '' },
                { title: '', description: '', slug: 'tips-nar-du-ovar-medveten-narvaro', icon: '' },
                { title: '', description: '', slug: 'rekryteringsmaterial', icon: '' },
              ]}
              columns={1 as 3} showDescription style="list" emptyText="" emptyManualText="" cardColor={pageCardsColor}
            />
          </VariantCell>
          <VariantCell label="List — no description">
            <PageCards
              heading="" parentSlug=""
              manualPages={[
                { title: 'Vad är ACT', description: '', slug: 'act', icon: '' },
                { title: 'Mindfulness', description: '', slug: 'mindfulness', icon: '' },
                { title: 'Forskning', description: '', slug: 'forskning-pa-metoden', icon: '' },
              ]}
              columns={1 as 3} showDescription={false} style="list" emptyText="" emptyManualText="" cardColor={pageCardsColor}
            />
          </VariantCell>
          <VariantCell label="Minimal">
            <PageCards
              heading="" parentSlug=""
              manualPages={[
                { title: 'Vad är ACT', description: '', slug: 'act', icon: '' },
                { title: 'Mindfulness', description: '', slug: 'mindfulness', icon: '' },
                { title: 'Forskning', description: '', slug: 'forskning-pa-metoden', icon: '' },
                { title: 'Kontakt', description: '', slug: 'kontakt', icon: '' },
              ]}
              columns={1 as 3} showDescription={false} style="minimal" emptyText="" emptyManualText="" cardColor={pageCardsColor}
            />
          </VariantCell>
        </VariantGrid>
      </Section>

      <Section title="CourseList">
        <p className="text-sm text-stone-600 mb-6">Dynamic course cards with status, location, date, price. Live data. Production default is 2 columns.</p>
        <CardColorPicker value={courseListColor} onChange={setCourseListColor} />
        <ColumnPicker value={courseListCols} onChange={setCourseListCols} options={[2, 3]} />

        <VariantGrid cols={courseListCols}>
          <VariantCell label="Full — location + date + price + read more">
            <CourseList heading="" maxItems={1} columns={1 as 2} compactMode={false} showLocation showPrice readMoreText="View course" bookButtonText="Book" fullLabel="Fully booked" spotsText="spots left" emptyText="No courses in database" cardColor={courseListColor} />
          </VariantCell>
          <VariantCell label="Compact mode">
            <CourseList heading="" maxItems={1} columns={1 as 2} compactMode showLocation showPrice readMoreText="View course" bookButtonText="Book" fullLabel="Fully booked" spotsText="spots left" emptyText="No courses in database" cardColor={courseListColor} />
          </VariantCell>
          <VariantCell label="Without price">
            <CourseList heading="" maxItems={1} columns={1 as 2} compactMode={false} showLocation showPrice={false} readMoreText="View course" bookButtonText="Book" fullLabel="Fully booked" spotsText="spots left" emptyText="No courses in database" cardColor={courseListColor} />
          </VariantCell>
          <VariantCell label="Without location">
            <CourseList heading="" maxItems={1} columns={1 as 2} compactMode={false} showLocation={false} showPrice readMoreText="View course" bookButtonText="Book" fullLabel="Fully booked" spotsText="spots left" emptyText="No courses in database" cardColor={courseListColor} />
          </VariantCell>
          <VariantCell label="Compact + no price">
            <CourseList heading="" maxItems={1} columns={1 as 2} compactMode showLocation showPrice={false} readMoreText="View course" bookButtonText="Book" fullLabel="Fully booked" spotsText="spots left" emptyText="No courses in database" cardColor={courseListColor} />
          </VariantCell>
        </VariantGrid>
      </Section>

      <Section title="ProductList">
        <p className="text-sm text-stone-600 mb-6">Dynamic product cards with type, price, buy button. Live data.</p>
        <CardColorPicker value={productListColor} onChange={setProductListColor} />
        <ColumnPicker value={productListCols} onChange={setProductListCols} options={[2, 3]} />

        <VariantGrid cols={productListCols}>
          <VariantCell label="Full — image + price + buy button">
            <ProductList heading="" filterType="" columns={1 as 3} maxItems={1} showImage showPrice buyButtonText="Buy" freeLabel="Free" outOfStockLabel="Out of stock" emptyText="No products in database" typeLabels={{ book: 'Books', cd: 'CDs', cards: 'Cards', app: 'Apps', download: 'Downloads', manual: 'Manuals' }} cardColor={productListColor} />
          </VariantCell>
          <VariantCell label="No image">
            <ProductList heading="" filterType="" columns={1 as 3} maxItems={1} showImage={false} showPrice buyButtonText="Buy" freeLabel="Free" outOfStockLabel="Out of stock" emptyText="No products in database" typeLabels={{ book: 'Books', cd: 'CDs', cards: 'Cards', app: 'Apps', download: 'Downloads', manual: 'Manuals' }} cardColor={productListColor} />
          </VariantCell>
          <VariantCell label="No price">
            <ProductList heading="" filterType="" columns={1 as 3} maxItems={1} showImage showPrice={false} buyButtonText="Buy" freeLabel="Free" outOfStockLabel="Out of stock" emptyText="No products in database" typeLabels={{ book: 'Books', cd: 'CDs', cards: 'Cards', app: 'Apps', download: 'Downloads', manual: 'Manuals' }} cardColor={productListColor} />
          </VariantCell>
        </VariantGrid>
      </Section>

      <Section title="CTABanner">
        <p className="text-sm text-stone-600 mb-6">Full-width banner with heading, description, and button(s). Pick background, width, and padding — each variant below demos a composition change.</p>
        <CTABannerBgPicker value={ctaBannerBg} onChange={setCtaBannerBg} />
        <SegmentedPicker label="Width" value={ctaBannerWidth} onChange={setCtaBannerWidth} options={[{ value: 'full', label: 'Full' }, { value: 'contained', label: 'Contained' }, { value: 'narrow', label: 'Narrow' }]} />
        <SegmentedPicker label="Padding" value={ctaBannerPadding} onChange={setCtaBannerPadding} options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]} />

        <div className="space-y-12 mt-8">
          <VariantCell label="Center — 1 button">
            <CTABanner heading="Ready to get started?" description="Join our upcoming ACT training and transform your practice." buttonText="Book now" buttonLink="#" backgroundColor={ctaBannerBg} alignment="center" width={ctaBannerWidth} padding={ctaBannerPadding} />
          </VariantCell>
          <VariantCell label="Left align — 2 buttons">
            <CTABanner heading="Ready to get started?" description="Join our upcoming ACT training and transform your practice." buttonText="" buttonLink="" buttons={[{ text: 'Book now', link: '#', variant: 'primary' }, { text: 'Learn more', link: '#', variant: 'outline' }]} backgroundColor={ctaBannerBg} alignment="left" width={ctaBannerWidth} padding={ctaBannerPadding} />
          </VariantCell>
          <VariantCell label="Right align">
            <CTABanner heading="Ready to get started?" description="Join our upcoming ACT training." buttonText="Book now" buttonLink="#" backgroundColor={ctaBannerBg} alignment="right" width={ctaBannerWidth} padding={ctaBannerPadding} />
          </VariantCell>
          <VariantCell label="No description">
            <CTABanner heading="Ready to get started?" description="" buttonText="Book now" buttonLink="#" backgroundColor={ctaBannerBg} alignment="center" width={ctaBannerWidth} padding={ctaBannerPadding} />
          </VariantCell>
        </div>
      </Section>

      <Section title="Testimonial">
        <p className="text-sm text-stone-600 mb-6">Quote blocks with author + avatar. Three display modes × three styles. Stacked full-width to match production layout.</p>

        <div className="space-y-16">
          <VariantCell label="Single — card style">
            <Testimonial items={[sampleTestimonials[0]]} style="card" displayMode="single" showQuoteIcon />
          </VariantCell>
          <VariantCell label="Single — minimal style">
            <Testimonial items={[sampleTestimonials[0]]} style="minimal" displayMode="single" showQuoteIcon />
          </VariantCell>
          <VariantCell label="Single — featured style">
            <Testimonial items={[sampleTestimonials[0]]} style="featured" displayMode="single" showQuoteIcon />
          </VariantCell>
          <VariantCell label="Single — no quote icon">
            <Testimonial items={[sampleTestimonials[0]]} style="card" displayMode="single" showQuoteIcon={false} />
          </VariantCell>
          <VariantCell label="Grid — 3 items">
            <Testimonial items={sampleTestimonials} style="card" displayMode="grid" showQuoteIcon />
          </VariantCell>
          <VariantCell label="Carousel — infinite marquee">
            <div className="overflow-hidden">
              <Testimonial items={sampleTestimonials} style="card" displayMode="carousel" showQuoteIcon autoPlaySpeed={30} />
            </div>
          </VariantCell>
        </div>
      </Section>

      <Section title="FeatureGrid">
        <p className="text-sm text-stone-600 mb-6">Icon feature grid. Styles: cards, minimal. Icon sizes: small/medium/large. Stacked full-width to match production 3-col layout.</p>
        <CardColorPicker value={featureGridColor} onChange={setFeatureGridColor} />

        <div className="space-y-16">
          <VariantCell label="Cards style — 3 items, medium icons">
            <FeatureGrid heading="" subheading="" columns={3} items={sampleFeatureItems} style="cards" iconSize="medium" padding="medium" cardColor={featureGridColor} />
          </VariantCell>
          <VariantCell label="Cards style — small icons">
            <FeatureGrid heading="" subheading="" columns={3} items={sampleFeatureItems} style="cards" iconSize="small" padding="medium" cardColor={featureGridColor} />
          </VariantCell>
          <VariantCell label="Cards style — large icons">
            <FeatureGrid heading="" subheading="" columns={3} items={sampleFeatureItems} style="cards" iconSize="large" padding="medium" cardColor={featureGridColor} />
          </VariantCell>
          <VariantCell label="Minimal style">
            <FeatureGrid heading="" subheading="" columns={3} items={sampleFeatureItems} style="minimal" iconSize="medium" padding="medium" cardColor={featureGridColor} />
          </VariantCell>
          <VariantCell label="2 columns">
            <FeatureGrid heading="" subheading="" columns={2} items={sampleFeatureItems.slice(0, 2)} style="cards" iconSize="medium" padding="medium" cardColor={featureGridColor} />
          </VariantCell>
        </div>
      </Section>

      <Section title="PersonCard">
        <p className="text-sm text-stone-600 mb-6">Author / person card with avatar, title, bio, contact info. Styles: card, horizontal.</p>

        <VariantGrid>
          <VariantCell label="Card — with bio">
            <PersonCard name="Fredrik Livheim" title="Legitimerad psykolog" bio="Fredrik har utvecklat gruppformatet av ACT och forskat inom området i över 15 år." image={sampleImage1} email="" phone="" style="card" imageSize="medium" />
          </VariantCell>
          <VariantCell label="Card — with contact info">
            <PersonCard name="Fredrik Livheim" title="Legitimerad psykolog" bio="Fredrik har utvecklat gruppformatet av ACT och forskat inom området." image={sampleImage1} email="fredrik@livskompass.se" phone="+46 70 123 45 67" style="card" imageSize="medium" />
          </VariantCell>
          <VariantCell label="Card — no bio">
            <PersonCard name="Fredrik Livheim" title="Legitimerad psykolog" bio="" image={sampleImage1} email="" phone="" style="card" imageSize="medium" />
          </VariantCell>
          <VariantCell label="Card — small image">
            <PersonCard name="Fredrik Livheim" title="Legitimerad psykolog" bio="Fredrik har utvecklat gruppformatet av ACT och forskat inom området." image={sampleImage1} email="" phone="" style="card" imageSize="small" />
          </VariantCell>
          <VariantCell label="Horizontal — with bio">
            <PersonCard name="Fredrik Livheim" title="Legitimerad psykolog" bio="Fredrik har utvecklat gruppformatet av ACT och forskat inom området i över 15 år." image={sampleImage1} email="" phone="" style="horizontal" imageSize="small" />
          </VariantCell>
          <VariantCell label="Horizontal — with contact">
            <PersonCard name="Fredrik Livheim" title="Legitimerad psykolog" bio="Fredrik har utvecklat gruppformatet av ACT." image={sampleImage1} email="fredrik@livskompass.se" phone="+46 70 123 45 67" style="horizontal" imageSize="small" />
          </VariantCell>
        </VariantGrid>
      </Section>

      <Section title="PricingTable">
        <p className="text-sm text-stone-600 mb-6">Pricing tiers with features, CTA, and optional highlighted tier. Stacked full-width to match production layout.</p>

        <div className="space-y-16">
          <VariantCell label="3 tiers — middle highlighted">
            <PricingTable heading="" items={samplePricingTiers} columns={3} highlightLabel="Most popular" emptyText="" showCurrency />
          </VariantCell>
          <VariantCell label="2 tiers — one highlighted">
            <PricingTable heading="" items={samplePricingTiers.slice(0, 2)} columns={2} highlightLabel="Recommended" emptyText="" showCurrency />
          </VariantCell>
          <VariantCell label="Single tier — no highlight">
            <PricingTable heading="" items={[{ ...samplePricingTiers[0], highlighted: false }]} columns={2} highlightLabel="" emptyText="" showCurrency />
          </VariantCell>
          <VariantCell label="Single tier — highlighted">
            <PricingTable heading="" items={[{ ...samplePricingTiers[1], highlighted: true }]} columns={2} highlightLabel="Recommended" emptyText="" showCurrency />
          </VariantCell>
          <VariantCell label="No currency">
            <PricingTable heading="" items={samplePricingTiers.slice(0, 2)} columns={2} highlightLabel="Recommended" emptyText="" showCurrency={false} />
          </VariantCell>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <div className="flex gap-3 flex-wrap">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      {/* Form Elements */}
      <Section title="Form Elements">
        <div className="max-w-md space-y-6">
          <div>
            <Label htmlFor="ds-name">Name</Label>
            <Input id="ds-name" placeholder="Enter your name" />
          </div>
          <div>
            <Label htmlFor="ds-email">Email</Label>
            <Input id="ds-email" type="email" placeholder="name@example.com" />
          </div>
          <div>
            <Label htmlFor="ds-message">Message</Label>
            <Textarea id="ds-message" placeholder="Write your message..." />
          </div>
          <div>
            <Label htmlFor="ds-disabled">Disabled input</Label>
            <Input id="ds-disabled" placeholder="Cannot edit" disabled />
          </div>
        </div>
      </Section>

      {/* Separator */}
      <Section title="Separator">
        <div className="max-w-md space-y-4">
          <p className="text-sm text-stone-600">Content above separator</p>
          <Separator />
          <p className="text-sm text-stone-600">Content below separator</p>
        </div>
      </Section>

      {/* Skeleton / Loading */}
      <Section title="Skeleton / Loading">
        <div className="max-w-md space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-[12px]" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24 rounded-[16px]" />
            <Skeleton className="h-10 w-24 rounded-[16px]" />
          </div>
        </div>
      </Section>

      {/* === PRIMITIVE === */}
      <Section title="Price (primitive)">
        <p className="text-sm text-stone-600 mb-6">Unified price display. Used in CourseList, ProductList, BookingCTA. Three sizes; colour configurable.</p>
        <div className="flex items-baseline gap-8 flex-wrap">
          <div className="flex flex-col items-start gap-1">
            <Price value={2500} size="sm" />
            <span className="text-xs text-faint font-mono">size="sm"</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Price value={2500} size="md" />
            <span className="text-xs text-faint font-mono">size="md" (default)</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Price value={16500} size="lg" />
            <span className="text-xs text-faint font-mono">size="lg"</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Price value={4500} size="md" colorClass="text-foreground" />
            <span className="text-xs text-faint font-mono">colorClass="text-foreground"</span>
          </div>
        </div>
      </Section>

      {/* === LAYOUT BLOCKS === */}
      <Section title="Hero">
        <p className="text-sm text-stone-600 mb-6">Top-of-page hero. Six presets (centered / split-left / split-right / full-image / minimal / fullscreen) × three bg styles (gradient / forest / stone).</p>
        <div className="space-y-12">
          <VariantCell label="Centered — gradient, dual CTA">
            <Hero preset="centered" heading="Tillsammans tränar vi medveten närvaro" subheading="ACT-baserade gruppledarutbildningar för terapeuter och yrkesverksamma." bgStyle="gradient" ctaPrimaryText="Boka utbildning" ctaPrimaryLink="#" ctaSecondaryText="Läs mer" ctaSecondaryLink="#" image="" backgroundImage="" backgroundVideo="" overlayDarkness="dark-2" contentPosition="center" showScrollIndicator={false} textAlignment="center" showHeading showSubheading />
          </VariantCell>
          <VariantCell label="Full image — single CTA, dark overlay">
            <Hero preset="full-image" heading="Forskningsbaserade verktyg" subheading="Praktisk tillämpning av ACT i ditt dagliga arbete." bgStyle="forest" ctaPrimaryText="Kom igång" ctaPrimaryLink="#" ctaSecondaryText="" ctaSecondaryLink="" image="" backgroundImage={sampleImage1} backgroundVideo="" overlayDarkness="dark-3" contentPosition="center" showScrollIndicator={false} textAlignment="center" showHeading showSubheading />
          </VariantCell>
        </div>
      </Section>

      <Section title="PageHeader">
        <p className="text-sm text-stone-600 mb-6">Page intro: heading + subheading + breadcrumbs. Two sizes, two alignments, optional divider.</p>
        <div className="space-y-8">
          <VariantCell label="Large, center, with divider">
            <PageHeader heading="Utbildningar" subheading="Gruppledarutbildningar och fördjupningskurser inom ACT." alignment="center" size="large" showDivider breadcrumbs={[{ label: 'ACT', href: '#' }]} breadcrumbHomeText="Hem" />
          </VariantCell>
          <VariantCell label="Small, left, light bg">
            <PageHeader heading="Material" subheading="Böcker, kort och digitala verktyg." alignment="left" size="small" showDivider={false} breadcrumbs={[]} breadcrumbHomeText="Hem" backgroundColor="light" />
          </VariantCell>
        </div>
      </Section>

      <Section title="PostHeader (data-bound)">
        <p className="text-sm text-stone-600 mb-6">Renders inside a post page. Pulls title/date/image from the surrounding post; here the data context is empty so only the back link renders.</p>
        <PostHeader showBackLink backLinkText="Tillbaka till nyheter" backLinkUrl="#" />
      </Section>

      <Section title="CourseInfo (data-bound)">
        <p className="text-sm text-stone-600 mb-6">Inline meta strip on course pages: location, dates, price, spots. Two layouts.</p>
        <div className="space-y-6">
          <VariantCell label="Grid layout (data placeholder)">
            <CourseInfo showDeadline showEmpty layout="grid" locationLabel="Plats" dateLabel="Datum" priceLabel="Pris" spotsLabel="Platser" deadlineLabel="Anmälan senast" fullLabel="Fullbokad" spotsOfText="av" spotsRemainingText="platser kvar" />
          </VariantCell>
          <VariantCell label="Stacked layout (data placeholder)">
            <CourseInfo showDeadline showEmpty layout="stacked" locationLabel="Plats" dateLabel="Datum" priceLabel="Pris" spotsLabel="Platser" deadlineLabel="Anmälan senast" fullLabel="Fullbokad" spotsOfText="av" spotsRemainingText="platser kvar" />
          </VariantCell>
        </div>
      </Section>

      <Section title="BookingCTA (data-bound)">
        <p className="text-sm text-stone-600 mb-6">Booking call-to-action on a course page. Two styles. Renders empty without a course context — sample shown for layout reference.</p>
        <div className="space-y-6">
          <VariantCell label="Card style">
            <BookingCTA style="card" buttonText="Boka plats" heading="Säkra din plats" description="Anmälan är bindande. Du får bekräftelse via e-post." completedMessage="Utbildningen är genomförd." fullMessage="Fullbokad" fullSubMessage="Anmäl intresse för nästa tillfälle." />
          </VariantCell>
          <VariantCell label="Inline style">
            <BookingCTA style="inline" buttonText="Boka plats" heading="" description="" completedMessage="" fullMessage="Fullbokad" fullSubMessage="" />
          </VariantCell>
        </div>
      </Section>

      <Section title="ContactForm">
        <p className="text-sm text-stone-600 mb-6">POSTs to /api/contact. Two layouts (full / split with contact card).</p>
        <div className="max-w-2xl">
          <ContactForm heading="Kontakta oss" description="Vi svarar inom två arbetsdagar." showPhone showSubject layout="full" contactName="" contactTitle="" contactEmail="" contactPhone="" submitButtonText="Skicka meddelande" submittingText="Skickar..." successHeading="Tack!" successMessage="Vi återkommer så snart vi kan." nameLabel="Namn" emailLabel="E-post" phoneLabel="Telefon" subjectLabel="Ämne" messageLabel="Meddelande" />
        </div>
      </Section>

      <Section title="BookingForm">
        <p className="text-sm text-stone-600 mb-6">Booking initiation form — name, email, participants, optional org/notes. Triggers Stripe Checkout when a course context is present.</p>
        <div className="max-w-2xl">
          <BookingForm showOrganization showNotes submitButtonText="Gå till betalning" processingText="Förbereder betalning..." fullMessage="Fullbokad" completedMessage="Utbildningen är genomförd" totalLabel="Totalt" nameLabel="Namn" emailLabel="E-post" phoneLabel="Telefon" organizationLabel="Organisation" participantsLabel="Antal deltagare" notesLabel="Övriga önskemål" priceSuffix="kr" />
          <p className="text-xs text-faint mt-3">Form renders empty without a course data context.</p>
        </div>
      </Section>

      <Section title="Accordion">
        <p className="text-sm text-stone-600 mb-6">Expand/collapse FAQ-style content. Three styles.</p>
        <div className="space-y-8">
          <VariantCell label="Default — first open">
            <Accordion heading="Vanliga frågor" defaultOpen="first" style="default" iconPosition="right" items={[
              { question: 'Vem är utbildningen för?', answer: 'Psykologer, terapeuter och yrkesverksamma som vill arbeta evidensbaserat med ACT.' },
              { question: 'Hur lång är utbildningen?', answer: 'Tre dagar, fördelade över sex veckor.' },
              { question: 'Får jag certifikat?', answer: 'Ja, alla deltagare får certifikat efter genomförd utbildning.' },
            ]} />
          </VariantCell>
          <VariantCell label="Bordered — none open">
            <Accordion heading="" defaultOpen="none" style="bordered" iconPosition="right" items={[
              { question: 'Hur bokar jag?', answer: 'Klicka på "Boka" på utbildningens sida.' },
              { question: 'Kan jag avboka?', answer: 'Avbokning fram till 14 dagar före kursstart.' },
            ]} />
          </VariantCell>
          <VariantCell label="Minimal — all open, icon left">
            <Accordion heading="" defaultOpen="all" style="minimal" iconPosition="left" items={[
              { question: 'Pris', answer: '4 500 kr inkl. material.' },
              { question: 'Plats', answer: 'Online + två fysiska träffar i Stockholm.' },
            ]} />
          </VariantCell>
        </div>
      </Section>

      <Section title="RichText">
        <p className="text-sm text-stone-600 mb-6">Tiptap-rendered prose block. Three widths × three font sizes × three alignments.</p>
        <div className="space-y-6">
          <VariantCell label="Narrow, normal">
            <RichText content="<p>Övningar, appar och material för att träna medveten närvaro i vardagen. <strong>En central del av ACT</strong> handlar om att skapa utrymme för det som är svårt — utan att fly från det.</p>" maxWidth="narrow" alignment="left" fontSize="normal" />
          </VariantCell>
          <VariantCell label="Medium, large, center">
            <RichText content="<p>Acceptance and Commitment Therapy bygger på sex kärnprocesser. Tillsammans skapar de psykologisk flexibilitet.</p>" maxWidth="medium" alignment="center" fontSize="large" />
          </VariantCell>
        </div>
      </Section>

      <Section title="ImageBlock">
        <p className="text-sm text-stone-600 mb-6">Single image with caption. Sizes, alignment, rounding, shadow, optional border + link.</p>
        <div className="space-y-8">
          <VariantCell label="Medium, center, large rounded, shadow">
            <ImageBlock src={sampleImage1} alt="Sample" caption="Övningar och material för att träna medveten närvaro." size="medium" alignment="center" rounded="large" link="" shadow="large" border="none" />
          </VariantCell>
          <VariantCell label="Small, left, no rounding, with border">
            <ImageBlock src={sampleImage2} alt="Sample" caption="" size="small" alignment="left" rounded="none" link="" shadow="none" border="thin" />
          </VariantCell>
        </div>
      </Section>

      <Section title="ImageGallery">
        <p className="text-sm text-stone-600 mb-6">Grid of images. 2/3/4 columns, three gaps, four aspect ratios, optional lightbox.</p>
        <div className="space-y-8">
          <VariantCell label="3 cols, square, medium gap">
            <ImageGallery columns={3} gap="medium" aspectRatio="square" rounded="medium" lightbox={false} images={[
              { src: sampleImage1, alt: '', caption: '' },
              { src: sampleImage2, alt: '', caption: '' },
              { src: sampleImage3, alt: '', caption: '' },
            ]} />
          </VariantCell>
          <VariantCell label="2 cols, landscape, large gap">
            <ImageGallery columns={2} gap="large" aspectRatio="landscape" rounded="large" lightbox={false} images={[
              { src: sampleImage1, alt: '', caption: 'Workshop i Stockholm' },
              { src: sampleImage2, alt: '', caption: 'Online-träff' },
            ]} />
          </VariantCell>
        </div>
      </Section>

      <Section title="StatsCounter">
        <p className="text-sm text-stone-600 mb-6">Number-driven stat tiles. Two styles, 2/3/4 columns, optional count-up animation.</p>
        <div className="space-y-8">
          <VariantCell label="3 cols, default style">
            <StatsCounter columns={3} style="default" animation="none" items={[
              { value: '15', label: 'Års forskning', prefix: '', suffix: '+' },
              { value: '2400', label: 'Utbildade ledare', prefix: '', suffix: '' },
              { value: '92', label: 'Rekommenderar oss', prefix: '', suffix: '%' },
            ]} />
          </VariantCell>
          <VariantCell label="2 cols, bordered">
            <StatsCounter columns={2} style="bordered" animation="none" items={[
              { value: '500', label: 'Deltagare per år', prefix: '', suffix: '' },
              { value: '4.8', label: 'Snittbetyg', prefix: '', suffix: '/5' },
            ]} />
          </VariantCell>
        </div>
      </Section>

      <Section title="NavigationMenu">
        <p className="text-sm text-stone-600 mb-6">Inline nav as a content block. Four styles × two layouts × three alignments.</p>
        <div className="space-y-8">
          {(['pills', 'underline', 'buttons', 'minimal'] as const).map(style => (
            <VariantCell key={style} label={`${style} — horizontal, center`}>
              <NavigationMenu layout="horizontal" style={style} alignment="center" items={[
                { label: 'ACT', link: '#' },
                { label: 'Mindfulness', link: '#' },
                { label: 'Forskning', link: '#' },
                { label: 'Kontakt', link: '#' },
              ]} />
            </VariantCell>
          ))}
        </div>
      </Section>

      <Section title="ButtonGroup">
        <p className="text-sm text-stone-600 mb-6">Cluster of buttons. Three sizes × two directions × three alignments.</p>
        <div className="space-y-8">
          <VariantCell label="Horizontal, medium, center">
            <ButtonGroup direction="horizontal" alignment="center" size="medium" buttons={[
              { text: 'Boka utbildning', link: '#', variant: 'primary' },
              { text: 'Läs mer', link: '#', variant: 'outline' },
            ]} />
          </VariantCell>
          <VariantCell label="Vertical, large, left">
            <ButtonGroup direction="vertical" alignment="left" size="large" buttons={[
              { text: 'Kom igång', link: '#', variant: 'primary' },
              { text: 'Boka demo', link: '#', variant: 'secondary' },
              { text: 'Kontakta oss', link: '#', variant: 'outline' },
            ]} />
          </VariantCell>
        </div>
      </Section>

      <Section title="Columns">
        <p className="text-sm text-stone-600 mb-6">Multi-column layout for nesting blocks. Four ratios (50-50, 33-33-33, 66-33, 33-66) × three gaps × three vertical alignments.</p>
        <div className="rounded-[12px] border border-dashed border-default p-4">
          <Columns layout="50-50" gap="medium" verticalAlignment="top" stackOnMobile />
          <p className="text-xs text-faint mt-2">Columns block accepts nested zones in production — empty in this preview.</p>
        </div>
      </Section>

      <Section title="SeparatorBlock">
        <p className="text-sm text-stone-600 mb-6">Block-level horizontal divider. Four variants × three line weights × three widths. Different from the shadcn <code className="text-xs font-mono">Separator</code> primitive — this one is a placeable block.</p>
        <div className="space-y-8">
          <VariantCell label="Line — medium, full">
            <SeparatorBlock variant="line" spacing="medium" lineColor="medium" maxWidth="full" />
          </VariantCell>
          <VariantCell label="Dots — light, narrow">
            <SeparatorBlock variant="dots" spacing="medium" lineColor="light" maxWidth="narrow" />
          </VariantCell>
          <VariantCell label="Gradient — medium width">
            <SeparatorBlock variant="gradient" spacing="medium" lineColor="dark" maxWidth="medium" />
          </VariantCell>
          <VariantCell label="Space-only">
            <div className="bg-amber-100 rounded">
              <SeparatorBlock variant="space-only" spacing="large" lineColor="light" maxWidth="full" />
            </div>
          </VariantCell>
        </div>
      </Section>

      <Section title="Spacer">
        <p className="text-sm text-stone-600 mb-6">Vertical whitespace block. Five sizes.</p>
        <div className="space-y-2">
          {(['xs', 'small', 'medium', 'large', 'xl'] as const).map(size => (
            <div key={size} className="flex items-center gap-4">
              <code className="text-xs font-mono w-20">size="{size}"</code>
              <div className="flex-1 bg-amber-100 rounded">
                <Spacer size={size} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="VideoEmbed">
        <p className="text-sm text-stone-600 mb-6">YouTube/Vimeo iframe with caption. Three aspect ratios.</p>
        <div className="max-w-2xl">
          <VideoEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" aspectRatio="16:9" caption="Introduktion till ACT." />
        </div>
      </Section>

      <Section title="AudioEmbed">
        <p className="text-sm text-stone-600 mb-6">Audio player. Two styles.</p>
        <div className="max-w-2xl space-y-6">
          <VariantCell label="Card style">
            <AudioEmbed url="" caption="Guidad mindfulness-övning, 10 min" style="card" />
          </VariantCell>
          <VariantCell label="Minimal style">
            <AudioEmbed url="" caption="Andningsövning, 5 min" style="minimal" />
          </VariantCell>
        </div>
      </Section>

      <Section title="FileEmbed">
        <p className="text-sm text-stone-600 mb-6">Downloadable file with name, optional preview.</p>
        <div className="max-w-2xl">
          <FileEmbed url="#" fileName="ACT-arbetsbok.pdf" caption="Övningsbok som komplement till utbildningen." showPreview={false} />
        </div>
      </Section>

      <Section title="EmbedBlock">
        <p className="text-sm text-stone-600 mb-6">Generic iframe / raw HTML embed for third-party widgets. Aspect-ratio aware.</p>
        <div className="max-w-2xl">
          <EmbedBlock url="" html='<div style="padding:24px;text-align:center;color:#6E685E;font-size:14px;">EmbedBlock — pass <code>url</code> for an iframe, or <code>html</code> for inline HTML.</div>' caption="Empty preview" aspectRatio="auto" />
        </div>
      </Section>
    </>
  )
}

function SubSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h3 className="text-h4 mb-1">{title}</h3>
      {hint && <p className="text-secondary text-body-sm mb-4">{hint}</p>}
      {!hint && <div className="mb-4" />}
      {children}
    </div>
  )
}

function TokenChip({ name, value }: { name: string; value?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">{name}</code>
      {value && <span className="text-xs text-stone-400 font-mono">{value}</span>}
    </div>
  )
}

const semanticTextRoles: Array<{ var: string; cls: string; label: string }> = [
  { var: '--foreground', cls: 'text-foreground', label: 'Foreground — body copy' },
  { var: '--foreground-strong', cls: 'text-foreground-strong', label: 'Foreground strong — bold body' },
  { var: '--secondary', cls: 'text-secondary', label: 'Secondary — supporting copy' },
  { var: '--muted', cls: 'text-muted', label: 'Muted — captions, metadata' },
  { var: '--faint', cls: 'text-faint', label: 'Faint — placeholder, disabled' },
  { var: '--brand', cls: 'text-brand', label: 'Brand — section headings' },
  { var: '--brand-hover', cls: '', label: 'Brand hover — interaction state' },
  { var: '--accent', cls: 'text-accent', label: 'Accent — links, primary actions' },
  { var: '--accent-hover', cls: '', label: 'Accent hover — interaction state' },
  { var: '--highlight', cls: 'text-highlight', label: 'Highlight — emphasis' },
  { var: '--highlight-soft', cls: '', label: 'Highlight soft — soft emphasis' },
]

const statusColors: Array<{ name: string; fg: string; bg: string }> = [
  { name: 'Success', fg: 'var(--color-success-fg)', bg: 'var(--color-success-bg)' },
  { name: 'Warning', fg: 'var(--color-warning-fg)', bg: 'var(--color-warning-bg)' },
  { name: 'Error',   fg: 'var(--color-error-fg)',   bg: 'var(--color-error-bg)' },
  { name: 'Info',    fg: 'var(--color-info-fg)',    bg: 'var(--color-info-bg)' },
]

const sectionPaddings = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const gapSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
const widthTokens = [
  { name: '--width-content', value: '1280px', desc: 'Default container max-width' },
  { name: '--width-wide',    value: '1440px', desc: 'Hero / wide layouts' },
  { name: '--width-narrow',  value: '720px',  desc: 'Narrow content (forms, focused reading)' },
  { name: '--width-prose',   value: '65ch',   desc: 'Optimal reading width' },
]
const motionDurations = [
  { name: '--duration-instant',   value: '100ms' },
  { name: '--duration-fast',      value: '200ms' },
  { name: '--duration-normal',    value: '350ms' },
  { name: '--duration-slow',      value: '500ms' },
  { name: '--duration-reveal',    value: '700ms' },
  { name: '--duration-dramatic', value: '1000ms' },
]
const motionEasings = [
  { name: '--ease-out',     value: 'cubic-bezier(0.16, 1, 0.3, 1)',    desc: 'Default — decisive entry' },
  { name: '--ease-in-out',  value: 'cubic-bezier(0.45, 0, 0.55, 1)',   desc: 'Symmetric — toggle, swap' },
  { name: '--ease-gentle',  value: 'cubic-bezier(0.4, 0, 0.2, 1)',     desc: 'Material-style — micro-interactions' },
]
const namedGradients = [
  { name: '--gradient-hero',             desc: 'Mist hero background',           style: { background: 'var(--gradient-hero)' } },
  { name: '--gradient-section',          desc: 'Soft stone-50 → stone-100',      style: { background: 'var(--gradient-section)' } },
  { name: '--gradient-glow',             desc: 'Forest radial glow on dark',     style: { background: '#0A1F1A', backgroundImage: 'var(--gradient-glow)' } },
  { name: '--gradient-testimonial-glow', desc: 'Testimonial highlight glow',     style: { background: '#0A1F1A', backgroundImage: 'var(--gradient-testimonial-glow)' } },
  { name: '--gradient-pricing-glow',     desc: 'Pricing card amber corner glow', style: { background: '#0A1F1A', backgroundImage: 'var(--gradient-pricing-glow)' } },
  { name: '--gradient-shimmer',          desc: 'Subtle diagonal shimmer overlay', style: { background: '#0A1F1A', backgroundImage: 'var(--gradient-shimmer)' } },
]

function FoundationsTab() {
  return (
    <>
      {/* === BRAND === */}
      <Section title="Brand">
        <p className="text-secondary mb-6">Two typefaces. Rubik for display & H1/H2 (brand voice). Inter for H3/H4 + body (legibility). Section headings adopt brand-green on light surfaces, white on dark sections via <code className="text-xs font-mono">--heading-color</code>.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-[16px] border border-default bg-surface-elevated">
            <div className="text-overline text-secondary mb-3">Display — Rubik</div>
            <div style={{ fontFamily: "'Rubik', system-ui, sans-serif", fontSize: 64, lineHeight: 1.05, letterSpacing: '-0.025em' }}>Aa</div>
            <div className="mt-4 text-body-sm text-secondary">Used for h1, h2, hero displays. Weight 400.</div>
            <code className="text-xs font-mono text-stone-500 mt-2 block">--font-display</code>
          </div>
          <div className="p-8 rounded-[16px] border border-default bg-surface-elevated">
            <div className="text-overline text-secondary mb-3">Body — Inter</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 64, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 600 }}>Aa</div>
            <div className="mt-4 text-body-sm text-secondary">Used for h3, h4, body, captions. Weight 400 / 600 (headings).</div>
            <code className="text-xs font-mono text-stone-500 mt-2 block">--font-body</code>
          </div>
        </div>
      </Section>

      {/* === LOGO === */}
      <Section title="Logo">
        <div className="space-y-10">
          <div>
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">Wordmark</h3>
            <div className="flex gap-8 items-end flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <div className="p-6 rounded-[16px] border border-black/5 bg-white">
                  <img src="/logo-wordmark.svg" alt="FL wordmark" className="h-10" />
                </div>
                <span className="text-xs text-stone-500">Horizontal</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-6 rounded-[16px] border border-black/5 bg-white">
                  <img src="/logo-wordmark-vertical.svg" alt="FL wordmark vertical" className="h-24" />
                </div>
                <span className="text-xs text-stone-500">Vertical</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">With circle mark</h3>
            <div className="flex gap-8 items-end flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <div className="p-6 rounded-[16px] border border-black/5 bg-white">
                  <img src="/logo-circle-wordmark.svg" alt="FL circle wordmark" className="h-28" />
                </div>
                <span className="text-xs text-stone-500">Circle + wordmark</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-6 rounded-[16px] border border-black/5 bg-white">
                  <img src="/logo-circle-wordmark-compact.svg" alt="FL circle wordmark compact" className="h-16" />
                </div>
                <span className="text-xs text-stone-500">Compact</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">Full lockup</h3>
            <div className="flex gap-8 items-end flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <div className="p-6 rounded-[16px] border border-black/5 bg-white">
                  <img src="/logo-full.svg" alt="FL full" className="h-24" />
                </div>
                <span className="text-xs text-stone-500">Full</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-6 rounded-[16px] border border-black/5 bg-white">
                  <img src="/logo-full-wide.svg" alt="FL full wide" className="h-24" />
                </div>
                <span className="text-xs text-stone-500">Full wide</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">On dark background</h3>
            <div className="flex gap-8 items-end flex-wrap">
              <div className="flex flex-col items-center gap-2">
                <div className="p-6 rounded-[16px] bg-forest-800">
                  <img src="/logo-wordmark.svg" alt="FL wordmark on dark" className="h-10 invert brightness-200" />
                </div>
                <span className="text-xs text-stone-500">Inverted</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-6 rounded-[16px]" style={{ background: '#C7DDDC' }}>
                  <img src="/logo-wordmark.svg" alt="FL wordmark on mist" className="h-10" />
                </div>
                <span className="text-xs text-stone-500">On mist</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* === COLOR PALETTES === */}
      <Section title="Color palettes">
        <p className="text-secondary mb-6">Three ramps. Forest = brand green (primary), Stone = neutrals, Amber = accent. Stored as space-separated RGB triplets so utilities can compose with alpha (<code className="text-xs font-mono">rgb(var(--forest-800) / 0.4)</code>).</p>
        {Object.entries(colors).map(([group, swatches]) => (
          <div key={group} className="mb-10">
            <h3 className="text-h4 mb-3">{group}</h3>
            <div className="flex gap-2 flex-wrap">
              {swatches.map((s) => (
                <div key={s.name} className="flex flex-col items-center gap-1">
                  <div className={`${s.class} w-16 h-16 rounded-[12px] border border-black/5`} title={s.var} />
                  <span className="text-xs text-secondary">{s.name}</span>
                  {s.label && <span className="text-[10px] text-faint font-mono">{s.label}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* === SEMANTIC ROLES === */}
      <Section title="Semantic colors">
        <p className="text-secondary mb-6">Role-based aliases that point at palette tokens. Use these in components — never reference raw palette tokens directly. Swap the alias and the whole site re-themes.</p>
        <SubSection title="Text roles" hint="Mapped to stone/forest/amber ramps. Section headings inherit --heading-color (brand on light, white on dark sections).">
          <div className="space-y-2">
            {semanticTextRoles.map((r) => (
              <div key={r.var} className="flex items-baseline gap-4 flex-wrap">
                <span className="text-body font-semibold" style={{ color: `rgb(var(${r.var}))` }}>{r.label}</span>
                <code className="text-xs font-mono text-stone-500">{r.var}</code>
                {r.cls && <code className="text-xs font-mono text-stone-400">{r.cls}</code>}
              </div>
            ))}
          </div>
        </SubSection>
        <SubSection title="Surface roles" hint="Backgrounds for sections, cards, overlays, glass.">
          <div className="flex gap-4 flex-wrap">
            {surfaces.map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-2">
                <div className="w-32 h-20 rounded-[12px] border border-default" style={s.style} />
                <span className="text-xs text-secondary">{s.name}</span>
                <span className="text-[10px] text-faint font-mono">{s.var}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-20 rounded-[12px]" style={{ background: 'var(--surface-overlay)' }} />
              <span className="text-xs text-secondary">Overlay</span>
              <span className="text-[10px] text-faint font-mono">--surface-overlay</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-20 rounded-[12px]" style={{ background: 'var(--surface-overlay-heavy)' }} />
              <span className="text-xs text-secondary">Overlay heavy</span>
              <span className="text-[10px] text-faint font-mono">--surface-overlay-heavy</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-20 rounded-[12px]" style={{ background: 'var(--overlay-light)' }} />
              <span className="text-xs text-secondary">Overlay light</span>
              <span className="text-[10px] text-faint font-mono">--overlay-light</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-20 rounded-[12px]" style={{ background: 'var(--overlay-dark)' }} />
              <span className="text-xs text-secondary">Overlay dark</span>
              <span className="text-[10px] text-faint font-mono">--overlay-dark</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-20 rounded-[12px]" style={{ background: 'rgb(var(--mist))' }} />
              <span className="text-xs text-secondary">Mist</span>
              <span className="text-[10px] text-faint font-mono">--mist</span>
            </div>
          </div>
        </SubSection>
        <SubSection title="Border roles">
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-20 rounded-[12px] bg-surface-elevated" style={{ border: '1px solid rgb(var(--border-default))' }} />
              <code className="text-xs font-mono text-stone-500">--border-default</code>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-20 rounded-[12px] bg-surface-elevated" style={{ border: '1px solid rgb(var(--border-strong))' }} />
              <code className="text-xs font-mono text-stone-500">--border-strong</code>
            </div>
          </div>
        </SubSection>
      </Section>

      {/* === BRAND COLOR SWATCHES (used by every card block) === */}
      <Section title="Card surface colors">
        <p className="text-secondary mb-6">Four brand-sanctioned card backgrounds. Used by every card-style block (CardGrid, CourseList, ProductList, PostGrid, PageCards, FeatureGrid). Pickable per-block in the editor.</p>
        <div className="flex gap-6 flex-wrap">
          {[
            { name: 'White',  cls: 'bg-white border border-default' },
            { name: 'Yellow', cls: 'bg-amber-300' },
            { name: 'Mist',   cls: 'bg-mist' },
            { name: 'Dark',   cls: 'bg-forest-800' },
          ].map(c => (
            <div key={c.name} className="flex flex-col items-center gap-2">
              <div className={cn('w-32 h-20 rounded-[12px]', c.cls)} />
              <span className="text-xs text-secondary">{c.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* === STATUS COLORS === */}
      <Section title="Status colors">
        <p className="text-secondary mb-6">Feedback states with paired fg/bg for accessible contrast. Use in alerts, toasts, inline form messages.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {statusColors.map((s) => (
            <div key={s.name} className="rounded-[12px] p-4 flex items-center gap-4" style={{ background: s.bg, color: s.fg }}>
              <div className="font-semibold text-body">{s.name}</div>
              <div className="text-body-sm opacity-80">Inline status message example.</div>
              <code className="ml-auto text-xs font-mono opacity-60">--color-{s.name.toLowerCase()}-fg/bg</code>
            </div>
          ))}
        </div>
      </Section>

      {/* === TYPOGRAPHY === */}
      <Section title="Typography">
        <p className="text-secondary mb-6">All headings render via the actual <code className="text-xs font-mono">.text-*</code> utility, so what you see is what production renders. h1/h2/display use Rubik (display); h3/h4 + body use Inter (body).</p>
        <SubSection title="Type scale" hint="Fluid sizes (clamp) — h3 is the canonical card-title and section-heading size.">
          <div className="space-y-6">
            <TypographyRow tailwind="text-display" token="--type-display" sample="Display heading" />
            <TypographyRow tailwind="text-h1" token="--type-h1" sample="Heading 1" />
            <TypographyRow tailwind="text-h2" token="--type-h2" sample="Heading 2" />
            <TypographyRow tailwind="text-h3" token="--type-h3" sample="Heading 3 — section + card title" />
            <TypographyRow tailwind="text-h4" token="--type-h4" sample="Heading 4 — sub-section" />
            <TypographyRow tailwind="text-body-lg" token="--type-body-lg" sample="Body large — Övningar, appar och material för att träna medveten närvaro i vardagen." />
            <TypographyRow tailwind="text-body" token="--type-body" sample="Body — Övningar, appar och material för att träna medveten närvaro i vardagen." />
            <TypographyRow tailwind="text-body-sm" token="--type-body-sm" sample="Body small — Övningar, appar och material." />
            <TypographyRow tailwind="text-caption" token="--type-caption" sample="Caption text — small metadata, dates, labels" />
            <TypographyRow tailwind="text-overline" token="--type-overline" sample="OVERLINE TEXT — eyebrow labels" />
          </div>
        </SubSection>
        <SubSection title="Line height" hint="Headings tighter (1.1–1.3), body roomier (1.6–1.65).">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['display','h1','h2','h3','h4','body','body-sm','caption'].map(k => (
              <TokenChip key={k} name={`--leading-${k}`} value={getComputedToken(`--leading-${k}`)} />
            ))}
          </div>
        </SubSection>
        <SubSection title="Letter spacing" hint="Negative for headings (tightens display), positive for overline (airy uppercase).">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['display','h1','h2','h3','h4','body','overline'].map(k => (
              <TokenChip key={k} name={`--tracking-${k}`} value={getComputedToken(`--tracking-${k}`)} />
            ))}
          </div>
        </SubSection>
      </Section>

      {/* === SPACING === */}
      <Section title="Spacing">
        <SubSection title="Gaps" hint="Use for grids, flex gaps, padding inside components.">
          <div className="space-y-3">
            {gapSizes.map((size) => (
              <div key={size} className="flex items-center gap-4">
                <span className="text-xs text-faint font-mono w-24">--gap-{size}</span>
                <div className="bg-forest-200 rounded" style={{ width: `var(--gap-${size})`, height: 24 }} />
              </div>
            ))}
          </div>
        </SubSection>
        <SubSection title="Section paddings" hint="Vertical block padding (paddingBlock) — fluid clamp values that scale with viewport.">
          <div className="space-y-3">
            {sectionPaddings.map((size) => (
              <div key={size} className="flex items-center gap-4">
                <span className="text-xs text-faint font-mono w-28">--section-{size}</span>
                <div className="bg-amber-300 rounded" style={{ height: `var(--section-${size})`, width: 80 }} />
              </div>
            ))}
          </div>
        </SubSection>
        <SubSection title="Container padding" hint="Horizontal page padding (paddingInline). Fluid: 1rem → 4rem.">
          <TokenChip name="--container-px" value="clamp(1rem, 0.5rem + 2vw, 4rem)" />
        </SubSection>
      </Section>

      {/* === LAYOUT WIDTHS === */}
      <Section title="Layout widths">
        <div className="space-y-3">
          {widthTokens.map(w => (
            <div key={w.name} className="flex items-baseline gap-4 flex-wrap">
              <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 w-44">{w.name}</code>
              <span className="text-body-sm font-mono text-stone-500 w-24">{w.value}</span>
              <span className="text-body-sm text-secondary">{w.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* === RADIUS === */}
      <Section title="Border radius">
        <div className="flex gap-4 flex-wrap">
          {[
            { name: 'xs', size: '4px',  r: 'var(--radius-xs)' },
            { name: 'sm', size: '6px',  r: 'var(--radius-sm)' },
            { name: 'md', size: '12px', r: 'var(--radius-md)' },
            { name: 'lg', size: '16px', r: 'var(--radius-lg)' },
            { name: 'xl', size: '20px', r: 'var(--radius-xl)' },
            { name: '2xl', size: '24px', r: 'var(--radius-2xl)' },
            { name: 'full', size: '9999px', r: 'var(--radius-full)' },
          ].map((item) => (
            <div key={item.name} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 bg-forest-100 border border-forest-200" style={{ borderRadius: item.r }} />
              <span className="text-xs text-secondary">--radius-{item.name}</span>
              <span className="text-[10px] text-faint font-mono">{item.size}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* === SHADOWS === */}
      <Section title="Shadows">
        <SubSection title="Elevation" hint="Forest-tinted shadows so they sit naturally on the warm stone-50 base.">
          <div className="flex gap-6 flex-wrap">
            {['xs', 'sm', 'md', 'lg', 'xl'].map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 bg-white rounded-[12px]" style={{ boxShadow: `var(--shadow-${size})` }} />
                <span className="text-xs text-secondary">--shadow-{size}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 bg-white rounded-[12px]" style={{ boxShadow: 'var(--shadow-glow)' }} />
              <span className="text-xs text-secondary">--shadow-glow</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 bg-white rounded-[12px]" style={{ boxShadow: 'var(--shadow-amber)' }} />
              <span className="text-xs text-secondary">--shadow-amber</span>
            </div>
          </div>
        </SubSection>
        <SubSection title="Button shadows" hint="Tighter, brand-tinted — used by primary button rest + hover states.">
          <div className="flex gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 px-7 rounded-[16px] bg-forest-700 text-white font-semibold flex items-center" style={{ boxShadow: 'var(--shadow-btn-forest)' }}>Rest</div>
              <code className="text-xs font-mono text-stone-500">--shadow-btn-forest</code>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 px-7 rounded-[16px] bg-forest-700 text-white font-semibold flex items-center" style={{ boxShadow: 'var(--shadow-btn-forest-hover)' }}>Hover</div>
              <code className="text-xs font-mono text-stone-500">--shadow-btn-forest-hover</code>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 px-7 rounded-[16px] bg-amber-400 text-stone-900 font-semibold flex items-center" style={{ boxShadow: 'var(--shadow-btn-amber-hover)' }}>Amber hover</div>
              <code className="text-xs font-mono text-stone-500">--shadow-btn-amber-hover</code>
            </div>
          </div>
        </SubSection>
      </Section>

      {/* === MOTION === */}
      <Section title="Motion">
        <SubSection title="Durations" hint="Most UI uses --duration-fast (200ms). Reveals/scroll animations use --duration-reveal+.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {motionDurations.map(d => (
              <div key={d.name} className="flex items-center gap-3">
                <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 w-44">{d.name}</code>
                <span className="text-xs font-mono text-stone-500">{d.value}</span>
              </div>
            ))}
          </div>
        </SubSection>
        <SubSection title="Easings">
          <div className="space-y-3">
            {motionEasings.map(e => (
              <div key={e.name}>
                <div className="flex items-baseline gap-3 flex-wrap mb-1">
                  <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">{e.name}</code>
                  <span className="text-xs text-secondary">{e.desc}</span>
                </div>
                <code className="text-[10px] font-mono text-faint block">{e.value}</code>
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* === GRADIENTS === */}
      <Section title="Gradients">
        <p className="text-secondary mb-6">Five named gradients used across hero, sections, and decorative glow effects.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {namedGradients.map(g => (
            <div key={g.name} className="rounded-[16px] overflow-hidden border border-default">
              <div className="h-32" style={g.style} />
              <div className="p-3 bg-surface-elevated">
                <code className="text-xs font-mono text-stone-700">{g.name}</code>
                <div className="text-xs text-secondary mt-1">{g.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

function getComputedToken(name: string): string {
  if (typeof window === 'undefined') return ''
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || ''
}
