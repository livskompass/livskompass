import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest-500/10 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-forest-600 text-white hover:bg-forest-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50",
        secondary: "bg-stone-100 text-stone-900 hover:bg-stone-200",
        ghost: "hover:bg-stone-100 text-stone-700",
        link: "text-forest-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild && React.isValidElement(props.children)) {
      const child = props.children as React.ReactElement<Record<string, unknown>>
      return React.cloneElement(child, {
        className: cn(buttonVariants({ variant, size, className }), child.props.className as string | undefined),
        ref,
      })
    }
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
