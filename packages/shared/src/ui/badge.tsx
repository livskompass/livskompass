import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-forest-200 bg-forest-50 text-forest-700",
        accent: "border-amber-200 bg-amber-50 text-amber-600",
        secondary: "border-stone-200 bg-stone-100 text-stone-600",
        destructive: "border-red-200 bg-red-50 text-red-700",
        outline: "text-stone-700 border-stone-300",
        success: "border-forest-200 bg-forest-50 text-forest-700",
        warning: "border-amber-200 bg-amber-50 text-amber-600",
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
