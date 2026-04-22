import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-[0.9375rem] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-forest-600 text-white hover:bg-forest-500 active:bg-forest-700",
        secondary:
          "border-[1.5px] border-stone-300 bg-transparent text-forest-950 hover:bg-stone-100 hover:border-stone-400 active:bg-stone-200",
        ghost:
          "text-forest-600 hover:bg-forest-50 hover:text-forest-700 active:bg-forest-100",
        accent:
          "bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-600",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "text-forest-600 underline-offset-4 hover:underline",
        outline:
          "border-[1.5px] border-stone-300 bg-white hover:bg-stone-50 text-stone-700",
      },
      size: {
        default: "h-12 px-7",
        sm: "h-10 px-5 text-sm",
        lg: "h-14 px-9 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
