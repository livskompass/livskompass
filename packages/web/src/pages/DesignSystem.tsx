import { useState } from 'react'
import { Button } from '../components/ui/button'
// Card components available: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Separator } from '../components/ui/separator'
import { Skeleton } from '../components/ui/skeleton'

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

      {/* Cards */}
      <Section title="Cards">
        {/* 4 color variants from Figma */}
        <div>
          <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">Color variants (with image)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Yellow card */}
            <div className="rounded-[16px] overflow-hidden bg-amber-300">
              <div className="h-[220px] bg-forest-200" />
              <div className="p-6">
                <h3 className="text-[22px] font-semibold text-forest-800 leading-tight mb-2">Acceptance and commitment therapy exercises</h3>
                <p className="text-sm text-forest-800/70">Läs mer om nästa gruppledarutbildning och anmäl dig</p>
              </div>
            </div>
            {/* Mist card */}
            <div className="rounded-[16px] overflow-hidden" style={{ background: '#C7DDDC' }}>
              <div className="h-[220px] bg-forest-300" />
              <div className="p-6">
                <h3 className="text-[22px] font-semibold text-forest-800 leading-tight mb-2">Acceptance and commitment therapy exercises</h3>
                <p className="text-sm text-forest-800/70">Läs mer om nästa gruppledarutbildning och anmäl dig</p>
              </div>
            </div>
            {/* Dark green card */}
            <div className="rounded-[16px] overflow-hidden bg-forest-800">
              <div className="h-[220px] bg-forest-400" />
              <div className="p-6">
                <h3 className="text-[22px] font-semibold text-amber-300 leading-tight mb-2">Acceptance and commitment therapy exercises</h3>
                <p className="text-sm text-amber-300/70">Läs mer om nästa gruppledarutbildning och anmäl dig</p>
              </div>
            </div>
            {/* Yellow card (rounded image) */}
            <div className="rounded-[16px] overflow-hidden bg-amber-300">
              <div className="p-4 pb-0">
                <div className="h-[200px] bg-forest-200 rounded-[12px]" />
              </div>
              <div className="p-6">
                <h3 className="text-[22px] font-semibold text-forest-800 leading-tight mb-2">Acceptance and commitment therapy exercises</h3>
                <p className="text-sm text-forest-800/70">Läs mer om nästa gruppledarutbildning och anmäl dig</p>
              </div>
            </div>
          </div>
        </div>

        {/* Without image */}
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">Without image</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-[16px] overflow-hidden bg-amber-300 p-6 flex flex-col">
              <h3 className="text-[22px] font-semibold text-forest-800 leading-tight mb-2">Course title here</h3>
              <p className="text-sm text-forest-800/70 mb-6 flex-1">Short description of the content or course.</p>
              <Button variant="default" size="sm" className="w-fit">Läs mer</Button>
            </div>
            <div className="rounded-[16px] overflow-hidden p-6 flex flex-col" style={{ background: '#C7DDDC' }}>
              <h3 className="text-[22px] font-semibold text-forest-800 leading-tight mb-2">Article title here</h3>
              <p className="text-sm text-forest-800/70 mb-6 flex-1">Short description of the content or article.</p>
              <Button variant="default" size="sm" className="w-fit">Läs mer</Button>
            </div>
            <div className="rounded-[16px] overflow-hidden bg-forest-800 p-6 flex flex-col">
              <h3 className="text-[22px] font-semibold text-amber-300 leading-tight mb-2">Featured content</h3>
              <p className="text-sm text-amber-300/70 mb-6 flex-1">Highlighted on dark background.</p>
              <Button variant="secondary" size="sm" className="w-fit">Läs mer</Button>
            </div>
            <div className="rounded-[16px] overflow-hidden bg-white border border-stone-200 p-6 flex flex-col">
              <h3 className="text-[22px] font-semibold text-forest-800 leading-tight mb-2">Neutral card</h3>
              <p className="text-sm text-stone-600 mb-6 flex-1">Clean white card with subtle border.</p>
              <Button variant="outline" size="sm" className="w-fit">Läs mer</Button>
            </div>
          </div>
        </div>

        {/* With button + meta */}
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider mb-4">With image + button</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-[16px] overflow-hidden bg-amber-300">
              <div className="h-[200px] bg-forest-200" />
              <div className="p-6 flex flex-col">
                <span className="text-xs font-medium text-forest-800/50 uppercase tracking-wider mb-2">Utbildning</span>
                <h3 className="text-[22px] font-semibold text-forest-800 leading-tight mb-2">ACT Gruppledarutbildning</h3>
                <p className="text-sm text-forest-800/70 mb-4">Stockholm, 15-17 april 2026</p>
                <div className="flex gap-3">
                  <Button variant="default" size="sm">Boka plats</Button>
                  <Button variant="ghost" size="sm" className="text-forest-800">Läs mer</Button>
                </div>
              </div>
            </div>
            <div className="rounded-[16px] overflow-hidden" style={{ background: '#C7DDDC' }}>
              <div className="h-[200px] bg-forest-300" />
              <div className="p-6 flex flex-col">
                <span className="text-xs font-medium text-forest-800/50 uppercase tracking-wider mb-2">Material</span>
                <h3 className="text-[22px] font-semibold text-forest-800 leading-tight mb-2">ACT Samtalskort</h3>
                <p className="text-sm text-forest-800/70 mb-4">Verktyg för terapeuter och gruppledare</p>
                <div className="flex gap-3">
                  <Button variant="default" size="sm">Köp nu</Button>
                  <Button variant="ghost" size="sm" className="text-forest-800">Detaljer</Button>
                </div>
              </div>
            </div>
            <div className="rounded-[16px] overflow-hidden bg-forest-800">
              <div className="h-[200px] bg-forest-400" />
              <div className="p-6 flex flex-col">
                <span className="text-xs font-medium text-amber-300/50 uppercase tracking-wider mb-2">Nyhet</span>
                <h3 className="text-[22px] font-semibold text-amber-300 leading-tight mb-2">Ny forskning om ACT</h3>
                <p className="text-sm text-amber-300/70 mb-4">Publicerad mars 2026</p>
                <Button variant="secondary" size="sm" className="w-fit">Läs artikeln</Button>
              </div>
            </div>
          </div>
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
