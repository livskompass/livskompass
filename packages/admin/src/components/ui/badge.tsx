import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border border-zinc-200 bg-zinc-100 text-zinc-700",
        accent: "border border-zinc-200 bg-zinc-50 text-zinc-600",
        success: "border border-zinc-300 bg-zinc-100 text-zinc-700",
        warning: "border border-zinc-200 bg-zinc-50 text-zinc-600",
        destructive: "border border-red-200 bg-red-50 text-red-700",
        secondary: "border border-zinc-200 bg-zinc-100 text-zinc-600",
        outline: "border border-zinc-300 text-zinc-700",
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
