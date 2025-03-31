"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Pill = React.forwardRef<HTMLSpanElement, PillProps>(({ className, ...props }, ref) => {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Pill.displayName = "Pill"

export { Pill }

