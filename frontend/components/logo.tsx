"use client"

import { Pill } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  animate?: boolean
  centered?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, animate, centered = false, className = "" }: LogoProps) {
  const [animationState, setAnimationState] = useState<"initial" | "animating" | "final">(animate ? "initial" : "final")

  useEffect(() => {
    if (animate) {
      // Start animation sequence
      setAnimationState("initial")

      const timer1 = setTimeout(() => {
        setAnimationState("animating")
      }, 300)

      const timer2 = setTimeout(() => {
        setAnimationState("final")
      }, 2000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [animate])

  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  }

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32,
  }

  const containerClasses = cn(
    "flex items-center gap-2 font-bold transition-all duration-700",
    sizeClasses[size],
    {
      "justify-center": centered || animationState !== "final",
      "w-full": centered,
      "opacity-0 scale-95": animationState === "initial",
      "opacity-100 scale-100": animationState !== "initial",
    },
    className,
  )

  return (
    <Link href="/" className={containerClasses}>
      <div
        className={cn("relative transition-transform duration-700", {
          "animate-pulse-scale": animationState === "animating",
        })}
      >
        <div className="bg-gradient-to-r from-medical-blue to-medical-green rounded-full p-1">
          <Pill size={iconSizes[size]} className="text-white" />
        </div>
      </div>
      {showText && (
        <span
          className={cn(
            "bg-gradient-to-r flex flex-column items-center justify-center from-medical-blue to-medical-green bg-clip-text text-transparent transition-all duration-700",
            {
              "translate-x-2": animationState === "animating",
              "opacity-0": animationState === "initial",
              "opacity-100 translate": animationState === "final",
            },
          )}
        >
          MediScan
        </span>
      )}
    </Link>
  )
}

