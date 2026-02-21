import { cn } from '../ui/utils'
import { useScrollReveal } from '../helpers'
import { Heart, Star, Shield, Zap, BookOpen, Users, Target, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface FeatureGridProps {
  heading: string
  subheading: string
  columns: 2 | 3 | 4
  items: Array<{ icon: string; title: string; description: string }>
  style: 'cards' | 'minimal'
}

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  star: Star,
  shield: Shield,
  zap: Zap,
  book: BookOpen,
  users: Users,
  target: Target,
  sparkles: Sparkles,
}

const colMap = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' }

export function FeatureGrid({
  heading = '',
  subheading = '',
  columns = 3,
  items = [],
  style = 'cards',
}: FeatureGridProps) {
  const revealRef = useScrollReveal()

  if (items.length === 0) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
          Lägg till funktioner i inställningarna...
        </div>
      </div>
    )
  }

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {(heading || subheading) && (
        <div className="text-center mb-12 reveal">
          {heading && <h2 className="text-h2 text-stone-800 mb-3">{heading}</h2>}
          {subheading && <p className="text-lg text-stone-600 max-w-2xl mx-auto">{subheading}</p>}
        </div>
      )}
      <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[3])}>
        {items.map((item, i) => {
          const IconComponent = iconMap[item.icon?.toLowerCase()] || Star
          const stagger = `reveal reveal-stagger-${Math.min(i + 1, 5)}`
          return style === 'cards' ? (
            <div key={i} className={`bg-white rounded-xl border border-stone-200 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${stagger}`}>
              <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center mb-4">
                <IconComponent className="h-6 w-6 text-forest-600" />
              </div>
              <h3 className="font-semibold text-stone-800 mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{item.description}</p>
            </div>
          ) : (
            <div key={i} className={`text-center ${stagger}`}>
              <div className="w-12 h-12 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
                <IconComponent className="h-6 w-6 text-forest-600" />
              </div>
              <h3 className="font-semibold text-stone-800 mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{item.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
