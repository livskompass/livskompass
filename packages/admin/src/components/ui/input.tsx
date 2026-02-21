import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border-[1.5px] border-stone-300 bg-white px-3.5 py-2 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-forest-400 focus:ring-[3px] focus:ring-forest-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-fast",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
