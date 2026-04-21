import { useState } from 'react'
import { Button } from '../components/ui/button'
import { CardGrid, PostGrid, PageCards, CourseList, ProductList, CTABanner, Testimonial, FeatureGrid, PersonCard, PricingTable } from '@livskompass/shared'
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
      <h2 className="font-display text-forest-800 mb-6" style={{ fontSize: 'var(--type-h2)' }}>{title}</h2>
      {children}
    </section>
  )
}

const tabs = ['Foundations', 'Components'] as const
type Tab = typeof tabs[number]

export default function DesignSystem() {
  const [activeTab, setActiveTab] = useState<Tab>('Foundations')

  return (
    <div className="pt-24 pb-20" style={{ maxWidth: 'var(--width-content)', marginInline: 'auto', paddingInline: 'var(--container-px)' }}>
      <h1 className="font-display text-forest-800 mb-4" style={{ fontSize: 'var(--type-display)' }}>Design System</h1>
      <p className="text-forest-600 mb-8" style={{ fontSize: 'var(--type-body-lg)' }}>Livskompass component library and visual guidelines.</p>

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
      {activeTab === 'Components' && <ComponentsTab />}
    </div>
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
              manualPages={[{ title: 'Vad är ACT', description: 'En introduktion till Acceptance and Commitment Therapy.', slug: 'act', icon: '' }]}
              columns={1 as 3} showDescription style="card" emptyText="" emptyManualText="" cardColor={pageCardsColor}
            />
          </VariantCell>
          <VariantCell label="Card — no description">
            <PageCards
              heading="" parentSlug=""
              manualPages={[{ title: 'Vad är ACT', description: '', slug: 'act', icon: '' }]}
              columns={1 as 3} showDescription={false} style="card" emptyText="" emptyManualText="" cardColor={pageCardsColor}
            />
          </VariantCell>
          <VariantCell label="List — with description">
            <PageCards
              heading="" parentSlug=""
              manualPages={[
                { title: 'Vad är ACT', description: 'En introduktion till metoden.', slug: 'act', icon: '' },
                { title: 'Mindfulness', description: 'Övningar och vetenskap bakom mindfulness.', slug: 'mindfulness', icon: '' },
                { title: 'Forskning', description: 'Aktuell forskning på metoden.', slug: 'forskning-pa-metoden', icon: '' },
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
    </>
  )
}

function FoundationsTab() {
  return (
    <>
      {/* Logo */}
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

      {/* Colors */}
      <Section title="Colors">
        {Object.entries(colors).map(([group, swatches]) => (
          <div key={group} className="mb-10">
            <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-3">{group}</h3>
            <div className="flex gap-2 flex-wrap">
              {swatches.map((s) => (
                <div key={s.name} className="flex flex-col items-center gap-1">
                  <div
                    className={`${s.class} w-16 h-16 rounded-[12px] border border-black/5`}
                    title={s.var}
                  />
                  <span className="text-xs text-stone-600">{s.name}</span>
                  {s.label && <span className="text-[10px] text-stone-400 font-mono">{s.label}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* Surfaces */}
      <Section title="Surfaces">
        <div className="flex gap-4 flex-wrap">
          {surfaces.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-2">
              <div
                className="w-32 h-20 rounded-[12px] border border-black/5"
                style={s.style}
              />
              <span className="text-xs text-stone-600">{s.name}</span>
              <span className="text-[10px] text-stone-400 font-mono">{s.var}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-6">
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-display / Outfit</span>
            <p className="font-display text-forest-800" style={{ fontSize: 'var(--type-display)', lineHeight: 'var(--leading-display)' }}>Display Heading</p>
          </div>
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-h1</span>
            <p className="font-display text-forest-800" style={{ fontSize: 'var(--type-h1)', lineHeight: 'var(--leading-h1)' }}>Heading One</p>
          </div>
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-h2</span>
            <p className="font-display text-forest-800" style={{ fontSize: 'var(--type-h2)', lineHeight: 'var(--leading-h2)' }}>Heading Two</p>
          </div>
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-h3</span>
            <p className="font-display text-forest-800" style={{ fontSize: 'var(--type-h3)', lineHeight: 'var(--leading-h3)' }}>Heading Three</p>
          </div>
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-h4</span>
            <p className="font-display text-forest-800" style={{ fontSize: 'var(--type-h4)', lineHeight: 'var(--leading-h4)' }}>Heading Four</p>
          </div>
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-body-lg / Inter</span>
            <p style={{ fontSize: 'var(--type-body-lg)', lineHeight: 'var(--leading-body)' }}>Body large — Övningar, appar och material för att träna medveten närvaro i vardagen. En central del av ACT.</p>
          </div>
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-body</span>
            <p style={{ fontSize: 'var(--type-body)', lineHeight: 'var(--leading-body)' }}>Body — Övningar, appar och material för att träna medveten närvaro i vardagen. En central del av ACT.</p>
          </div>
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-body-sm</span>
            <p style={{ fontSize: 'var(--type-body-sm)', lineHeight: 'var(--leading-body-sm)' }}>Body small — Övningar, appar och material för att träna medveten närvaro i vardagen.</p>
          </div>
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-caption</span>
            <p style={{ fontSize: 'var(--type-caption)', lineHeight: 'var(--leading-caption)' }}>Caption text</p>
          </div>
          <div>
            <span className="text-xs text-stone-400 font-mono block mb-1">--type-overline</span>
            <p className="uppercase tracking-widest font-semibold" style={{ fontSize: 'var(--type-overline)' }}>Overline text</p>
          </div>
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Spacing">
        <div className="space-y-3">
          {['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].map((size) => (
            <div key={size} className="flex items-center gap-4">
              <span className="text-xs text-stone-400 font-mono w-20">--gap-{size}</span>
              <div className="bg-forest-200 rounded" style={{ width: `var(--gap-${size})`, height: 24 }} />
            </div>
          ))}
        </div>
      </Section>

      {/* Radius */}
      <Section title="Border Radius">
        <div className="flex gap-4 flex-wrap">
          {[
            { name: 'xs (4px)', r: 'var(--radius-xs)' },
            { name: 'sm (6px)', r: 'var(--radius-sm)' },
            { name: 'md (10px)', r: 'var(--radius-md)' },
            { name: 'lg (14px)', r: 'var(--radius-lg)' },
            { name: 'xl (20px)', r: 'var(--radius-xl)' },
            { name: '2xl (24px)', r: 'var(--radius-2xl)' },
            { name: 'Button (16px)', r: '16px' },
            { name: 'full', r: 'var(--radius-full)' },
          ].map((item) => (
            <div key={item.name} className="flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 bg-forest-100 border border-forest-200"
                style={{ borderRadius: item.r }}
              />
              <span className="text-xs text-stone-500">{item.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Shadows */}
      <Section title="Shadows">
        <div className="flex gap-6 flex-wrap">
          {['xs', 'sm', 'md', 'lg', 'xl'].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <div
                className="w-24 h-24 bg-white rounded-[12px]"
                style={{ boxShadow: `var(--shadow-${size})` }}
              />
              <span className="text-xs text-stone-500">--shadow-{size}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
