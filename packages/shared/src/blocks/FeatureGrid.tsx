import { cn } from '../ui/utils'
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
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-lg">
          Lägg till funktioner i inställningarna...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {(heading || subheading) && (
        <div className="text-center mb-12">
          {heading && <h2 className="font-heading text-3xl font-bold text-neutral-800 mb-3 tracking-tight">{heading}</h2>}
          {subheading && <p className="text-lg text-neutral-600 max-w-2xl mx-auto">{subheading}</p>}
        </div>
      )}
      <div className={cn('grid grid-cols-1 gap-6', colMap[columns] || colMap[3])}>
        {items.map((item, i) => {
          const IconComponent = iconMap[item.icon?.toLowerCase()] || Star
          return style === 'cards' ? (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <IconComponent className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{item.description}</p>
            </div>
          ) : (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <IconComponent className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{item.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
