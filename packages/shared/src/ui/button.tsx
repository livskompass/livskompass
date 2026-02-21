import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-[0.9375rem] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-forest-600 text-white shadow-[0_1px_3px_rgba(50,102,71,0.2),0_1px_2px_rgba(50,102,71,0.12)] hover:bg-forest-500 hover:shadow-[0_4px_12px_rgba(50,102,71,0.2),0_2px_4px_rgba(50,102,71,0.12)] hover:-translate-y-px active:bg-forest-700 active:shadow-xs active:translate-y-0",
        secondary:
          "border-[1.5px] border-stone-300 bg-transparent text-forest-950 hover:bg-stone-100 hover:border-stone-400 active:bg-stone-200",
        ghost:
          "text-forest-600 hover:bg-forest-50 hover:text-forest-700 active:bg-forest-100",
        accent:
          "bg-amber-600 text-white shadow-amber hover:bg-amber-500 hover:shadow-[0_4px_12px_rgba(166,123,74,0.25),0_2px_4px_rgba(166,123,74,0.15)] hover:-translate-y-px active:bg-amber-600 active:translate-y-0",
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
