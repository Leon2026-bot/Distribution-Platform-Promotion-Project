"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => {
          onCheckedChange?.(e.target.checked)
          onChange?.(e)
        }}
        className={cn(
          "peer h-4 w-4 shrink-0 cursor-pointer rounded border border-zinc-300",
          "accent-zinc-900 checked:border-zinc-900 checked:bg-zinc-900",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
