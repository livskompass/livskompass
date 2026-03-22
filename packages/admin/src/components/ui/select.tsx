import * as React from "react"
import { cn } from "../../lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border-[1.5px] border-zinc-300 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 appearance-none bg-no-repeat focus:outline-none focus:border-zinc-500 focus:ring-[3px] focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-fast",
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundSize: '16px',
          backgroundPosition: 'right 10px center',
        }}
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
