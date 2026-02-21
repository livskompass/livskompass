import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border border-forest-200 bg-forest-50 text-forest-700",
        accent: "border border-amber-200 bg-amber-50 text-amber-600",
        success: "border border-forest-200 bg-forest-50 text-forest-700",
        warning: "border border-amber-200 bg-amber-50 text-amber-600",
        destructive: "border border-red-200 bg-red-50 text-red-700",
        secondary: "border border-stone-200 bg-stone-100 text-stone-600",
        outline: "border border-stone-300 text-stone-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
