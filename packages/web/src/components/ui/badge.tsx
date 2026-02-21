import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-100 text-primary-800",
        secondary:
          "border-transparent bg-neutral-100 text-neutral-800",
        destructive:
          "border-transparent bg-[#FEF2F1] text-[#C4463A]",
        outline: "text-neutral-700 border-neutral-300",
        success:
          "border-transparent bg-[#F0F7F2] text-[#3D8B52]",
        warning:
          "border-transparent bg-[#FEF9EE] text-[#C89828]",
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
