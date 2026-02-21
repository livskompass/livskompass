import * as React from "react"
import { cn } from "../../lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full rounded-md border-[1.5px] border-stone-300 bg-white px-3.5 py-2 pr-9 text-base text-stone-900 appearance-none bg-no-repeat bg-[length:16px] bg-[right_10px_center] bg-[url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23A9A49B'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E\")] focus:outline-none focus:border-forest-400 focus:ring-[3px] focus:ring-forest-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-fast",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
